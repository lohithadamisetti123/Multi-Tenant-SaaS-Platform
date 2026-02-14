import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  KeyRound,
  AtSign,
  Globe,
  ChevronRight,
  CircleDashed,
  Fingerprint
} from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSubdomain: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.name === 'tenantSubdomain' ? e.target.value.toLowerCase().replace(/\s+/g, '-') : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 selection:bg-orange-500/30 selection:text-orange-500">

      {/* Structural Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative z-10">

        {/* Visual Brand Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-zinc-800 to-zinc-900 border-r border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-black w-5 h-5" />
            </div>
            <span className="text-white font-black uppercase tracking-widest text-sm">Nexus Core</span>
          </div>

          <div>
            <h1 className="text-5xl font-black text-white leading-tight">
              Secure <br />
              <span className="text-zinc-500 italic font-light">Workspace</span>
            </h1>
            <p className="mt-6 text-zinc-400 max-w-sm leading-relaxed">
              Unified login gateway to manage your organization and scale your projects with ease.
            </p>
          </div>

          <div className="flex gap-6 text-zinc-500 text-xs font-mono">
            <span>v4.0.2-stable</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center lg:justify-start gap-3">
              <Fingerprint className="text-orange-500 w-8 h-8" /> Welcome Back
            </h2>
            <p className="text-zinc-500 mt-2">Sign in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">
                Workspace Name
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  name="tenantSubdomain"
                  placeholder="e.g. my-company"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-12 py-4 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-zinc-700 text-sm"
                  value={formData.tenantSubdomain}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">
                Email Address
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-12 py-4 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-zinc-700 text-sm"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-12 py-4 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-zinc-700 text-sm"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden group py-4 px-6 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-tighter rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <CircleDashed className="animate-spin w-5 h-5" />
                ) : (
                  <>Sign In <ChevronRight className="w-4 h-4" /></>
                )}
              </span>
            </button>
          </form>

          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-zinc-800"></div>
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">New here?</span>
              <div className="h-px flex-1 bg-zinc-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/register"
                className="py-3 px-4 border border-zinc-800 rounded-xl text-center text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
              >
                Join Team
              </Link>
              <Link
                to="/register-tenant"
                className="py-3 px-4 border border-zinc-800 rounded-xl text-center text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
              >
                Register Org
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}