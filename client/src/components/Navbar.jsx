import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-content">
                <div className="navbar-logo" onClick={() => scrollToSection('hero')}>
                    <span className="logo-text">Sophia Martinez</span>
                </div>

                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <li><a onClick={() => scrollToSection('portfolio')}>Portfolio</a></li>
                    <li><a onClick={() => scrollToSection('about')}>About</a></li>
                    <li><a onClick={() => scrollToSection('experience')}>Experience</a></li>
                    <li><a onClick={() => scrollToSection('testimonials')}>Testimonials</a></li>
                    <li><a onClick={() => scrollToSection('contact')} className="btn btn-primary">Contact</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
