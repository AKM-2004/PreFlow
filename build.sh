#!/bin/bash

# Variables
VERSION_FILE=version.txt
DOCKER_USERNAME=Adkmboi
CLIENT_IMAGE_NAME=preflow-app

# Ensure version file exists
if [ ! -f "$VERSION_FILE" ]; then
    echo "0.1.0" > "$VERSION_FILE"
fi

# Read version from file
VERSION=$(cat "$VERSION_FILE")
MAJOR=$(echo $VERSION | cut -d. -f1)
MINOR=$(echo $VERSION | cut -d. -f2)
PATCH=$(echo $VERSION | cut -d. -f3)

# Increment patch version
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# Update version file
echo "$NEW_VERSION" > "$VERSION_FILE"

# Build Docker images
echo "Building Docker images..."
docker build -t $DOCKER_USERNAME/$CLIENT_IMAGE_NAME:latest -t $DOCKER_USERNAME/$CLIENT_IMAGE_NAME:$NEW_VERSION .

# Push Docker images to Docker Hub
echo "Pushing Docker images to Docker Hub..."
docker push $DOCKER_USERNAME/$CLIENT_IMAGE_NAME:latest
docker push $DOCKER_USERNAME/$CLIENT_IMAGE_NAME:$NEW_VERSION

echo "Docker images built and pushed successfully!"
