# Windows Jenkins Setup - Additional Steps

## AWS CLI Installation for Windows

Since you're running Jenkins on Windows, you need to install AWS CLI to deploy to S3.

### Step 1: Download AWS CLI

1. Go to: https://aws.amazon.com/cli/
2. Click **"Download for Windows"**
3. Download the MSI installer (64-bit recommended)

### Step 2: Install AWS CLI

1. Run the downloaded `.msi` file
2. Follow the installation wizard
3. Use default settings
4. Complete the installation

### Step 3: Configure AWS Credentials

Open a **new PowerShell window** and run:

```powershell
aws configure
```

Enter your AWS credentials:
- **AWS Access Key ID**: `AKIAWS6X3Z6M3P7QWFHN`
- **AWS Secret Access Key**: `vuU3E+ObFhlKAEUbYxuXJxUsBfnjwa3VamgydtWS`
- **Default region name**: `eu-north-1` (or your S3 bucket region)
- **Default output format**: `json`

### Step 4: Verify Installation

```powershell
aws --version
aws s3 ls
```

You should see your S3 buckets listed.

### Step 5: Restart Jenkins

After installing AWS CLI, restart Jenkins:

```powershell
Restart-Service Jenkins
```

---

## Backend Deployment on Windows

The updated Jenkinsfile **skips backend deployment** on Windows because SSH from Windows Jenkins is complex. You have two options:

### Option 1: Manual Backend Deployment (Recommended for now)

When you push code changes:

1. **SSH to your EC2 instance**:
   ```powershell
   ssh -i portfolio-ec2-key.pem ubuntu@13.51.200.186
   ```

2. **Update and restart the backend**:
   ```bash
   cd /home/ubuntu/interior-designer-portfolio
   git pull origin main
   npm install --production
   pm2 restart ecosystem.config.js
   ```

### Option 2: Use a Linux Jenkins Agent (Advanced)

Set up a Linux machine (or Docker container) as a Jenkins agent to handle SSH deployments.

---

## Updated Jenkinsfile Changes

The Jenkinsfile has been updated to:

✅ Use `bat` commands instead of `sh` (Windows compatible)  
✅ Check for AWS CLI before deploying to S3  
✅ Skip backend deployment on Windows (with manual instructions)  
✅ Use Windows path separators (`\` instead of `/`)  
✅ Use Windows environment variable syntax (`%VAR%`)

---

## Next Steps

1. ✅ Install AWS CLI for Windows
2. ✅ Configure AWS credentials
3. ✅ Restart Jenkins
4. ✅ Push the updated Jenkinsfile to GitHub
5. ✅ Retry the Jenkins build

---

## Push Updated Jenkinsfile

Open Git Bash or PowerShell and run:

```bash
cd /c/Users/91790/OneDrive/Desktop/alankrita/JINKINS_

git add Jenkinsfile
git commit -m "Update Jenkinsfile for Windows compatibility"
git push origin main
```

Then retry the build in Jenkins!
