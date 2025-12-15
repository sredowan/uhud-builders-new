import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, SiteSettings, GalleryItem, ContactMessage, ContactFormData } from '../types';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
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

const DEFAULT_SETTINGS: SiteSettings = {
  contact: {
    phone: '+1 (555) 123-4567',
    whatsapp: '',
    email: 'aarsayem002@gmail.com',
    address: '1234 Green Ave, Suite 100, Metropolis, NY 10012'
  },
  social: {
    facebook: '#',
    twitter: '#',
    instagram: '#',
    linkedin: '#'
  },
  content: {
    aboutUsShort: 'Crafting spaces that inspire, endure, and harmonize with nature.',
    aboutUsFull: 'Founded on the principles of integrity and innovation, Uhud Builders Ltd started as a boutique firm...',
    privacyPolicy: 'Your privacy is important to us...',
    termsOfService: 'Welcome to Uhud Builders Ltd...'
  },
  analytics: {
    googleSearchConsole: '',
    facebookPixel: ''
  },
  seo: {
    siteTitle: 'Uhud Builders Ltd',
    metaDescription: 'Building dreams, one project at a time.',
    favicon: ''
  }
};

const SAMPLE_PROJECTS: Omit<Project, 'id'>[] = [
  {
    title: "Uhud Hafeez Palace",
    location: "Enayetganj, Hazaribagh, Dhaka",
    price: "Contact for Pricing",
    description: "Modern Living at Uhud Hafeez Palace – Hazaribagh\n\nDiscover comfort and convenience at Uhud Hafeez Palace, ideally located in the heart of Enayetganj, Hazaribagh. This residential building offers thoughtfully designed apartments perfect for small families or individuals looking for a functional living space in Dhaka.\n\nAddress: Uhud Hafeez Palace House: 51/2/C, Enayetganj, Hazaribagh, Dhaka.",
    status: "Ongoing",
    imageUrl: "/images/uhud-hafeez.png",
    logoUrl: "",
    units: [
      {
        name: "Type A",
        size: "700 Sq. Ft. (approx.)",
        bedrooms: 2,
        bathrooms: 2,
        balconies: 2,
        features: ["Drawing & Dining"],
        floorPlanImage: ""
      },
      {
        name: "Type B",
        size: "700 Sq. Ft. (approx.)",
        bedrooms: 2,
        bathrooms: 2,
        balconies: 2,
        features: ["Drawing & Dining"],
        floorPlanImage: ""
      }
    ],
    buildingAmenities: ["Lift (Modern Elevator)", "Power Backup (Full Generator)", "Integrated PBX System"]
  }
];

const SAMPLE_GALLERY: Omit<GalleryItem, 'id'>[] = [
  { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c", caption: "Modern Interiors" },
  { url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea", caption: "Spacious Living Rooms" },
  { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0", caption: "Gourmet Kitchens" },
  { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", caption: "Backyard Oasis" }
];

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
      // 1. Fetch Projects
      const projectsSnap = await getDocs(collection(db, 'projects'));
      let projectsData = projectsSnap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Project[];

      // 2. Fetch Gallery
      const gallerySnap = await getDocs(collection(db, 'gallery'));
      let galleryData = gallerySnap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as GalleryItem[];

      // 3. Fetch Messages
      const messagesQuery = query(collection(db, 'messages'), orderBy('date', 'desc'));
      const messagesSnap = await getDocs(messagesQuery);
      const messagesData = messagesSnap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as ContactMessage[];
      setMessages(messagesData);

      // 4. Auto-seed logic (AGGRESSIVE SEEDING)
      // If the DB is empty, we populate it. We removed the localStorage check to ensure
      // data comes back if the user wiped their DB manually in console.
      const isProjectsEmpty = projectsData.length === 0;
      const isGalleryEmpty = galleryData.length === 0;

      if (isProjectsEmpty || isGalleryEmpty) {
        console.log("Database empty. Initializing with sample data...");

        if (isProjectsEmpty) {
          const promises = SAMPLE_PROJECTS.map(p => addDoc(collection(db, 'projects'), p));
          const refs = await Promise.all(promises);
          projectsData = SAMPLE_PROJECTS.map((p, i) => ({ ...p, id: refs[i].id })) as Project[];
        }

        if (isGalleryEmpty) {
          const promises = SAMPLE_GALLERY.map(g => addDoc(collection(db, 'gallery'), g));
          const refs = await Promise.all(promises);
          galleryData = SAMPLE_GALLERY.map((g, i) => ({ ...g, id: refs[i].id })) as GalleryItem[];
        }
      }

      setProjects(projectsData);
      setGallery(galleryData);

      // 5. Fetch Settings
      const settingsRef = doc(db, 'settings', 'global');
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data() as SiteSettings);
      } else {
        await setDoc(settingsRef, DEFAULT_SETTINGS);
      }

    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (err.code === 'permission-denied') {
        setError("Permission Denied. Please check your firestore rules.");
      } else {
        setError(err.message || "An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Project Actions ---
  const addProject = async (project: Project) => {
    try {
      const { id, ...projectData } = project;
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      const newProject = { ...project, id: docRef.id };
      setProjects((prev) => [newProject, ...prev]);
    } catch (err: any) { throw err; }
  };

  const updateProject = async (updatedProject: Project) => {
    try {
      const { id, ...projectData } = updatedProject;
      const projectRef = doc(db, 'projects', id);
      await updateDoc(projectRef, projectData as any);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    } catch (err: any) { throw err; }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) { throw err; }
  };

  const getProject = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  // --- Gallery Actions ---
  const addToGallery = async (item: GalleryItem) => {
    try {
      const { id, ...itemData } = item;
      const docRef = await addDoc(collection(db, 'gallery'), itemData);
      const newItem = { ...item, id: docRef.id };
      setGallery(prev => [newItem, ...prev]);
    } catch (err: any) { throw err; }
  };

  const removeFromGallery = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', id));
      setGallery(prev => prev.filter(item => item.id !== id));
    } catch (err: any) { throw err; }
  };

  // --- Message Actions ---
  const addMessage = async (data: ContactFormData) => {
    try {
      const newMessage: Omit<ContactMessage, 'id'> = {
        ...data,
        date: new Date().toISOString(),
        read: false
      };
      const docRef = await addDoc(collection(db, 'messages'), newMessage);
      const savedMessage = { ...newMessage, id: docRef.id };
      setMessages(prev => [savedMessage, ...prev]);
    } catch (err: any) { throw err; }
  };

  const deleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err: any) { throw err; }
  };

  // --- Settings Actions ---
  const updateSettings = async (newSettings: SiteSettings) => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, newSettings);
      setSettings(newSettings);
    } catch (err: any) { throw err; }
  };

  const seedDatabase = async () => {
    try {
      setLoading(true);
      // Clear existing local state to prevent duplicates in UI before reload
      const projectPromises = SAMPLE_PROJECTS.map(p => addDoc(collection(db, 'projects'), p));
      await Promise.all(projectPromises);
      const galleryPromises = SAMPLE_GALLERY.map(g => addDoc(collection(db, 'gallery'), g));
      await Promise.all(galleryPromises);
      await fetchData();
    } catch (err: any) { throw err; }
  };

  return (
    <ProjectContext.Provider value={{
      projects, loading, error, addProject, updateProject, deleteProject, getProject,
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
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};