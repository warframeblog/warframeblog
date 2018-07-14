#!/bin/sh

set -e

if [[ $(git status -s) ]]
then
    echo "The working directory is dirty. Please commit any pending changes."
    exit 1;
fi

echo "Deleting old publication"
rm -rf public
git worktree prune

echo "Checking out gh-pages branch into public"
git worktree add -B gh-pages public origin/gh-pages

echo "Removing existing files"
rm -rf public/*

echo "Generating site"
hugo

timestamp=$(date +%s%3N)
cd public
ls

ls wp-content/uploads/2017
ls wp-content/uploads/2018
# echo "Publishing version $timestamp"
# cd public && \
#   git add --all && \
#   git commit -m "publish_to_ghpages" && \
#   git tag "$timestamp" && \
#   git push origin gh-pages && \
#   git push origin "$timestamp"