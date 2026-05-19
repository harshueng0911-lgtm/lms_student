import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Globe, Mail, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">Lerno</span>
            </Link>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              A modern learning management system built for university students to access materials and track progress.
            </p>
            <div className="flex gap-4 text-slate-400">
              <a href="#" className="hover:text-blue-600 transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="hover:text-blue-600 transition-colors"><Mail className="w-5 h-5" /></a>
              <a href="#" className="hover:text-blue-600 transition-colors"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 tracking-tight">Resources</h4>
            <ul className="space-y-3">
              <li><Link to="/courses" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Course Library</Link></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Study Materials</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Assignments</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Departments</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4 tracking-tight">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Help Center</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">System Status</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4 tracking-tight">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Lerno Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
