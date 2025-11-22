# Complete Deployment Guide: GitLab CI/CD with React + Express

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [AWS Setup](#aws-setup)
   - [EC2 Instance Setup](#ec2-instance-setup)
   - [S3 Bucket Setup](#s3-bucket-setup)
   - [IAM User & Permissions](#iam-user--permissions)
4. [GitLab CI/CD Configuration](#gitlab-cicd-configuration)
5. [Deployment Process](#deployment-process)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

This guide walks you through deploying a **React + Express** application using **GitLab CI/CD** with:
- **Backend (Express)**: Hosted on AWS EC2 with PM2 process management
- **Frontend (React)**: Hosted on AWS S3 as a static website
- **CI/CD**: Automated deployment via GitLab pipelines

### Architecture Diagram

```mermaid
graph LR
    A[GitLab Repository] -->|Push to main| B[GitLab CI/CD Pipeline]
    B -->|Build| C[Build Stage]
    C -->|Artifacts| D[Deploy Backend]
    C -->|Artifacts| E[Deploy Frontend]
    D -->|SSH Deploy| F[AWS EC2<br/>Express Server]
    E -->|AWS CLI| G[AWS S3<br/>React Static Site]
    F -->|API Calls| H[Users]
    G -->|HTTP| H
```

---

## Prerequisites

Before starting, ensure you have:

- ✅ **AWS Account** with billing enabled
- ✅ **GitLab Account** (free tier works)
- ✅ **Domain Name** (optional, for custom domain)
- ✅ **Local Development Environment**:
  - Node.js 18+
  - Git
  - AWS CLI installed locally
  - SSH client

---

## AWS Setup

### EC2 Instance Setup

#### Step 1: Launch EC2 Instance

1. **Login to AWS Console** → Navigate to EC2 Dashboard

2. **Launch Instance**:
   - Click **"Launch Instance"**
   - **Name**: `interior-portfolio-backend`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**: `t2.micro` (or `t3.micro` for better performance)
   - **Key Pair**: Create new key pair
     - Name: `portfolio-ec2-key`
     - Type: RSA
     - Format: `.pem`
     - **Download and save securely** (you'll need this!)

3. **Configure Security Group**:
   - Create new security group: `portfolio-backend-sg`
   - Add the following inbound rules:

   | Type | Protocol | Port Range | Source | Description |
   |------|----------|------------|--------|-------------|
   | SSH | TCP | 22 | My IP | SSH access |
   | HTTP | TCP | 80 | 0.0.0.0/0 | HTTP access |
   | HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS access |
   | Custom TCP | TCP | 5000 | 0.0.0.0/0 | Express API |

4. **Storage**: 8 GB gp3 (default is fine)

5. **Launch Instance** and wait for it to be in "Running" state

#### Step 2: Connect to EC2 Instance

```bash
# Set correct permissions for your key
chmod 400 portfolio-ec2-key.pem

# Connect via SSH (replace with your instance IP)
ssh -i portfolio-ec2-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

#### Step 3: Install Required Software on EC2

Once connected to your EC2 instance, run:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version

# Install PM2 globally (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Create application directory
mkdir -p /home/ubuntu/interior-designer-portfolio
```

#### Step 4: Configure Git Access on EC2

You need to allow your EC2 instance to pull code from GitLab:

```bash
# Generate SSH key on EC2
ssh-keygen -t ed25519 -C "ec2-gitlab-deploy" -f ~/.ssh/gitlab_deploy_key -N ""

# Display the public key
cat ~/.ssh/gitlab_deploy_key.pub
```

**Copy this public key**, then:

1. Go to your GitLab project → **Settings** → **Repository** → **Deploy Keys**
2. Click **"Add new key"**
3. Paste the public key
4. Give it a title: `EC2 Deploy Key`
5. Check **"Grant write permissions"** (if you need to push from EC2)
6. Click **"Add key"**

Configure SSH on EC2:

```bash
# Add GitLab to known hosts
ssh-keyscan gitlab.com >> ~/.ssh/known_hosts

# Configure SSH to use the deploy key
cat >> ~/.ssh/config << EOF
Host gitlab.com
  HostName gitlab.com
  User git
  IdentityFile ~/.ssh/gitlab_deploy_key
  StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config
```

#### Step 5: Initial Deployment on EC2

```bash
# Clone your repository (replace with your GitLab repo URL)
cd /home/ubuntu
git clone git@gitlab.com:YOUR_USERNAME/YOUR_REPO.git interior-designer-portfolio
cd interior-designer-portfolio

# Install production dependencies
npm install --production

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Copy and run the command that PM2 outputs
```

#### Step 6: Verify Backend is Running

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs interior-designer-portfolio

# Test the API locally
curl http://localhost:5000/api/projects
```

From your local machine, test the public endpoint:

```bash
curl http://<YOUR_EC2_PUBLIC_IP>:5000/api/projects
```

---

### S3 Bucket Setup

#### Step 1: Create S3 Bucket

```bash
# Set your desired bucket name (must be globally unique)
export BUCKET_NAME="interior-portfolio-frontend"
export AWS_REGION="us-east-1"

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION
```

Or via AWS Console:
1. Go to **S3** → **Create bucket**
2. **Bucket name**: `interior-portfolio-frontend` (must be globally unique)
3. **Region**: Choose your preferred region (e.g., `us-east-1`)
4. **Uncheck** "Block all public access" (we need public access for website hosting)
5. Acknowledge the warning
6. Click **"Create bucket"**

#### Step 2: Enable Static Website Hosting

```bash
# Enable static website hosting
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html
```

Or via Console:
1. Select your bucket → **Properties** tab
2. Scroll to **"Static website hosting"** → Click **"Edit"**
3. **Enable** static website hosting
4. **Index document**: `index.html`
5. **Error document**: `index.html` (for React Router support)
6. Click **"Save changes"**
7. **Note the website endpoint URL** (e.g., `http://bucket-name.s3-website-us-east-1.amazonaws.com`)

#### Step 3: Configure Bucket Policy for Public Access

Create a file `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::interior-portfolio-frontend/*"
    }
  ]
}
```

> **Replace** `interior-portfolio-frontend` with your actual bucket name

Apply the policy:

```bash
# Apply bucket policy
aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file://bucket-policy.json
```

Or via Console:
1. Select your bucket → **Permissions** tab
2. Scroll to **"Bucket policy"** → Click **"Edit"**
3. Paste the JSON policy above (replace bucket name)
4. Click **"Save changes"**

#### Step 4: Configure CORS (if needed)

If your frontend needs to make API calls from the S3 domain:

```bash
# Create cors.json
cat > cors.json << EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

# Apply CORS configuration
aws s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration file://cors.json
```

---

### IAM User & Permissions

#### Step 1: Create IAM User for GitLab CI/CD

1. Go to **IAM** → **Users** → **Create user**
2. **User name**: `gitlab-ci-deployer`
3. **Access type**: Select **"Access key - Programmatic access"**
4. Click **"Next"**

#### Step 2: Attach Permissions

Click **"Attach policies directly"** and create a custom policy:

1. Click **"Create policy"** → **JSON** tab
2. Paste the following policy:

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
        "s3:PutBucketWebsite",
        "s3:GetBucketWebsite"
      ],
      "Resource": [
        "arn:aws:s3:::interior-portfolio-frontend",
        "arn:aws:s3:::interior-portfolio-frontend/*"
      ]
    }
  ]
}
```

3. Click **"Next"**
4. **Policy name**: `GitLabCIDeploymentPolicy`
5. Click **"Create policy"**

Go back to user creation and attach this policy.

#### Step 3: Get Access Keys

1. After creating the user, you'll see **Access key ID** and **Secret access key**
2. **Download the CSV** or copy these values securely
3. **Important**: You won't be able to see the secret key again!

---

## GitLab CI/CD Configuration

### Step 1: Add CI/CD Variables to GitLab

1. Go to your GitLab project
2. Navigate to **Settings** → **CI/CD** → **Variables**
3. Click **"Add variable"** for each of the following:

#### AWS Credentials

| Key | Value | Protected | Masked | Description |
|-----|-------|-----------|--------|-------------|
| `AWS_ACCESS_KEY_ID` | Your IAM access key | ✅ | ✅ | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your IAM secret key | ✅ | ✅ | AWS secret key |
| `AWS_DEFAULT_REGION` | `us-east-1` | ✅ | ❌ | AWS region |
| `S3_BUCKET_NAME` | `interior-portfolio-frontend` | ✅ | ❌ | S3 bucket name |

#### EC2 Credentials

| Key | Value | Protected | Masked | Description |
|-----|-------|-----------|--------|-------------|
| `EC2_HOST` | Your EC2 public IP | ✅ | ❌ | EC2 instance IP |
| `EC2_USER` | `ubuntu` | ✅ | ❌ | EC2 username |
| `EC2_SSH_KEY` | Contents of `.pem` file | ✅ | ✅ | Private SSH key |

> **For `EC2_SSH_KEY`**: Open your `.pem` file in a text editor, copy the entire contents (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`), and paste it as the value.

### Step 2: Verify `.gitlab-ci.yml`

Your project already has a `.gitlab-ci.yml` file. Here's what it does:

```yaml
stages:
  - build           # Builds both frontend and backend
  - deploy_backend  # Deploys Express to EC2
  - deploy_frontend # Deploys React to S3
```

**Pipeline Flow**:
1. **Build Stage**: Installs dependencies and builds React app
2. **Deploy Backend**: SSHs into EC2 and runs deployment script
3. **Deploy Frontend**: Syncs React build to S3 bucket

### Step 3: Update Backend API URL in Frontend

Before deploying, update your React app to point to the EC2 backend:

1. Create/edit `client/.env.production`:

```env
VITE_API_URL=http://<YOUR_EC2_PUBLIC_IP>:5000
```

2. Update your React API calls to use this environment variable:

```javascript
// In your React components
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Example API call
fetch(`${API_URL}/api/projects`)
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Deployment Process

### Initial Deployment

1. **Commit your changes**:

```bash
git add .
git commit -m "Configure production deployment"
git push origin main
```

2. **Monitor the pipeline**:
   - Go to GitLab → **CI/CD** → **Pipelines**
   - Click on the running pipeline
   - Watch each stage complete:
     - ✅ Build
     - ✅ Deploy Backend
     - ✅ Deploy Frontend

3. **Access your application**:
   - **Frontend**: `http://<S3_BUCKET_NAME>.s3-website-<REGION>.amazonaws.com`
   - **Backend API**: `http://<EC2_PUBLIC_IP>:5000/api/projects`

### Subsequent Deployments

Every push to the `main` branch will automatically trigger the CI/CD pipeline:

```bash
# Make your changes
git add .
git commit -m "Update portfolio content"
git push origin main

# Pipeline runs automatically!
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. **Pipeline Fails at Build Stage**

**Error**: `npm install` fails

**Solution**:
```bash
# Check package.json dependencies
# Ensure all dependencies are properly listed
# Try locally first:
npm install
cd client && npm install
```

#### 2. **SSH Connection Failed to EC2**

**Error**: `Permission denied (publickey)`

**Solution**:
- Verify `EC2_SSH_KEY` variable contains the complete private key
- Check EC2 security group allows SSH from GitLab runners
- Ensure the key format is correct (no extra spaces/newlines)

```bash
# Test SSH connection locally
ssh -i portfolio-ec2-key.pem ubuntu@<EC2_IP>
```

#### 3. **S3 Deployment Fails**

**Error**: `Access Denied` or `Bucket not found`

**Solution**:
- Verify IAM user has correct permissions
- Check `S3_BUCKET_NAME` variable matches actual bucket name
- Ensure bucket exists in the specified region

```bash
# Test AWS credentials locally
aws s3 ls s3://<BUCKET_NAME>
```

#### 4. **Backend Not Responding**

**Error**: API calls return 502/504 errors

**Solution**:
```bash
# SSH into EC2
ssh -i portfolio-ec2-key.pem ubuntu@<EC2_IP>

# Check PM2 status
pm2 status

# View logs
pm2 logs interior-designer-portfolio

# Restart if needed
pm2 restart interior-designer-portfolio
```

#### 5. **CORS Errors in Browser**

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
- Ensure Express server has CORS enabled (already configured in `server.js`)
- Verify the frontend is making requests to the correct backend URL
- Check browser console for exact error message

#### 6. **React Router 404 on Refresh**

**Error**: S3 returns 404 when refreshing on routes like `/projects`

**Solution**: Already configured! The S3 bucket is set to use `index.html` as the error document, which handles React Router correctly.

---

## Monitoring & Maintenance

### EC2 Monitoring

#### Check Application Status

```bash
# SSH into EC2
ssh -i portfolio-ec2-key.pem ubuntu@<EC2_IP>

# Check PM2 status
pm2 status

# View real-time logs
pm2 logs interior-designer-portfolio --lines 100

# Monitor system resources
pm2 monit
```

#### View Application Logs

```bash
# On EC2 instance
cd /home/ubuntu/interior-designer-portfolio

# View error logs
tail -f logs/err.log

# View output logs
tail -f logs/out.log

# View combined logs
tail -f logs/combined.log
```

#### Restart Application

```bash
# Restart the application
pm2 restart interior-designer-portfolio

# Reload with zero-downtime
pm2 reload interior-designer-portfolio

# Stop the application
pm2 stop interior-designer-portfolio

# Start the application
pm2 start ecosystem.config.js
```

### S3 Monitoring

#### Check S3 Bucket Contents

```bash
# List all files in bucket
aws s3 ls s3://<BUCKET_NAME> --recursive

# Check bucket size
aws s3 ls s3://<BUCKET_NAME> --recursive --summarize --human-readable
```

#### Manual Frontend Deployment

If you need to deploy frontend manually:

```bash
# Build React app locally
cd client
npm run build

# Deploy to S3
aws s3 sync build/ s3://<BUCKET_NAME> --delete

# Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
```

### Cost Monitoring

#### Estimated Monthly Costs (Free Tier)

- **EC2 t2.micro**: $0 (first 12 months) / ~$8.50/month after
- **S3 Storage**: $0.023 per GB (~$0.50 for 20GB)
- **S3 Requests**: $0.0004 per 1,000 GET requests
- **Data Transfer**: First 1GB free, then $0.09/GB

**Total**: ~$0-2/month (free tier) or ~$10-15/month (after free tier)

#### Set Up Billing Alerts

1. Go to **AWS Billing Dashboard** → **Budgets**
2. Click **"Create budget"**
3. Select **"Cost budget"**
4. Set amount: `$10` (or your threshold)
5. Configure email alerts

---

## Advanced Configuration

### Setting Up a Custom Domain

#### For S3 Frontend

1. **Register domain** (e.g., via Route 53, Namecheap, etc.)

2. **Create CloudFront distribution**:
   - Origin: Your S3 bucket website endpoint
   - Alternate domain names (CNAMEs): `www.yourdomain.com`
   - SSL certificate: Request via AWS Certificate Manager

3. **Update DNS records**:
   - Add CNAME record: `www` → CloudFront distribution domain

#### For EC2 Backend

1. **Allocate Elastic IP**:
   ```bash
   # Allocate Elastic IP
   aws ec2 allocate-address --domain vpc
   
   # Associate with EC2 instance
   aws ec2 associate-address --instance-id <INSTANCE_ID> --allocation-id <ALLOCATION_ID>
   ```

2. **Update DNS**:
   - Add A record: `api.yourdomain.com` → Elastic IP

3. **Setup Nginx reverse proxy** (optional but recommended):
   ```bash
   sudo apt install nginx
   
   # Configure Nginx to proxy to Express
   sudo nano /etc/nginx/sites-available/default
   ```

   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo systemctl restart nginx
   ```

4. **Setup SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

### Environment Variables

For sensitive configuration, use environment variables:

1. **On EC2**, create `.env` file:
   ```bash
   cd /home/ubuntu/interior-designer-portfolio
   nano .env
   ```

   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=your_database_url
   API_KEY=your_api_key
   ```

2. **Update `ecosystem.config.js`**:
   ```javascript
   module.exports = {
       apps: [{
           name: 'interior-designer-portfolio',
           script: './server.js',
           env_file: '.env',
           // ... rest of config
       }]
   };
   ```

### Scaling Considerations

#### Horizontal Scaling (Multiple EC2 Instances)

1. Set up Application Load Balancer (ALB)
2. Create Auto Scaling Group
3. Update GitLab CI/CD to deploy to multiple instances

#### Database Integration

If you need a database:

1. **AWS RDS** (managed PostgreSQL/MySQL)
2. **MongoDB Atlas** (managed MongoDB)
3. Update backend to connect to database
4. Store connection string in environment variables

---

## Security Best Practices

### ✅ Checklist

- [ ] **Never commit** `.pem` files or AWS credentials to Git
- [ ] Use **environment variables** for sensitive data
- [ ] Enable **MFA** on AWS root account
- [ ] Regularly **rotate** IAM access keys
- [ ] Keep EC2 instance **updated**: `sudo apt update && sudo apt upgrade`
- [ ] Use **HTTPS** for production (setup SSL certificates)
- [ ] Restrict EC2 security group to **specific IPs** when possible
- [ ] Enable **CloudWatch** logging for monitoring
- [ ] Set up **automated backups** for critical data
- [ ] Use **AWS Secrets Manager** for production secrets

---

## Quick Reference Commands

### GitLab CI/CD

```bash
# Trigger pipeline manually
git commit --allow-empty -m "Trigger pipeline"
git push origin main

# View pipeline status
# Go to: GitLab → CI/CD → Pipelines
```

### EC2 Management

```bash
# Connect to EC2
ssh -i portfolio-ec2-key.pem ubuntu@<EC2_IP>

# Check PM2 status
pm2 status

# View logs
pm2 logs

# Restart app
pm2 restart interior-designer-portfolio

# Pull latest code
cd /home/ubuntu/interior-designer-portfolio
git pull origin main
npm install --production
pm2 restart ecosystem.config.js
```

### S3 Management

```bash
# List bucket contents
aws s3 ls s3://<BUCKET_NAME>

# Sync local build to S3
aws s3 sync ./client/build s3://<BUCKET_NAME> --delete

# Empty bucket
aws s3 rm s3://<BUCKET_NAME> --recursive
```

---

## Conclusion

You now have a fully automated CI/CD pipeline for your React + Express application! 🎉

**What happens on every push to `main`**:
1. ✅ GitLab builds your React frontend
2. ✅ GitLab deploys Express backend to EC2
3. ✅ GitLab deploys React frontend to S3
4. ✅ Your application is live!

**Next Steps**:
- [ ] Set up custom domain
- [ ] Configure HTTPS/SSL
- [ ] Add monitoring and alerts
- [ ] Implement automated backups
- [ ] Set up staging environment

---

## Support & Resources

- **GitLab CI/CD Docs**: https://docs.gitlab.com/ee/ci/
- **AWS EC2 Docs**: https://docs.aws.amazon.com/ec2/
- **AWS S3 Docs**: https://docs.aws.amazon.com/s3/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **React Deployment**: https://vitejs.dev/guide/static-deploy.html

---

**Made with ❤️ for seamless deployments**
