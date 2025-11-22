import React, { useState, useEffect } from 'react';
import './Experience.css';

const Experience = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExperience();
    }, []);

    const fetchExperience = async () => {
        try {
            const response = await fetch('/api/experience');
            const data = await response.json();
            setExperiences(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching experience:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section id="experience" className="section experience">
                <div className="container">
                    <div className="spinner"></div>
                </div>
            </section>
        );
    }

    return (
        <section id="experience" className="section experience">
            <div className="container">
                <h2 className="section-title">Professional Experience</h2>

                <div className="timeline">
                    {experiences.map((exp, index) => (
                        <div key={exp.id} className="timeline-item" style={{ animationDelay: `${index * 0.2}s` }}>
                            <div className="timeline-marker"></div>
                            <div className="timeline-content glass-card">
                                <div className="timeline-header">
                                    <div>
                                        <h3>{exp.title}</h3>
                                        <p className="company">{exp.company}</p>
                                        <p className="location">{exp.location}</p>
                                    </div>
                                    <div className="timeline-date">
                                        {exp.startDate} - {exp.endDate}
                                    </div>
                                </div>
                                <p className="description">{exp.description}</p>
                                <div className="achievements">
                                    <h4>Key Achievements:</h4>
                                    <ul>
                                        {exp.achievements.map((achievement, i) => (
                                            <li key={i}>{achievement}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;
