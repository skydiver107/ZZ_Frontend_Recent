#!/usr/bin/env bash
npm run build

# check deployment via github actions
echo "Deploying build"

aws s3 sync out/ s3://test-pp-web-frontend --acl public-read --profile pozzle