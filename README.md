# site

git clone --recurse-submodules -j8 https://github.com/warframeblog/warframeblog.git

git worktree add -B gh-pages public gh-pages
hugo
cd public && git add --all && git commit -m "Publishing to gh-pages" && cd ..
cd public && git push && cd ..
rm -rf public/*
git worktree prune