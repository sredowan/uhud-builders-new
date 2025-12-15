import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

const Contact: React.FC = () => {
  const { settings, addMessage } = useProjects();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addMessage(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have a question? Fill out the form below or email us directly at <a href={`mailto:${settings.contact.email}`} className="text-primary font-semibold hover:underline">{settings.contact.email}</a>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="bg-white p-8 rounded-xl shadow-md h-full">
              <div className="flex items-start gap-4 mb-8">
                <div className="bg-green-100 p-3 rounded-lg text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Visit Us</h3>
                  <p className="text-gray-600">{settings.contact.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 mb-8">
                <div className="bg-green-100 p-3 rounded-lg text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Call Us</h3>
                  <p className="text-gray-600">{settings.contact.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Email Us</h3>
                  <p className="text-gray-600 break-all">{settings.contact.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="bg-white p-8 rounded-xl shadow-md">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center animate-fade-in">
                  <div className="bg-green-100 p-4 rounded-full mb-4">
                    <Send className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600 mb-6">Your message has been saved. We will contact you at {settings.contact.email} if required.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-primary font-semibold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-black mb-1">Full Name</label>
                      <input type="text" id="name" name="name" required className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-primary outline-none transition-all" value={formData.name} onChange={handleChange} />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-black mb-1">Email Address</label>
                      <input type="email" id="email" name="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-primary outline-none transition-all" value={formData.email} onChange={handleChange} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">Phone Number</label>
                    <input type="tel" id="phone" name="phone" className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-primary outline-none transition-all" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-black mb-1">Message</label>
                    <textarea id="message" name="message" rows={5} required className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-primary outline-none resize-none" value={formData.message} onChange={handleChange}></textarea>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                    {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;