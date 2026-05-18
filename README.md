# cost-analyzer-demo

A minimal CDK TypeScript project that demonstrates [cdk-cost-analyzer](https://github.com/buildinginthecloud/cdk-cost-analyzer) running automatically on pull requests.

## What it does

On every pull request, a GitHub Action synthesizes both the base branch and the PR branch, compares the resulting CloudFormation templates, and posts a per-resource cost-impact comment on the PR — including monthly delta, trend arrows, and a service-level breakdown.

## Stack

- Lambda function (Node.js 20) returning a "Hello, World!" JSON response
- API Gateway REST API with a single `GET /` endpoint

## Local commands

```bash
npm install
npm test
npx cdk synth
```

## Demo flow

1. Open a pull request against `main`
2. The `pull-request` workflow runs cost-analysis against the diff
3. A comment appears on the PR with the cost breakdown

Configuration lives in `.cdk-cost-analyzer.yml` (thresholds, assumptions).
