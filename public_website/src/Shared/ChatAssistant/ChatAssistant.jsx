import React, { useState } from 'react';
import './chatAssistant.css';

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`chat-assistant-container ${isOpen ? 'open' : ''}`}>
            {/* Chat Window */}
            <div className="chat-window">
                <div className="chat-header">
                    <div className="assistant-info">
                        <div className="assistant-avatar">
                            <div className="online-indicator"></div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <div className="assistant-text">
                            <h4>Antha Assistant</h4>
                            <p>Online | Ready to help</p>
                        </div>
                    </div>
                    <button className="close-chat" onClick={() => setIsOpen(false)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="chat-body">
                    <div className="message assistant-msg">
                        Hello! 👋 How can I help you regarding our digital services today?
                    </div>
                </div>

                <div className="chat-footer">
                    <input type="text" placeholder="Type your query..." />
                    <button className="send-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Floating Trigger Button */}
            <button className="chat-trigger" onClick={() => setIsOpen(!isOpen)}>
                <div className="trigger-icon">
                    {isOpen ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    )}
                </div>
                {!isOpen && <span className="trigger-tooltip">Instant Query?</span>}
            </button>
        </div>
    );
}
