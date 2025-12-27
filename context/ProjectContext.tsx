import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, SiteSettings, GalleryItem, ContactMessage, ContactFormData } from '../types';

// Environment-aware API URL for split deployment (Vercel backend + Hostinger frontend)
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const API_BASE = isLocalhost ? 'http://localhost:3001' : 'https://api.uhudbuilders.com';

// Helper function to build API URLs
const apiUrl = (path: string) => `${API_BASE}${path}`;

// For file uploads, use Hostinger PHP endpoint in production
const UPLOAD_URL = isLocalhost ? 'http://localhost:3001/api/upload' : 'https://uhudbuilders.com/upload.php';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProjects: (id: string, direction: 'up' | 'down') => Promise<void>;
  getProject: (id: string) => Project | undefined;

  gallery: GalleryItem[];
  addToGallery: (item: GalleryItem) => Promise<void>;
  removeFromGallery: (id: string) => Promise<void>;

  messages: ContactMessage[];
  addMessage: (data: ContactFormData) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  settings: SiteSettings;
  updateSettings: (settings: SiteSettings) => Promise<void>;
  seedDatabase: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Default settings fallback
const DEFAULT_SETTINGS: SiteSettings = {
  contact: { phone: '', email: '', address: '' },
  social: { facebook: '', twitter: '', instagram: '', linkedin: '' },
  content: { aboutUsShort: '', aboutUsFull: '', privacyPolicy: '', termsOfService: '' },
  homePage: { heroTitle: '', heroSubtitle: '', heroImage: '', showWhyChooseUs: true },
  analytics: {},
  seo: {}
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, gallRes, msgRes, setRes] = await Promise.all([
        fetch(apiUrl('/api/projects'), { credentials: 'include' }),
        fetch(apiUrl('/api/gallery'), { credentials: 'include' }),
        fetch(apiUrl('/api/messages'), { credentials: 'include' }),
        fetch(apiUrl('/api/settings'), { credentials: 'include' })
      ]);

      if (projRes.ok) setProjects(await projRes.json());
      if (gallRes.ok) setGallery(await gallRes.json());
      if (msgRes.ok) setMessages(await msgRes.json());
      if (setRes.ok) {
        const fetchedSettings = await setRes.json();
        setSettings({ ...DEFAULT_SETTINGS, ...fetchedSettings });
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Failed to load data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Actions (Optimistic UI could be added here) ---

  const addProject = async (project: Project) => {
    try {
      const res = await fetch(apiUrl('/api/projects'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to create");
      const newProj = await res.json();
      setProjects(prev => [...prev, newProj]);
    } catch (err) { throw err; }
  };

  const updateProject = async (project: Project) => {
    try {
      const res = await fetch(apiUrl(`/api/projects/${project.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === project.id ? { ...project, ...updated } : p));
    } catch (err) { throw err; }
  };

  const deleteProject = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/projects/${id}`), {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to delete");
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) { throw err; }
  };

  const reorderProjects = async (id: string, direction: 'up' | 'down') => {
    // Implement Reorder Logic if needed
  };

  const getProject = (id: string) => projects.find((p) => p.id === id);

  const addToGallery = async (item: GalleryItem) => {
    const res = await fetch(apiUrl('/api/gallery'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
      credentials: 'include'
    });
    const newItem = await res.json();
    setGallery(prev => [newItem, ...prev]);
  };

  const removeFromGallery = async (id: string) => { };

  const addMessage = async (data: ContactFormData) => {
    const res = await fetch(apiUrl('/api/messages'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    const newMsg = await res.json();
    setMessages(prev => [newMsg, ...prev]);
  };

  const deleteMessage = async (id: string) => { };
  const updateSettings = async (settings: SiteSettings) => { };
  const seedDatabase = async () => { };

  return (
    <ProjectContext.Provider value={{
      projects, loading, error, addProject, updateProject, deleteProject, reorderProjects, getProject,
      gallery, addToGallery, removeFromGallery,
      messages, addMessage, deleteMessage,
      settings, updateSettings, seedDatabase
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) throw new Error('useProjects must be used within a ProjectProvider');
  return context;
};