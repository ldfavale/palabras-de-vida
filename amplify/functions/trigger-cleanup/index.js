import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const sqsClient = new SQSClient({});
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler = async (event) => {
  try {
    console.log(`Event ${event}`);
    const productId = event.pathParameters?.productId;
      console.log(`Product ID ${productId}`);

    if (!productId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Product ID is required' }),
      };
    }

    let productImages = [];
    try {
      const getParams = {
        TableName: process.env.PRODUCT_TABLE_NAME,
        Key: { id: productId },
        ProjectionExpression: 'images'
      };
      const productResult = await docClient.send(new GetCommand(getParams));
      console.log(`productResult ${JSON.stringify(productResult)})}`);
      if (productResult.Item && productResult.Item.images) {
        productImages = productResult.Item.images;
        console.log(`Found ${productImages.length} images for product ${productId}`);
      }
    } catch (getError) {
      console.warn(`Could not retrieve product images: ${getError.message}`);
    }

    await sqsClient.send(new SendMessageCommand({
      QueueUrl: process.env.CLEANUP_QUEUE_URL,
      MessageBody: JSON.stringify({ productId, productImages }),
      DelaySeconds: 5,
    }));

    return {
      statusCode: 202,
      headers,
      body: JSON.stringify({ message: 'Cleanup process initiated', productId }),
    };
  } catch (error) {
    console.error('Error triggering cleanup:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to initiate cleanup process' }),
    };
  }
};