# Jenkins Setup Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Jenkins Installation](#jenkins-installation)
3. [Required Plugins](#required-plugins)
4. [Credential Configuration](#credential-configuration)
5. [Pipeline Setup](#pipeline-setup)
6. [Webhook Configuration](#webhook-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide walks you through setting up Jenkins to automatically deploy your React + Express application to AWS. The Jenkins pipeline will:
- Build the React frontend and Express backend
- Deploy the backend to AWS EC2
- Deploy the frontend to AWS S3

### Architecture

```mermaid
graph LR
    A[Git Repository] -->|Webhook/Poll| B[Jenkins Server]
    B -->|Build| C[Build Stage]
    C -->|Deploy| D[Deploy Backend Stage]
    C -->|Deploy| E[Deploy Frontend Stage]
    D -->|SSH| F[AWS EC2<br/>Express Server]
    E -->|AWS CLI| G[AWS S3<br/>React Static Site]
    F -->|API| H[Users]
    G -->|HTTP| H
```

---

## Jenkins Installation

### Option 1: Local Installation (Windows)

1. **Download Jenkins**:
   - Visit [jenkins.io/download](https://www.jenkins.io/download/)
   - Download the Windows installer (`.msi` file)

2. **Install Jenkins**:
   - Run the installer
   - Follow the installation wizard
   - Default port: `8080`
   - Note the initial admin password location

3. **Access Jenkins**:
   ```
   http://localhost:8080
   ```

4. **Unlock Jenkins**:
   - Copy the initial admin password from:
     ```
     C:\Program Files\Jenkins\secrets\initialAdminPassword
     ```
   - Paste it in the web interface

5. **Install Suggested Plugins**:
   - Select "Install suggested plugins"
   - Wait for installation to complete

6. **Create Admin User**:
   - Fill in your details
   - Click "Save and Continue"

### Option 2: Docker Installation (Cross-platform)

```bash
# Pull Jenkins Docker image
docker pull jenkins/jenkins:lts

# Run Jenkins container
docker run -d -p 8080:8080 -p 50000:50000 \
  --name jenkins \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Access Jenkins at `http://localhost:8080`

### Option 3: Using School/Institution Server

If your teacher has provided a Jenkins server:
1. Get the Jenkins URL from your teacher
2. Get your login credentials
3. Skip to [Required Plugins](#required-plugins) section

---

## Required Plugins

After Jenkins is installed, install these essential plugins:

1. **Navigate to Plugin Manager**:
   - Jenkins Dashboard → Manage Jenkins → Manage Plugins

2. **Install the following plugins**:

   | Plugin Name | Purpose |
   |-------------|---------|
   | **Pipeline** | Core pipeline functionality (usually pre-installed) |
   | **Git Plugin** | Git repository integration (usually pre-installed) |
   | **SSH Agent Plugin** | SSH credential management for EC2 deployment |
   | **Credentials Binding Plugin** | Secure credential handling (usually pre-installed) |
   | **NodeJS Plugin** | Node.js environment management |
   | **Pipeline: AWS Steps** | (Optional) AWS integration helpers |

3. **Installation Steps**:
   - Go to "Available" tab
   - Search for each plugin
   - Check the checkbox next to the plugin
   - Click "Install without restart"
   - Wait for installation to complete

4. **Configure NodeJS**:
   - Go to: Manage Jenkins → Global Tool Configuration
   - Scroll to "NodeJS"
   - Click "Add NodeJS"
   - Name: `18` (must match the Jenkinsfile)
   - Version: Select Node.js 18.x
   - Click "Save"

---

## Credential Configuration

Jenkins needs credentials to access AWS and your EC2 instance. Here's how to add them:

### 1. AWS Access Key ID

1. Navigate to: Jenkins Dashboard → Manage Jenkins → Manage Credentials
2. Click on "(global)" domain
3. Click "Add Credentials"
4. Configure:
   - **Kind**: Secret text
   - **Scope**: Global
   - **Secret**: Your AWS Access Key ID (from IAM user)
   - **ID**: `aws-access-key-id`
   - **Description**: AWS Access Key ID
5. Click "OK"

### 2. AWS Secret Access Key

1. Click "Add Credentials" again
2. Configure:
   - **Kind**: Secret text
   - **Scope**: Global
   - **Secret**: Your AWS Secret Access Key
   - **ID**: `aws-secret-access-key`
   - **Description**: AWS Secret Access Key
3. Click "OK"

### 3. AWS Region

1. Click "Add Credentials" again
2. Configure:
   - **Kind**: Secret text
   - **Scope**: Global
   - **Secret**: Your AWS region (e.g., `us-east-1`)
   - **ID**: `aws-region`
   - **Description**: AWS Default Region
3. Click "OK"

### 4. S3 Bucket Name

1. Click "Add Credentials" again
2. Configure:
   - **Kind**: Secret text
   - **Scope**: Global
   - **Secret**: Your S3 bucket name (e.g., `interior-portfolio-frontend`)
   - **ID**: `s3-bucket-name`
   - **Description**: S3 Bucket Name
3. Click "OK"

### 5. EC2 Host

1. Click "Add Credentials" again
2. Configure:
   - **Kind**: Secret text
   - **Scope**: Global
   - **Secret**: Your EC2 public IP address
   - **ID**: `ec2-host`
   - **Description**: EC2 Host IP
3. Click "OK"

### 6. EC2 User

1. Click "Add Credentials" again
2. Configure:
   - **Kind**: Secret text
   - **Scope**: Global
   - **Secret**: `ubuntu` (or your EC2 username)
   - **ID**: `ec2-user`
   - **Description**: EC2 Username
3. Click "OK"

### 7. EC2 SSH Private Key

This is the most important credential for EC2 deployment.

1. Click "Add Credentials" again
2. Configure:
   - **Kind**: SSH Username with private key
   - **Scope**: Global
   - **ID**: `ec2-ssh-key`
   - **Description**: EC2 SSH Private Key
   - **Username**: `ubuntu` (or your EC2 username)
   - **Private Key**: Select "Enter directly"
   - Click "Add"
   - Paste your entire `.pem` file contents (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)
3. Click "OK"

> **Tip**: To get your `.pem` file contents on Windows:
> ```powershell
> Get-Content portfolio-ec2-key.pem | clip
> ```
> This copies the file contents to your clipboard.

---

## Pipeline Setup

### Step 1: Create a New Pipeline Job

1. **From Jenkins Dashboard**:
   - Click "New Item"
   - Enter name: `Interior-Portfolio-Deployment`
   - Select "Pipeline"
   - Click "OK"

### Step 2: Configure Pipeline

1. **General Settings**:
   - Description: `Automated deployment for React + Express portfolio`
   - Check "GitHub project" (if using GitHub) or similar for your Git platform
   - Enter your repository URL

2. **Build Triggers**:
   
   Choose one or both:
   
   **Option A: Poll SCM** (Recommended for beginners)
   - Check "Poll SCM"
   - Schedule: `H/5 * * * *` (checks every 5 minutes)
   - This will automatically build when changes are detected
   
   **Option B: Webhook** (More efficient, see [Webhook Configuration](#webhook-configuration))

3. **Pipeline Configuration**:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your Git repository URL
     - For GitHub: `https://github.com/username/repository.git`
     - For GitLab: `https://gitlab.com/username/repository.git`
   - **Credentials**: Add your Git credentials if repository is private
     - Click "Add" → Jenkins
     - Kind: Username with password
     - Username: Your Git username
     - Password: Your Git personal access token
     - ID: `git-credentials`
   - **Branch Specifier**: `*/main` (or `*/master` if using master branch)
   - **Script Path**: `Jenkinsfile` (default)

4. **Click "Save"**

### Step 3: Test the Pipeline

1. **Manual Build**:
   - Click "Build Now"
   - Watch the build progress in "Build History"
   - Click on the build number to see details
   - Click "Console Output" to see logs

2. **Verify Stages**:
   - ✅ Build stage completes
   - ✅ Deploy Backend stage completes
   - ✅ Deploy Frontend stage completes

---

## Webhook Configuration

Webhooks trigger builds immediately when you push code, instead of polling.

### For GitHub

1. **In GitHub Repository**:
   - Go to Settings → Webhooks → Add webhook
   - **Payload URL**: `http://YOUR_JENKINS_URL/github-webhook/`
   - **Content type**: `application/json`
   - **Which events**: "Just the push event"
   - Click "Add webhook"

2. **In Jenkins Pipeline**:
   - Edit your pipeline job
   - Build Triggers → Check "GitHub hook trigger for GITScm polling"
   - Save

### For GitLab

1. **In GitLab Repository**:
   - Go to Settings → Webhooks
   - **URL**: `http://YOUR_JENKINS_URL/project/Interior-Portfolio-Deployment`
   - **Trigger**: Push events
   - **Branch**: `main`
   - Click "Add webhook"

2. **In Jenkins Pipeline**:
   - Edit your pipeline job
   - Build Triggers → Check "Build when a change is pushed to GitLab"
   - Save

### For Bitbucket

1. **In Bitbucket Repository**:
   - Go to Repository settings → Webhooks → Add webhook
   - **Title**: Jenkins Build Trigger
   - **URL**: `http://YOUR_JENKINS_URL/bitbucket-hook/`
   - **Triggers**: Repository push
   - Click "Save"

2. **In Jenkins Pipeline**:
   - Edit your pipeline job
   - Build Triggers → Check "Build when a change is pushed to Bitbucket"
   - Save

> **Note**: If Jenkins is running locally, you'll need to expose it to the internet using tools like ngrok for webhooks to work.

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Build Fails: "node: command not found"

**Cause**: NodeJS plugin not configured correctly

**Solution**:
1. Go to Manage Jenkins → Global Tool Configuration
2. Add NodeJS installation with name `18`
3. Rebuild the pipeline

#### 2. Build Fails: "Permission denied (publickey)" during EC2 deployment

**Cause**: SSH credentials not configured correctly

**Solution**:
1. Verify the `ec2-ssh-key` credential contains the complete private key
2. Ensure the key format is correct (no extra spaces)
3. Test SSH connection manually:
   ```bash
   ssh -i portfolio-ec2-key.pem ubuntu@<EC2_IP>
   ```

#### 3. Build Fails: "Access Denied" during S3 deployment

**Cause**: AWS credentials incorrect or insufficient permissions

**Solution**:
1. Verify AWS credentials are correct
2. Check IAM user has S3 permissions (see `iam-policy.json`)
3. Test AWS CLI locally:
   ```bash
   aws s3 ls s3://<BUCKET_NAME>
   ```

#### 4. Pipeline Doesn't Trigger Automatically

**Cause**: Webhook not configured or polling not enabled

**Solution**:
1. Enable "Poll SCM" with schedule `H/5 * * * *`
2. Or configure webhook (see [Webhook Configuration](#webhook-configuration))
3. Check Jenkins logs: Manage Jenkins → System Log

#### 5. Build Fails: "npm install" errors

**Cause**: Dependency issues or network problems

**Solution**:
1. Check `package.json` is valid
2. Test locally: `npm install`
3. Clear npm cache in Jenkins:
   ```groovy
   // Add to Jenkinsfile before npm install
   sh 'npm cache clean --force'
   ```

#### 6. EC2 Deployment Succeeds but Application Not Running

**Cause**: PM2 process failed to start

**Solution**:
1. SSH into EC2:
   ```bash
   ssh -i portfolio-ec2-key.pem ubuntu@<EC2_IP>
   ```
2. Check PM2 status:
   ```bash
   pm2 status
   pm2 logs interior-designer-portfolio
   ```
3. Manually restart:
   ```bash
   pm2 restart interior-designer-portfolio
   ```

#### 7. S3 Website Shows 404 or Access Denied

**Cause**: Bucket policy or static website hosting not configured

**Solution**:
1. Verify bucket policy allows public read access (see `bucket-policy.json`)
2. Ensure static website hosting is enabled
3. Check bucket URL format:
   ```
   http://<BUCKET_NAME>.s3-website-<REGION>.amazonaws.com
   ```

---

## Next Steps

After setting up Jenkins:

1. ✅ **Test the pipeline** with a small change
2. ✅ **Configure webhooks** for automatic builds
3. ✅ **Set up email notifications** (optional):
   - Manage Jenkins → Configure System → E-mail Notification
4. ✅ **Monitor builds** regularly
5. ✅ **Review logs** if deployments fail

---

## Additional Resources

- [Jenkins Official Documentation](https://www.jenkins.io/doc/)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

## Security Best Practices

- ✅ Never commit Jenkins credentials to Git
- ✅ Use Jenkins credential management for all secrets
- ✅ Regularly update Jenkins and plugins
- ✅ Enable CSRF protection (enabled by default)
- ✅ Use HTTPS for Jenkins in production
- ✅ Restrict Jenkins access with authentication
- ✅ Regularly rotate AWS access keys
