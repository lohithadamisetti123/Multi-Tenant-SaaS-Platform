import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Timer, 
  Briefcase, 
  Zap, 
  ChevronRight, 
  PlusCircle, 
  AlertCircle 
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    activeProjects: 0, 
    completedTasks: 0, 
    pendingTasks: 0 
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- SAFE USER PARSING ---
  let user = { fullName: 'User' };
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.warn("Corrupted user data in Dashboard, using default.");
  }
  // -------------------------

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const projectsRes = await api.get('/projects');
        const projects = projectsRes.data.data || [];

        const activeProjects = projects.filter(p => p.status === 'active').length;
        
        setStats({
          activeProjects,
          completedTasks: 0, 
          pendingTasks: 0    
        });

        setRecentProjects(projects.slice(0, 3)); 
        setLoading(false);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        if (err.response && err.response.status !== 401) {
            setError("Failed to load dashboard data.");
        }
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-screen grid place-items-center bg-zinc-950">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-2 border-zinc-800 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">Loading Workspace...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-zinc-950 p-8 flex items-center justify-center">
      <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-lg max-w-md w-full flex items-start gap-4">
        <AlertCircle className="text-red-500 shrink-0" />
        <div>
            <h4 className="text-red-500 font-bold">Something went wrong</h4>
            <p className="text-red-200/70 text-sm mt-1">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Header Bar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg shadow-lg shadow-orange-200">
                <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight text-zinc-800">
              Workspace Overview
            </h1>
          </div>
          
          <Link 
            to="/projects" 
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Project
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Welcome Block */}
        <section>
            <h2 className="text-4xl font-light text-zinc-400">
                Welcome back, <span className="text-zinc-900 font-bold">{user.fullName.split(' ')[0]}</span>
            </h2>
            <p className="text-zinc-500 mt-1">Status: <span className="text-emerald-500 font-medium">All systems operational</span></p>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                <Briefcase className="w-10 h-10 text-orange-500 mb-6 relative" />
                <p className="text-zinc-500 font-medium text-sm">Total Projects</p>
                <p className="text-5xl font-black mt-2">{stats.activeProjects}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                <CheckSquare className="w-10 h-10 text-blue-500 mb-6 relative" />
                <p className="text-zinc-500 font-medium text-sm">Completed Tasks</p>
                <p className="text-5xl font-black mt-2">{stats.completedTasks}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative group overflow-hidden sm:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                <Timer className="w-10 h-10 text-purple-500 mb-6 relative" />
                <p className="text-zinc-500 font-medium text-sm">Tasks To-Do</p>
                <p className="text-5xl font-black mt-2">{stats.pendingTasks}</p>
            </div>
        </section>

        {/* List Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 fill-orange-500 text-orange-500" />
              Recent Projects
            </h3>
            <Link to="/projects" className="text-sm font-bold text-orange-600 hover:underline">
              View All Projects
            </Link>
          </div>

          <div className="grid gap-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <Link 
                  to={`/projects/${project.id}`} 
                  key={project.id} 
                  className="group block bg-white border border-zinc-200 p-2 rounded-2xl hover:border-zinc-900 transition-colors"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 bg-zinc-900 flex items-center justify-center rounded-xl text-zinc-100 font-mono text-xl group-hover:bg-orange-500 transition-colors">
                        {project.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-zinc-800">{project.name}</h4>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
                          {project.status === 'active' ? 'Active' : project.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="hidden md:block text-right">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Last Update</p>
                        <p className="text-sm font-medium">{new Date(project.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-zinc-50 p-2 rounded-full group-hover:bg-zinc-900 group-hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-zinc-100/50 border-2 border-dashed border-zinc-200 rounded-3xl py-20 text-center">
                <div className="max-w-xs mx-auto space-y-4">
                  <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm">
                    <Briefcase className="w-6 h-6 text-zinc-300" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-800">No projects yet</p>
                    <p className="text-sm text-zinc-500">Your recent activity will appear here once you create a project.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}