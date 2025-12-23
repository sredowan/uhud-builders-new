import React from 'react';
import { Project } from '../types';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Ongoing': return 'bg-green-100 text-green-700 border-green-200';
      case 'Upcoming': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Link
      to={`/projects/${project.id}`}
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 group animate-fade-in hover:-translate-y-1 block"
    >
      {/* Vertical Image Container - Aspect Ratio 3:4 */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-sm ${getStatusColor(project.status)}`}>
          {project.status}
        </div>

        {/* Project Logo Overlay */}
        {project.logoUrl && (
          <div className="absolute bottom-4 left-4 bg-white/90 p-2.5 rounded-lg shadow-sm backdrop-blur-sm z-10 border border-white/50 max-w-[40%]">
            <img src={project.logoUrl} alt={`${project.title} logo`} className="h-10 w-auto object-contain" />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{project.title}</h3>

        <div className="flex items-center text-gray-500 mb-4 text-sm">
          <MapPin className="w-4 h-4 mr-1.5 text-primary" />
          {project.location}
        </div>




      </div>
    </Link>
  );
};

export default ProjectCard;