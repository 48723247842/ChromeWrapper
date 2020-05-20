#!/bin/bash

GITHUB_USER_NAME="mediabox"
GITHUB_USER_EMAIL="mediabox@mediabox.com"
GITHUB_SSH_REPOSITORY_URL="http://192.168.1.100:3000/mediabox/ChromeWrapper.git"

function is_int() { return $(test "$@" -eq "$@" > /dev/null 2>&1); }
ssh-add -D
git init
git config --global --unset user.name
git config --global --unset user.email
git config user.name "$GITHUB_USER_NAME"
git config user.email "$GITHUB_USER_EMAIL"
ssh-add -k $GITHUB_PRIVATE_KEY_PATH

LastCommit=$(git log -1 --pretty="%B" | xargs)
# https://stackoverflow.com/a/3626205
if $(is_int "${LastCommit}");
    then
    NextCommitNumber=$((LastCommit+1))
else
    echo "Not an integer Resetting"
    NextCommitNumber=1
fi
#echo "$NextCommitNumber"
git add .
git commit -m "$NextCommitNumber"
git remote add gogs $GITHUB_SSH_REPOSITORY_URL
git push gogs
