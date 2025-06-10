#!/bin/bash
# This script builds your custom node, deploys it to your n8n custom nodes folder,
# kills any running n8n process, and then restarts n8n.
#
# It dynamically determines the target directory based on the "name" field in package.json.
#
# Usage: ./deploy-node.sh

# Exit immediately if a command fails.
set -e

# Set the volume name for n8n storage.
# check with 'docker volume list' to find the correct volume name.
VOLUME_NAME="...SET_YOUR_VOLUME_NAME_HERE..."

if ! docker volume inspect $VOLUME_NAME &> /dev/null; then
	echo "Error: Docker volume '$VOLUME_NAME' does not exist."
	exit 1
fi

echo "Found volume storage: '$VOLUME_NAME'"

##############################
# Step 0: Get Package Name
##############################
# Use Node.js to extract the package name from package.json.
PACKAGE_NAME=$(node -p "require('./package.json').name")

if [ -z "$PACKAGE_NAME" ]; then
  echo "Error: Could not determine package name from package.json."
  exit 1
fi

# Get the mount point of the n8n storage volume.
DATA_DIR=$(docker volume inspect $VOLUME_NAME | grep -oP "\"Mountpoint\": \"\K[\w\/]+")
if [ -z "$DATA_DIR" ]; then
	echo "Error: Could not determine mount point for Docker volume '$VOLUME_NAME'."
	exit 1
fi

# Set the target directory based on the package name.
TARGET_DIR="$DATA_DIR/custom/$PACKAGE_NAME"

echo "Detected package name: '$PACKAGE_NAME'"
echo "Target deployment directory: '$TARGET_DIR'"

##############################
# Step 1: Build the Node
##############################
echo "Building the node..."
pnpm run build

##############################
# Step 2: Deploy the Build Output
##############################
# Define the source (build output) directory.
SOURCE_DIR="./dist"

echo "Deploying build output from '$SOURCE_DIR' to '$TARGET_DIR'..."

# Remove any previous deployment and recreate the target directory.
sudo rm -rf "$TARGET_DIR"
sudo mkdir -p "$TARGET_DIR"

# Copy all files from the build output to the target directory.
sudo cp -r "$SOURCE_DIR/"* "$TARGET_DIR/"

echo "Deployment complete."

##############################
# Step 3: Restart n8n
##############################
echo "Restarting n8n..."
docker container restart n8n

# Logging for debugging
docker logs -f n8n
