import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DatabaseConstruct } from '../constructs/DatabaseConstruct';
import { HelloWorldConstruct } from '../constructs/HelloWorldConstruct';

export interface HelloWorldStackProps extends StackProps {
  readonly environment: string;
}

export class HelloWorldStack extends Stack {
  constructor(scope: Construct, id: string, props: HelloWorldStackProps) {
    super(scope, id, props);

    const database = new DatabaseConstruct(this, 'Database', {
      environment: props.environment,
    });

    const helloWorld = new HelloWorldConstruct(this, 'HelloWorld', {
      environment: props.environment,
      vpc: database.vpc,
      database: database.cluster,
    });

    new CfnOutput(this, 'ApiEndpointUrl', {
      value: helloWorld.apiUrl,
      description: 'API Gateway endpoint URL',
    });

    new CfnOutput(this, 'DatabaseEndpoint', {
      value: database.cluster.clusterEndpoint.hostname,
      description: 'Aurora cluster endpoint',
    });

    Tags.of(this).add('Environment', props.environment);
    Tags.of(this).add('Application', 'HelloWorld');
  }
}
