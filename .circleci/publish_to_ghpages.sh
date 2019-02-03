#!/bin/sh

set -e

echo "Deleting old publication"
rm -rf public
git worktree prune

echo "Checking out gh-pages branch into public"
git worktree add -B gh-pages public origin/gh-pages

echo "Removing existing files"
rm -rf public/*

echo "Generating site"
npm run build

find ./public/images -name ".git" -type f -delete
find ./public/wp-content -name ".git" -type f -delete


cd public

rm -rf wp-content/uploads/2019/*
git submodule add https://github.com/warframeblog/images2019.git wp-content/uploads/2019

if [[ -z $(git status --porcelain) ]]; then
    echo "There are no changes to commit.";
    exit 0;
fi

timestamp=$(date +%s%3N)
echo "Publishing version $timestamp"
git status && \
  git add --all && \
  git commit -m "publish_to_ghpage $timestamps [ci skip]" && \
  git tag "$timestamp" && \
  git push origin gh-pages && \
  git push origin "$timestamp"