import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  MoveLeft, 
  CalendarDays, 
  CheckCircle2, 
  Layers, 
  Trash, 
  Plus, 
  GripVertical, 
  Target, 
  Ban, 
  FileText,
  CircleDot
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', status: 'todo' });
  const [loading, setLoading] = useState(true);

  const fetchProjectData = async () => {
    try {
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data.data);
      
      const tasksRes = await api.get(`/tasks?projectId=${id}`); 
      setTasks(tasksRes.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load project details');
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjectData(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if(!newTask.title.trim()) return;
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      toast.success('Task added successfully');
      setNewTask({ title: '', status: 'todo' });
      setShowTaskForm(false);
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to update status');
      fetchProjectData();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task removed');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen grid place-items-center bg-zinc-950 font-mono">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-zinc-800 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-500 text-xs tracking-widest uppercase">Loading Project Details...</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="p-8 bg-white border border-zinc-200 rounded-2xl text-center shadow-xl">
            <Ban className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-zinc-900">Project Not Found</h2>
            <Link to="/projects" className="mt-4 px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm inline-block font-bold">Return to Projects</Link>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-4 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation */}
        <nav>
            <Link to="/projects" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors font-bold text-sm uppercase tracking-tighter">
                <MoveLeft className="w-4 h-4" /> 
                Projects / {project.name}
            </Link>
        </nav>

        {/* Hero Meta Section */}
        <section className="bg-white border-b-4 border-zinc-900 p-8 lg:p-12 rounded-t-[2.5rem] shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4 flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-md text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <CircleDot className="w-3 h-3 text-orange-500" />
                        Status: {project.status === 'active' ? 'Active' : project.status}
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-zinc-900 leading-none">
                        {project.name}
                    </h1>
                    <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-xl italic">
                        "{project.description || "No description available for this project."}"
                    </p>
                </div>
                
                <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
                        <CalendarDays className="w-4 h-4" />
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-6xl font-black text-zinc-100 tabular-nums select-none">
                        {progressPercentage.toString().padStart(2, '0')}%
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-12 h-4 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                <div 
                    className="h-full bg-zinc-900 transition-all duration-700 ease-in-out relative"
                    style={{ width: `${progressPercentage}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-50 animate-pulse"></div>
                </div>
            </div>
        </section>

        {/* Action Header */}
        <div className="flex items-center justify-between border-l-4 border-orange-500 pl-6 py-2">
            <div>
                <h3 className="text-xl font-black uppercase tracking-tight italic">Project Tasks</h3>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{tasks.length} Total Tasks</p>
            </div>
            {!showTaskForm && (
                <button 
                  onClick={() => setShowTaskForm(true)}
                  className="p-3 bg-zinc-900 text-white rounded-full hover:bg-orange-500 hover:rotate-90 transition-all shadow-lg active:scale-90"
                >
                  <Plus className="w-6 h-6" />
                </button>
            )}
        </div>

        {/* Task Form */}
        {showTaskForm && (
          <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Create New Task</span>
                <button onClick={() => setShowTaskForm(false)} className="text-zinc-500 hover:text-white transition-colors">
                    <Ban className="w-5 h-5" />
                </button>
            </div>
            <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input 
                autoFocus
                className="md:col-span-2 bg-zinc-800 border-none text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-orange-500 outline-none text-lg placeholder:text-zinc-600"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                required
              />
              <select 
                className="bg-zinc-800 text-zinc-400 font-bold uppercase text-xs rounded-xl px-5 py-4 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer appearance-none"
                value={newTask.status}
                onChange={(e) => setNewTask({...newTask, status: e.target.value})}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
              <button type="submit" className="bg-orange-500 text-zinc-900 py-4 rounded-xl hover:bg-orange-400 font-black uppercase text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
                Add Task
              </button>
            </form>
          </div>
        )}

        {/* Task Grid */}
        <div className="grid gap-3">
          {tasks.map((task) => (
            <div 
                key={task.id} 
                className={`flex flex-col md:flex-row items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                    task.status === 'done' 
                    ? 'bg-zinc-100 border-zinc-200 opacity-60' 
                    : 'bg-white border-zinc-200 hover:border-zinc-900 shadow-sm'
                }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <button 
                    onClick={() => handleUpdateStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    task.status === 'done' 
                        ? 'bg-zinc-900 text-white' 
                        : 'bg-zinc-50 text-zinc-300 border border-zinc-200 hover:border-zinc-900 hover:text-zinc-900'
                    }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>

                <div>
                  <h4 className={`text-lg font-bold leading-none ${task.status === 'done' ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                    {task.title}
                  </h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                    {task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Completed'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select 
                    className="bg-zinc-50 border border-zinc-200 text-[10px] font-black uppercase py-2 px-3 rounded-lg outline-none cursor-pointer focus:border-zinc-900 transition-colors"
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Completed</option>
                </select>
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-red-600 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {tasks.length === 0 && !showTaskForm && (
            <div className="bg-zinc-100/50 border-2 border-dashed border-zinc-300 rounded-[2rem] py-24 text-center">
              <Layers className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-zinc-900 font-black uppercase tracking-tighter text-xl">All Caught Up!</h3>
              <p className="text-zinc-500 text-sm font-medium mb-6">No tasks added yet. Start by creating a new task for this project.</p>
              <button 
                onClick={() => setShowTaskForm(true)}
                className="px-6 py-3 bg-white border-2 border-zinc-900 text-zinc-900 font-black rounded-xl hover:bg-zinc-900 hover:text-white transition-all shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create First Task
              </button>
            </div>
          )}
        </div>

        {/* Project Footer */}
        <footer className="pt-10 flex items-center justify-center gap-8 text-zinc-400 border-t border-zinc-200">
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <FileText className="w-4 h-4" />
                Project Details
             </div>
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <GripVertical className="w-4 h-4" />
                Project Ref: {id.slice(0, 8)}
             </div>
        </footer>
      </div>
    </div>
  );
}