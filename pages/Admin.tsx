import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Project, UnitConfig } from '../types';
import {
  Lock, Plus, Upload, LayoutDashboard, Settings, Mail, Edit2,
  Trash2, Save, AlertCircle, Database, X, Home, Image as ImageIcon,
  Building, LogOut, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';
import { authClient } from '../lib/auth-client';
import { useNavigate } from 'react-router-dom';

type Tab = 'dashboard' | 'projects' | 'gallery' | 'messages' | 'settings' | 'homepage';

const Admin: React.FC = () => {
  const {
    projects, addProject, updateProject, deleteProject, reorderProjects,
    gallery, addToGallery, removeFromGallery,
    messages, deleteMessage,
    settings, updateSettings, seedDatabase,
    loading, error
  } = useProjects();

  const navigate = useNavigate();
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Project Form State
  const [isEditing, setIsEditing] = useState(false);
  const [projectForm, setProjectForm] = useState<Project>({
    id: '', title: '', location: '', price: '', description: '',
    status: 'Upcoming', imageUrl: '', logoUrl: '', units: [], buildingAmenities: []
  });
  const [amenityInput, setAmenityInput] = useState('');

  // Gallery Form State
  const [galleryForm, setGalleryForm] = useState({ url: '', caption: '' });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);

  useEffect(() => {
    if (settings) setSettingsForm(settings);
  }, [settings]);

  // Auth Redirect
  useEffect(() => {
    if (!isAuthPending && !session) {
      navigate('/login');
    }
  }, [session, isAuthPending, navigate]);


  // --- Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'headerLogo' | 'footerLogo' | 'favicon' | 'heroImage') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        if (field === 'favicon') {
          setSettingsForm(prev => ({ ...prev, seo: { ...prev.seo, favicon: data.url } }));
        } else if (field === 'heroImage') {
          setSettingsForm(prev => ({ ...prev, homePage: { ...prev.homePage, heroImage: data.url } }));
        } else {
          setSettingsForm(prev => ({ ...prev, [field]: data.url }));
        }
        alert('Image uploaded successfully!');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}. Ensure the local server is running (npm run server).`);
      console.error(err);
    }
  };

  const handleProjectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'logoUrl' | 'floorPlanImage', unitIndex?: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        if (unitIndex !== undefined) {
          const newUnits = [...projectForm.units];
          newUnits[unitIndex].floorPlanImage = data.url;
          setProjectForm(prev => ({ ...prev, units: newUnits }));
        } else {
          // @ts-ignore
          setProjectForm(prev => ({ ...prev, [field]: data.url }));
        }
        alert('Project image uploaded successfully!');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}. Ensure the local server is running (npm run server).`);
      console.error(err);
    }
  };

  // --- Project Handlers ---
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.imageUrl) return;

    const projectData: Project = { ...projectForm, units: projectForm.units || [], buildingAmenities: projectForm.buildingAmenities || [] };

    try {
      if (isEditing) {
        await updateProject(projectData);
        setIsEditing(false);
      } else {
        const { id, ...newProjectData } = projectData;
        await addProject(projectData);
      }
      setProjectForm({ id: '', title: '', location: '', price: '', description: '', status: 'Upcoming', imageUrl: '', logoUrl: '', units: [], buildingAmenities: [] });
      alert(isEditing ? 'Project Updated!' : 'Project Added!');
    } catch (err: any) {
      console.error(err);
      alert('Error saving project: ' + err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try { await deleteProject(id); } catch (err: any) { alert("Failed to delete: " + err.message); }
    }
  };

  const handleEditClick = (project: Project) => {
    setProjectForm({ ...project, logoUrl: project.logoUrl || '', units: project.units || [], buildingAmenities: project.buildingAmenities || [] });
    setIsEditing(true);
  };

  const handleAmenityAdd = () => {
    if (amenityInput.trim()) {
      setProjectForm(prev => ({ ...prev, buildingAmenities: [...(prev.buildingAmenities || []), amenityInput.trim()] }));
      setAmenityInput('');
    }
  };

  // --- Gallery Handlers ---
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.url) return;
    try {
      await addToGallery({ id: '', url: galleryForm.url, caption: galleryForm.caption });
      setGalleryForm({ url: '', caption: '' });
      alert('Image added to gallery');
    } catch (err: any) { alert('Error adding image: ' + err.message); }
  };

  const handleRemoveGallery = async (id: string) => {
    if (window.confirm('Remove this image?')) {
      try { await removeFromGallery(id); } catch (err: any) { alert("Failed to remove: " + err.message); }
    }
  };

  // --- Settings Handlers ---
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await updateSettings(settingsForm); alert('Settings Saved!'); } catch (err: any) { alert('Error saving settings: ' + err.message); }
  };

  const handleSeedData = async () => {
    if (window.confirm('This will add sample projects and gallery items to your database. Continue?')) {
      try { await seedDatabase(); alert('Sample data loaded successfully!'); } catch (err: any) { alert('Error loading sample data: ' + err.message); }
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('Delete this message?')) { await deleteMessage(id); }
  };

  if (isAuthPending || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>;
  }

  if (!session) return null;

  const SidebarItem = ({ id, label, icon: Icon }: { id: Tab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === id ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      <Icon className="w-5 h-5" /> <span className="font-medium">{label}</span>
      {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block fixed h-full z-20 overflow-y-auto">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2"><LayoutDashboard /> Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-2">
          <SidebarItem id="dashboard" label="Dashboard" icon={Home} />
          <SidebarItem id="homepage" label="Home Page" icon={LayoutDashboard} />
          <SidebarItem id="projects" label="Projects" icon={Building} />
          <SidebarItem id="gallery" label="Gallery" icon={ImageIcon} />
          <SidebarItem id="messages" label={`Messages (${messages.length})`} icon={Mail} />
          <SidebarItem id="settings" label="Global Settings" icon={Settings} />
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
          <button
            onClick={async () => {
              await authClient.signOut();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 lg:p-8 overflow-y-auto h-screen">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-bold">Connection Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* DASHBOARD HOME */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome back, {session.user?.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-primary hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Projects</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{projects.length}</h3>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg"><Building className="w-6 h-6 text-primary" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Gallery Images</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{gallery.length}</h3>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg"><ImageIcon className="w-6 h-6 text-blue-500" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Messages</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{messages.length}</h3>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg"><Mail className="w-6 h-6 text-orange-500" /></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => { setActiveTab('projects'); setIsEditing(false); }} className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Project</button>
                  <button onClick={() => setActiveTab('gallery')} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm flex items-center gap-2"><Upload className="w-4 h-4" /> Upload Photo</button>
                  <button onClick={handleSeedData} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm flex items-center gap-2"><Database className="w-4 h-4" /> Reset Data</button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-bold mb-4">Recent Messages</h3>
                <div className="space-y-3">
                  {messages.slice(0, 3).map(m => (
                    <div key={m.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                      <span className="font-medium text-gray-800 truncate">{m.name}</span>
                      <span className="text-gray-400 text-xs">{new Date(m.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {messages.length === 0 && <p className="text-gray-400 text-sm italic">No recent messages.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOMEPAGE SETTINGS */}
        {activeTab === 'homepage' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><LayoutDashboard className="w-6 h-6 text-primary" /> Home Page Configuration</h2>
              <form onSubmit={handleSettingsSubmit} className="space-y-6">

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Hero Section Background Image</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="https://..." className="input-field" value={settingsForm.homePage?.heroImage || ''} onChange={e => setSettingsForm({ ...settingsForm, homePage: { ...settingsForm.homePage, heroImage: e.target.value } })} />
                      <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 flex items-center justify-center rounded-lg min-w-[50px]">
                        <Upload className="w-4 h-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'heroImage')} />
                      </label>
                    </div>
                    {settingsForm.homePage?.heroImage && <img src={settingsForm.homePage.heroImage} className="mt-2 h-32 w-full object-cover rounded-lg border" />}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Hero Title</label>
                    <textarea rows={2} className="input-field text-xl font-bold" value={settingsForm.homePage?.heroTitle} onChange={e => setSettingsForm({ ...settingsForm, homePage: { ...settingsForm.homePage, heroTitle: e.target.value } })} />
                    <p className="text-xs text-gray-400 mt-1">Use new lines for line breaks on the homepage.</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Hero Subtitle</label>
                    <input type="text" className="input-field" value={settingsForm.homePage?.heroSubtitle} onChange={e => setSettingsForm({ ...settingsForm, homePage: { ...settingsForm.homePage, heroSubtitle: e.target.value } })} />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={settingsForm.homePage?.showWhyChooseUs} onChange={e => setSettingsForm({ ...settingsForm, homePage: { ...settingsForm.homePage, showWhyChooseUs: e.target.checked } })} />
                      <span className="font-medium text-gray-700">Show "Why Choose Us" Section</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button type="submit" className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 shadow-md">
                    Save Changes
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}


        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  {isEditing ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                  {isEditing ? 'Edit Project' : 'Add New Project'}
                </h2>
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Project Title" className="input-field" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} required />
                    <select className="input-field" value={projectForm.status} onChange={e => setProjectForm({ ...projectForm, status: e.target.value as Project['status'] })}>
                      <option value="Upcoming">Upcoming</option><option value="Ongoing">Ongoing</option><option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Location" className="input-field" value={projectForm.location} onChange={e => setProjectForm({ ...projectForm, location: e.target.value })} required />
                    <input type="text" placeholder="Price Range (e.g. $500k - $900k)" className="input-field" value={projectForm.price} onChange={e => setProjectForm({ ...projectForm, price: e.target.value })} />
                  </div>

                  <textarea placeholder="Description" rows={3} className="input-field" value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} required />

                  {/* Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Main Image URL (Vertical)</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="https://..." className="input-field" value={projectForm.imageUrl} onChange={e => setProjectForm({ ...projectForm, imageUrl: e.target.value })} required />
                        <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 flex items-center justify-center rounded-lg min-w-[50px]">
                          <Upload className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProjectFileUpload(e, 'imageUrl')} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Project Logo URL (Optional)</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="https://..." className="input-field" value={projectForm.logoUrl || ''} onChange={e => setProjectForm({ ...projectForm, logoUrl: e.target.value })} />
                        <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 flex items-center justify-center rounded-lg min-w-[50px]">
                          <Upload className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProjectFileUpload(e, 'logoUrl')} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Unit Configurations */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-bold text-gray-800">Unit Configurations</label>
                      <button
                        type="button"
                        onClick={() => setProjectForm(prev => ({ ...prev, units: [...prev.units, { name: `Unit ${String.fromCharCode(65 + prev.units.length)}`, size: '', bedrooms: 3, bathrooms: 3, balconies: 2, features: [], floorPlanImage: '' }] }))}
                        className="text-xs bg-primary text-white px-3 py-1.5 rounded-full hover:bg-green-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Unit
                      </button>
                    </div>

                    <div className="space-y-4">
                      {projectForm.units.map((unit, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg border shadow-sm relative group">
                          <button type="button" onClick={() => setProjectForm(prev => ({ ...prev, units: prev.units.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"><X className="w-4 h-4" /></button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Unit Name</label>
                              <input type="text" className="input-field py-1.5 text-sm font-bold" value={unit.name} onChange={e => { const newUnits = [...projectForm.units]; newUnits[idx].name = e.target.value; setProjectForm({ ...projectForm, units: newUnits }); }} />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Size</label>
                              <input type="text" className="input-field py-1.5 text-sm" value={unit.size} onChange={e => { const newUnits = [...projectForm.units]; newUnits[idx].size = e.target.value; setProjectForm({ ...projectForm, units: newUnits }); }} />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                            <div className="col-span-1">
                              <label className="text-[10px] text-gray-400 block mb-1">Beds</label>
                              <input type="number" className="input-field py-1 text-center" value={unit.bedrooms} onChange={e => { const u = [...projectForm.units]; u[idx].bedrooms = +e.target.value; setProjectForm({ ...projectForm, units: u }) }} />
                            </div>
                            <div className="col-span-1">
                              <label className="text-[10px] text-gray-400 block mb-1">Baths</label>
                              <input type="number" className="input-field py-1 text-center" value={unit.bathrooms} onChange={e => { const u = [...projectForm.units]; u[idx].bathrooms = +e.target.value; setProjectForm({ ...projectForm, units: u }) }} />
                            </div>
                            <div className="col-span-1">
                              <label className="text-[10px] text-gray-400 block mb-1">Balconies</label>
                              <input type="number" className="input-field py-1 text-center" value={unit.balconies} onChange={e => { const u = [...projectForm.units]; u[idx].balconies = +e.target.value; setProjectForm({ ...projectForm, units: u }) }} />
                            </div>
                            <div className="col-span-3">
                              <label className="text-[10px] text-gray-400 block mb-1">Floor Plan URL</label>
                              <div className="flex gap-2">
                                <input type="text" className="input-field py-1 text-xs" value={unit.floorPlanImage || ''} onChange={e => { const u = [...projectForm.units]; u[idx].floorPlanImage = e.target.value; setProjectForm({ ...projectForm, units: u }) }} />
                                <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-600 px-2 flex items-center justify-center rounded-lg min-w-[40px]">
                                  <Upload className="w-3 h-3" />
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProjectFileUpload(e, 'floorPlanImage', idx)} />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Building Amenities */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Building Amenities</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" placeholder="Add Amenity (e.g. Lift)" className="input-field" value={amenityInput} onChange={e => setAmenityInput(e.target.value)} />
                      <button type="button" onClick={handleAmenityAdd} className="bg-gray-200 px-4 rounded-lg hover:bg-gray-300">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {projectForm.buildingAmenities?.map((a, i) => (
                        <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                          {a} <button type="button" onClick={() => setProjectForm(prev => ({ ...prev, buildingAmenities: prev.buildingAmenities?.filter((_, idx) => idx !== i) }))} className="hover:text-green-900"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {isEditing && (
                      <button type="button" onClick={() => { setIsEditing(false); setProjectForm({ id: '', title: '', location: '', price: '', description: '', status: 'Upcoming', imageUrl: '', logoUrl: '', units: [], buildingAmenities: [] }); }} className="btn-secondary flex-1">
                        Cancel Edit
                      </button>
                    )}
                    <button type="submit" className="bg-primary text-white font-bold py-3 rounded-lg flex-1 hover:bg-green-700 shadow-md transition-all hover:shadow-lg">
                      {isEditing ? 'Update Project' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Project List Side */}
            <div>
              <div className="bg-white p-6 rounded-xl shadow-sm border animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="font-bold mb-4">Existing Projects</h2>
                <div className="space-y-3">
                  {projects.map((p, index) => (
                    <div key={p.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-green-50 transition-colors items-center">
                      <div className="flex flex-col gap-1 mr-1">
                        <button
                          onClick={() => reorderProjects(p.id, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-gray-500"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => reorderProjects(p.id, 'down')}
                          disabled={index === projects.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-gray-500"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <img src={p.imageUrl} className="w-12 h-16 object-cover rounded bg-gray-200" />
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-sm truncate">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.status}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleEditClick(p)} className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => handleDeleteProject(p.id)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="font-bold mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Upload Image</h2>
                <form onSubmit={handleGallerySubmit} className="space-y-4">
                  <input type="text" placeholder="Image URL" className="input-field" value={galleryForm.url} onChange={e => setGalleryForm({ ...galleryForm, url: e.target.value })} required />
                  <input type="text" placeholder="Caption" className="input-field" value={galleryForm.caption} onChange={e => setGalleryForm({ ...galleryForm, caption: e.target.value })} />
                  <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700">Add to Gallery</button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map(item => (
                  <div key={item.id} className="relative group rounded-lg overflow-hidden aspect-square border bg-gray-100">
                    <img src={item.url} className="w-full h-full object-cover" />
                    <button onClick={() => handleRemoveGallery(item.id)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"><Trash2 className="w-4 h-4" /></button>
                    <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">{item.caption}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Mail className="w-6 h-6 text-primary" /> Inbox</h2>
              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors relative">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{msg.name}</h3>
                        <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:gap-4"><span>{msg.email}</span><span>{msg.phone}</span></div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block mb-2">{new Date(msg.date).toLocaleDateString()}</span>
                        <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-primary" /> Global Site Settings</h2>
              <form onSubmit={handleSettingsSubmit} className="space-y-8">
                {/* Branding */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Branding</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 mb-1 block">Header Logo URL</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="https://..." className="input-field" value={settingsForm.headerLogo || ''} onChange={e => setSettingsForm({ ...settingsForm, headerLogo: e.target.value })} />
                        <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 flex items-center justify-center rounded-lg min-w-[50px]">
                          <Upload className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'headerLogo')} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-500 mb-1 block">Footer Logo URL</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="https://..." className="input-field" value={settingsForm.footerLogo || ''} onChange={e => setSettingsForm({ ...settingsForm, footerLogo: e.target.value })} />
                        <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 flex items-center justify-center rounded-lg min-w-[50px]">
                          <Upload className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'footerLogo')} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Phone Number" className="input-field" value={settingsForm.contact.phone} onChange={e => setSettingsForm({ ...settingsForm, contact: { ...settingsForm.contact, phone: e.target.value } })} />
                    <input type="text" placeholder="WhatsApp Number" className="input-field" value={settingsForm.contact.whatsapp || ''} onChange={e => setSettingsForm({ ...settingsForm, contact: { ...settingsForm.contact, whatsapp: e.target.value } })} />
                    <input type="email" placeholder="Email Address" className="input-field" value={settingsForm.contact.email} onChange={e => setSettingsForm({ ...settingsForm, contact: { ...settingsForm.contact, email: e.target.value } })} />
                    <input type="text" placeholder="Address" className="input-field" value={settingsForm.contact.address} onChange={e => setSettingsForm({ ...settingsForm, contact: { ...settingsForm.contact, address: e.target.value } })} />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Page Content</h3>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1">About Us (Home Short)</label><textarea rows={2} className="input-field" value={settingsForm.content.aboutUsShort} onChange={e => setSettingsForm({ ...settingsForm, content: { ...settingsForm.content, aboutUsShort: e.target.value } })} /></div>
                    <div><label className="block text-sm font-medium mb-1">About Us (Full)</label><textarea rows={5} className="input-field" value={settingsForm.content.aboutUsFull} onChange={e => setSettingsForm({ ...settingsForm, content: { ...settingsForm.content, aboutUsFull: e.target.value } })} /></div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="flex-grow bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 shadow-md transition-all">
                    <Save className="w-5 h-5" /> Save All Settings
                  </button>
                </div>
              </form>
            </div>

            {/* SEO & Meta */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">SEO & Meta Configuration</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 block">Site Title</label>
                  <input type="text" placeholder="e.g. Uhud Builders Ltd" className="input-field" value={settingsForm.seo?.siteTitle || ''} onChange={e => setSettingsForm({ ...settingsForm, seo: { ...settingsForm.seo, siteTitle: e.target.value } })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 block">Meta Description</label>
                  <textarea rows={2} placeholder="Brief description of your site..." className="input-field" value={settingsForm.seo?.metaDescription || ''} onChange={e => setSettingsForm({ ...settingsForm, seo: { ...settingsForm.seo, metaDescription: e.target.value } })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 block">Site Icon (Favicon) URL</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="https://..." className="input-field" value={settingsForm.seo?.favicon || ''} onChange={e => setSettingsForm({ ...settingsForm, seo: { ...settingsForm.seo, favicon: e.target.value } })} />
                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 flex items-center justify-center rounded-lg min-w-[50px]">
                      <Upload className="w-4 h-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={handleSettingsSubmit} className="flex-grow bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 shadow-md transition-all">
                  <Save className="w-5 h-5" /> Update SEO Settings
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <style>{`
        .input-field { width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #018c45; ring: 2px solid #018c45; }
        .btn-secondary { background-color: #f3f4f6; color: #374151; font-weight: bold; padding: 0.75rem; border-radius: 0.5rem; }
        .btn-secondary:hover { background-color: #e5e7eb; }
      `}</style>
    </div>
  );
};

export default Admin;