#!/bin/bash

# Deploy Frontend to S3
# This script uploads the React build to S3 and configures caching

set -e

echo "Starting frontend deployment to S3..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Installing..."
    pip install awscli
fi

# Check if S3_BUCKET_NAME is set
if [ -z "$S3_BUCKET_NAME" ]; then
    echo "Error: S3_BUCKET_NAME environment variable is not set"
    exit 1
fi

# Sync build files to S3
echo "Uploading files to S3 bucket: $S3_BUCKET_NAME..."
aws s3 sync client/build/ s3://$S3_BUCKET_NAME --delete

# Set cache headers for static assets (1 year)
echo "Setting cache headers for static assets..."
aws s3 cp s3://$S3_BUCKET_NAME s3://$S3_BUCKET_NAME \
  --recursive \
  --metadata-directive REPLACE \
  --cache-control max-age=31536000,public \
  --exclude "*.html"

# Set cache headers for HTML files (no cache)
echo "Setting cache headers for HTML files..."
aws s3 cp s3://$S3_BUCKET_NAME s3://$S3_BUCKET_NAME \
  --recursive \
  --metadata-directive REPLACE \
  --cache-control no-cache \
  --include "*.html"

# Make bucket publicly accessible for website hosting
echo "Configuring S3 bucket for static website hosting..."
aws s3 website s3://$S3_BUCKET_NAME --index-document index.html --error-document index.html

echo "Frontend deployment completed successfully!"
echo "Website URL: http://$S3_BUCKET_NAME.s3-website-$AWS_DEFAULT_REGION.amazonaws.com"
