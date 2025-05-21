import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage, storageOpensearch } from './storage/resource';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as iam from "aws-cdk-lib/aws-iam";
import * as osis from "aws-cdk-lib/aws-osis";
import * as logs from "aws-cdk-lib/aws-logs";
import * as lambda from 'aws-cdk-lib/aws-lambda';
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

// --- Referencias a las Tablas ---
const productTableResource = backend.data.resources.tables['Product'];
const productCategoryTableResource = backend.data.resources.tables['ProductCategory'];

// --- Referencias a las Tablas (accediendo directamente a los recursos CfnTable L1) ---
const cfnProductTable = backend.data.resources.cfnResources.amplifyDynamoDbTables['Product'];
const cfnProductCategoryTable = backend.data.resources.cfnResources.amplifyDynamoDbTables['ProductCategory'];

// --- Habilitar Streams ---

if (cfnProductTable) {
  cfnProductTable.pointInTimeRecoveryEnabled = true; 
  cfnProductTable.streamSpecification = {
    streamViewType: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, 
  };
  console.log("StreamSpecification configurada para Product table.");
} else {
  console.error("ERROR: No se encontró CfnTable para 'Product'. El Stream no se pudo habilitar.");
}

if (cfnProductCategoryTable) {
  // cfnProductCategoryTable.pointInTimeRecoveryEnabled = true; 
  cfnProductCategoryTable.streamSpecification = {
    streamViewType: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, 
  };
  console.log("StreamSpecification configurada para ProductCategory table.");
} else {
  console.error("ERROR: No se encontró CfnTable para 'ProductCategory'. El Stream para la Lambda de denormalización no se pudo habilitar.");
  throw new Error("CfnTable for 'ProductCategory' not found.");
}

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
        new iam.PolicyStatement({ // Permiso para actualizar la tabla Product
          actions: ['dynamodb:UpdateItem', 'dynamodb:PutItem'],
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
  timeout: Duration.seconds(60), 
  environment: {
    PRODUCT_TABLE_NAME: productTableResource.tableName,
    PRODUCT_CATEGORY_TABLE_NAME: productCategoryTableResource.tableName,
    PRODUCT_CATEGORY_GSI_NAME: 'productCategoriesByProductId'                                     
  },
});

// --- Trigger: Conectar el Stream de ProductCategory a la Lambda ---
denormalizeProductCategoriesFunction.addEventSource(new DynamoEventSource(productCategoryTableResource, {
  startingPosition: StartingPosition.LATEST, // Procesar solo eventos nuevos
  batchSize: 100, // Ajusta según el volumen esperado
  bisectBatchOnError: true, // Si un batch falla, reintentar con batches más pequeños
  retryAttempts: 3, // Reintentos
}));



const productTable =
  backend.data.resources.cfnResources.amplifyDynamoDbTables['Product'];

// Actualizar configuración de la tabla
productTable.pointInTimeRecoveryEnabled = true;

productTable.streamSpecification = {
  streamViewType: dynamodb.StreamViewType.NEW_IMAGE,
};

// Obtener el ARN de la tabla DynamoDB
const tableArn = backend.data.resources.tables['Product'].tableArn;
// Obtener el nombre de la tabla DynamoDB
const tableName = backend.data.resources.tables['Product'].tableName;





// Create the OpenSearch domain
const openSearchDomain = new opensearch.Domain(
  backend.data.stack,
  'OpenSearchDomain',
  {
    version: opensearch.EngineVersion.OPENSEARCH_2_11,
    capacity: {
      // upgrade instance types for production use
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



// Get the S3Bucket ARN
const s3BucketArn = backend.storage.resources.bucket.bucketArn;
// Get the S3Bucket Name
const s3BucketName = backend.storage.resources.bucket.bucketName;


// Create an IAM role for OpenSearch integration
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


// Define OpenSearch index mappings
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



const branchName = process.env.AWS_BRANCH || 'local';

if (!branchName) {
  throw new Error(
    "La variable de entorno AWS_BRANCH no está definida. " +
    "Es necesaria para crear nombres de recursos únicos. " +
    "Asegúrate de estar desplegando a través de la consola de Amplify o la CLI de Amplify."
  );
}

// Sanitizar el nombre de la rama para que cumpla con las restricciones de OSIS: [a-z][a-z0-9-]+
// y longitud (3-28 caracteres para el nombre completo de la pipeline)

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

const osisDedicatedLogGroupName = `${uniquePipelineName}-pipeline-logs`; 

const osisPipelineLogGroup = new logs.LogGroup(backend.data.stack, "OsisPipelineDedicatedLogGroup", {
  logGroupName: osisDedicatedLogGroupName, 
  removalPolicy: RemovalPolicy.DESTROY,
});

const cfnPipeline = new osis.CfnPipeline(
  backend.data.stack,
  "OpenSearchIntegrationPipeline",
  {
    maxUnits: 4,
    minUnits: 1,
    pipelineConfigurationBody: openSearchTemplate,
    pipelineName: uniquePipelineName, 
    logPublishingOptions: {
      isLoggingEnabled: true,
      cloudWatchLogDestination: {
        logGroup: osisPipelineLogGroup.logGroupName,
      },
    },
  }
);


// Add OpenSearch data source 
const osDataSource = backend.data.addOpenSearchDataSource(
  "osDataSource",
  openSearchDomain
);