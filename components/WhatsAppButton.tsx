import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
    const { settings } = useProjects();
    const whatsappNumber = settings?.contact?.whatsapp;

    if (!whatsappNumber) return null;

    // Clean number for URL
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanNumber}`;

    return (
        <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all z-50 animate-bounce hover:animate-none group"
            title="Chat on WhatsApp"
        >
            <MessageCircle className="w-8 h-8" />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Chat with Us
            </span>
        </a>
    );
};

export default WhatsAppButton;
