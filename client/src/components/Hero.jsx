import React, { useEffect, useState } from 'react';
import './Hero.css';

const Hero = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
    }, []);

    return (
        <section id="hero" className="hero">
            <div className="hero-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="container hero-content">
                <div className={`hero-text ${visible ? 'animate-fade-in-up' : ''}`}>
                    <p className="hero-subtitle">Interior Designer & Space Curator</p>
                    <h1 className="hero-title">
                        Transforming Spaces<br />
                        Into <span className="gradient-text">Timeless</span> Experiences
                    </h1>
                    <p className="hero-description">
                        Creating stunning, functional environments that reflect your unique personality
                        and lifestyle through the perfect blend of aesthetics and sustainability.
                    </p>
                    <div className="hero-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={() => document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' })}
                        >
                            View Portfolio
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Get In Touch
                        </button>
                    </div>
                </div>
            </div>

            <div className="scroll-indicator">
                <div className="mouse">
                    <div className="wheel"></div>
                </div>
                <p>Scroll to explore</p>
            </div>
        </section>
    );
};

export default Hero;
