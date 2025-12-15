import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Menu, X } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { settings } = useProjects();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) => location.pathname === path ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={settings.headerLogo || "https://file-service.chat/api/file/get/79e32f01-7132-411a-827c-658133543976"}
              alt="Uhud Builders Ltd"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className={`${isActive('/')} transition-colors`}>Home</Link>
            <Link to="/projects" className={`${isActive('/projects')} transition-colors`}>Projects</Link>
            <Link to="/gallery" className={`${isActive('/gallery')} transition-colors`}>Gallery</Link>
            <Link to="/about" className={`${isActive('/about')} transition-colors`}>About</Link>
            <Link to="/contact" className={`${isActive('/contact')} transition-colors`}>Contact</Link>
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a href={`tel:${settings.contact.phone}`} className="flex items-center gap-2 bg-primary hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg">
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="lg:hidden text-gray-600 focus:outline-none">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary">Home</Link>
            <Link to="/projects" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary">Projects</Link>
            <Link to="/gallery" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary">Gallery</Link>
            <Link to="/about" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary">About</Link>
            <Link to="/contact" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary">Contact</Link>
            <div className="pt-4">
              <a href={`tel:${settings.contact.phone}`} className="flex justify-center items-center gap-2 w-full bg-primary text-white px-4 py-3 rounded-lg font-bold">
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;