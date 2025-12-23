import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, SiteSettings, GalleryItem, ContactMessage, ContactFormData } from '../types';

// We now fetch from our own API instead of Firebase/Dummy Data
const API_URL = 'http://localhost:3001/api'; // Or relative '/api' in production

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
        fetch('/api/projects'),
        fetch('/api/gallery'),
        fetch('/api/messages'),
        fetch('/api/settings')
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
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (!res.ok) throw new Error("Failed to create");
      const newProj = await res.json();
      setProjects(prev => [...prev, newProj]);
    } catch (err) { throw err; }
  };

  const updateProject = async (project: Project) => {
    // Implement PUT
  };

  const deleteProject = async (id: string) => {
    // Implement DELETE
  };

  const reorderProjects = async (id: string, direction: 'up' | 'down') => {
    // Implement Reorder Logic if needed
  };

  const getProject = (id: string) => projects.find((p) => p.id === id);

  const addToGallery = async (item: GalleryItem) => {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const newItem = await res.json();
    setGallery(prev => [newItem, ...prev]);
  };

  const removeFromGallery = async (id: string) => { };

  const addMessage = async (data: ContactFormData) => {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
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