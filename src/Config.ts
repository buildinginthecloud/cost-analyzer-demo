export interface AppConfig {
  readonly account: string;
  readonly region: string;
  readonly environment: string;
}

export function loadConfig(): AppConfig {
  return {
    account: process.env.CDK_DEFAULT_ACCOUNT ?? '000000000000',
    region: process.env.CDK_DEFAULT_REGION ?? 'eu-central-1',
    environment: process.env.ENVIRONMENT ?? 'dev',
  };
}
