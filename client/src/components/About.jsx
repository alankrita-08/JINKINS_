import React, { useState, useEffect } from 'react';
import './About.css';

const About = () => {
    const [aboutData, setAboutData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAboutData();
    }, []);

    const fetchAboutData = async () => {
        try {
            const response = await fetch('/api/about');
            const data = await response.json();
            setAboutData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching about data:', error);
            setLoading(false);
        }
    };

    if (loading || !aboutData) {
        return (
            <section id="about" className="section about">
                <div className="container">
                    <div className="spinner"></div>
                </div>
            </section>
        );
    }

    return (
        <section id="about" className="section about">
            <div className="container">
                <h2 className="section-title">About Me</h2>

                <div className="about-grid">
                    <div className="about-image glass-card">
                        <img src={aboutData.image} alt={aboutData.name} />
                    </div>

                    <div className="about-content">
                        <h3 className="about-name">{aboutData.name}</h3>
                        <p className="about-title">{aboutData.title}</p>
                        <p className="about-bio">{aboutData.bio}</p>

                        <div className="about-details">
                            <div className="detail-item">
                                <span className="icon">📧</span>
                                <a href={`mailto:${aboutData.email}`}>{aboutData.email}</a>
                            </div>
                            <div className="detail-item">
                                <span className="icon">📱</span>
                                <a href={`tel:${aboutData.phone}`}>{aboutData.phone}</a>
                            </div>
                            <div className="detail-item">
                                <span className="icon">📍</span>
                                <span>{aboutData.location}</span>
                            </div>
                        </div>

                        <div className="certifications glass-card">
                            <h4>Certifications & Awards</h4>
                            <ul>
                                {aboutData.certifications.map((cert, index) => (
                                    <li key={index}>
                                        <span className="cert-icon">🏆</span>
                                        {cert}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="social-links">
                            {aboutData.social.instagram && (
                                <a href={aboutData.social.instagram} target="_blank" rel="noopener noreferrer" className="social-btn">
                                    Instagram
                                </a>
                            )}
                            {aboutData.social.pinterest && (
                                <a href={aboutData.social.pinterest} target="_blank" rel="noopener noreferrer" className="social-btn">
                                    Pinterest
                                </a>
                            )}
                            {aboutData.social.linkedin && (
                                <a href={aboutData.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-btn">
                                    LinkedIn
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="skills-section">
                    <h3>Expertise</h3>
                    <div className="skills-grid">
                        {aboutData.skills.map((skill, index) => (
                            <div key={index} className="skill-card glass-card">
                                <span>{skill}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
