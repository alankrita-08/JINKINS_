# Fix AWS IAM Permissions for S3 Deployment

## The Issue

Jenkins is getting an "AccessDenied" error when trying to deploy to S3. This is because the IAM user policy needs to be updated with the correct bucket name.

## Quick Fix Steps

### Step 1: Go to AWS IAM Console

1. Login to AWS Console: https://console.aws.amazon.com/
2. Go to **IAM** service
3. Click **Users** in the left sidebar
4. Click on your user: **`jenkins-deployer`**

### Step 2: Update the Policy

1. Click on the **Permissions** tab
2. Find the policy attached to this user (might be called `JenkinsDeploymentPolicy` or similar)
3. Click on the policy name
4. Click **Edit** (or **Edit policy**)
5. Click the **JSON** tab

### Step 3: Replace with Updated Policy

**IMPORTANT**: Replace `interior-portfolio-frontend` with your actual S3 bucket name if different!

Copy and paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3DeploymentAccess",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:PutBucketWebsite",
                "s3:GetBucketWebsite"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR_ACTUAL_BUCKET_NAME",
                "arn:aws:s3:::YOUR_ACTUAL_BUCKET_NAME/*"
            ]
        }
    ]
}
```

### Step 4: Save the Policy

1. Click **Review policy** (or **Next**)
2. Click **Save changes**

### Step 5: Retry Jenkins Build

1. Go to Jenkins: `http://localhost:8080`
2. Click on your pipeline job
3. Click **Build Now**

---

## Alternative: Create New Inline Policy

If you can't find the existing policy, create a new inline policy:

1. In the IAM user page, click **Add permissions** → **Create inline policy**
2. Click **JSON** tab
3. Paste the policy above (with your bucket name)
4. Click **Review policy**
5. Name it: `JenkinsS3DeploymentPolicy`
6. Click **Create policy**

---

## What Changed

Added permission:
- ✅ `s3:GetBucketLocation` - Required for AWS CLI to work properly

Fixed:
- ✅ Resource ARN now points to your actual bucket name

---

## Verify Your Bucket Name

To find your S3 bucket name:

1. Go to Jenkins → Manage Jenkins → Manage Credentials
2. Find the credential with ID: `s3-bucket-name`
3. Note the bucket name
4. Use that name in the policy above

---

After updating the IAM policy, retry the Jenkins build and it should successfully deploy to S3! 🚀
