# Jenkins Quick Start Deployment Guide

This is a condensed checklist for deploying your React + Express app with Jenkins CI/CD. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) and [JENKINS_SETUP.md](./JENKINS_SETUP.md).

---

## ✅ Pre-Deployment Checklist

### 1. AWS Setup

#### EC2 Instance
- [ ] Launch Ubuntu 22.04 EC2 instance (t2.micro)
- [ ] Download and save `.pem` key file
- [ ] Configure security group (ports: 22, 80, 443, 5000)
- [ ] Note down public IP address: `_________________`

#### S3 Bucket
- [ ] Create S3 bucket with unique name: `_________________`
- [ ] Enable static website hosting
- [ ] Disable "Block all public access"
- [ ] Apply bucket policy (use `bucket-policy.json`)
- [ ] Note website endpoint: `_________________`

#### IAM User
- [ ] Create IAM user: `jenkins-deployer`
- [ ] Attach S3 deployment policy (use `iam-policy.json`)
- [ ] Save Access Key ID: `_________________`
- [ ] Save Secret Access Key: `_________________`

### 2. EC2 Configuration

SSH into your EC2 instance and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 and Git
sudo npm install -g pm2
sudo apt install -y git

# Generate SSH key for Git
ssh-keygen -t ed25519 -C "ec2-deploy" -f ~/.ssh/git_deploy_key -N ""
cat ~/.ssh/git_deploy_key.pub  # Copy this!

# Add Git provider to known hosts (choose one)
ssh-keyscan github.com >> ~/.ssh/known_hosts      # For GitHub
ssh-keyscan gitlab.com >> ~/.ssh/known_hosts      # For GitLab
ssh-keyscan bitbucket.org >> ~/.ssh/known_hosts   # For Bitbucket

# Configure SSH
cat >> ~/.ssh/config << EOF
Host github.com gitlab.com bitbucket.org
  User git
  IdentityFile ~/.ssh/git_deploy_key
  StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config

# Clone repository (replace with your repo URL)
cd /home/ubuntu
git clone git@YOUR_GIT_PROVIDER:YOUR_USERNAME/YOUR_REPO.git interior-designer-portfolio
cd interior-designer-portfolio

# Install dependencies and start
npm install --production
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Run the command it outputs
```

**Add the public key to your Git repository**:
- **GitHub**: Settings → Deploy keys → Add deploy key
- **GitLab**: Settings → Repository → Deploy Keys → Add new key
- **Bitbucket**: Settings → Access keys → Add key

### 3. Jenkins Setup

#### Install Jenkins (if not already installed)

**Windows:**
1. Download from [jenkins.io/download](https://www.jenkins.io/download/)
2. Run installer, access at `http://localhost:8080`
3. Get initial password from `C:\Program Files\Jenkins\secrets\initialAdminPassword`
4. Install suggested plugins

**Docker:**
```bash
docker run -d -p 8080:8080 -p 50000:50000 \
  --name jenkins \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

#### Install Required Plugins

Go to: Manage Jenkins → Manage Plugins → Available

Install these plugins:
- [ ] **Pipeline** (usually pre-installed)
- [ ] **Git Plugin** (usually pre-installed)
- [ ] **SSH Agent Plugin**
- [ ] **Credentials Binding Plugin** (usually pre-installed)
- [ ] **NodeJS Plugin**

#### Configure NodeJS

1. Go to: Manage Jenkins → Global Tool Configuration
2. Scroll to **NodeJS** → Click **Add NodeJS**
3. **Name**: `18` (must match Jenkinsfile)
4. **Version**: Select Node.js 18.x
5. Click **Save**

### 4. Jenkins Credentials Configuration

Go to: Jenkins Dashboard → Manage Jenkins → Manage Credentials → (global) → Add Credentials

Add the following credentials:

#### AWS Credentials

| Credential ID | Kind | Value |
|---------------|------|-------|
| `aws-access-key-id` | Secret text | Your AWS access key ID |
| `aws-secret-access-key` | Secret text | Your AWS secret access key |
| `aws-region` | Secret text | e.g., `us-east-1` |
| `s3-bucket-name` | Secret text | Your S3 bucket name |

#### EC2 Credentials

| Credential ID | Kind | Value |
|---------------|------|-------|
| `ec2-host` | Secret text | Your EC2 public IP |
| `ec2-user` | Secret text | `ubuntu` |
| `ec2-ssh-key` | SSH Username with private key | Your `.pem` file contents |

**For `ec2-ssh-key`:**
- Kind: **SSH Username with private key**
- Username: `ubuntu`
- Private Key: Select **"Enter directly"** → Paste entire `.pem` file contents

### 5. Create Jenkins Pipeline Job

1. **Create New Item**:
   - Jenkins Dashboard → **New Item**
   - Name: `Interior-Portfolio-Deployment`
   - Type: **Pipeline**
   - Click **OK**

2. **Configure Pipeline**:
   - **Description**: `Automated deployment for React + Express portfolio`
   - **Build Triggers**: 
     - Check **"Poll SCM"**
     - Schedule: `H/5 * * * *` (checks every 5 minutes)
   - **Pipeline**:
     - **Definition**: Pipeline script from SCM
     - **SCM**: Git
     - **Repository URL**: Your Git repository URL
     - **Credentials**: Add if private (Username with password or personal access token)
     - **Branch Specifier**: `*/main`
     - **Script Path**: `Jenkinsfile`
   - Click **Save**

### 6. Configure Frontend

```bash
# Create production environment file
cp client/.env.production.example client/.env.production

# Edit and add your EC2 IP
# VITE_API_URL=http://YOUR_EC2_IP:5000
```

Update your React components to use the API URL:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### 7. Deploy!

```bash
git add .
git commit -m "Configure Jenkins deployment"
git push origin main
```

**In Jenkins:**
1. Go to your pipeline job
2. Click **"Build Now"**
3. Watch the build progress
4. Check **Console Output** for logs

---

## 🎉 Access Your Application

- **Frontend**: `http://YOUR_BUCKET_NAME.s3-website-YOUR_REGION.amazonaws.com`
- **Backend API**: `http://YOUR_EC2_IP:5000/api/projects`

---

## 🔧 Common Commands

### Check Jenkins Build Status
1. Go to Jenkins Dashboard
2. Click on your pipeline job
3. View **Build History**
4. Click build number → **Console Output**

### Check EC2 Status
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
pm2 status
pm2 logs
```

### Manual Frontend Deploy
```bash
cd client
npm run build
aws s3 sync build/ s3://YOUR_BUCKET_NAME --delete
```

### Manual Backend Deploy
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/interior-designer-portfolio
git pull origin main
npm install --production
pm2 restart ecosystem.config.js
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Pipeline fails at build | Check NodeJS plugin configured with name `18` |
| SSH connection failed | Verify `ec2-ssh-key` credential, check security group |
| S3 access denied | Verify IAM permissions, check bucket policy |
| Backend not responding | SSH to EC2, run `pm2 logs`, check `pm2 status` |
| CORS errors | Verify `VITE_API_URL` is correct, check Express CORS config |
| Node command not found | Configure NodeJS in Global Tool Configuration |

For detailed troubleshooting, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting).

---

## 📚 Next Steps

1. ✅ **Test the pipeline** with a small code change
2. ✅ **Set up webhooks** for instant builds (optional)
3. ✅ **Configure email notifications** in Jenkins
4. ✅ **Set up custom domain** (optional)
5. ✅ **Enable HTTPS** with SSL certificates
6. ✅ **Set up AWS billing alerts**

---

**Need help?** 
- Full deployment guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Jenkins setup guide: [JENKINS_SETUP.md](./JENKINS_SETUP.md)
