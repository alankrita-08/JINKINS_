pipeline {
    agent any
    
    environment {
        // Node.js version
        NODE_VERSION = '18'
        
        // AWS credentials (configured in Jenkins)
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        AWS_DEFAULT_REGION = credentials('aws-region')
        S3_BUCKET_NAME = credentials('s3-bucket-name')
        
        // EC2 credentials (configured in Jenkins)
        EC2_HOST = credentials('ec2-host')
        EC2_USER = credentials('ec2-user')
    }
    
    tools {
        nodejs "${NODE_VERSION}"
    }
    
    stages {
        stage('Build') {
            steps {
                echo 'Starting build process...'
                
                // Install backend dependencies
                echo 'Installing backend dependencies...'
                bat 'npm install'
                
                // Install frontend dependencies
                echo 'Installing frontend dependencies...'
                dir('client') {
                    bat 'npm install'
                    
                    // Build React application
                    echo 'Building React frontend...'
                    bat 'npm run build'
                }
                
                echo 'Build completed successfully!'
            }
        }
        
        stage('Deploy Backend') {
            steps {
                echo 'Deploying backend to EC2...'
                echo 'Note: SSH deployment from Windows Jenkins requires additional setup.'
                echo 'For now, this stage will be skipped. Deploy backend manually or use a Linux Jenkins agent.'
                
                // Windows doesn't have native SSH like Linux
                // You would need to install OpenSSH or use a different method
                // For simplicity, we'll skip this stage on Windows
                script {
                    echo 'Backend deployment skipped on Windows. Please deploy manually to EC2.'
                    echo 'SSH to EC2: ssh -i your-key.pem ubuntu@${EC2_HOST}'
                    echo 'Then run: cd /home/ubuntu/interior-designer-portfolio && git pull && npm install --production && pm2 restart ecosystem.config.js'
                }
            }
        }
        
        stage('Deploy Frontend') {
            steps {
                echo 'Deploying frontend to S3...'
                
                // Check if AWS CLI is available
                script {
                    def awsInstalled = bat(script: '@where aws 2>nul', returnStatus: true) == 0
                    if (!awsInstalled) {
                        echo 'AWS CLI not found. Please install AWS CLI for Windows.'
                        echo 'Download from: https://aws.amazon.com/cli/'
                        error('AWS CLI is required for S3 deployment')
                    }
                }
                
                // Sync React build to S3
                echo "Uploading files to S3 bucket: ${S3_BUCKET_NAME}..."
                bat "aws s3 sync client\\build\\ s3://%S3_BUCKET_NAME% --delete"
                
                // Set cache headers for static assets (1 year)
                echo 'Setting cache headers for static assets...'
                bat """
                    aws s3 cp s3://%S3_BUCKET_NAME% s3://%S3_BUCKET_NAME% ^
                        --recursive ^
                        --metadata-directive REPLACE ^
                        --cache-control max-age=31536000,public ^
                        --exclude "*.html"
                """
                
                // Set cache headers for HTML files (no cache)
                echo 'Setting cache headers for HTML files...'
                bat """
                    aws s3 cp s3://%S3_BUCKET_NAME% s3://%S3_BUCKET_NAME% ^
                        --recursive ^
                        --metadata-directive REPLACE ^
                        --cache-control no-cache ^
                        --include "*.html"
                """
                
                echo 'Frontend deployment completed successfully!'
                echo "Website URL: http://${S3_BUCKET_NAME}.s3-website-${AWS_DEFAULT_REGION}.amazonaws.com"
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Frontend: http://${S3_BUCKET_NAME}.s3-website-${AWS_DEFAULT_REGION}.amazonaws.com"
            echo "Backend API: http://${EC2_HOST}:5000/api/projects"
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above for details.'
        }
        always {
            // Clean up workspace
            cleanWs()
        }
    }
}
