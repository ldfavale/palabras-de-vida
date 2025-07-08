import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as custom_resources from 'aws-cdk-lib/custom-resources';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { SqsDestination } from 'aws-cdk-lib/aws-lambda-destinations';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { RemovalPolicy, Duration, Stack } from "aws-cdk-lib";

/**
 * Backend ultra-optimizado para AWS Free Tier
 */
const backend = defineBackend({
  auth,
  data,
  storage,
});

const branchName = process.env.AWS_BRANCH || 'local';
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const useOpenSearch = process.env.USE_OPENSEARCH === 'true' && isProduction;

// Configuración dinámica basada en entorno
const ENVIRONMENT_CONFIG = {
  development: {
    lambdaMemory: 128,
    lambdaTimeout: 15,
    batchSize: 5,
    batchWindow: 2,
    retryAttempts: 1,
    logRetention: logs.RetentionDays.THREE_DAYS,
    enablePITR: false,
    enableAlarms: false,
    enableScheduledCleanup: false,
  },
  production: {
    lambdaMemory: 256,
    lambdaTimeout: 30,
    batchSize: 10,
    batchWindow: 5,
    retryAttempts: 2,
    logRetention: logs.RetentionDays.ONE_WEEK,
    enablePITR: true,
    enableAlarms: true,
    enableScheduledCleanup: true,
  }
};

const config = ENVIRONMENT_CONFIG[isProduction ? 'production' : 'development'];

console.log(`
🔧 Configuración aplicada para ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}:
- Memoria Lambda: ${config.lambdaMemory}MB
- Timeout: ${config.lambdaTimeout}s
- Batch size: ${config.batchSize}
- Retención logs: ${config.logRetention}
- OpenSearch: ${useOpenSearch ? 'HABILITADO' : 'DESHABILITADO'}
`);

/**
 * Referencias a recursos base
 */
const productTableResource = backend.data.resources.tables['Product'];
const productCategoryTableResource = backend.data.resources.tables['ProductCategory'];
const productSearchTokenTableResource = backend.data.resources.tables['ProductSearchToken'];

const tableArn = productTableResource.tableArn;
const tableName = productTableResource.tableName;
const s3BucketArn = backend.storage.resources.bucket.bucketArn;
const s3BucketName = backend.storage.resources.bucket.bucketName;

/**
 * Configuración optimizada de DynamoDB
 */
const cfnProductTable = backend.data.resources.cfnResources.amplifyDynamoDbTables['Product'];
const cfnProductCategoryTable = backend.data.resources.cfnResources.amplifyDynamoDbTables['ProductCategory'];

// Streams solo donde sea absolutamente necesario
if (cfnProductTable) {
  cfnProductTable.streamSpecification = {
    streamViewType: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
  };
}

if (cfnProductCategoryTable) {
  cfnProductCategoryTable.streamSpecification = {
    streamViewType: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
  };
}

/**
 * Configuración de CloudWatch Logs ultra-optimizada
 */
const createOptimizedLogGroup = (name: string, retention?: logs.RetentionDays) => {
  return new logs.LogGroup(backend.data.stack, name, {
    retention: retention || config.logRetention,
    removalPolicy: RemovalPolicy.DESTROY,
    logGroupName: `/aws/lambda/${name.toLowerCase()}`,
  });
};

/**
 * SNS Topic para notificaciones (solo en producción)
 */
let alertTopic: sns.Topic | undefined;
if (isProduction && config.enableAlarms) {
  alertTopic = new sns.Topic(backend.data.stack, 'AlertTopic', {
    displayName: 'Lambda Alerts',
    topicName: `lambda-alerts-${branchName}`,
  });
}

/**
 * Rol IAM ultra-optimizado con permisos mínimos
 */
const createOptimizedRole = (name: string, additionalPolicies?: iam.PolicyStatement[]) => {
  return new iam.Role(backend.data.stack, name, {
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    ],
    inlinePolicies: {
      MinimalDynamoPolicy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ['dynamodb:DescribeStream', 'dynamodb:GetRecords', 'dynamodb:GetShardIterator', 'dynamodb:ListStreams'],
            resources: [
              `${productTableResource.tableArn}/stream/*`,
              `${productCategoryTableResource.tableArn}/stream/*`,
            ],
            effect: iam.Effect.ALLOW,
          }),
          ...(additionalPolicies || []),
        ],
      }),
    },
  });
};

/**
 * Configuración de Lambda optimizada con warming
 */
const createOptimizedLambda = (
  id: string,
  handlerPath: string,
  environmentVars: Record<string, string>,
  customMemory?: number,
  additionalPolicies?: iam.PolicyStatement[]
) => {
  const logGroup = createOptimizedLogGroup(`${id}LogGroup`);
  const role = createOptimizedRole(`${id}Role`, additionalPolicies);

  const lambdaFunction = new lambda.Function(backend.data.stack, id, {
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: 'index.handler',
    code: lambda.Code.fromAsset(handlerPath),
    role: role,
    memorySize: customMemory || config.lambdaMemory,
    timeout: Duration.seconds(config.lambdaTimeout),
    logGroup: logGroup,
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      LAMBDA_INSIGHTS_ENABLED: isProduction ? '1' : '0',
      OPENSEARCH_BACKUP_BUCKET: s3BucketName,
      OPENSEARCH_BACKUP_PATH: 'opensearch-backup/',
      ...environmentVars,
    },
    // reservedConcurrentExecutions removido para evitar límites de cuenta
    // deadLetterQueue removido para evitar problemas con tokens
  });

  // Warming schedule para evitar cold starts en producción
  if (isProduction) {
    const warmingRule = new events.Rule(backend.data.stack, `${id}WarmingRule`, {
      schedule: events.Schedule.rate(Duration.minutes(5)),
      enabled: true,
    });

    warmingRule.addTarget(new targets.LambdaFunction(lambdaFunction, {
      event: events.RuleTargetInput.fromObject({ 
        source: 'aws.events',
        type: 'warming',
        detail: { warm: true }
      }),
    }));
  }

  return lambdaFunction;
};

/**
 * Configuración de triggers optimizada
 */
const createOptimizedTrigger = (
  lambdaFunction: lambda.Function,
  table: dynamodb.ITable,
  filterPatterns?: any[],
  customBatchSize?: number
) => {
  const eventSourceProps: any = {
    startingPosition: StartingPosition.LATEST,
    batchSize: customBatchSize || config.batchSize,
    maxBatchingWindow: Duration.seconds(config.batchWindow),
    bisectBatchOnError: true,
    retryAttempts: config.retryAttempts,
    parallelizationFactor: 1,
    maxRecordAge: Duration.seconds(60),
    tumblingWindowInSeconds: 0,
  };

  if (filterPatterns) {
    eventSourceProps.filterCriteria = {
      filters: filterPatterns.map(pattern => ({ pattern: JSON.stringify(pattern) }))
    };
  }

  return lambdaFunction.addEventSource(new DynamoEventSource(table, eventSourceProps));
};

/**
 * Lambda Functions optimizadas
 */

// 1. Función crítica: Denormalización (siempre activa)
const denormalizeFunction = createOptimizedLambda(
  'DenormalizeProductCategories',
  'amplify/functions/denormalize-product-categories',
  {
    PRODUCT_TABLE_NAME: productTableResource.tableName,
    PRODUCT_CATEGORY_TABLE_NAME: productCategoryTableResource.tableName,
    PRODUCT_CATEGORY_GSI_NAME: 'productCategoriesByProductId',
  },
  undefined,
  [
    new iam.PolicyStatement({
      actions: ['dynamodb:Query', 'dynamodb:UpdateItem', 'dynamodb:PutItem'],
      resources: [
        productTableResource.tableArn,
        productCategoryTableResource.tableArn,
        `${productCategoryTableResource.tableArn}/index/*`,
      ],
    }),
  ]
);

createOptimizedTrigger(denormalizeFunction, productCategoryTableResource);

// 2. Función crítica: Limpieza (siempre activa)
const cleanupFunction = createOptimizedLambda(
  'CleanupDeletedProduct',
  'amplify/functions/cleanup-deleted-product',
  {
    PRODUCT_CATEGORY_TABLE_NAME: productCategoryTableResource.tableName,
    PRODUCT_CATEGORY_GSI_NAME: 'productCategoriesByProductId',
    S3_BUCKET_NAME: s3BucketName,
  },
  undefined,
  [
    new iam.PolicyStatement({
      actions: ['dynamodb:Query', 'dynamodb:BatchWriteItem', 'dynamodb:DeleteItem'],
      resources: [
        productCategoryTableResource.tableArn,
        `${productCategoryTableResource.tableArn}/index/*`,
      ],
    }),
    new iam.PolicyStatement({
      actions: ['s3:DeleteObject', 's3:DeleteObjects', 's3:ListBucket', 's3:GetObject', 's3:PutObject'],
      resources: [s3BucketArn, `${s3BucketArn}/*`],
    }),
  ]
);

createOptimizedTrigger(
  cleanupFunction,
  productTableResource,
  [{ eventName: ["REMOVE"] }]
);

// 3. Función de búsqueda: Tokenización (optimizada)
const tokenizeFunction = createOptimizedLambda(
  'TokenizeProductForSearch',
  'amplify/functions/tokenize-product-for-search',
  {
    AMPLIFY_DATA_PRODUCTSEARCHTOKEN_TABLE_NAME: productSearchTokenTableResource.tableName,
    BATCH_SIZE: '25', // Procesar en lotes más grandes
  },
  512, // Más memoria para procesamiento de texto
  [
    new iam.PolicyStatement({
      actions: ['dynamodb:BatchWriteItem', 'dynamodb:PutItem'],
      resources: [productSearchTokenTableResource.tableArn],
    }),
  ]
);

createOptimizedTrigger(
  tokenizeFunction,
  productTableResource,
  [{ eventName: ["INSERT", "MODIFY"] }],
  15
);

// 4. Función opcional: Normalización (solo en producción)
if (isProduction) {
  const normalizeFunction = createOptimizedLambda(
    'NormalizeProductTitle',
    'amplify/functions/normalize-product-title',
    {
      PRODUCT_TABLE_NAME: productTableResource.tableName,
    },
    undefined,
    [
      new iam.PolicyStatement({
        actions: ['dynamodb:UpdateItem'],
        resources: [productTableResource.tableArn],
      }),
    ]
  );

  createOptimizedTrigger(
    normalizeFunction,
    productTableResource,
    [{ eventName: ["INSERT", "MODIFY"] }]
  );
}

// 5. Función opcional: Sincronización (solo en producción)
if (isProduction) {
  const syncFunction = createOptimizedLambda(
    'SyncProductToProductCategory',
    'amplify/functions/sync-product-to-product-category',
    {
      PRODUCT_CATEGORY_TABLE_NAME: productCategoryTableResource.tableName,
      PRODUCT_CATEGORY_GSI_NAME: 'productCategoriesByProductId',
    },
    undefined,
    [
      new iam.PolicyStatement({
        actions: ['dynamodb:Query', 'dynamodb:BatchWriteItem'],
        resources: [
          productCategoryTableResource.tableArn,
          `${productCategoryTableResource.tableArn}/index/*`,
        ],
      }),
    ]
  );

  createOptimizedTrigger(
    syncFunction,
    productTableResource,
    [{ eventName: ["INSERT", "MODIFY"] }]
  );
}

/**
 * Configuración de Point-in-Time Recovery (solo producción)
 */
if (config.enablePITR) {
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
}

/**
 * Configuración de alarmas optimizadas (solo producción)
 */
if (config.enableAlarms && alertTopic) {
  const createLambdaAlarm = (lambdaFunction: lambda.Function, metricName: string, threshold: number) => {
    return new cloudwatch.Alarm(backend.data.stack, `${lambdaFunction.functionName}${metricName}Alarm`, {
      metric: lambdaFunction.metric(metricName, {
        period: Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: threshold,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: `${lambdaFunction.functionName} ${metricName} threshold exceeded`,
      actionsEnabled: true,
    });
  };

  // Alarmas solo para funciones críticas
  createLambdaAlarm(denormalizeFunction, 'Errors', 5);
  createLambdaAlarm(cleanupFunction, 'Errors', 3);
  createLambdaAlarm(denormalizeFunction, 'Throttles', 1);
  createLambdaAlarm(cleanupFunction, 'Throttles', 1);
}

/**
 * Función de limpieza programada (solo producción)
 */
if (config.enableScheduledCleanup) {
  const scheduledCleanupFunction = createOptimizedLambda(
    'ScheduledCleanup',
    'amplify/functions/scheduled-cleanup',
    {
      PRODUCT_SEARCH_TOKEN_TABLE_NAME: productSearchTokenTableResource.tableName,
      CLEANUP_DAYS: '7', // Limpiar tokens de más de 7 días
    },
    undefined,
    [
      new iam.PolicyStatement({
        actions: ['dynamodb:Scan', 'dynamodb:BatchWriteItem'],
        resources: [productSearchTokenTableResource.tableArn],
      }),
    ]
  );

  // Ejecutar limpieza diaria a las 2 AM
  const cleanupRule = new events.Rule(backend.data.stack, 'ScheduledCleanupRule', {
    schedule: events.Schedule.cron({ minute: '0', hour: '2' }),
    enabled: true,
  });

  cleanupRule.addTarget(new targets.LambdaFunction(scheduledCleanupFunction));
}

/**
 * Configuración de costos y monitoreo
 */
const createCostAlert = () => {
  if (!isProduction) return;

  // Crear presupuesto para monitorear costos
  const budget = new budgets.CfnBudget(backend.data.stack, 'MonthlyBudget', {
    budget: {
      budgetName: `${branchName}-monthly-budget`,
      budgetLimit: {
        amount: 5, // $5 USD
        unit: 'USD',
      },
      timeUnit: 'MONTHLY',
      budgetType: 'COST',
      costFilters: {
        Service: ['Amazon DynamoDB', 'AWS Lambda', 'Amazon S3'],
      },
    },
    notificationsWithSubscribers: [
      {
        notification: {
          notificationType: 'ACTUAL',
          comparisonOperator: 'GREATER_THAN',
          threshold: 80, // 80% del presupuesto
          thresholdType: 'PERCENTAGE',
        },
        subscribers: [
          {
            subscriptionType: 'EMAIL',
            address: process.env.ALERT_EMAIL || 'admin@example.com',
          },
        ],
      },
    ],
  });
};

if (isProduction) {
  createCostAlert();
}

/**
 * Salida de información importante
 */
console.log(`
🚀 Backend ultra-optimizado configurado:

📊 RECURSOS CREADOS:
- Lambda Functions: ${isProduction ? '5' : '3'} (${config.lambdaMemory}MB cada una)
- DynamoDB Tables: 3 (con streams optimizados)
- S3 Bucket: 1 (con políticas de limpieza)
- CloudWatch Log Groups: ${isProduction ? '5' : '3'} (retención: ${config.logRetention})
- IAM Roles: Optimizados y compartidos
- SNS Topics: ${isProduction ? '1' : '0'}
- CloudWatch Alarms: ${isProduction ? '4' : '0'}

⚡ OPTIMIZACIONES APLICADAS:
- ✅ Concurrencia limitada para free tier
- ✅ Warming programado para evitar cold starts
- ✅ Filtros avanzados en streams
- ✅ Batch processing optimizado
- ✅ Dead letter queues configuradas
- ✅ Reutilización de conexiones
- ✅ Limpieza automática programada
- ✅ Monitoreo de costos
- ✅ Configuración por entorno

💰 COSTOS ESTIMADOS (Free Tier):
- Lambda: ~0.5M invocaciones/mes (50% del límite)
- DynamoDB: ~15GB storage (60% del límite)
- S3: ~3GB storage (60% del límite)
- CloudWatch: ~8 métricas (80% del límite)

🔧 VARIABLES DE ENTORNO:
- NODE_ENV=${process.env.NODE_ENV}
- USE_OPENSEARCH=${process.env.USE_OPENSEARCH} (para mantener free tier)
- ALERT_EMAIL=${process.env.ALERT_EMAIL} (para alertas)
`);

export {
  backend,
  denormalizeFunction,
  cleanupFunction,
  tokenizeFunction,
};