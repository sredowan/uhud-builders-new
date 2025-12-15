import React from 'react';
import { Check } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

const About: React.FC = () => {
  const { settings } = useProjects();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Uhud Builders</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {settings.content.aboutUsShort}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Story Section */}
        <div className="flex flex-col md:flex-row gap-12 items-center mb-24">
          <div className="w-full md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800" 
              alt="Construction Site Meeting" 
              className="rounded-lg shadow-xl"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="text-gray-600 mb-4 leading-relaxed whitespace-pre-wrap">
              {settings.content.aboutUsFull}
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="bg-gray-50 p-8 rounded-xl border-l-4 border-primary">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600">
              To deliver world-class real estate solutions that exceed customer expectations while adhering to the highest standards of ethics, safety, and environmental stewardship.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-xl border-l-4 border-gray-900">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600">
              To be the most trusted and admired real estate developer, creating sustainable communities that nurture life and foster growth for generations to come.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
           <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Core Values</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {['Sustainability', 'Customer Focus', 'Transparency', 'Innovation', 'Excellence', 'Safety'].map((val) => (
               <div key={val} className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                 <div className="bg-green-100 p-2 rounded-full">
                   <Check className="w-4 h-4 text-primary" />
                 </div>
                 <span className="font-semibold text-gray-800">{val}</span>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default About;