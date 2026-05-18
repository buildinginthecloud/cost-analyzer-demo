import { awscdk } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { NodePackageManager } from 'projen/lib/javascript';

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.172.0',
  defaultReleaseBranch: 'main',
  name: 'cost-analyzer-demo',
  description: 'CDK demo project showcasing cdk-cost-analyzer cost-impact analysis on pull requests',
  authorName: 'Yvo van Zee',
  authorEmail: 'yvo@cloudar.nl',
  projenrcTs: true,
  packageManager: NodePackageManager.NPM,
  appEntrypoint: 'Main.ts',

  deps: [
    'aws-cdk-lib',
    'constructs',
    '@types/aws-lambda',
  ],

  devDeps: [
    'cdk-cost-analyzer',
    '@types/node',
  ],

  github: true,
  githubOptions: {
    pullRequestLint: true,
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: ['feat', 'fix', 'chore', 'build', 'docs', 'refactor'],
      },
    },
  },
  buildWorkflow: true,
});

project.gitignore.exclude('cdk.context.json', 'cdk.out.target/', 'cdk.out.base/');

// Pull request workflow with cost analysis
const prWorkflow = project.github!.addWorkflow('pull-request');

prWorkflow.on({
  pullRequest: {
    branches: ['main'],
  },
});

prWorkflow.addJob('cost-analysis', {
  runsOn: ['ubuntu-latest'],
  permissions: {
    idToken: JobPermission.WRITE,
    contents: JobPermission.READ,
    pullRequests: JobPermission.WRITE,
  },
  env: {
    NODE_VERSION: '20',
    AWS_REGION: 'eu-central-1',
  },
  steps: [
    {
      name: 'Checkout',
      uses: 'actions/checkout@v4',
      with: {
        'fetch-depth': 0,
      },
    },
    {
      name: 'Setup Node.js',
      uses: 'actions/setup-node@v4',
      with: {
        'node-version': '${{ env.NODE_VERSION }}',
        'cache': 'npm',
      },
    },
    {
      name: 'Install dependencies',
      run: 'npm install',
    },
    {
      name: 'Configure AWS credentials',
      uses: 'aws-actions/configure-aws-credentials@v4',
      with: {
        'role-to-assume': '${{ secrets.AWS_ROLE_ARN }}',
        'role-session-name': 'github-cost-analyzer',
        'aws-region': '${{ env.AWS_REGION }}',
      },
    },
    {
      name: 'Set CDK environment variables',
      run: [
        'echo "CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)" >> $GITHUB_ENV',
        'echo "CDK_DEFAULT_REGION=${{ env.AWS_REGION }}" >> $GITHUB_ENV',
      ].join('\n'),
    },
    {
      name: 'Synthesize current branch',
      run: 'npx cdk synth --all --output cdk.out.target',
    },
    {
      name: 'Checkout base branch and synthesize',
      run: [
        'git fetch origin main',
        'git checkout main',
        'npm install',
        'npx cdk synth --all --output cdk.out.base',
      ].join('\n'),
    },
    {
      name: 'Checkout PR branch',
      run: 'git checkout -',
    },
    {
      name: 'Run cost analysis',
      run: [
        'npx cdk-cost-analyzer compare cdk.out.base/*.template.json cdk.out.target/*.template.json --region ${{ env.AWS_REGION }} --format markdown > cost-analysis-raw.md 2>&1 || true',
        '# Filter out $0.00 added-resource rows for a cleaner comment',
        "sed -E '/^\\| .* \\| `AWS::[^`]+` \\| \\$0\\.00 \\|$/d' cost-analysis-raw.md > cost-analysis.md",
      ].join('\n'),
    },
    {
      name: 'Comment PR',
      uses: 'actions/github-script@v7',
      with: {
        script: [
          "const fs = require('fs');",
          "const comment = fs.readFileSync('cost-analysis.md', 'utf8');",
          'github.rest.issues.createComment({',
          '  issue_number: context.issue.number,',
          '  owner: context.repo.owner,',
          '  repo: context.repo.repo,',
          '  body: comment',
          '});',
        ].join('\n'),
      },
    },
  ],
});

project.synth();
