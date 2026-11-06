import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import { LambdaIntegration, MethodLoggingLevel, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IVpc, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { DatabaseCluster } from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export interface HelloWorldConstructProps {
  readonly environment: string;
  readonly vpc?: IVpc;
  readonly database?: DatabaseCluster;
}

export class HelloWorldConstruct extends Construct {
  public readonly function: NodejsFunction;
  public readonly api: RestApi;
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: HelloWorldConstructProps) {
    super(scope, id);

    this.function = new NodejsFunction(this, 'Handler', {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, 'handler', 'Index.ts'),
      handler: 'handler',
      memorySize: 128,
      timeout: Duration.seconds(10),
      vpc: props.vpc,
      vpcSubnets: props.vpc ? { subnetType: SubnetType.PRIVATE_WITH_EGRESS } : undefined,
      environment: {
        ENVIRONMENT: props.environment,
        DB_HOST: props.database?.clusterEndpoint.hostname ?? '',
        DB_PORT: props.database?.clusterEndpoint.port.toString() ?? '',
      },
    });

    if (props.database) {
      props.database.connections.allowDefaultPortFrom(this.function);
    }

    this.api = new RestApi(this, 'Api', {
      restApiName: `hello-world-${props.environment}`,
      description: 'Hello World API',
      deployOptions: {
        stageName: props.environment,
        loggingLevel: MethodLoggingLevel.INFO,
      },
    });

    this.api.root.addMethod('GET', new LambdaIntegration(this.function));
    this.apiUrl = this.api.url;
  }
}
