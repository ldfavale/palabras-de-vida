// amplify/functions/cleanup-deleted-product/index.js
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

import pkg from '@aws-sdk/lib-dynamodb';

const { DynamoDBDocumentClient, QueryCommand ,BatchWriteCommand } = pkg;

const PRODUCT_CATEGORY_TABLE_NAME = process.env.PRODUCT_CATEGORY_TABLE_NAME;
const PRODUCT_CATEGORY_GSI_NAME = process.env.PRODUCT_CATEGORY_GSI_NAME;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const CLEANUP_QUEUE_URL = process.env.CLEANUP_QUEUE_URL;

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({});
const sqsClient = new SQSClient({});

export const handler = async (event) => {
  // Procesar eventos de SQS
  console.log(`Hola estoy en la función de limpieza de productos eliminados`,event);

  if (event.Records && event.Records.length > 0 && event.Records[0].eventSource === 'aws:sqs') {
    for (const record of event.Records) {
      try {
        const message = JSON.parse(record.body);
        const productId = message.productId;
        const productImages = message.productImages || [];
        
        if (!productId) {
          console.error('Missing productId in SQS message');
          continue;
        }
        
        console.log(`Processing cleanup for product ${productId}`);
        
        // Resultados para seguimiento
        const results = {
          categoriesDeleted: 0,
          imagesDeleted: 0,
          errors: []
        };
        
        // 1. Eliminar entradas de ProductCategory
        try {
          console.log(`Querying ProductCategory for productId: ${productId}`);
          const queryParams = {
            TableName: PRODUCT_CATEGORY_TABLE_NAME,
            IndexName: PRODUCT_CATEGORY_GSI_NAME,
            KeyConditionExpression: 'productId = :pid',
            ExpressionAttributeValues: { ':pid': productId },
            ProjectionExpression: 'id, categoryId',
          };
          
          const queryResult = await docClient.send(new QueryCommand(queryParams));
          
          if (queryResult.Items && queryResult.Items.length > 0) {
            console.log(`Found ${queryResult.Items.length} items in ProductCategory to delete.`);
            const deleteRequests = queryResult.Items.map(item => ({
              DeleteRequest: { Key: { id: item.id } },
            }));
            
            for (let i = 0; i < deleteRequests.length; i += 25) {
              const batch = deleteRequests.slice(i, i + 25);
              const batchWriteParams = {
                RequestItems: { [PRODUCT_CATEGORY_TABLE_NAME]: batch },
              };
              await docClient.send(new BatchWriteCommand(batchWriteParams));
              results.categoriesDeleted += batch.length;
              console.log(`Deleted batch of ${batch.length} items from ProductCategory.`);
            }
          } else {
            console.log(`No items found in ProductCategory for productId: ${productId}.`);
          }
        } catch (categoryError) {
          console.error(`Error deleting ProductCategory entries: ${categoryError}`);
          results.errors.push({
            phase: 'category-deletion',
            message: categoryError.message
          });
          
          // Si hay un error, programamos un reintento
          if (message.retryCount === undefined || message.retryCount < 3) {
            await sqsClient.send(new SendMessageCommand({
              QueueUrl: CLEANUP_QUEUE_URL,
              MessageBody: JSON.stringify({
                productId,
                productImages,
                retryCount: (message.retryCount || 0) + 1,
                lastError: categoryError.message
              }),
              // Retraso exponencial
              DelaySeconds: Math.pow(2, (message.retryCount || 0) + 1),
            }));
            console.log(`Scheduled retry ${(message.retryCount || 0) + 1} for product ${productId}`);
          } else {
            console.error(`Max retries reached for product ${productId}`);
          }
        }
        
        // 2. Eliminar imágenes de S3
        try {
          // Si tenemos las rutas de las imágenes en el mensaje, las usamos directamente
          if (productImages && productImages.length > 0) {
            console.log(`Deleting ${productImages.length} images from S3 for product ${productId}`);
            
            const objectsToDelete = productImages.map(key => ({ Key: key }));
            
            if (objectsToDelete.length > 0) {
              const deleteParams = {
                Bucket: S3_BUCKET_NAME,
                Delete: { Objects: objectsToDelete }
              };
              
              const deleteResult = await s3Client.send(new DeleteObjectsCommand(deleteParams));
              results.imagesDeleted = deleteResult.Deleted ? deleteResult.Deleted.length : 0;
              
              console.log(`Deleted ${results.imagesDeleted} images from S3 for product ${productId}`);
              
              if (deleteResult.Errors && deleteResult.Errors.length > 0) {
                console.error(`Errors deleting S3 objects:`, deleteResult.Errors);
                results.errors.push({
                  phase: 's3-deletion',
                  message: `Failed to delete ${deleteResult.Errors.length} images`
                });
              }
            }
          } else {
            // Si no tenemos las rutas, buscamos objetos con el prefijo del productId
            console.log(`Looking for S3 objects with prefix 'product-images/${productId}/'`);
            
            const listParams = {
              Bucket: S3_BUCKET_NAME,
              Prefix: `product-images/${productId}/`
            };
            
            const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));
            
            if (listedObjects.Contents && listedObjects.Contents.length > 0) {
              console.log(`Found ${listedObjects.Contents.length} objects to delete`);
              
              const objectsToDelete = listedObjects.Contents.map(obj => ({ Key: obj.Key }));
              
              const deleteParams = {
                Bucket: S3_BUCKET_NAME,
                Delete: { Objects: objectsToDelete }
              };
              
              const deleteResult = await s3Client.send(new DeleteObjectsCommand(deleteParams));
              results.imagesDeleted = deleteResult.Deleted ? deleteResult.Deleted.length : 0;
              
              console.log(`Deleted ${results.imagesDeleted} images from S3 for product ${productId}`);
              
              if (deleteResult.Errors && deleteResult.Errors.length > 0) {
                console.error(`Errors deleting S3 objects:`, deleteResult.Errors);
                results.errors.push({
                  phase: 's3-deletion',
                  message: `Failed to delete ${deleteResult.Errors.length} images`
                });
              }
            } else {
              console.log(`No S3 objects found with prefix 'product-images/${productId}/'`);
            }
          }
        } catch (s3Error) {
          console.error(`Error deleting S3 images: ${s3Error}`);
          results.errors.push({
            phase: 's3-deletion',
            message: s3Error.message
          });
          
          // Si hay un error, programamos un reintento
          if (message.retryCount === undefined || message.retryCount < 3) {
            await sqsClient.send(new SendMessageCommand({
              QueueUrl: CLEANUP_QUEUE_URL,
              MessageBody: JSON.stringify({
                productId,
                productImages,
                retryCount: (message.retryCount || 0) + 1,
                lastError: s3Error.message,
                skipCategories: true // Para no repetir la eliminación de categorías que ya se hizo
              }),
              DelaySeconds: Math.pow(2, (message.retryCount || 0) + 1),
            }));
            console.log(`Scheduled retry ${(message.retryCount || 0) + 1} for product ${productId} S3 cleanup`);
          } else {
            console.error(`Max retries reached for product ${productId} S3 cleanup`);
          }
        }
        
        console.log(`Cleanup results for product ${productId}:`, results);
      } catch (error) {
        console.error('Error processing SQS message:', error);
      }
    }
  }
};
