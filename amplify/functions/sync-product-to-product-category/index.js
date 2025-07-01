const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { BatchWriteItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const PRODUCT_CATEGORY_TABLE_NAME = process.env.PRODUCT_CATEGORY_TABLE_NAME;
const PRODUCT_CATEGORY_GSI_NAME = process.env.PRODUCT_CATEGORY_GSI_NAME;

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
      const newImage = unmarshall(record.dynamodb.NewImage);

      // 1. Encontrar todos los items de ProductCategory para este producto
      const queryParams = {
        TableName: PRODUCT_CATEGORY_TABLE_NAME,
        IndexName: PRODUCT_CATEGORY_GSI_NAME, // 'productCategoriesByProductId'
        KeyConditionExpression: "productId = :productId",
        ExpressionAttributeValues: {
          ":productId": { S: newImage.id },
        },
      };

      try {
        const { Items } = await ddbClient.send(new QueryCommand(queryParams));
        if (!Items || Items.length === 0) {
          console.log(`No categories found for product ${newImage.id}. Nothing to sync.`);
          continue;
        }

        // 2. Preparar una operación de actualización para cada item
        const writeRequests = Items.map(item => {
          const pk = item.id;
          return {
            PutRequest: {
              Item: marshall({
                ...item,
                productStatus: newImage.searchableStatus,
                productTitle: newImage.normalizedTitle,
                productPrice: newImage.price,
                productCreatedAt: newImage.createdAt,
              }),
            },
          };
        });

        // 3. Ejecutar la actualización en lote
        const batchWriteParams = {
          RequestItems: {
            [PRODUCT_CATEGORY_TABLE_NAME]: writeRequests,
          },
        };

        await ddbClient.send(new BatchWriteItemCommand(batchWriteParams));
        console.log(`Successfully synced product data to ${writeRequests.length} category entries for product ${newImage.id}`);

      } catch (error) {
        console.error(`Error syncing product ${newImage.id}:`, error);
        // Considerar enviar a una DLQ
        throw error;
      }
    }
  }
  return { status: "Done" };
};