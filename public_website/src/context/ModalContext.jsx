import React, { createContext, useContext, useState } from 'react';
import ContactPopup from '../Shared/ContactPopup/ContactPopup';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const openContactModal = () => setIsContactModalOpen(true);
    const closeContactModal = () => setIsContactModalOpen(false);

    return (
        <ModalContext.Provider value={{ openContactModal, closeContactModal }}>
            {children}
            <ContactPopup
                isOpen={isContactModalOpen}
                onClose={closeContactModal}
            />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
