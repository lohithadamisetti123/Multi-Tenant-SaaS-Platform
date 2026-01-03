import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Folder, 
  LogOut, 
  Menu, 
  X, 
  Users, 
  ChevronRight,
  ShieldCheck,
  Bell,
  Hexagon
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // SAFE USER PARSING 2.0
  let user = { fullName: 'User', email: '' };
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.warn("User data corrupted, using default.");
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: Folder },
    { label: 'Team Members', path: '/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans selection:bg-orange-500/30 selection:text-orange-500">
      
      {/* SIDEBAR: Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-zinc-900 border-r border-zinc-800 fixed h-full z-40 transition-all">
        {/* Brand Header */}
        <div className="h-24 flex items-center px-8 gap-3 border-b border-zinc-800/50">
          <div className="h-10 w-10 bg-orange-600 rounded-xl flex items-center justify-center text-zinc-950 shadow-lg shadow-orange-600/20 rotate-3 group hover:rotate-0 transition-transform cursor-pointer">
            <Hexagon className="h-6 w-6 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white uppercase tracking-[0.2em] leading-none">Nexus</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Workspace Manager</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between group px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-orange-600/10 text-orange-500' 
                    : 'hover:bg-zinc-800/50 hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-orange-500' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* User Account Section */}
        <div className="p-6 bg-zinc-900/50 border-t border-zinc-800/50">
          <div className="bg-zinc-950 p-4 rounded-3xl border border-zinc-800 space-y-4 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 font-black text-xs">
                {user.fullName ? user.fullName.substring(0, 1).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-zinc-100 truncate uppercase tracking-tighter">{user.fullName}</p>
                <p className="text-[10px] text-zinc-500 truncate font-mono">{user.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/50 rounded-xl transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE: Navigation Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-zinc-900 border-b border-zinc-800 z-50 px-6 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-orange-600 rounded-lg flex items-center justify-center text-zinc-950">
            <Hexagon className="h-5 w-5 fill-current" />
          </div>
          <span className="font-black text-white uppercase tracking-tighter italic">Nexus</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-100 active:scale-90 transition-transform"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* MOBILE: Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-zinc-950 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col h-full p-8">
            <div className="flex justify-between items-center mb-12">
               <span className="text-2xl font-black text-white uppercase tracking-tighter italic">Main Menu</span>
               <button onClick={() => setIsMobileMenuOpen(false)}><X className="h-8 w-8 text-zinc-500" /></button>
            </div>
            
            <nav className="space-y-4 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-6 py-5 rounded-[2rem] text-lg font-bold transition-all ${
                    location.pathname === item.path ? 'bg-orange-600 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-3 p-6 text-rose-500 bg-rose-500/10 rounded-[2rem] font-black uppercase tracking-widest text-xs"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* MAIN: Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen transition-all">
        {/* Top Desktop Bar */}
        <header className="hidden lg:flex h-24 items-center justify-end px-12 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-6">
            <button className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white transition-colors relative">
               <Bell className="h-5 w-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-orange-600 rounded-full border-2 border-zinc-900"></span>
            </button>
            <div className="h-10 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-3 bg-zinc-900/50 pl-2 pr-4 py-1.5 rounded-full border border-zinc-800">
               <div className="h-7 w-7 bg-orange-600 rounded-full flex items-center justify-center text-[10px] font-black text-zinc-950">
                  <ShieldCheck className="h-4 w-4" />
               </div>
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Secure Access Active</span>
            </div>
          </div>
        </header>

        <div className="px-6 md:px-12 py-10 lg:pt-0 max-w-7xl mx-auto">
          <div className="mt-20 lg:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}