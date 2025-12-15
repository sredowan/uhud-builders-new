import React from 'react';
import { useProjects } from '../context/ProjectContext';

const Terms: React.FC = () => {
  const { settings } = useProjects();
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-lg text-gray-700 whitespace-pre-wrap">
        {settings.content.termsOfService}
      </div>
    </div>
  );
};
export default Terms;