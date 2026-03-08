import React from 'react';
import './OurProcess.css';

const OurProcess = ({ steps }) => {
    return (
        <section className="process-section">
            <div className="process-container">
                <div className="section-badge">
                    <span className="badge-text" style={{ textTransform: 'none' }}>Workflow</span>
                </div>
                <h2 className="process-title">How we work</h2>

                <div className="process-list">
                    {steps.map((item, index) => (
                        <div key={index} className="process-item">
                            <div className="process-number">{item.step}</div>
                            <div className="process-content">
                                <h3 className="process-step-title">{item.title}</h3>
                                <p className="process-step-text">{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OurProcess;
