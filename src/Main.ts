import { App, Tags } from 'aws-cdk-lib';
import { loadConfig } from './Config';
import { HelloWorldStack } from './stacks/HelloWorldStack';

const config = loadConfig();
const app = new App();

new HelloWorldStack(app, 'HelloWorldStack', {
  env: config.account
    ? { account: config.account, region: config.region }
    : undefined,
  environment: config.environment,
  description: `Hello World CDK application for ${config.environment}`,
});

Tags.of(app).add('Project', 'cost-analyzer-demo');
Tags.of(app).add('ManagedBy', 'CDK');

app.synth();
