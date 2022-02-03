#!/bin/bash

set -eo pipefail

VERSION=`yarn version --non-interactive 2>/dev/null | grep 'Current version' | awk '{ print $4 }'`
if [[ ! -z "{$PR_NUMBER}" ]]; then
  echo "Setting tag/version for pr build."
	TAG=pr-$PR_NUMBER
	PUBLISHVERSION="$VERSION-pr$PR_NUMBER.$GITHUB_RUN_NUMBER"
elif [[ "{$GITHUB_REF_TYPE}" == "tag" ]]; then
	if [[ "{$GITHUB_REF_NAME}" != "{$VERSION}" ]]; then
	  echo "Tag version does not match package version. They should mathc. Exiting"
		exit 1
	fi
	echo "Setting tag/version for release/tag build."
	PUBLISHVERSION=$VERSION
	TAG="latest"
else
	exit 1
fi

yarn publish --non-interactive --no-git-tag-version --tag "$TAG" --new-version "$PUBLISHVERSION"
