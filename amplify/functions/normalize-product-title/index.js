import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
// import { marshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});
const PRODUCT_TABLE_NAME = process.env.PRODUCT_TABLE_NAME;

const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD') // Separa los caracteres de sus acentos
    .replace(/[\u0300-\u036f]/g, ''); // Elimina los acentos
};

export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
      const newImage = record.dynamodb.NewImage;
      const productId = newImage.id.S;
      const title = newImage.title?.S;

      // Generamos el título normalizado
      const normalizedTitle = normalizeText(title);

      const params = {
        TableName: PRODUCT_TABLE_NAME,
        Key: { id: { S: productId } },
        UpdateExpression: 'SET #normalizedTitle = :normalizedTitle, #searchableStatus = :searchableStatus',
        ExpressionAttributeNames: {
          '#normalizedTitle': 'normalizedTitle',
          '#searchableStatus': 'searchableStatus',
        },
        ExpressionAttributeValues: {
          ':normalizedTitle': { S: normalizedTitle },
          // Usamos un valor estático para la Partition Key del GSI
          ':searchableStatus': { S: 'ACTIVE' },
        },
        // Condición para evitar un bucle infinito de actualizaciones
        // Solo actualiza si el valor ha cambiado o no existe
        ConditionExpression: 'attribute_not_exists(#normalizedTitle) OR #normalizedTitle <> :normalizedTitle',
      };

      try {
        console.log(`Updating product ${productId} with normalizedTitle: ${normalizedTitle}`);
        await client.send(new UpdateItemCommand(params));
      } catch (error) {
        // ConditionFailedException es esperado si el campo ya está actualizado, lo ignoramos.
        if (error.name === 'ConditionalCheckFailedException') {
          console.log(`Product ${productId} already has the correct normalized title. No update needed.`);
        } else {
          console.error(`Error updating product ${productId}:`, error);
          // Vuelve a lanzar el error para que el trigger reintente si es apropiado
          throw error;
        }
      }
    }
  }
};