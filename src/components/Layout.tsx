import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, Phone, Mail, MapPin, ArrowRight, Globe, MessageCircle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";
import { Toaster } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { SmartImage } from "./SmartImage";

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { language, setLanguage, showLanguageSwitcher } = useLanguage();

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
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/global");
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const navLinks = [
    { name: language === "en" ? "Home" : "หน้าแรก", path: "/" },
    { name: language === "en" ? "Services" : "บริการของเรา", path: "/services" },
    { name: language === "en" ? "Client Portal" : "พอร์ทัลลูกค้า", path: "/portal" },
    { name: language === "en" ? "Contact" : "ติดต่อเรา", path: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-cyan-500/30">
      <Toaster position="top-right" richColors />
      
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
          >
            <div className="relative">
              <div className="w-20 h-20 border-2 border-cyan-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={32} className="text-cyan-400 animate-pulse fill-current" />
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-slate-400 font-display font-medium tracking-widest text-xs uppercase"
            >
              Loading Excellence
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            {showLanguageSwitcher && (
              <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
                <button 
                  onClick={() => setLanguage("en")} 
                  className={`hover:text-white transition-colors ${language === "en" ? "text-cyan-400 font-bold" : ""}`}
                >
                  EN
                </button>
                <span className="text-white/20">|</span>
                <button 
                  onClick={() => setLanguage("th")} 
                  className={`hover:text-white transition-colors ${language === "th" ? "text-cyan-400 font-bold" : ""}`}
                >
                  TH
                </button>
              </div>
            )}
            <Link to="/admin" className="hover:text-cyan-400 transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass py-2 shadow-sm" : "bg-white/95 backdrop-blur-md py-3 sm:py-4 border-b border-slate-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              {settings.logoUrl ? (
                <div className="h-9 sm:h-10 max-w-[140px] sm:max-w-[180px] flex items-center justify-start overflow-hidden">
                  <SmartImage src={settings.logoUrl} alt="Logo" className="max-h-full w-auto object-contain" />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-2 sm:p-2.5 rounded-xl shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                  <Zap size={22} className="fill-current" />
                </div>
              )}
              <span className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight truncate max-w-[160px] sm:max-w-[240px]">
                {settings.companyName || "V Mind"}
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 relative py-2 ${
                    location.pathname === link.path ? "text-blue-600 font-semibold" : "text-slate-600"
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
                className="bg-slate-900 text-white px-5 lg:px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-all shadow-md hover:shadow-xl hover:shadow-blue-600/20 flex items-center gap-2"
              >
                {language === "en" ? "Get a Quote" : "ขอใบเสนอราคา"} <ArrowRight size={16} />
              </Link>
            </nav>

            {/* Mobile Menu Button - Clean Hamburger only */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                aria-label="Toggle Navigation Menu"
                className="p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden shadow-2xl absolute w-full top-full left-0 max-h-[calc(100vh-65px)] overflow-y-auto"
            >
              <div className="px-4 py-5 space-y-3">
                {/* Language Option inside 3-bar lines (only shown if both languages are enabled) */}
                {showLanguageSwitcher && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Globe size={14} className="text-blue-600" />
                      <span>Language / ภาษา</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage("en");
                        }}
                        className={`py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                          language === "en"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>English (EN)</span>
                        {language === "en" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage("th");
                        }}
                        className={`py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                          language === "th"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>ภาษาไทย (TH)</span>
                        {language === "th" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors min-h-[44px] flex items-center ${
                        location.pathname === link.path
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="pt-3 space-y-2 border-t border-slate-100">
                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-5 py-3.5 rounded-xl text-base font-semibold hover:bg-blue-700 active:bg-blue-800 transition shadow-lg shadow-blue-600/20 min-h-[48px]"
                  >
                    {language === "en" ? "Get a Quote" : "ขอใบเสนอราคา"} <ArrowRight size={18} />
                  </Link>

                  <div className="pt-2 flex items-center justify-between px-2 text-xs text-slate-500">
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-slate-500 hover:text-blue-600 py-2 font-semibold transition"
                    >
                      Admin Portal
                    </Link>
                    {settings.phoneNumber && (
                      <a href={`tel:${settings.phoneNumber}`} className="text-slate-600 font-medium hover:text-blue-600">
                        {settings.phoneNumber}
                      </a>
                    )}
                  </div>
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
                {settings.logoUrl ? (
                  <SmartImage src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
                ) : (
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white p-2 rounded-lg">
                    <Zap size={24} className="fill-current" />
                  </div>
                )}
                <span className="text-2xl font-display font-bold text-white tracking-tight">
                  {settings.companyName || "V Mind"}
                </span>
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

                {/* LINE App */}
                {(settings.messagingPlatform === 'line' || settings.messagingPlatform === 'both' || (!settings.messagingPlatform && settings.lineId)) && settings.lineId && (
                  <li className="flex items-start gap-4">
                    <div className="bg-[#00B900]/20 p-2 rounded-lg text-[#00B900] shrink-0">
                      <MessageCircle size={18} />
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">LINE App</p>
                      <a 
                        href={settings.lineId.startsWith("http") ? settings.lineId : `https://line.me/ti/p/~${settings.lineId}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-300 hover:text-[#00B900] transition-colors"
                      >
                        {settings.lineId}
                      </a>
                    </div>
                  </li>
                )}

                {/* WhatsApp */}
                {(settings.messagingPlatform === 'whatsapp' || settings.messagingPlatform === 'both' || (!settings.messagingPlatform && settings.whatsappNumber)) && settings.whatsappNumber && (
                  <li className="flex items-start gap-4">
                    <div className="bg-[#25D366]/20 p-2 rounded-lg text-[#25D366] shrink-0">
                      <MessageCircle size={18} />
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">WhatsApp</p>
                      <a 
                        href={settings.whatsappNumber.startsWith("http") ? settings.whatsappNumber : `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-300 hover:text-[#25D366] transition-colors"
                      >
                        {settings.whatsappNumber}
                      </a>
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
                      <span className="text-slate-300 block">{settings.address}</span>
                      {(settings.googleMapUrl || settings.address) && (
                        <a 
                          href={settings.googleMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium mt-1.5"
                        >
                          <span>Open on Google Maps</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
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
