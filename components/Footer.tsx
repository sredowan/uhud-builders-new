import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';

const Footer: React.FC = () => {
  const { settings } = useProjects();

  return (
    <footer className="bg-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={settings.footerLogo || "https://file-service.chat/api/file/get/79e32f01-7132-411a-827c-658133543976"}
                alt="Uhud Builders Ltd"
                className="h-12 w-auto object-contain bg-white rounded p-1"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Building sustainable futures with integrity and excellence. Your dream property is just a call away.
            </p>
            <div className="flex gap-4">
              {settings.social.facebook && <a href={settings.social.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>}
              {settings.social.twitter && <a href={settings.social.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>}
              {settings.social.instagram && <a href={settings.social.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>}
              {settings.social.linkedin && <a href={settings.social.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/projects" className="hover:text-primary transition-colors">Projects</Link></li>
              <li><Link to="/gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Residential Development</li>
              <li>Commercial Spaces</li>
              <li>Property Management</li>
              <li>Urban Planning</li>
              <li>Sustainable Design</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>{settings.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>{settings.contact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>{settings.contact.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Uhud Builders Ltd. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;