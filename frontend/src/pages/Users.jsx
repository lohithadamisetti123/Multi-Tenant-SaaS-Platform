import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Search, 
  Mail, 
  ShieldCheck, 
  User, 
  UserMinus, 
  UserPlus, 
  X, 
  Command, 
  ExternalLink, 
  Loader2, 
  Users as UsersIcon,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'user' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- SAFE USER PARSING ---
  let currentUser = { role: 'user' };
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      currentUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.warn("Corrupted user data in Users page");
  }
  const isAdmin = currentUser.role === 'tenant_admin';
  // ------------------------

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users', formData);
      toast.success('Team member added successfully');
      setShowModal(false);
      setFormData({ fullName: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member from the team?")) return;
    
    try {
      await api.delete(`/users/${userId}`);
      toast.success('Member removed successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove user');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 p-4 lg:p-12 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-zinc-800 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs tracking-[0.3em] uppercase">
              <Command className="w-4 h-4" /> Team Directory
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
              Team Members
            </h1>
            <p className="text-zinc-500 font-medium">Manage team access and collaboration roles for your organization.</p>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setShowModal(true)}
              className="group relative flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all hover:bg-indigo-500 hover:text-white active:scale-95 shadow-xl shadow-white/5"
            >
              <UserPlus className="h-4 w-4" /> Invite Member
            </button>
          )}
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="h-48 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse"></div>
               ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="group bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] hover:border-zinc-700 transition-all flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:border-indigo-500 transition-colors">
                        <Fingerprint className="w-6 h-6 text-zinc-500 group-hover:text-indigo-400" />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                          user.role === 'tenant_admin' 
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}>
                          {user.role === 'tenant_admin' ? 'Administrator' : 'Team Member'}
                        </span>
                        <p className="text-[10px] font-mono mt-2 opacity-30 group-hover:opacity-100 transition-opacity">
                          Ref: {user.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white tracking-tight">{user.fullName}</h3>
                      <p className="text-sm font-medium text-zinc-500 flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3" /> {user.email}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">Active Now</span>
                      </div>
                      
                      {isAdmin && user.id !== currentUser.id && (
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Remove Member"
                        >
                          <UserMinus className="h-5 w-5" />
                        </button>
                      )}
                      
                      {user.id === currentUser.id && (
                        <span className="text-[10px] font-black italic text-indigo-400 uppercase tracking-widest">You</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-32 flex flex-col items-center justify-center bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-[3rem]">
                  <ShieldAlert className="h-16 w-16 text-zinc-800 mb-6" />
                  <h3 className="text-2xl font-black text-white uppercase italic">Your Team is Empty</h3>
                  <p className="text-zinc-500 mt-2">Start inviting colleagues to collaborate on your projects.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl shadow-indigo-500/10">
            <div className="px-10 py-10 flex justify-between items-center border-b border-zinc-800">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Add Team Member</h3>
                <p className="text-zinc-500 text-sm mt-1">Setup a new account for your team member.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                  <input 
                    type="text" required
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white placeholder:text-zinc-700"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                  <input 
                    type="email" required
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white placeholder:text-zinc-700"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Initial Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                  <input 
                    type="password" required
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white placeholder:text-zinc-700"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Access Level</label>
                <select 
                  className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-zinc-400 appearance-none cursor-pointer"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">Team Member (Standard)</option>
                  <option value="tenant_admin">Administrator (Root)</option>
                </select>
              </div>

              <div className="md:col-span-2 pt-6 flex gap-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-5 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-400 transition-all flex justify-center items-center shadow-lg shadow-indigo-500/20"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}