import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash, 
  Briefcase, 
  CalendarDays, 
  UserCircle2, 
  XCircle, 
  Layers, 
  Search, 
  ChevronRight,
  MonitorDot
} from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    
    try {
      await api.post('/projects', newProject);
      toast.success('Project Created Successfully!');
      setNewProject({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      toast.error('Error creating project');
    }
  };

  const handleDelete = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project Deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto p-4 md:p-12 space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase">
              Your Projects
            </h1>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm">
              <MonitorDot className="h-4 w-4 animate-pulse" />
              <span>Project Management Dashboard</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`group relative overflow-hidden flex items-center gap-2 px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all ${
              showForm 
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/50' 
                : 'bg-cyan-500 text-slate-900 hover:bg-white active:scale-95'
            }`}
          >
            {showForm ? (
              <><XCircle className="h-4 w-4" /> Cancel</>
            ) : (
              <><Plus className="h-4 w-4" /> Create New Project</>
            )}
          </button>
        </div>

        {/* Project Creation Form */}
        {showForm && (
          <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-white italic">Project Details</h2>
              <Briefcase className="text-slate-700 h-8 w-8" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <input 
                  autoFocus
                  className="w-full bg-transparent border-b-2 border-slate-800 py-4 text-2xl text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-700"
                  placeholder="Project Title (e.g., Q1 Marketing Design)"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  required
                />
                <span className="absolute right-0 bottom-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Required</span>
              </div>
              
              <div className="relative">
                <textarea 
                  className="w-full bg-slate-800/50 border border-slate-800 rounded-2xl p-6 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600 min-h-[120px]"
                  placeholder="Briefly describe the project goals and objectives..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end">
                <button className="bg-white text-slate-900 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-cyan-400 transition-colors shadow-xl shadow-cyan-500/10">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-slate-900/50 border border-slate-800 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {projects.map((project) => (
                  <Link to={`/projects/${project.id}`} key={project.id} className="group relative block">
                    <div className="h-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-cyan-500/5">
                      
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Layers className="h-40 w-40 -mr-10 -mt-10 rotate-12" />
                      </div>

                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-cyan-400 font-black text-xl group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors duration-500">
                            {project.name.charAt(0).toUpperCase()}
                          </div>
                          <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-2 ${
                            project.status === 'active' 
                              ? 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5' 
                              : 'border-slate-700 text-slate-500 bg-slate-800'
                          }`}>
                            {project.status === 'active' ? 'Active' : project.status}
                          </span>
                        </div>
                        
                        <button 
                          onClick={(e) => handleDelete(e, project.id)}
                          className="p-3 text-slate-600 hover:text-white hover:bg-rose-500/20 rounded-full transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                          title="Delete Project"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="space-y-4 relative z-10 flex-1">
                        <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors decoration-2 underline-offset-4">{project.name}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 italic">
                          {project.description || "No description provided for this project."}
                        </p>
                      </div>
                      
                      <div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] relative z-10">
                        <div className="flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                          <UserCircle2 className="h-4 w-4" />
                          {project.creator?.fullName || 'User'}
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          Created: {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-700 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-32 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20">
                <div className="bg-slate-900 h-24 w-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-800">
                  <Search className="h-10 w-10 text-slate-700" />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">No projects yet</h3>
                <p className="text-slate-500 mt-4 mb-10 max-w-sm mx-auto font-medium">Ready to start something new? Create your first project to begin tracking your progress.</p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-white text-slate-900 px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-500/5 active:scale-95"
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}