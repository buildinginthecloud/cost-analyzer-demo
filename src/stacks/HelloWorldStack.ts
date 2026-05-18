import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { HelloWorldConstruct } from '../constructs/HelloWorldConstruct';

export interface HelloWorldStackProps extends StackProps {
  readonly environment: string;
}

export class HelloWorldStack extends Stack {
  constructor(scope: Construct, id: string, props: HelloWorldStackProps) {
    super(scope, id, props);

    const helloWorld = new HelloWorldConstruct(this, 'HelloWorld', {
      environment: props.environment,
    });

    new CfnOutput(this, 'ApiEndpointUrl', {
      value: helloWorld.apiUrl,
      description: 'API Gateway endpoint URL',
    });

    Tags.of(this).add('Environment', props.environment);
    Tags.of(this).add('Application', 'HelloWorld');
  }
}
