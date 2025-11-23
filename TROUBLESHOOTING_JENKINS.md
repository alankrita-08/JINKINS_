# Jenkins Troubleshooting Guide

## Error: "Cannot run program git.exe"

### Problem
```
java.io.IOException: Cannot run program "git.exe"
CreateProcess error=2, The system cannot find the file specified
```

This error occurs when Jenkins cannot find Git on your Windows system.

### Solution 1: Install Git for Windows

1. **Download Git for Windows**:
   - Go to: https://git-scm.com/download/win
   - Download the latest version (64-bit recommended)

2. **Install Git**:
   - Run the installer
   - **IMPORTANT**: During installation, select **"Git from the command line and also from 3rd-party software"**
   - This adds Git to your system PATH
   - Complete the installation with default settings

3. **Verify Git Installation**:
   ```powershell
   # Open PowerShell and run:
   git --version
   ```
   You should see something like: `git version 2.43.0.windows.1`

4. **Restart Jenkins**:
   ```powershell
   # Stop Jenkins service
   Stop-Service Jenkins
   
   # Start Jenkins service
   Start-Service Jenkins
   ```
   
   Or restart from Services:
   - Press `Win + R`, type `services.msc`
   - Find "Jenkins"
   - Right-click → Restart

5. **Retry Your Pipeline**:
   - Go to Jenkins Dashboard
   - Click on your pipeline job
   - Click "Build Now"

### Solution 2: Configure Git Path in Jenkins

If Git is already installed but Jenkins can't find it:

1. **Find Git Installation Path**:
   ```powershell
   # In PowerShell, run:
   where.exe git
   ```
   This will show the path, typically: `C:\Program Files\Git\bin\git.exe`

2. **Configure in Jenkins**:
   - Go to: **Manage Jenkins** → **Global Tool Configuration**
   - Scroll to **Git** section
   - Click **Add Git**
   - **Name**: `Default`
   - **Path to Git executable**: Enter the full path from step 1
     - Example: `C:\Program Files\Git\bin\git.exe`
   - Click **Save**

3. **Retry Your Pipeline**

### Solution 3: Add Git to System PATH Manually

1. **Find Git Installation Directory**:
   - Default location: `C:\Program Files\Git\bin`

2. **Add to System PATH**:
   - Press `Win + X` → **System**
   - Click **Advanced system settings**
   - Click **Environment Variables**
   - Under **System variables**, find **Path**
   - Click **Edit**
   - Click **New**
   - Add: `C:\Program Files\Git\bin`
   - Click **OK** on all dialogs

3. **Restart Jenkins** (see Solution 1, step 4)

4. **Retry Your Pipeline**

---

## Other Common Jenkins Errors

### Error: "node: command not found"

**Solution**: Configure NodeJS in Jenkins
1. Go to: **Manage Jenkins** → **Global Tool Configuration**
2. Scroll to **NodeJS**
3. Click **Add NodeJS**
4. **Name**: `18` (must match Jenkinsfile)
5. **Version**: Select Node.js 18.x
6. Click **Save**

### Error: "Permission denied (publickey)" during EC2 deployment

**Solution**: Check SSH credentials
1. Verify `ec2-ssh-key` credential in Jenkins contains complete private key
2. Ensure the key includes header and footer:
   ```
   -----BEGIN RSA PRIVATE KEY-----
   [key content]
   -----END RSA PRIVATE KEY-----
   ```
3. Check EC2 security group allows SSH (port 22)

### Error: "Access Denied" during S3 deployment

**Solution**: Verify AWS credentials
1. Check `aws-access-key-id` and `aws-secret-access-key` are correct
2. Verify IAM user has S3 permissions (see `iam-policy.json`)
3. Test locally:
   ```powershell
   aws s3 ls s3://YOUR_BUCKET_NAME
   ```

---

## Quick Verification Checklist

Before running your pipeline, verify:

- [ ] Git is installed and in PATH: `git --version`
- [ ] NodeJS plugin is configured in Jenkins
- [ ] All Jenkins credentials are added:
  - [ ] `aws-access-key-id`
  - [ ] `aws-secret-access-key`
  - [ ] `aws-region`
  - [ ] `s3-bucket-name`
  - [ ] `ec2-host`
  - [ ] `ec2-user`
  - [ ] `ec2-ssh-key`
- [ ] EC2 instance is running and accessible
- [ ] S3 bucket exists and has correct permissions

---

## Need More Help?

- Check [JENKINS_SETUP.md](./JENKINS_SETUP.md) for detailed setup instructions
- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive troubleshooting
