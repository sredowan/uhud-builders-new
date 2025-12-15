import React from 'react';
import { useProjects } from '../context/ProjectContext';
import ProjectCard from '../components/ProjectCard';

const Projects: React.FC = () => {
  const { projects } = useProjects();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Projects</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover our portfolio of residential and commercial developments, designed to elevate your lifestyle and business.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl text-gray-500">No projects found. Check back later!</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
