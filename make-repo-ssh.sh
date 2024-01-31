#!/bin/bash

# Get the current Git remote URL (origin)
CURRENT_URL=$(git config --get remote.origin.url)

# Verify if the URL is an HTTPS URL
if [[ $CURRENT_URL == https://* ]]; then
  # Extract the repository name from the URL
  REPO_NAME=$(basename "$CURRENT_URL" ".git")

  # Update the Git remote URL to use SSH
  NEW_URL="git@github.com:$(basename $(dirname "$CURRENT_URL"))/${REPO_NAME}.git"
  git remote set-url origin "$NEW_URL"

  # Verify the changes
  git remote -v

  echo "Git remote URL updated to SSH."
else
  echo "The current Git remote URL is already using SSH."
fi
