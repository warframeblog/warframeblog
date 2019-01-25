#!/bin/sh

set -e

timestamp=$(date +%s%3N)
echo "Updating trader inventory $timestamp"
git status && \
  git add --all && \
  git commit -m "Update trader inventory $timestamps" && \
  git push origin develop