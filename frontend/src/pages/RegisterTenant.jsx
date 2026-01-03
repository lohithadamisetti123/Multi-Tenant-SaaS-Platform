import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Globe, 
  User, 
  Mail, 
  Lock, 
  ChevronRight, 
  Loader2, 
  Zap,
  Terminal,
  ShieldCheck
} from 'lucide-react';

export default function RegisterTenant() {
  const [formData, setFormData] = useState({
    tenantName: '',
    subdomain: '',
    adminFullName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/register-tenant', formData);
      toast.success('Organization registered! Please login.');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 lg:p-8 selection:bg-emerald-500/30">
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #27272a 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="w-full max-w-4xl grid lg:grid-cols-2 bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl relative z-10">
        
        {/* Left Side: Brand & Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-emerald-600">
          <div className="flex items-center gap-2">
            <div className="bg-black p-2 rounded-lg">
              <Zap className="text-emerald-400 w-6 h-6 fill-emerald-400" />
            </div>
            <span className="text-black font-black uppercase tracking-tighter text-xl">Nexus OS</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-black text-black leading-none tracking-tighter">
              SCALE <br /> YOUR <br /> TEAM.
            </h1>
            <p className="text-emerald-950 font-bold text-lg leading-relaxed">
              Create a dedicated workspace for your company and start collaborating in seconds.
            </p>
          </div>

          <div className="bg-emerald-700/30 p-4 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-950 text-xs font-black uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> 
              Secure & Private Infrastructure
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 lg:p-10 max-h-[90vh] overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Terminal className="text-emerald-500 w-6 h-6" /> Organization Setup
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Provide your company details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- COMPANY DATA --- */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Company Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    name="tenantName" 
                    required 
                    placeholder="e.g. Acme Corporation" 
                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-white placeholder:text-zinc-700 text-sm"
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Workspace ID (URL)</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    name="subdomain" 
                    required 
                    placeholder="e.g. acme-team" 
                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-white placeholder:text-zinc-700 text-sm lowercase font-mono"
                    onChange={handleChange} 
                  />
                </div>
                <div className="text-[10px] bg-zinc-800/50 p-2 rounded-lg text-zinc-500 font-mono mt-2 overflow-hidden text-ellipsis whitespace-nowrap">
                   Your URL: <span className="text-emerald-500">{formData.subdomain || 'company'}.nexus-core.io</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-800 w-full my-2"></div>

            {/* --- ADMIN DATA --- */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Admin Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-400 transition-colors" />
                  <input 
                    name="adminFullName" 
                    required 
                    placeholder="Enter your name" 
                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-400 transition-all text-white placeholder:text-zinc-700 text-sm"
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Admin Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-400 transition-colors" />
                  <input 
                    type="email" 
                    name="adminEmail" 
                    required 
                    placeholder="admin@company.com" 
                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-400 transition-all text-white placeholder:text-zinc-700 text-sm"
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Create Admin Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-400 transition-colors" />
                  <input 
                    type="password" 
                    name="adminPassword" 
                    required 
                    placeholder="Create a strong password" 
                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-400 transition-all text-white placeholder:text-zinc-700 text-sm"
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group flex items-center justify-center py-4 px-4 bg-white hover:bg-emerald-400 text-black rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Registering...
                </>
              ) : (
                <>
                  Register Organization <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
            <Link to="/login" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}