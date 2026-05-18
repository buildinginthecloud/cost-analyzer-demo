import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { HelloWorldStack } from '../../src/stacks/HelloWorldStack';

test('Stack contains a Lambda function and a REST API', () => {
  const app = new App();
  const stack = new HelloWorldStack(app, 'TestStack', { environment: 'test' });
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::Lambda::Function', 1);
  template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
});
