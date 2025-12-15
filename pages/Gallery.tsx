import React from 'react';
import { useProjects } from '../context/ProjectContext';

const Gallery: React.FC = () => {
  const { gallery } = useProjects();

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Project Gallery</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore the visual journey of our architectural excellence and interior designs.
          </p>
        </div>

        {gallery.length === 0 ? (
           <div className="text-center py-20 bg-gray-50 rounded-xl">
             <p className="text-gray-500">No images in the gallery yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-xl shadow-lg bg-gray-100 aspect-[4/3]">
                <img 
                  src={item.url} 
                  alt={item.caption || 'Gallery Image'} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-white font-medium text-lg">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;