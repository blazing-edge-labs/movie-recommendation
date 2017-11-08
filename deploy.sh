#!/usr/bin/env bash
set -e

export NODE_ENV=production

buildpack-nodejs-build
buildpack-nodejs-run -e .env npm i
buildpack-nodejs-run -e .env npm run build

sudo systemctl restart movierec
sudo nginx -s reload
