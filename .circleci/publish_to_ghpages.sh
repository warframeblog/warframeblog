#!/bin/sh

set -e

echo "Checkout gh-pages branch to public directory"
git clone --single-branch --branch gh-pages https://github.com/warframeblog/warframeblog.git public
cd public
git submodule update --init --recursive
git submodule update --recursive --remote
git status
cd ..

# echo "Deleting old publication"
# rm -rf public
# git worktree prune

# echo "Checking out gh-pages branch into public"
# git worktree add -B gh-pages public origin/gh-pages

# echo "Removing existing files"
# rm -rf public/*

echo "Generating site"
npm run build

find ./public/images -name ".git" -type f -delete
find ./public/wp-content -name ".git" -type f -delete


cd public
ls wp-content/uploads
ls wp-content/uploads/2019
git submodule
git status
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