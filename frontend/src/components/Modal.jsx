// src/components/Modal.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Modal = ({ isOpen, onClose }) => {
    // Prevent scrolling of the background when the modal is open
    React.useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full transition-transform transform"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <header className="flex justify-between items-center mb-4">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-800">Welcome to AI Healthcare Assistant</h2>
                </header>
                <p className="mb-4 text-gray-600">
                    To get started, please sign up to access our features and experience personalized healthcare solutions.
                </p>
                <button
                    className="bg-blue-600 text-white rounded-lg px-5 py-2 w-full transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={onClose}
                >
                    Close {/* Retaining the button functionality for closing */}
                </button>
            </motion.div>
        </div>
    );
};

export default Modal;
