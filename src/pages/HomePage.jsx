import React from "react";
import { Link } from "react-router-dom";
import { FiUploadCloud, FiEdit, FiImage, FiSettings } from "react-icons/fi";
import "./HomePage.scss";

const HomePage = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="overlay">
          <div className="hero-content">
            <h1>Transform Your Images with AI-Powered Editing</h1>
            <p>
              Enhance your photos effortlessly with our advanced AI tools. No
              design skills needed.
            </p>
            <a to="/" className="cta-btn">
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="upload">
        <div className="upload-content">
          <h1>Transform Your Photos Instantly</h1>
          <p>AI-powered photo enhancement with stunning results.</p>
          <div className="upload-box">
            <FiUploadCloud className="upload-icon" />
            <p>
              Drag & Drop Your Image or <span>Browse</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="feature-list">
          <div className="feature-card">
            <FiEdit className="feature-icon" />
            <h3>AI Enhancement</h3>
            <p>Improve image quality with AI upscaling and noise reduction.</p>
          </div>
          <div className="feature-card">
            <FiImage className="feature-icon" />
            <h3>Color Correction</h3>
            <p>Enhance colors automatically with our smart algorithms.</p>
          </div>
          <div className="feature-card">
            <FiSettings className="feature-icon" />
            <h3>Advanced Tools</h3>
            <p>
              Use sharpening, clarity, and lighting adjustments effortlessly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
