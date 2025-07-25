
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Lista simple de stopwords en español. En un escenario real, esto podría ser más extenso.
const SPANISH_STOPWORDS = new Set([
  "a", "al", "algo", "algunas", "algunos", "ante", "antes", "como", "con", "contra", "cual", "cuando",
  "de", "del", "desde", "donde", "durante", "e", "el", "ella", "ellas", "ellos", "en", "entre",
  "era", "erais", "eramos", "eran", "eras", "eres", "es", "esa", "esas", "ese", "eso", "esos",
  "esta", "estaba", "estabais", "estabamos", "estaban", "estabas", "estad", "estada", "estadas",
  "estado", "estados", "estais", "estamos", "estan", "estando", "estar", "estara", "estaran",
  "estaras", "estare", "estareis", "estaremos", "estaria", "estariais", "estariamos", "estarian",
  "estarias", "estas", "este", "estemos", "esto", "estos", "estoy", "estuve", "estuviera",
  "estuvierais", "estuvieramos", "estuvieran", "estuvieras", "estuvieron", "estuviese",
  "estuvieseis", "estuviesemos", "estuviesen", "estuvieses", "estuvimos", "estuviste",
  "estuvisteis", "estuvo", "etc", "fue", "fuera", "fuerais", "fueramos", "fueran", "fueras",
  "fueron", "fuese", "fueseis", "fuesemos", "fuesen", "fueses", "fui", "fuimos", "fuiste",
  "fuisteis", "ha", "habia", "habiais", "habiamos", "habian", "habias", "habra", "habran",
  "habras", "habre", "habreis", "habremos", "habria", "habriais", "habriamos", "habrian",
  "habrias", "han", "has", "hasta", "hay", "haya", "hayais", "hayamos", "hayan", "hayas",
  "he", "hemos", "hube", "hubiera", "hubierais", "hubieramos", "hubieran", "hubieras",
  "hubieron", "hubiese", "hubieseis", "hubiesemos", "hubiesen", "hubieses", "hubimos",
  "hubiste", "hubisteis", "hubo", "la", "las", "le", "les", "lo", "los", "mas", "me",
  "mi", "mis", "mucho", "muchos", "muy", "nada", "ni", "no", "nos", "nosotras", "nosotros",
  "nuestra", "nuestras", "nuestro", "nuestros", "o", "os", "otra", "otras", "otro", "otros",
  "para", "pero", "pues", "que", "se", "sea", "seais", "seamos", "sean", "seas", "sentid",
  "sentida", "sentidas", "sentido", "sentidos", "sera", "seran", "seras", "sere", "sereis",
  "seremos", "seria", "seriais", "seriamos", "serian", "serias", "si", "sin", "sino", "sois",
  "somos", "son", "soy", "su", "sus", "suya", "suyas", "suyo", "suyos", "tal", "tambien",
  "tanta", "tantas", "tanto", "tantos", "te", "teneis", "tenemos", "tener", "tenga",
  "tengais", "tengamos", "tengan", "tengas", "tengo", "tenia", "teniais", "teniamos",
  "tenian", "tenias", "ti", "tiene", "tienen", "tienes", "todo", "todos", "tu", "tus",
  "tuve", "tuviera", "tuvierais", "tuvieramos", "tuvieran", "tuvieras", "tuvieron",
  "tuviese", "tuvieseis", "tuviesemos", "tuviesen", "tuvieses", "tuvimos", "tuviste",
  "tuvisteis", "tuvo", "un", "una", "unas", "uno", "unos", "usted", "ustedes", "vosotras",
  "vosotros", "y", "ya", "yo"
]);

const TOKEN_TABLE_NAME = process.env.AMPLIFY_DATA_PRODUCTSEARCHTOKEN_TABLE_NAME;

/**
 * Tokeniza el texto: lo convierte a minúsculas, divide en palabras y elimina stopwords.
 * @param {string} text El texto a tokenizar.
 * @returns {Set<string>} Un conjunto de tokens únicos.
 */
const tokenize = (text) => {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      // Separa por cualquier caracter que no sea una letra o número
      .split(/[^a-z0-9áéíóúñ]+/)
      .filter(word => word.length > 2 && !SPANISH_STOPWORDS.has(word))
  );
};

/**
 * Handler principal de la función Lambda.
 */
exports.handler = async (event) => {
  console.log(`Processing ${event.Records.length} records...`);

  const writeRequests = [];

  for (const record of event.Records) {
    // Solo procesar inserciones y modificaciones
    if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
      const newImage = record.dynamodb.NewImage;
      const productId = newImage.id.S;

      // 1. Extraer y tokenizar textos
      const titleTokens = tokenize(newImage.title?.S);
      const descriptionTokens = tokenize(newImage.description?.S);
      const allTokens = new Set([...titleTokens, ...descriptionTokens]);

      console.log(`Product ID: ${productId} - Tokens: ${Array.from(allTokens).join(', ')}`);

      // Extraer los campos a desnormalizar de la imagen del producto
      const categoryIds = newImage.categoryIds?.L?.map(item => item.S) || [];
      const price = newImage.price?.N ? parseFloat(newImage.price.N) : undefined;
      const title = newImage.title?.S; // <-- AÑADIDO
      const description = newImage.description?.S; // <-- AÑADIDO
      const normalizedTitle = newImage.normalizedTitle?.S;
      const createdAt = newImage.createdAt?.S;
      const images = newImage.images?.L?.map(item => item.S) || []; // <-- AÑADIDO

      // 2. Crear las operaciones de escritura para la tabla de tokens
      for (const token of allTokens) {
        // Construir el item base
        const item = {
          token: token,
          productId: productId,
          categoryIds: categoryIds.length > 0 ? categoryIds : undefined, // No guardar arrays vacíos
          price: price,
          title: title, 
          description: description, 
          normalizedTitle: normalizedTitle,
          createdAt: createdAt,
          images: images.length > 0 ? images : undefined, // <-- AÑADIDO
        };

        // Eliminar claves con valores undefined para no escribirlas en DynamoDB
        Object.keys(item).forEach(key => item[key] === undefined && delete item[key]);

        writeRequests.push({
          PutRequest: {
            Item: item,
          },
        });
      }
    }
    // NOTA: La limpieza de tokens al eliminar un producto se manejará por separado.
  }

  // 3. Escribir los tokens en la tabla en lotes de 25 (límite de BatchWriteCommand)
  if (writeRequests.length > 0) {
    for (let i = 0; i < writeRequests.length; i += 25) {
      const batch = writeRequests.slice(i, i + 25);
      const command = new BatchWriteCommand({
        RequestItems: {
          [TOKEN_TABLE_NAME]: batch,
        },
      });
      try {
        await docClient.send(command);
        console.log(`Successfully wrote batch ${i / 25 + 1}`);
      } catch (error) {
        console.error(`Error writing batch: ${JSON.stringify(batch)}`, error);
        // Considerar una estrategia de reintentos o DLQ (Dead-Letter Queue)
      }
    }
  }

  console.log("Finished processing records.");
  return { status: "done" };
};
