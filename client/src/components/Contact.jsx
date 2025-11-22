import React, { useState, useEffect } from 'react';
import './Contact.css';

const Contact = () => {
    const [aboutData, setAboutData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [formStatus, setFormStatus] = useState('');

    useEffect(() => {
        fetchAboutData();
    }, []);

    const fetchAboutData = async () => {
        try {
            const response = await fetch('/api/about');
            const data = await response.json();
            setAboutData(data);
        } catch (error) {
            console.error('Error fetching about data:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simulate form submission
        setFormStatus('sending');

        setTimeout(() => {
            setFormStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });

            setTimeout(() => {
                setFormStatus('');
            }, 3000);
        }, 1500);
    };

    return (
        <section id="contact" className="section contact">
            <div className="container">
                <h2 className="section-title">Get In Touch</h2>
                <p className="contact-subtitle">
                    Ready to transform your space? Let's discuss your project and bring your vision to life.
                </p>

                <div className="contact-grid">
                    <div className="contact-info">
                        <div className="info-card glass-card">
                            <div className="info-icon">📧</div>
                            <h3>Email</h3>
                            <a href={`mailto:${aboutData?.email}`}>{aboutData?.email}</a>
                        </div>

                        <div className="info-card glass-card">
                            <div className="info-icon">📱</div>
                            <h3>Phone</h3>
                            <a href={`tel:${aboutData?.phone}`}>{aboutData?.phone}</a>
                        </div>

                        <div className="info-card glass-card">
                            <div className="info-icon">📍</div>
                            <h3>Location</h3>
                            <p>{aboutData?.location}</p>
                        </div>

                        {aboutData?.social && (
                            <div className="social-links-contact">
                                <h3>Follow Me</h3>
                                <div className="social-buttons">
                                    {aboutData.social.instagram && (
                                        <a href={aboutData.social.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                                            Instagram
                                        </a>
                                    )}
                                    {aboutData.social.pinterest && (
                                        <a href={aboutData.social.pinterest} target="_blank" rel="noopener noreferrer" className="social-link">
                                            Pinterest
                                        </a>
                                    )}
                                    {aboutData.social.linkedin && (
                                        <a href={aboutData.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                                            LinkedIn
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <form className="contact-form glass-card" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Your name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                                placeholder="Tell me about your project..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary submit-btn"
                            disabled={formStatus === 'sending'}
                        >
                            {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
                        </button>

                        {formStatus === 'success' && (
                            <div className="form-message success">
                                ✓ Message sent successfully! I'll get back to you soon.
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <footer className="footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} {aboutData?.name || 'Sophia Martinez'}. All rights reserved.</p>
                    <p className="footer-tagline">Transforming Spaces, Creating Experiences</p>
                </div>
            </footer>
        </section>
    );
};

export default Contact;
