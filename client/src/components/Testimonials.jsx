import React, { useState, useEffect } from 'react';
import './Testimonials.css';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    useEffect(() => {
        if (testimonials.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % testimonials.length);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [testimonials]);

    const fetchTestimonials = async () => {
        try {
            const response = await fetch('/api/testimonials');
            const data = await response.json();
            setTestimonials(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            setLoading(false);
        }
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    if (loading || testimonials.length === 0) {
        return (
            <section id="testimonials" className="section testimonials">
                <div className="container">
                    <div className="spinner"></div>
                </div>
            </section>
        );
    }

    const currentTestimonial = testimonials[currentIndex];

    return (
        <section id="testimonials" className="section testimonials">
            <div className="container">
                <h2 className="section-title">Client Testimonials</h2>

                <div className="testimonial-carousel">
                    <button className="carousel-btn prev" onClick={prevSlide} aria-label="Previous testimonial">
                        ‹
                    </button>

                    <div className="testimonial-card glass-card">
                        <div className="stars">
                            {[...Array(currentTestimonial.rating)].map((_, i) => (
                                <span key={i} className="star">★</span>
                            ))}
                        </div>

                        <p className="testimonial-text">"{currentTestimonial.text}"</p>

                        <div className="testimonial-author">
                            <img src={currentTestimonial.image} alt={currentTestimonial.name} />
                            <div>
                                <p className="author-name">{currentTestimonial.name}</p>
                                <p className="author-role">{currentTestimonial.role}</p>
                            </div>
                        </div>
                    </div>

                    <button className="carousel-btn next" onClick={nextSlide} aria-label="Next testimonial">
                        ›
                    </button>
                </div>

                <div className="carousel-dots">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
