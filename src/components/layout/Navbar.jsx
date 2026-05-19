import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/osmania-logo-1.jpg';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'FAQ', path: '#faq' },
    { title: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Osmania University Logo" className="h-11 w-auto object-contain"/>
            <span className="font-bold text-xl text-slate-900 tracking-tight">LMS</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                link.title === "FAQ" ? (
                  <a key={link.title} href="#faq" className="text-slate-600 hover:text-blue-600 font-medium transition-colors" >
                    {link.title}
                  </a>
                ) : (
                  <Link key={link.title} to={link.path} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                    {link.title}
                  </Link>
                )
              ))}
            </div>
            <div className="flex gap-4">
              <Link to="/login" className="text-slate-900 font-medium hover:text-blue-500 px-4 py-2 transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="bg-blue-500 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors shadow-sm">
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                link.title === "FAQ" ? (
                  <a
                    key={link.title}
                    href="#faq"
                    className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.title}
                  </a>
                ) : (
                  <Link
                    key={link.title}
                    to={link.path}
                    className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.title}
                  </Link>
                )
              ))}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="block text-center px-3 py-2 text-base font-medium text-slate-900 border border-slate-200 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block text-center px-3 py-2 text-base font-medium text-white bg-blue-600 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
