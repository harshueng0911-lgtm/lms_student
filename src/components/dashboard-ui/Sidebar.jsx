import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, BookOpen, ClipboardList, HelpCircle, Bookmark, Gift, Bell, Settings, LogOut } from 'lucide-react';
import logo from '../../assets/osmania-logo-1.jpg';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    navigate('/login');
  };
  const learningLinks = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: BookOpen, label: 'My Materials', path: '/dashboard/materials' },
    { icon: ClipboardList, label: 'Assignments', path: '/dashboard/assignments' },
    { icon: Bookmark, label: 'Saved Materials', path: '/dashboard/saved' },
  ];

  const accountLinks = [
    { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    { icon: LogOut, label: 'Logout', path: '/login', isLogout: true },
  ];

  const renderLinks = (links) => {
    return links.map((link) => {
      const Icon = link.icon;
      
      if (link.isLogout) {
        return (
          <button
            key={link.label}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 font-medium text-sm transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <Icon className="w-5 h-5" />
            {link.label}
          </button>
        );
      }

      return (
        <NavLink
          key={link.label}
          to={link.path}
          end={link.path === '/dashboard'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 font-medium text-sm transition-colors ${
              isActive && !link.isLogout
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <Icon className="w-5 h-5" />
          {link.label}
        </NavLink>
      );
    });
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div>
            <img src={logo} alt="Osmania University Logo" className="h-11 w-auto object-contain"/>
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">LMS</span>
        </div>
      </div>

      {/* Student Portal Badge */}
      <div className="px-4 pt-6 pb-2">
        <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Student portal
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="px-4 py-4 flex-grow">
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">Learning</h4>
          {renderLinks(learningLinks)}
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">Account</h4>
          {renderLinks(accountLinks)}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
