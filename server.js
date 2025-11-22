require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load portfolio data
const portfolioData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'portfolio.json'), 'utf-8')
);

// API Routes

// Get all projects
app.get('/api/projects', (req, res) => {
    try {
        const { category } = req.query;
        let projects = portfolioData.projects;

        if (category && category !== 'All') {
            projects = projects.filter(p => p.category === category);
        }

        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Get single project by ID
app.get('/api/projects/:id', (req, res) => {
    try {
        const project = portfolioData.projects.find(
            p => p.id === parseInt(req.params.id)
        );

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// Get experience
app.get('/api/experience', (req, res) => {
    try {
        res.json(portfolioData.experience);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch experience' });
    }
});

// Get testimonials
app.get('/api/testimonials', (req, res) => {
    try {
        res.json(portfolioData.testimonials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

// Get about information
app.get('/api/about', (req, res) => {
    try {
        res.json(portfolioData.about);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch about information' });
    }
});

// Get project categories
app.get('/api/categories', (req, res) => {
    try {
        const categories = ['All', ...new Set(portfolioData.projects.map(p => p.category))];
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
});
