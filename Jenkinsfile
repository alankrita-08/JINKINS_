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
                sh 'npm install'
                
                // Install frontend dependencies
                echo 'Installing frontend dependencies...'
                dir('client') {
                    sh 'npm install'
                    
                    // Build React application
                    echo 'Building React frontend...'
                    sh 'npm run build'
                }
                
                echo 'Build completed successfully!'
            }
        }
        
        stage('Deploy Backend') {
            steps {
                echo 'Deploying backend to EC2...'
                
                // Use SSH credentials stored in Jenkins
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh '''
                        # Add EC2 host to known_hosts
                        mkdir -p ~/.ssh
                        ssh-keyscan -H ${EC2_HOST} >> ~/.ssh/known_hosts
                        
                        # Deploy backend by executing the deployment script on EC2
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} "bash -s" < ./scripts/deploy-backend.sh
                    '''
                }
                
                echo 'Backend deployment completed!'
            }
        }
        
        stage('Deploy Frontend') {
            steps {
                echo 'Deploying frontend to S3...'
                
                // Install AWS CLI if not available
                sh '''
                    if ! command -v aws &> /dev/null; then
                        echo "Installing AWS CLI..."
                        pip install awscli
                    fi
                '''
                
                // Sync React build to S3
                echo "Uploading files to S3 bucket: ${S3_BUCKET_NAME}..."
                sh 'aws s3 sync client/build/ s3://${S3_BUCKET_NAME} --delete'
                
                // Set cache headers for static assets (1 year)
                echo 'Setting cache headers for static assets...'
                sh '''
                    aws s3 cp s3://${S3_BUCKET_NAME} s3://${S3_BUCKET_NAME} \
                        --recursive \
                        --metadata-directive REPLACE \
                        --cache-control max-age=31536000,public \
                        --exclude "*.html"
                '''
                
                // Set cache headers for HTML files (no cache)
                echo 'Setting cache headers for HTML files...'
                sh '''
                    aws s3 cp s3://${S3_BUCKET_NAME} s3://${S3_BUCKET_NAME} \
                        --recursive \
                        --metadata-directive REPLACE \
                        --cache-control no-cache \
                        --include "*.html"
                '''
                
                echo 'Frontend deployment completed successfully!'
                echo "Website URL: http://${S3_BUCKET_NAME}.s3-website-${AWS_DEFAULT_REGION}.amazonaws.com"
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo 'Frontend: http://${S3_BUCKET_NAME}.s3-website-${AWS_DEFAULT_REGION}.amazonaws.com'
            echo 'Backend API: http://${EC2_HOST}:5000/api/projects'
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
