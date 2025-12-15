import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

const WhatsAppButton: React.FC = () => {
    const { settings } = useProjects();

    // Format phone number: remove non-numeric chars
    // If no phone number is set, fallback to a default or hide
    const rawPhone = settings?.contact?.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');

    if (!cleanPhone) return null;

    const whatsappUrl = `https://wa.me/${cleanPhone}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={28} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap font-medium">
                Chat with us
            </span>
        </a>
    );
};

export default WhatsAppButton;
