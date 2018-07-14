#!/bin/bash

set -e

# if [[ $(git status -s) ]]
# then
#     echo "The working directory is dirty. Please commit any pending changes."
# 	git status
#     exit 1;
# fi

echo "Deleting old publication"
rm -rf public
git worktree prune

echo "Checking out gh-pages branch into public"
git worktree add -B gh-pages public origin/gh-pages

echo "Removing existing files"
rm -rf public/*

echo "Generating site"
hugo

echo "Copying circleCI config"
cp -R .circleci public/

timestamp=$(date +%s%3N)

find ./public/images -name ".git" -type f -delete
find ./public/wp-content -name ".git" -type f -delete

echo "Publishing version $timestamp"
cd public && \
  git status && \
  git add --all && \
  git commit -m "publish_to_ghpages" && \
  git tag "$timestamp" && \
  git push origin gh-pages && \
  git push origin "$timestamp"