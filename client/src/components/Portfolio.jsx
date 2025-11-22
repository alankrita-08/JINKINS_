import React, { useState, useEffect } from 'react';
import './Portfolio.css';

const Portfolio = () => {
    const [projects, setProjects] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
        fetchCategories();
    }, []);

    const fetchProjects = async (category = 'All') => {
        try {
            const url = category === 'All'
                ? '/api/projects'
                : `/api/projects?category=${category}`;
            const response = await fetch(url);
            const data = await response.json();
            setProjects(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setLoading(true);
        fetchProjects(category);
    };

    const openLightbox = (project) => {
        setSelectedProject(project);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedProject(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <section id="portfolio" className="section portfolio">
            <div className="container">
                <h2 className="section-title">Featured Projects</h2>

                <div className="category-filters">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="projects-grid">
                        {projects.map((project, index) => (
                            <div
                                key={project.id}
                                className="project-card glass-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => openLightbox(project)}
                            >
                                <div className="project-image">
                                    <img src={project.image} alt={project.title} />
                                    <div className="project-overlay">
                                        <div className="project-info">
                                            <h3>{project.title}</h3>
                                            <p className="project-category">{project.category}</p>
                                            <p className="project-location">{project.location}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="project-tags">
                                    {project.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedProject && (
                <div className="lightbox" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={closeLightbox}>×</button>

                        <div className="lightbox-grid">
                            <div className="lightbox-images">
                                <img src={selectedProject.image} alt={selectedProject.title} className="main-image" />
                            </div>

                            <div className="lightbox-details">
                                <h2>{selectedProject.title}</h2>
                                <div className="project-meta">
                                    <span className="meta-item">
                                        <strong>Category:</strong> {selectedProject.category}
                                    </span>
                                    <span className="meta-item">
                                        <strong>Location:</strong> {selectedProject.location}
                                    </span>
                                    <span className="meta-item">
                                        <strong>Year:</strong> {selectedProject.year}
                                    </span>
                                </div>
                                <p className="project-description">{selectedProject.description}</p>
                                <div className="project-tags-full">
                                    {selectedProject.tags.map((tag, i) => (
                                        <span key={i} className="tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Portfolio;
