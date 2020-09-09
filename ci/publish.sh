#!/bin/bash

set -e

yarn install
yarn build

VERSION=`yarn version --non-interactive 2>/dev/null | grep 'Current version' | awk '{ print $4 }'`
if [ "$DRONE_BUILD_EVENT" == "pull_request" ]; then
	TAG=pr-$DRONE_PULL_REQUEST
	PUBLISHVERSION="$VERSION-pr$DRONE_PULL_REQUEST.$DRONE_BUILD_NUMBER"
elif [ "$DRONE_BUILD_EVENT" == "tag" ]; then
	if [ "$DRONE_TAG" != "$VERSION" ]; then
		exit 1
	fi
	PUBLISHVERSION=$VERSION
	TAG="latest"
else
	exit 1
fi

yarn publish --non-interactive --no-git-tag-version --tag "$TAG" --new-version "$PUBLISHVERSION"