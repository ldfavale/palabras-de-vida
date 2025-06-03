// amplify/functions/cleanup-deleted-product/index.js
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, DeleteObjectsCommand /*, ListObjectsV2Command // Opcional si necesitas listar */ } from '@aws-sdk/client-s3';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const PRODUCT_CATEGORY_TABLE_NAME = process.env.PRODUCT_CATEGORY_TABLE_NAME;
const PRODUCT_CATEGORY_GSI_NAME = process.env.PRODUCT_CATEGORY_GSI_NAME;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({});

export const handler = async (event) => {
  console.log(`Cleanup function received ${event.Records.length} records from DynamoDB stream.`);

  for (const record of event.Records) {
    console.log(`Processing record: EventID: ${record.eventID}, EventName: ${record.eventName}`);

    if (record.eventName !== 'REMOVE') {
      console.log(`Skipping non-REMOVE event: ${record.eventName}`);
      continue;
    }

    if (!record.dynamodb || !record.dynamodb.OldImage) {
      console.error('OldImage not found in REMOVE event. Ensure Product table stream is configured for NEW_AND_OLD_IMAGES.', JSON.stringify(record));
      // Esto podría indicar un problema de configuración o un evento inesperado.
      // Lambda lo reintentará o lo enviará a la DLQ según la configuración.
      // Puedes lanzar un error para forzar el reintento/DLQ.
      throw new Error('OldImage not found in REMOVE event.');
    }

    const oldImage = unmarshall(record.dynamodb.OldImage);
    const productId = oldImage.id; // Asume que 'id' es la clave primaria de Product
    const productImages = oldImage.images || []; // Asume que 'images' es el array de S3 keys en Product

    if (!productId) {
      console.error('Missing productId in OldImage from REMOVE event.', JSON.stringify(oldImage));
      throw new Error('Missing productId in OldImage.');
    }

    console.log(`Processing cleanup for removed product ${productId}`);
    const results = {
      productId: productId,
      categoriesDeleted: 0,
      imagesDeleted: 0,
      errorsEncountered: [], // Para loguear errores específicos de este intento
    };

    try {
      // 1. Eliminar entradas de ProductCategory
      try {
        console.log(`Querying ProductCategory for productId: ${productId}`);
        const queryParams = {
          TableName: PRODUCT_CATEGORY_TABLE_NAME,
          IndexName: PRODUCT_CATEGORY_GSI_NAME,
          KeyConditionExpression: 'productId = :pid',
          ExpressionAttributeValues: { ':pid': productId },
          ProjectionExpression: 'id', // Solo necesitas 'id' para la clave de eliminación
        };
        
        const queryResult = await docClient.send(new QueryCommand(queryParams));
        
        if (queryResult.Items && queryResult.Items.length > 0) {
          console.log(`Found ${queryResult.Items.length} items in ProductCategory to delete for product ${productId}.`);
          const deleteRequests = queryResult.Items.map(item => ({
            DeleteRequest: { Key: { id: item.id } }, // Asume 'id' es la clave de ProductCategory
          }));
          
          // DynamoDB BatchWriteItem tiene un límite de 25 items por request
          for (let i = 0; i < deleteRequests.length; i += 25) {
            const batch = deleteRequests.slice(i, i + 25);
            const batchWriteParams = {
              RequestItems: { [PRODUCT_CATEGORY_TABLE_NAME]: batch },
            };
            await docClient.send(new BatchWriteCommand(batchWriteParams));
            results.categoriesDeleted += batch.length;
            console.log(`Deleted batch of ${batch.length} items from ProductCategory for product ${productId}.`);
          }
        } else {
          console.log(`No items found in ProductCategory for product ${productId}.`);
        }
      } catch (categoryError) {
        console.error(`Error deleting ProductCategory entries for product ${productId}: ${categoryError.message}`, categoryError);
        results.errorsEncountered.push({ phase: 'category-deletion', message: categoryError.message });
        throw categoryError; // Propaga el error para que Lambda lo maneje (reintento/DLQ)
      }
      
      // 2. Eliminar imágenes de S3
      try {
        if (productImages && productImages.length > 0) {
          const objectsToDelete = productImages.map(key => {
            if (typeof key === 'string' && key.trim() !== '' && !key.startsWith('http')) {
              // Las claves de S3 no deben empezar con '/' si el bucket ya está en el path
              return { Key: key.startsWith('/') ? key.substring(1) : key };
            }
            console.warn(`Skipping invalid S3 key: '${key}' for product ${productId}`);
            return null;
          }).filter(obj => obj !== null); // Filtra las claves inválidas

          if (objectsToDelete.length > 0) {
             console.log(`Attempting to delete ${objectsToDelete.length} S3 images for product ${productId}: ${JSON.stringify(objectsToDelete)}`);
            const deleteParams = {
              Bucket: S3_BUCKET_NAME,
              Delete: { Objects: objectsToDelete },
            };
            const deleteResult = await s3Client.send(new DeleteObjectsCommand(deleteParams));
            results.imagesDeleted = deleteResult.Deleted ? deleteResult.Deleted.length : 0;
            console.log(`Successfully deleted ${results.imagesDeleted} images from S3 for product ${productId}.`);
            
            if (deleteResult.Errors && deleteResult.Errors.length > 0) {
              console.error(`Errors deleting some S3 objects for product ${productId}:`, deleteResult.Errors);
              results.errorsEncountered.push({
                phase: 's3-deletion-partial',
                message: `Failed to delete ${deleteResult.Errors.length} S3 images.`,
                details: deleteResult.Errors
              });
              // Considerar esto un fallo parcial, pero aún así propagar un error para revisión/reintento
              throw new Error(`S3 deletion partially failed for product ${productId}.`);
            }
          } else {
            console.log(`No valid S3 image keys to delete for product ${productId} after filtering.`);
          }
        } else {
          console.log(`No S3 image keys found in OldImage for product ${productId}.`);
        }
      } catch (s3Error) {
        console.error(`Error deleting S3 images for product ${productId}: ${s3Error.message}`, s3Error);
        results.errorsEncountered.push({ phase: 's3-deletion', message: s3Error.message });
        throw s3Error; // Propaga el error
      }
      
      console.log(`Cleanup successful for product ${productId}:`, results);

    } catch (error) {
      // Este catch es para errores propagados desde los bloques try/catch internos.
      // También capturará cualquier error inesperado en la lógica principal del bucle.
      console.error(`Failed to complete cleanup for product ${productId}. Record: ${JSON.stringify(record.dynamodb?.Keys)}. Error: ${error.message}`, error);
      // Re-lanzar el error es crucial para que Lambda sepa que el procesamiento de este registro falló.
      // Esto activará los reintentos configurados o enviará el evento a la DLQ.
      throw error;
    }
  }
  console.log("Cleanup function finished processing all records in the event.");
};