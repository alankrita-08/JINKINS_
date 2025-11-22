# Quick Start Deployment Checklist

This is a condensed checklist for deploying your React + Express app with GitLab CI/CD. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

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
- [ ] Create IAM user: `gitlab-ci-deployer`
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

# Generate SSH key for GitLab
ssh-keygen -t ed25519 -C "ec2-gitlab-deploy" -f ~/.ssh/gitlab_deploy_key -N ""
cat ~/.ssh/gitlab_deploy_key.pub  # Copy this!

# Add GitLab to known hosts
ssh-keyscan gitlab.com >> ~/.ssh/known_hosts

# Configure SSH
cat >> ~/.ssh/config << EOF
Host gitlab.com
  HostName gitlab.com
  User git
  IdentityFile ~/.ssh/gitlab_deploy_key
  StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config

# Clone repository (replace with your repo URL)
cd /home/ubuntu
git clone git@gitlab.com:YOUR_USERNAME/YOUR_REPO.git interior-designer-portfolio
cd interior-designer-portfolio

# Install dependencies and start
npm install --production
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Run the command it outputs
```

**Add the public key to GitLab**:
- GitLab → Settings → Repository → Deploy Keys → Add key

### 3. GitLab CI/CD Variables

Go to GitLab → Settings → CI/CD → Variables and add:

| Variable | Value | Protected | Masked |
|----------|-------|-----------|--------|
| `AWS_ACCESS_KEY_ID` | Your IAM access key | ✅ | ✅ |
| `AWS_SECRET_ACCESS_KEY` | Your IAM secret key | ✅ | ✅ |
| `AWS_DEFAULT_REGION` | e.g., `us-east-1` | ✅ | ❌ |
| `S3_BUCKET_NAME` | Your bucket name | ✅ | ❌ |
| `EC2_HOST` | EC2 public IP | ✅ | ❌ |
| `EC2_USER` | `ubuntu` | ✅ | ❌ |
| `EC2_SSH_KEY` | Contents of `.pem` file | ✅ | ✅ |

### 4. Configure Frontend

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

### 5. Deploy!

```bash
git add .
git commit -m "Configure production deployment"
git push origin main
```

Watch the pipeline at: GitLab → CI/CD → Pipelines

## 🎉 Access Your Application

- **Frontend**: `http://YOUR_BUCKET_NAME.s3-website-YOUR_REGION.amazonaws.com`
- **Backend API**: `http://YOUR_EC2_IP:5000/api/projects`

## 🔧 Common Commands

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

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Pipeline fails at build | Check `package.json` dependencies, try `npm install` locally |
| SSH connection failed | Verify `EC2_SSH_KEY` variable, check security group |
| S3 access denied | Verify IAM permissions, check bucket policy |
| Backend not responding | SSH to EC2, run `pm2 logs`, check `pm2 status` |
| CORS errors | Verify `VITE_API_URL` is correct, check Express CORS config |

For detailed troubleshooting, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting).

---

**Need help?** Check the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
