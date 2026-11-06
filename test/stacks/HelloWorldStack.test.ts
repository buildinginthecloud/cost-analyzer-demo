import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { HelloWorldStack } from '../../src/stacks/HelloWorldStack';

test('Stack contains Lambda, API, VPC, NAT, and Aurora cluster', () => {
  const app = new App();
  const stack = new HelloWorldStack(app, 'TestStack', { environment: 'test' });
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::Lambda::Function', 1);
  template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.resourceCountIs('AWS::EC2::NatGateway', 1);
  template.resourceCountIs('AWS::RDS::DBCluster', 1);
});
