import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { MapPin, Phone, Mail, ArrowLeft, Bed, Bath, LayoutGrid, Zap, PhoneCall, ArrowUpCircle } from 'lucide-react';

const ProjectDetails: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const { getProject, settings } = useProjects();
   const [activeTab, setActiveTab] = useState(0);

   const project = getProject(id || '');

   if (!project) {
      return <Navigate to="/projects" replace />;
   }

   return (
      <div className="bg-white min-h-screen pb-20 animate-fade-in">
         {/* Hero / Image Section */}
         <div className="relative h-[60vh] bg-gray-200">
            <img
               src={project.imageUrl}
               alt={project.title}
               className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute top-6 left-4 sm:left-8">
               <Link to="/projects" className="inline-flex items-center gap-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Projects
               </Link>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 text-white">
               <div className="container mx-auto">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                     <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${project.status === 'Completed' ? 'bg-blue-500' : project.status === 'Ongoing' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                           {project.status}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold mb-2">{project.title}</h1>
                        <div className="flex items-center gap-2 text-lg text-gray-200">
                           <MapPin className="w-5 h-5 text-primary" /> {project.location}
                        </div>
                     </div>
                     <div className="md:text-right">
                        <p className="text-sm text-gray-300 uppercase tracking-wider mb-1">Price Range</p>
                        <p className="text-2xl md:text-3xl font-bold text-primary">{project.price || 'Contact for Pricing'}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

               {/* Main Content */}
               <div className="lg:col-span-2 space-y-8">

                  {/* Unit Configurations (Tabs) */}
                  {project.units && project.units.length > 0 && (
                     <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Unit Configurations</h2>

                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 mb-8 border-b">
                           {project.units.map((unit, idx) => (
                              <button
                                 key={idx}
                                 onClick={() => setActiveTab(idx)}
                                 className={`px-6 py-3 font-semibold text-lg rounded-t-lg transition-colors relative ${activeTab === idx
                                    ? 'text-primary border-b-2 border-primary bg-green-50/50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                              >
                                 {unit.name}
                                 {activeTab === idx && <span className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-primary"></span>}
                              </button>
                           ))}
                        </div>

                        {/* Tab Content */}
                        <div className="animate-fade-in">
                           <div className="flex flex-col gap-6">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Size</p>
                                    <p className="text-lg font-bold text-gray-900">{project.units[activeTab].size}</p>
                                 </div>
                                 <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <Bed className="w-6 h-6 mx-auto mb-2 text-primary" />
                                    <p className="font-bold text-gray-900">{project.units[activeTab].bedrooms} Beds</p>
                                 </div>
                                 <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <Bath className="w-6 h-6 mx-auto mb-2 text-primary" />
                                    <p className="font-bold text-gray-900">{project.units[activeTab].bathrooms} Baths</p>
                                 </div>
                                 <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <LayoutGrid className="w-6 h-6 mx-auto mb-2 text-primary" />
                                    <p className="font-bold text-gray-900">{project.units[activeTab].balconies} Balconies</p>
                                 </div>
                              </div>

                              {/* Features List */}
                              {project.units[activeTab].features.length > 0 && (
                                 <div className="mt-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Unit Features:</h4>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                       {project.units[activeTab].features.map((feat, i) => (
                                          <li key={i} className="flex items-center gap-2 text-gray-700">
                                             <div className="w-2 h-2 rounded-full bg-primary" />
                                             {feat}
                                          </li>
                                       ))}
                                    </ul>
                                 </div>
                              )}

                              {/* Floor Plan Image */}
                              {project.units[activeTab].floorPlanImage && (
                                 <div className="mt-6 border rounded-xl overflow-hidden bg-gray-50">
                                    <img
                                       src={project.units[activeTab].floorPlanImage}
                                       alt={`${project.units[activeTab].name} Plan`}
                                       className="w-full h-auto"
                                    />
                                 </div>
                              )}

                              {!project.units[activeTab].floorPlanImage && (
                                 <div className="mt-6 p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400">
                                    <LayoutGrid className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>Floor plan view available on request</p>
                                 </div>
                              )}

                           </div>
                        </div>
                     </div>
                  )}

                  {/* Building Amenities */}
                  <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                     <h2 className="text-2xl font-bold text-gray-900 mb-6">Building Amenities</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {project.buildingAmenities.map((amenity, idx) => {
                           let icon = <ArrowUpCircle className="w-8 h-8 text-primary" />;
                           if (amenity.toLowerCase().includes('power') || amenity.toLowerCase().includes('generator')) icon = <Zap className="w-8 h-8 text-primary" />;
                           if (amenity.toLowerCase().includes('communication') || amenity.toLowerCase().includes('pbx')) icon = <PhoneCall className="w-8 h-8 text-primary" />;
                           if (amenity.toLowerCase().includes('lift') || amenity.toLowerCase().includes('elevator')) icon = <ArrowUpCircle className="w-8 h-8 text-primary" />;

                           return (
                              <div key={idx} className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                                 <div className="mb-3 p-3 bg-white rounded-full shadow-sm">
                                    {icon}
                                 </div>
                                 <span className="font-medium text-gray-800">{amenity}</span>
                              </div>
                           )
                        })}
                     </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                     <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Project</h2>
                     <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                        {project.description}
                     </p>
                  </div>

               </div>

               {/* Sidebar / Contact */}
               <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                     <h3 className="text-xl font-bold text-gray-900 mb-6">Interested in this property?</h3>

                     <div className="space-y-4 mb-8">
                        <a href={`tel:${settings.contact.phone}`} className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary hover:bg-green-50 transition-colors group">
                           <div className="bg-green-100 p-3 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <Phone className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">Call Us</p>
                              <p className="font-bold text-gray-900">{settings.contact.phone}</p>
                           </div>
                        </a>

                        <a href={`mailto:${settings.contact.email}`} className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary hover:bg-green-50 transition-colors group">
                           <div className="bg-green-100 p-3 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <Mail className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">Email Us</p>
                              <p className="font-bold text-gray-900 truncate max-w-[180px]">{settings.contact.email}</p>
                           </div>
                        </a>
                     </div>

                     <Link to="/contact" className="block w-full bg-primary hover:bg-green-700 text-white text-center font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                        Schedule a Viewing
                     </Link>

                     <div className="mt-6 pt-6 border-t text-center">
                        <p className="text-xs text-gray-400">Uhud Builders Ltd.</p>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
};

export default ProjectDetails;