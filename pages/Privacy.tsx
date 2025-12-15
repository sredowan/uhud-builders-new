import React from 'react';
import { useProjects } from '../context/ProjectContext';

const Privacy: React.FC = () => {
  const { settings } = useProjects();
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-lg text-gray-700 whitespace-pre-wrap">
        {settings.content.privacyPolicy}
      </div>
    </div>
  );
};
export default Privacy;