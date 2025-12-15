import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Project, UnitConfig } from '../types';
import { Lock, Plus, Upload, LayoutDashboard, Settings, Mail, Edit2, Trash2, Save, AlertCircle, Database, X } from 'lucide-react';

type Tab = 'projects' | 'gallery' | 'settings' | 'messages';

const Admin: React.FC = () => {
  const {
    projects, addProject, updateProject, deleteProject,
    gallery, addToGallery, removeFromGallery,
    messages, deleteMessage,
    settings, updateSettings, seedDatabase,
    loading, error
  } = useProjects();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('projects');

  // Project Form State
  const [isEditing, setIsEditing] = useState(false);
  const [projectForm, setProjectForm] = useState<Project>({
    id: '',
    title: '',
    location: '',
    price: '',
    description: '',
    status: 'Upcoming',
    imageUrl: '',
    logoUrl: '',
    units: [],
    buildingAmenities: []
  });
  const [amenityInput, setAmenityInput] = useState('');

  // Gallery Form State
  const [galleryForm, setGalleryForm] = useState({ url: '', caption: '' });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);

  // Update form when settings load from DB
  React.useEffect(() => {
    if (settings) {
      setSettingsForm(settings);
    }
  }, [settings]);

  // --- Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'headerLogo' | 'footerLogo' | 'favicon') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/upload.php', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        if (field === 'favicon') {
          setSettingsForm(prev => ({ ...prev, seo: { ...prev.seo, favicon: data.url } }));
        } else {
          setSettingsForm(prev => ({ ...prev, [field]: data.url }));
        }
        alert('Image uploaded successfully!');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}. Ensure you are running on a PHP server (cPanel) for this feature.`);
      console.error(err);
    }
  };

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'JJstmg3xpt9@!') setIsAuthenticated(true);
    else alert('Invalid Password');
  };

  // --- Project Handlers ---
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.imageUrl) return;

    // Ensure arrays are initialized
    const projectData: Project = {
      ...projectForm,
      units: projectForm.units || [],
      buildingAmenities: projectForm.buildingAmenities || []
    };

    try {
      if (isEditing) {
        await updateProject(projectData);
        setIsEditing(false);
      } else {
        // Remove ID for new creation so Firestore generates it
        const { id, ...newProjectData } = projectData;
        await addProject(projectData);
      }
      // Reset form
      setProjectForm({
        id: '', title: '', location: '', price: '', description: '',
        status: 'Upcoming', imageUrl: '', logoUrl: '', units: [], buildingAmenities: []
      });
      alert(isEditing ? 'Project Updated!' : 'Project Added!');
    } catch (err: any) {
      console.error(err);
      alert('Error saving project: ' + err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(id);
      } catch (err: any) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const handleEditClick = (project: Project) => {
    setProjectForm({
      ...project,
      logoUrl: project.logoUrl || '',
      units: project.units || [],
      buildingAmenities: project.buildingAmenities || []
    });
    setIsEditing(true);
    window.scrollTo(0, 0);
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
    } catch (err: any) {
      alert('Error adding image: ' + err.message);
    }
  };

  const handleRemoveGallery = async (id: string) => {
    if (window.confirm('Remove this image?')) {
      try {
        await removeFromGallery(id);
      } catch (err: any) {
        alert("Failed to remove: " + err.message);
      }
    }
  };

  // --- Settings Handlers ---
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settingsForm);
      alert('Settings Saved!');
    } catch (err: any) {
      alert('Error saving settings: ' + err.message);
    }
  };

  // --- Seed Data Handler ---
  const handleSeedData = async () => {
    if (window.confirm('This will add sample projects and gallery items to your database. Continue?')) {
      try {
        await seedDatabase();
        alert('Sample data loaded successfully!');
      } catch (err: any) {
        alert('Error loading sample data: ' + err.message);
      }
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('Delete this message?')) {
      await deleteMessage(id);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center animate-fade-in">
          <div className="bg-primary/10 p-3 rounded-full inline-block mb-4"><Lock className="w-8 h-8 text-primary" /></div>
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg mb-4" placeholder="Enter Password" />
          <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded-lg">Login</button>
          <p className="text-xs text-gray-400 mt-4">Hint: admin123</p>
        </form>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
      <div className="bg-white shadow-sm sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <LayoutDashboard className="text-primary" /> Admin Dashboard
            </div>
            <button onClick={() => setIsAuthenticated(false)} className="text-sm text-red-500 hover:underline">Logout</button>
          </div>
          <div className="flex gap-6 border-b text-sm font-medium overflow-x-auto">
            <button onClick={() => setActiveTab('projects')} className={`pb-3 whitespace-nowrap border-b-2 ${activeTab === 'projects' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Projects</button>
            <button onClick={() => setActiveTab('gallery')} className={`pb-3 whitespace-nowrap border-b-2 ${activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Gallery</button>
            <button onClick={() => setActiveTab('messages')} className={`pb-3 whitespace-nowrap border-b-2 ${activeTab === 'messages' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Messages ({messages.length})</button>
            <button onClick={() => setActiveTab('settings')} className={`pb-3 whitespace-nowrap border-b-2 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Site Settings</button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-bold">Connection Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm border animate-slide-up">
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
                      <input type="text" placeholder="https://..." className="input-field" value={projectForm.imageUrl} onChange={e => setProjectForm({ ...projectForm, imageUrl: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Project Logo URL (Optional)</label>
                      <input type="text" placeholder="https://..." className="input-field" value={projectForm.logoUrl || ''} onChange={e => setProjectForm({ ...projectForm, logoUrl: e.target.value })} />
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
                          <button
                            type="button"
                            onClick={() => setProjectForm(prev => ({ ...prev, units: prev.units.filter((_, i) => i !== idx) }))}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Unit Name</label>
                              <input
                                type="text"
                                className="input-field py-1.5 text-sm font-bold"
                                value={unit.name}
                                onChange={e => {
                                  const newUnits = [...projectForm.units];
                                  newUnits[idx].name = e.target.value;
                                  setProjectForm({ ...projectForm, units: newUnits });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Size</label>
                              <input
                                type="text"
                                placeholder="e.g. 1200 Sq. Ft."
                                className="input-field py-1.5 text-sm"
                                value={unit.size}
                                onChange={e => {
                                  const newUnits = [...projectForm.units];
                                  newUnits[idx].size = e.target.value;
                                  setProjectForm({ ...projectForm, units: newUnits });
                                }}
                              />
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
                              <input
                                type="text"
                                placeholder="https://..."
                                className="input-field py-1 text-xs"
                                value={unit.floorPlanImage || ''}
                                onChange={e => { const u = [...projectForm.units]; u[idx].floorPlanImage = e.target.value; setProjectForm({ ...projectForm, units: u }) }}
                              />
                            </div>
                          </div>

                          {/* Unit Features */}
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Features (comma separated)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Drawing, Dining, Kitchen, etc."
                                className="input-field text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.currentTarget.value.trim();
                                    if (val) {
                                      const newUnits = [...projectForm.units];
                                      newUnits[idx].features = [...newUnits[idx].features, val];
                                      setProjectForm({ ...projectForm, units: newUnits });
                                      e.currentTarget.value = '';
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {unit.features.map((feat, fIdx) => (
                                <span key={fIdx} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                  {feat}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newUnits = [...projectForm.units];
                                      newUnits[idx].features = newUnits[idx].features.filter((_, i) => i !== fIdx);
                                      setProjectForm({ ...projectForm, units: newUnits });
                                    }}
                                    className="hover:text-red-500"
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Press Enter to add feature</p>
                          </div>

                        </div>
                      ))}
                      {projectForm.units.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No units added yet.</p>}
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
                          {a}
                          <button type="button" onClick={() => setProjectForm(prev => ({ ...prev, buildingAmenities: prev.buildingAmenities?.filter((_, idx) => idx !== i) }))} className="hover:text-green-900"><X className="w-3 h-3" /></button>
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
                  {projects.map(p => (
                    <div key={p.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-green-50 transition-colors">
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
                  {projects.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500 italic mb-3">No projects found.</p>
                      <button onClick={handleSeedData} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium hover:bg-primary/20">
                        Initialize Sample Data
                      </button>
                    </div>
                  )}
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
                  <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700">
                    Add to Gallery
                  </button>
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
                {gallery.length === 0 && <p className="text-sm text-gray-500 italic col-span-2">No images in gallery.</p>}
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" /> Inbox
              </h2>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 italic">No messages yet.</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors relative">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{msg.name}</h3>
                          <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:gap-4">
                            <span>{msg.email}</span>
                            <span>{msg.phone}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block mb-2">{new Date(msg.date).toLocaleDateString()}</span>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
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
                      <p className="text-[10px] text-gray-400 mt-1">Recommended: Height ~100px (Display 48px). Max Width 300px. Transparent PNG/SVG.</p>
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
                      <p className="text-[10px] text-gray-400 mt-1">Recommended: Height ~100px (Display 48px). Max Width 300px. Transparent PNG/SVG.</p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Phone Number" className="input-field" value={settingsForm.contact.phone} onChange={e => setSettingsForm({ ...settingsForm, contact: { ...settingsForm.contact, phone: e.target.value } })} />
                    <input type="text" placeholder="WhatsApp Number (Start with +)" className="input-field" value={settingsForm.contact.whatsapp || ''} onChange={e => setSettingsForm({ ...settingsForm, contact: { ...settingsForm.contact, whatsapp: e.target.value } })} />
                    <input type="email" placeholder="Email Address" className="input-field" value={settingsForm.contact.email} onChange={e => setSettingsForm({ ...settingsForm, contact: { ...settingsForm.contact, email: e.target.value } })} />
                    <input type="text" placeholder="Address" className="input-field" value={settingsForm.contact.address} onChange={e => setSettingsForm({ ...settingsForm, contact: { ...settingsForm.contact, address: e.target.value } })} />
                  </div>
                </div>

                {/* Tracking & Analytics */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Analytics & Tracking</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 mb-1 block">Google Search Console Verification Code</label>
                      <input type="text" placeholder="e.g. content-of-content-attribute" className="input-field" value={settingsForm.analytics?.googleSearchConsole || ''} onChange={e => setSettingsForm({ ...settingsForm, analytics: { ...settingsForm.analytics, googleSearchConsole: e.target.value } })} />
                      <p className="text-[10px] text-gray-400 mt-1">Paste the verification code from the meta tag provided by Google Search Console.</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-500 mb-1 block">Facebook Pixel ID</label>
                      <input type="text" placeholder="e.g. 1234567890" className="input-field" value={settingsForm.analytics?.facebookPixel || ''} onChange={e => setSettingsForm({ ...settingsForm, analytics: { ...settingsForm.analytics, facebookPixel: e.target.value } })} />
                    </div>
                  </div>
                </div>

                {/* SEO & Meta */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">SEO & Meta</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 mb-1 block">Site Title</label>
                      <input type="text" placeholder="e.g. Uhud Builders Ltd" className="input-field" value={settingsForm.seo?.siteTitle || ''} onChange={e => setSettingsForm({ ...settingsForm, seo: { ...settingsForm.seo, siteTitle: e.target.value } })} />
                      <p className="text-[10px] text-gray-400 mt-1">Appears in browser tab and search results.</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-500 mb-1 block">Meta Description</label>
                      <textarea rows={2} placeholder="Brief description of your site..." className="input-field" value={settingsForm.seo?.metaDescription || ''} onChange={e => setSettingsForm({ ...settingsForm, seo: { ...settingsForm.seo, metaDescription: e.target.value } })} />
                      <p className="text-[10px] text-gray-400 mt-1">Shown in search engine results (150-160 characters recommended).</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-500 mb-1 block">Site Icon (Favicon) URL</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="https://..." className="input-field" value={settingsForm.seo?.favicon || ''} onChange={e => setSettingsForm({ ...settingsForm, seo: { ...settingsForm.seo, favicon: e.target.value } })} />
                        <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 flex items-center justify-center rounded-lg min-w-[50px]">
                          <Upload className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon' as any)} />
                        </label>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Recommended: 32x32px or 64x64px PNG/ICO.</p>
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Facebook URL" className="input-field" value={settingsForm.social.facebook} onChange={e => setSettingsForm({ ...settingsForm, social: { ...settingsForm.social, facebook: e.target.value } })} />
                    <input type="text" placeholder="Instagram URL" className="input-field" value={settingsForm.social.instagram} onChange={e => setSettingsForm({ ...settingsForm, social: { ...settingsForm.social, instagram: e.target.value } })} />
                    <input type="text" placeholder="Twitter URL" className="input-field" value={settingsForm.social.twitter} onChange={e => setSettingsForm({ ...settingsForm, social: { ...settingsForm.social, twitter: e.target.value } })} />
                    <input type="text" placeholder="LinkedIn URL" className="input-field" value={settingsForm.social.linkedin} onChange={e => setSettingsForm({ ...settingsForm, social: { ...settingsForm.social, linkedin: e.target.value } })} />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Page Content</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">About Us (Home Page Short)</label>
                      <textarea rows={2} className="input-field" value={settingsForm.content.aboutUsShort} onChange={e => setSettingsForm({ ...settingsForm, content: { ...settingsForm.content, aboutUsShort: e.target.value } })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">About Us (Full Page)</label>
                      <textarea rows={5} className="input-field" value={settingsForm.content.aboutUsFull} onChange={e => setSettingsForm({ ...settingsForm, content: { ...settingsForm.content, aboutUsFull: e.target.value } })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Privacy Policy</label>
                      <textarea rows={4} className="input-field" value={settingsForm.content.privacyPolicy} onChange={e => setSettingsForm({ ...settingsForm, content: { ...settingsForm.content, privacyPolicy: e.target.value } })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Terms of Service</label>
                      <textarea rows={4} className="input-field" value={settingsForm.content.termsOfService} onChange={e => setSettingsForm({ ...settingsForm, content: { ...settingsForm.content, termsOfService: e.target.value } })} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="flex-grow bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 shadow-md transition-all">
                    <Save className="w-5 h-5" /> Save All Settings
                  </button>
                </div>
              </form>
            </div>

            {/* Data Management Section */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Database className="w-6 h-6 text-primary" /> Data Management</h2>
              <p className="text-gray-600 mb-4 text-sm">Use this button to populate your database with sample projects and gallery images. This is useful if you are setting up the site for the first time or if your data has been lost.</p>
              <button
                type="button"
                onClick={handleSeedData}
                className="bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 border border-gray-200 transition-colors"
              >
                Initialize Sample Data
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .input-field {
          width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; outline: none; transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: #018c45; ring: 2px solid #018c45;
        }
        .btn-secondary {
          background-color: #f3f4f6; color: #374151; font-weight: bold; padding: 0.75rem; border-radius: 0.5rem;
        }
        .btn-secondary:hover { background-color: #e5e7eb; }
      `}</style>
    </div>
  );
};

export default Admin;