import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";
import { Toaster } from "sonner";

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/global");
    });
    return () => unsub();
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-cyan-500/30">
      <Toaster position="top-right" richColors />
      
      {/* Top Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 hidden md:block border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            {settings.phoneNumber && (
              <a href={`tel:${settings.phoneNumber}`} className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                <Phone size={12} /> {settings.phoneNumber}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                <Mail size={12} /> {settings.email}
              </a>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="hover:text-cyan-400 transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass py-2" : "bg-white/0 py-4"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-2.5 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                <Zap size={24} className="fill-current" />
              </div>
              <span className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                V Mind
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 relative py-2 ${
                    location.pathname === link.path ? "text-blue-600" : "text-slate-600"
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="underline"
                      className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600 rounded-full"
                    />
                  )}
                </Link>
              ))}
              <Link
                to="/contact"
                className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-all shadow-md hover:shadow-xl hover:shadow-blue-600/20 flex items-center gap-2"
              >
                Get a Quote <ArrowRight size={16} />
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden shadow-xl absolute w-full top-full left-0"
            >
              <div className="px-4 py-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      location.pathname === link.path
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4">
                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-5 py-3.5 rounded-xl text-base font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                  >
                    Get a Quote <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 pt-20 pb-10 border-t border-slate-800 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
            <div className="md:col-span-5 lg:col-span-4">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white p-2 rounded-lg">
                  <Zap size={24} className="fill-current" />
                </div>
                <span className="text-2xl font-display font-bold text-white tracking-tight">V Mind</span>
              </Link>
              <p className="text-slate-400 leading-relaxed mb-8">
                {settings.aboutText || "Professional electrical, security, and networking solutions for modern businesses and homes. Engineering excellence in every connection."}
              </p>
            </div>
            
            <div className="md:col-span-3 lg:col-span-2 lg:col-start-7">
              <h3 className="text-white font-semibold mb-6 text-lg">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-slate-400 hover:text-cyan-400 transition-colors">Home</Link></li>
                <li><Link to="/services" className="text-slate-400 hover:text-cyan-400 transition-colors">Our Services</Link></li>
                <li><Link to="/contact" className="text-slate-400 hover:text-cyan-400 transition-colors">Contact Us</Link></li>
                <li><Link to="/admin" className="text-slate-400 hover:text-cyan-400 transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            <div className="md:col-span-4 lg:col-span-4">
              <h3 className="text-white font-semibold mb-6 text-lg">Contact Information</h3>
              <ul className="space-y-4">
                {settings.phoneNumber && (
                  <li className="flex items-start gap-4">
                    <div className="bg-slate-800/50 p-2 rounded-lg text-cyan-400 shrink-0">
                      <Phone size={18} />
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Call Us</p>
                      <a href={`tel:${settings.phoneNumber}`} className="text-slate-300 hover:text-white transition-colors">{settings.phoneNumber}</a>
                    </div>
                  </li>
                )}
                {settings.email && (
                  <li className="flex items-start gap-4">
                    <div className="bg-slate-800/50 p-2 rounded-lg text-cyan-400 shrink-0">
                      <Mail size={18} />
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Email</p>
                      <a href={`mailto:${settings.email}`} className="text-slate-300 hover:text-white transition-colors">{settings.email}</a>
                    </div>
                  </li>
                )}
                {settings.address && (
                  <li className="flex items-start gap-4">
                    <div className="bg-slate-800/50 p-2 rounded-lg text-cyan-400 shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Location</p>
                      <span className="text-slate-300">{settings.address}</span>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} V Mind. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Designed for Excellence</span>
              <Zap size={14} className="text-cyan-500" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
