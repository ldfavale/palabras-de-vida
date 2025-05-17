// amplify/functions/denormalize-product-categories/index.js (o .mjs)
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const PRODUCT_TABLE_NAME = process.env.PRODUCT_TABLE_NAME;
const PRODUCT_CATEGORY_TABLE_NAME = process.env.PRODUCT_CATEGORY_TABLE_NAME;
const PRODUCT_CATEGORY_GSI_NAME = process.env.PRODUCT_CATEGORY_GSI_NAME;

if (!PRODUCT_TABLE_NAME || !PRODUCT_CATEGORY_TABLE_NAME || !PRODUCT_CATEGORY_GSI_NAME) {
  // En un entorno de producción real, podrías querer manejar este error de forma más robusta.
  console.error("Error: Environment variables PRODUCT_TABLE_NAME, PRODUCT_CATEGORY_TABLE_NAME, or PRODUCT_CATEGORY_GSI_NAME must be set.");
  // Podrías lanzar un error para que la invocación de la Lambda falle claramente si las variables no están.
  // throw new Error("Missing required environment variables.");
  // Por ahora, para depuración, el console.error puede ser suficiente, pero la función podría no comportarse como se espera.
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => { // Quitamos DynamoDBStreamEvent y Promise<void>
  console.log(`Received ${event.Records.length} records from ProductCategory stream.`);

  const affectedProductIds = new Set(); // No necesita tipo <string>

  for (const record of event.Records) {
    console.log(`EventName: ${record.eventName}, Record Keys: ${JSON.stringify(record.dynamodb?.Keys)}`);

    let productId; // No necesita tipo

    if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
      if (record.dynamodb?.NewImage) {
        const newImage = unmarshall(record.dynamodb.NewImage); // unmarshall infiere el tipo
        productId = newImage.productId;
      }
    } else if (record.eventName === 'REMOVE') {
      if (record.dynamodb?.OldImage) {
        const oldImage = unmarshall(record.dynamodb.OldImage);
        productId = oldImage.productId;
      }
    }

    if (productId) {
      affectedProductIds.add(productId);
    } else {
      console.warn('Could not determine productId from record:', JSON.stringify(record));
    }
  }

  if (affectedProductIds.size === 0) {
    console.log("No unique productIds affected. Exiting.");
    return;
  }

  console.log(`Affected productIds to update: ${Array.from(affectedProductIds).join(', ')}`);

  for (const productId of affectedProductIds) {
    try {
      console.log(`Processing productId: ${productId}`);

      const queryParams = {
        TableName: PRODUCT_CATEGORY_TABLE_NAME,
        IndexName: PRODUCT_CATEGORY_GSI_NAME,
        KeyConditionExpression: 'productId = :pid',
        ExpressionAttributeValues: {
          ':pid': productId,
        },
        ProjectionExpression: 'categoryId',
      };

      const queryCommand = new QueryCommand(queryParams);
      const queryResult = await docClient.send(queryCommand);

      const categoryIdsForProduct = queryResult.Items
        ? queryResult.Items.map(item => item.categoryId).filter(Boolean)
        : [];

      console.log(`Found ${categoryIdsForProduct.length} categoryIds for productId ${productId}: ${categoryIdsForProduct.join(', ')}`);

      const updateProductParams = {
        TableName: PRODUCT_TABLE_NAME,
        Key: {
          id: productId,
        },
        UpdateExpression: 'SET categoryIds = :cats',
        ExpressionAttributeValues: {
          ':cats': categoryIdsForProduct.length > 0 ? categoryIdsForProduct : [],
        },
        ReturnValues: 'UPDATED_NEW', 
      };

      const updateCommand = new UpdateCommand(updateProductParams);
      await docClient.send(updateCommand);
      console.log(`Successfully updated categoryIds for Product ${productId}`);

    } catch (error) {
      console.error(`Error processing update for productId ${productId}:`, error);
    }
  }
};