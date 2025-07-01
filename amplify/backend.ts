import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage, storageOpensearch } from './storage/resource';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as iam from "aws-cdk-lib/aws-iam";
import * as osis from "aws-cdk-lib/aws-osis";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as custom_resources from 'aws-cdk-lib/custom-resources';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'; // Importa DynamoEventSource
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { RemovalPolicy, Duration } from "aws-cdk-lib";


/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  storageOpensearch
});

const branchName = process.env.AWS_BRANCH || 'local';
const useOpenSearch = process.env.USE_OPENSEARCH === 'true';

console.log(`[CDK] OpenSearch está ${useOpenSearch ? 'HABILITADO' : 'DESHABILITADO'} para este despliegue.`);

if (!branchName) {
  throw new Error(
    "La variable de entorno AWS_BRANCH no está definida. " +
    "Es necesaria para crear nombres de recursos únicos. " +
    "Asegúrate de estar desplegando a través de la consola de Amplify o la CLI de Amplify."
  );
}

/**
 * * Configuración de DynamoDB y Streams
 */

// --- Referencias a las Tablas ---
const productTableResource = backend.data.resources.tables['Product'];
const productCategoryTableResource = backend.data.resources.tables['ProductCategory'];

// Obtener el ARN y nombre de la tabla DynamoDB
const tableArn = productTableResource.tableArn;
const tableName = productTableResource.tableName;

// --- Referencias a las Tablas (accediendo directamente a los recursos CfnTable L1) ---
const cfnProductTable = backend.data.resources.cfnResources.amplifyDynamoDbTables['Product'];
const cfnProductCategoryTable = backend.data.resources.cfnResources.amplifyDynamoDbTables['ProductCategory'];

// Get the S3Bucket ARN and Name
const s3BucketArn = backend.storage.resources.bucket.bucketArn;
const s3BucketName = backend.storage.resources.bucket.bucketName;


// --- Habilitar Stream para la tabla Product ---
if (cfnProductTable) {
  cfnProductTable.streamSpecification = {
    streamViewType: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, 
  };
  console.log("StreamSpecification configurada para Product table.");
} else {
  console.error("ERROR: No se encontró CfnTable para 'Product'. El Stream no se pudo habilitar.");
}

// --- Habilitar Stream para la tabla ProductCategory ---
if (cfnProductCategoryTable) {
  cfnProductCategoryTable.streamSpecification = {
    streamViewType: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, 
  };
  console.log("StreamSpecification configurada para ProductCategory table.");
} else {
  console.error("ERROR: No se encontró CfnTable para 'ProductCategory'. El Stream para la Lambda de denormalización no se pudo habilitar.");
  throw new Error("CfnTable for 'ProductCategory' not found.");
}

// --- Custom Resource para habilitar PITR después de la creación en la tabla Product ---
const enablePITR = new custom_resources.AwsCustomResource(
  backend.data.stack,
  'EnablePITRForProductTable',
  {
    policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
      resources: [productTableResource.tableArn],
    }),
    onCreate: {
      service: 'DynamoDB',
      action: 'updateContinuousBackups',
      parameters: {
        TableName: productTableResource.tableName,
        PointInTimeRecoverySpecification: {
          PointInTimeRecoveryEnabled: true,
        },
      },
      physicalResourceId: custom_resources.PhysicalResourceId.of(
        `EnablePITR-${productTableResource.tableName}`
      ),
    },
  }
);

enablePITR.node.addDependency(productTableResource);



/**
 * * Configuración de la Lambda de Denormalización
 */

// --- Rol IAM para la Lambda de Denormalización ---
const denormalizeLambdaRole = new iam.Role(backend.data.stack, 'DenormalizeLambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    //  Esta política da más permisos de los necesarios para el stream.
    // TODO => En producción, restringirla más.
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaDynamoDBExecutionRole'),
  ],
  inlinePolicies: {
    CustomDynamoDBPermissions: new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({ // Permiso para consultar la tabla ProductCategory y su GSI
          actions: ['dynamodb:Query'],
          resources: [
            productCategoryTableResource.tableArn,
            `${productCategoryTableResource.tableArn}/index/*` // Permiso para todos los GSIs de la tabla
          ],
        }),
        new iam.PolicyStatement({ 
          actions: [
            'dynamodb:UpdateItem', 
            'dynamodb:PutItem',
            'dynamodb:Query'
          ],
          resources: [productTableResource.tableArn],
        }),
      ],
    }),
  },
});

// --- Función Lambda para Denormalizar categoryIds en Product ---
const denormalizeProductCategoriesFunction = new lambda.Function(backend.data.stack, 'DenormalizeProductCategoriesFunction', {
  runtime: lambda.Runtime.NODEJS_18_X, 
  handler: 'index.handler',
  code: lambda.Code.fromAsset('amplify/functions/denormalize-product-categories'), 
  role: denormalizeLambdaRole,
  timeout: Duration.seconds(5), 
  environment: {
    PRODUCT_TABLE_NAME: productTableResource.tableName,
    PRODUCT_CATEGORY_TABLE_NAME: productCategoryTableResource.tableName,
    PRODUCT_CATEGORY_GSI_NAME: 'productCategoriesByProductId'                                     
  },
});

// --- Trigger: Conectar el Stream de ProductCategory a la Lambda de Denormalización ---
denormalizeProductCategoriesFunction.addEventSource(new DynamoEventSource(productCategoryTableResource, {
  startingPosition: StartingPosition.LATEST, // Procesar solo eventos nuevos
  batchSize: 6,
  maxBatchingWindow: Duration.seconds(2),
  bisectBatchOnError: true, 
  retryAttempts: 2, 
}));
 

/**
 * * Configuración de la Lambda de Normalización de Título
 */
 

// --- Rol IAM para la Lambda de Normalización de Título ---
const normalizeTitleLambdaRole = new iam.Role(backend.data.stack, 'NormalizeTitleLambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    // Esta política es más específica y segura que la de DynamoDBExecutionRole
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaDynamoDBExecutionRole'),
  ],
  inlinePolicies: {
    DynamoDBUpdatePolicy: new iam.PolicyDocument({
      statements: [
        // No necesitamos una política separada aquí si usamos la ManagedPolicy de arriba.
        // Pero para ser explícitos:
        new iam.PolicyStatement({
          actions: ['dynamodb:UpdateItem'],
          // El recurso es la tabla, no el stream
          resources: [productTableResource.tableArn], 
        }),
      ],
    }),
  },
});

// --- Función Lambda para Normalizar el Título del Producto ---
const normalizeProductTitleFunction = new lambda.Function(backend.data.stack, 'NormalizeProductTitleFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  // Crea una nueva carpeta para esta función
  code: lambda.Code.fromAsset('amplify/functions/normalize-product-title'),
  role: normalizeTitleLambdaRole,
  timeout: Duration.seconds(5),
  environment: {
    PRODUCT_TABLE_NAME: productTableResource.tableName,
  },
});

// --- Trigger: Conectar el Stream de Product a la Lambda de Normalización de Título ---
normalizeProductTitleFunction.addEventSource(new DynamoEventSource(productTableResource, {
  startingPosition: StartingPosition.LATEST,
  batchSize: 5,
  bisectBatchOnError: true,
  retryAttempts: 2,
  filters: [
    // {
    //   pattern: JSON.stringify({
    //     eventName: ['INSERT', 'MODIFY']
    //   })
    // }
    lambda.FilterCriteria.filter({
      eventName: lambda.FilterRule.or('INSERT', 'MODIFY'),
    }),

  ],
}));


/**
 * * Configuración de la Lambda de Limpieza de Productos Eliminados
 */
 

// --- Rol IAM para la Lambda de Limpieza de Productos Eliminados ---
const cleanupLambdaRole = new iam.Role(backend.data.stack, 'CleanupDeletedProductLambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaDynamoDBExecutionRole'),
  ],
  inlinePolicies: {
    CleanupPermissions: new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['dynamodb:Query', 'dynamodb:BatchWriteItem', 'dynamodb:DeleteItem'],
          resources: [
            productCategoryTableResource.tableArn,
            `${productCategoryTableResource.tableArn}/index/*`,
          ],
        }),
        new iam.PolicyStatement({
          actions: ['dynamodb:GetItem'],
          resources: [productTableResource.tableArn],
        }),
        new iam.PolicyStatement({
          actions: ['s3:DeleteObject', 's3:DeleteObjects'],
          resources: [`arn:aws:s3:::${s3BucketName}/*`],
        }),
        new iam.PolicyStatement({
          actions: ['s3:ListBucket'],
          resources: [`arn:aws:s3:::${s3BucketName}`],
        }),
      ],
    }),
  },
});


// --- Función Lambda para Limpieza de Productos Eliminados ---
const cleanupDeletedProductFunction = new lambda.Function(backend.data.stack, 'CleanupDeletedProductFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('amplify/functions/cleanup-deleted-product'), 
  role: cleanupLambdaRole,
  timeout: Duration.seconds(5),
  environment: {
    PRODUCT_CATEGORY_TABLE_NAME: productCategoryTableResource.tableName,
    PRODUCT_CATEGORY_GSI_NAME: 'productCategoriesByProductId',
    S3_BUCKET_NAME: s3BucketName,
  },
});


// --- Trigger: Conectar el Stream de Product a la Lambda de Limpieza --- 
cleanupDeletedProductFunction.addEventSource(new DynamoEventSource(productTableResource, { // productTableResource es tu tabla Product
  startingPosition: StartingPosition.LATEST,
  batchSize: 5, 
  bisectBatchOnError: true,
  // onFailure: new SqsDlq(productCleanupDLQ), // TODO: Descomentar para Prod y generar mecanismo para leer los mensajes fallidos de la DQL
  retryAttempts: 2, 
  maxBatchingWindow: Duration.seconds(2),
  filters: [
  {
    pattern: JSON.stringify({
      eventName: ["REMOVE"]
    })
  }
]
}));


/**
 * * Configuración de la Lambda de Tokenización para Búsqueda
 */

// --- Referencias a las Tablas ---
const productSearchTokenTableResource = backend.data.resources.tables['ProductSearchToken'];

// --- Rol IAM para la Lambda de Tokenización ---
const tokenizeProductLambdaRole = new iam.Role(backend.data.stack, 'TokenizeProductLambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaDynamoDBExecutionRole'),
  ],
  inlinePolicies: {
    TokenizePermissions: new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['dynamodb:BatchWriteItem', 'dynamodb:PutItem'],
          resources: [productSearchTokenTableResource.tableArn],
        }),
        new iam.PolicyStatement({
          actions: ['dynamodb:GetItem'],
          resources: [productTableResource.tableArn],
        }),
      ],
    }),
  },
});

// --- Función Lambda para Tokenizar Productos ---
const tokenizeProductForSearchFunction = new lambda.Function(backend.data.stack, 'TokenizeProductForSearchFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('amplify/functions/tokenize-product-for-search'),
  role: tokenizeProductLambdaRole,
  timeout: Duration.seconds(10),
  environment: {
    AMPLIFY_DATA_PRODUCTSEARCHTOKEN_TABLE_NAME: productSearchTokenTableResource.tableName,
  },
});

// --- Trigger: Conectar el Stream de Product a la Lambda de Tokenización ---
tokenizeProductForSearchFunction.addEventSource(new DynamoEventSource(productTableResource, {
  startingPosition: StartingPosition.LATEST,
  batchSize: 5,
  bisectBatchOnError: true,
  retryAttempts: 2,
  filters: [
    lambda.FilterCriteria.filter({
      eventName: lambda.FilterRule.or('INSERT', 'MODIFY'),
    }),
  ],
}));

/**
 * * Configuración de la Lambda de Sincronización de Product a ProductCategory
 */

// --- Rol IAM para la Lambda de Sincronización ---
const syncProductDataLambdaRole = new iam.Role(backend.data.stack, 'SyncProductDataLambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaDynamoDBExecutionRole'),
  ],
  inlinePolicies: {
    CustomSyncPermissions: new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['dynamodb:Query', 'dynamodb:BatchWriteItem'],
          resources: [
            productCategoryTableResource.tableArn,
            `${productCategoryTableResource.tableArn}/index/*`, // Permiso para el GSI
          ],
        }),
      ],
    }),
  },
});

// --- Función Lambda para Sincronizar datos de Product a ProductCategory ---
const syncProductToProductCategoryFunction = new lambda.Function(backend.data.stack, 'SyncProductToProductCategoryFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('amplify/functions/sync-product-to-product-category'),
  role: syncProductDataLambdaRole,
  timeout: Duration.seconds(10),
  environment: {
    PRODUCT_CATEGORY_TABLE_NAME: productCategoryTableResource.tableName,
    PRODUCT_CATEGORY_GSI_NAME: 'productCategoriesByProductId',
  },
});

// --- Trigger: Conectar el Stream de Product a la Lambda de Sincronización ---
syncProductToProductCategoryFunction.addEventSource(new DynamoEventSource(productTableResource, {
  startingPosition: StartingPosition.LATEST,
  batchSize: 5,
  bisectBatchOnError: true,
  retryAttempts: 2,
  filters: [
    lambda.FilterCriteria.filter({
      eventName: lambda.FilterRule.or('INSERT', 'MODIFY'),
    }),
  ],
}));


/*
* Configuración de OpenSearch 
*/

if (useOpenSearch) {

      // -- Crear un dominio OpenSearch
      const openSearchDomain = new opensearch.Domain(
        backend.data.stack,
        'OpenSearchDomain',
        {
          version: opensearch.EngineVersion.OPENSEARCH_2_11,
          capacity: {
            // TODO upgrade instance types for production use
            masterNodeInstanceType: "t3.small.search",
            masterNodes: 0,
            dataNodeInstanceType: "t3.small.search",
            dataNodes: 1,
          },
          nodeToNodeEncryption: true,
          // set removalPolicy to DESTROY to make sure the OpenSearch domain is deleted on stack deletion.
          removalPolicy: RemovalPolicy.DESTROY,
          encryptionAtRest: {
            enabled: true
          }
        }
      );


    // IAM role for OpenSearch integration
    const openSearchIntegrationPipelineRole = new iam.Role(
      backend.data.stack,
      "OpenSearchIntegrationPipelineRole",
      {
        assumedBy: new iam.ServicePrincipal("osis-pipelines.amazonaws.com"),
        inlinePolicies: {
          openSearchPipelinePolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: ["es:DescribeDomain"],
                resources: [
                  openSearchDomain.domainArn,
                  openSearchDomain.domainArn + "/*",
                ],
                effect: iam.Effect.ALLOW,
              }),
              new iam.PolicyStatement({
                actions: ["es:ESHttp*"],
                resources: [
                  openSearchDomain.domainArn,
                  openSearchDomain.domainArn + "/*",
                ],
                effect: iam.Effect.ALLOW,
              }),
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  "s3:GetObject",
                  "s3:AbortMultipartUpload",
                  "s3:PutObject",
                  "s3:PutObjectAcl",
                ],
                resources: [s3BucketArn, s3BucketArn + "/*"],
              }),
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  "dynamodb:DescribeTable",
                  "dynamodb:DescribeContinuousBackups",
                  "dynamodb:ExportTableToPointInTime",
                  "dynamodb:DescribeExport",
                  "dynamodb:DescribeStream",
                  "dynamodb:GetRecords",
                  "dynamodb:GetShardIterator",
                ],
                resources: [tableArn, tableArn + "/*"],
              }),
            ],
          }),
        },
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonOpenSearchIngestionFullAccess"
          ),
        ],
      }
    );


    // -- Define OpenSearch index mappings
    const indexName = "product";

    const indexMapping = {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
      },
      mappings: {
        properties: {
          id: {
            type: "keyword",
          },
          title: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                ignore_above: 256
              }
            }
          },
          description: {
            type: "text",
          },
          categoryIds: { type: "keyword" },
          price: { type: "float" },        
          code: { type: "keyword" },
          createdAt: { type: "date" },
          updatedAt: { type: "date" }
        },
      },
    };


    // OpenSearch template definition

    const openSearchTemplate = `
    version: "2"
    dynamodb-pipeline:
      source:
        dynamodb:
          acknowledgments: true
          tables:
            - table_arn: "${tableArn}"
              stream:
                start_position: "LATEST"
              export:
                s3_bucket: "${s3BucketName}"
                s3_region: "${backend.storage.stack.region}"
                s3_prefix: "${tableName}/"
          aws:
            sts_role_arn: "${openSearchIntegrationPipelineRole.roleArn}"
            region: "${backend.data.stack.region}"
      sink:
        - opensearch:
            hosts:
              - "https://${openSearchDomain.domainEndpoint}"
            index: "${indexName}"
            index_type: "custom"
            template_content: |
              ${JSON.stringify(indexMapping)}
            document_id: '\${getMetadata("primary_key")}'
            action: '\${getMetadata("opensearch_action")}'
            document_version: '\${getMetadata("document_version")}'
            document_version_type: "external"
            bulk_size: 4
            aws:
              sts_role_arn: "${openSearchIntegrationPipelineRole.roleArn}"
              region: "${backend.data.stack.region}"
    `;

      // -- Sanitizar el nombre de la rama para que cumpla con las restricciones de OSIS --

      let sanitizedSuffix = branchName.toLowerCase();
      sanitizedSuffix = sanitizedSuffix.replace(/[^a-z0-9-]/g, '-');
      sanitizedSuffix = sanitizedSuffix.replace(/-+/g, '-');
      sanitizedSuffix = sanitizedSuffix.replace(/^-+|-+$/g, '');

      if (sanitizedSuffix.length === 0) {
        sanitizedSuffix = 'default';
      }

      const prefix = 'dynamodb-integration-';
      const maxSuffixLength = 28 - prefix.length;

      if (sanitizedSuffix.length > maxSuffixLength) {
        sanitizedSuffix = sanitizedSuffix.substring(0, maxSuffixLength);
        sanitizedSuffix = sanitizedSuffix.replace(/-+$/g, '');
      }

      let uniquePipelineName = `${prefix}${sanitizedSuffix}`;

      if (!/^[a-z]/.test(uniquePipelineName)) {
        if (uniquePipelineName.length < 3) {
          uniquePipelineName = `${uniquePipelineName}pipeline`; 
        }
      }
      uniquePipelineName = uniquePipelineName.substring(0, 28); 


      const pipelineLogGroup = new logs.LogGroup(
          backend.data.stack,
          'OpenSearchIntegrationPipelineLogGroup',
          {
              logGroupName: `/aws/vendedlogs/OpenSearchIngestion/${uniquePipelineName}`,
              removalPolicy: RemovalPolicy.DESTROY, // Se elimina al destruir el stack (ideal para desarrollo)
          }
      );


      const cfnPipeline = new osis.CfnPipeline(
        backend.data.stack,
        "OpenSearchIntegrationPipeline",
        {
          maxUnits: 1, // Aumentar a 5 para produccion 
          minUnits: 1,
          pipelineConfigurationBody: openSearchTemplate,
          pipelineName: uniquePipelineName, 
          logPublishingOptions: {
            cloudWatchLogDestination: {
              logGroup: pipelineLogGroup.logGroupName,
            },
            isLoggingEnabled: true,
          },
        }
      );

      cfnPipeline.addDependency(openSearchIntegrationPipelineRole.node.defaultChild as iam.CfnRole);
      cfnPipeline.addDependency(pipelineLogGroup.node.defaultChild as logs.CfnLogGroup);

      // Add OpenSearch data source 
      const osDataSource = backend.data.addOpenSearchDataSource(
        "osDataSource",
        openSearchDomain
      );

};