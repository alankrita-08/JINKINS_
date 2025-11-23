# Interior Designer Portfolio Website

A stunning, modern portfolio website for interior designers built with React and Express, featuring dark theme, glassmorphism effects, and smooth animations.

![Portfolio Preview](https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&h=400&fit=crop)

## 🌟 Features

- **Modern Design**: Dark theme with glassmorphism effects and gradient accents
- **Responsive**: Fully responsive design that works on all devices
- **Animated**: Smooth animations and transitions throughout
- **Portfolio Gallery**: Filterable project gallery with lightbox view
- **Professional Timeline**: Experience section with timeline layout
- **Client Testimonials**: Auto-rotating carousel with ratings
- **Contact Form**: Elegant contact form with validation
- **REST API**: Express backend serving portfolio data
- **CI/CD Ready**: Jenkins pipeline for automated deployment

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite (Build tool)
- CSS3 (Custom design system)
- Google Fonts (Playfair Display, Inter)

### Backend
- Node.js
- Express.js
- CORS enabled
- JSON data storage

### DevOps
- Jenkins Pipeline
- AWS EC2 (Backend hosting)
- AWS S3 (Frontend static hosting)
- PM2 (Process management)

## 📋 Prerequisites

- Node.js 18+ and npm
- Git
- AWS Account (for deployment)
- Jenkins server (for CI/CD)

## 🚀 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd jenkins-backend-dev
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```
   Backend will run on http://localhost:5000

5. **Start the frontend dev server** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## 📦 Building for Production

1. **Build the React frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```
   The Express server will serve the React build at http://localhost:5000

## 🔌 API Endpoints

- `GET /api/projects` - Get all projects (supports `?category=` filter)
- `GET /api/projects/:id` - Get single project by ID
- `GET /api/experience` - Get work experience
- `GET /api/testimonials` - Get client testimonials
- `GET /api/about` - Get about/bio information
- `GET /api/categories` - Get project categories

## 🚢 Deployment

### Jenkins Pipeline Setup

For detailed Jenkins setup instructions, see [JENKINS_SETUP.md](JENKINS_SETUP.md).

1. **Configure Jenkins Credentials**
   
   Go to Jenkins → Manage Jenkins → Manage Credentials and add:

   **AWS Credentials:**
   - `AWS_ACCESS_KEY_ID` - Your AWS access key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
   - `AWS_DEFAULT_REGION` - AWS region (e.g., us-east-1)
   - `S3_BUCKET_NAME` - S3 bucket name for frontend

   **EC2 Credentials:**
   - `EC2_HOST` - EC2 instance IP or hostname
   - `EC2_USER` - EC2 username (usually `ubuntu`)
   - `EC2_SSH_KEY` - Private SSH key for EC2 access

2. **Prepare EC2 Instance**
   
   SSH into your EC2 instance and run:
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 globally
   sudo npm install -g pm2

   # Clone your repository
   cd /home/ubuntu
   git clone <your-repo-url> interior-designer-portfolio
   cd interior-designer-portfolio

   # Install dependencies
   npm install --production

   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

3. **Configure S3 Bucket**
   
   ```bash
   # Create S3 bucket
   aws s3 mb s3://your-bucket-name

   # Enable static website hosting
   aws s3 website s3://your-bucket-name \
     --index-document index.html \
     --error-document index.html

   # Set bucket policy for public access
   aws s3api put-bucket-policy \
     --bucket your-bucket-name \
     --policy file://bucket-policy.json
   ```

4. **Trigger Jenkins Pipeline**
   
   Push your code to the `main` branch to trigger the Jenkins pipeline:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
   
   Or manually trigger from Jenkins Dashboard → Build Now

### Manual Deployment

#### Backend to EC2
```bash
ssh user@ec2-instance
cd /path/to/project
git pull origin main
npm install --production
pm2 restart ecosystem.config.js
```

#### Frontend to S3
```bash
cd client
npm run build
aws s3 sync build/ s3://your-bucket-name --delete
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app component
│   │   └── index.css      # Design system
│   ├── package.json
│   └── vite.config.js
├── data/
│   └── portfolio.json     # Portfolio data
├── scripts/
│   ├── deploy-backend.sh  # EC2 deployment script
│   └── deploy-frontend.sh # S3 deployment script
├── Jenkinsfile            # Jenkins pipeline configuration
├── JENKINS_SETUP.md       # Jenkins setup guide
├── ecosystem.config.js    # PM2 configuration
├── server.js              # Express server
└── package.json           # Backend dependencies
```

## 🎨 Customization

### Update Portfolio Data

Edit `data/portfolio.json` to customize:
- Projects and images
- Work experience
- Testimonials
- About information
- Skills and certifications

### Modify Design

Edit `client/src/index.css` to customize:
- Color palette (CSS variables)
- Typography
- Spacing and layout
- Animations

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Sophia Martinez** - Interior Designer & Space Curator

---

**Made with ❤️ using React and Express**
