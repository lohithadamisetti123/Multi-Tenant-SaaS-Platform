import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Lock, 
  Building2, 
  ShieldCheck, 
  UserPlus2, 
  ChevronRight, 
  RotateCw, 
  Fingerprint,
  Sparkles
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',      
    email: '',
    password: '',
    tenantSubdomain: '', 
    role: 'User'
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
      await api.post('/auth/register', formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 selection:bg-indigo-500/30">
      {/* Visual background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-4xl grid lg:grid-cols-5 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10">
        
        {/* Branding Side - Hidden on Mobile */}
        <div className="hidden lg:flex lg:col-span-2 bg-gradient-to-b from-zinc-800 to-zinc-900 p-12 flex-col justify-between border-r border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-black tracking-tighter text-xl uppercase italic">Nexus</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tighter">
              START YOUR <br />
              <span className="text-indigo-400">JOURNEY</span> WITH <br />
              THE CORE.
            </h1>
            <p className="text-zinc-500 font-medium leading-relaxed">
              Create your account to start collaborating with your team today.
            </p>
          </div>

          <div className="flex items-center gap-4 text-zinc-600 text-[10px] font-bold tracking-widest uppercase">
            <span>Security</span>
            <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
            <span>Scale</span>
            <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
            <span>Speed</span>
          </div>
        </div>

        {/* Form Side */}
        <div className="lg:col-span-3 p-8 md:p-12 lg:p-16">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-2">
              <Fingerprint className="w-4 h-4" /> Account Creation
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter">Join Your Team</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Workspace ID - Full width */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Workspace Name</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  name="tenantSubdomain"
                  required
                  placeholder="e.g. my-company"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700 text-sm font-medium"
                  value={formData.tenantSubdomain}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Enter your name"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700 text-sm font-medium"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@email.com"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700 text-sm font-medium"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Create a password"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700 text-sm font-medium"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Your Role</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                <select
                  name="role"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white pl-12 pr-10 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer text-sm font-medium"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="User">Team Member</option>
                  <option value="Manager">Department Manager</option>
                  <option value="Admin">Administrator</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Submit Button - Full width */}
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="animate-spin w-4 h-4" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
            <p className="text-zinc-500 text-sm font-medium">
              Already have an account? {' '}
              <Link to="/login" className="text-white hover:text-indigo-400 font-bold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}