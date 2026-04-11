import React, { useState, useEffect, FormEvent } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, orderBy, where, getDocs, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import firebaseConfig from "../../firebase-applet-config.json";
import { LogOut, Plus, Edit, Trash2, Save, X, LayoutDashboard, Settings, List, MessageSquare, FolderKanban, FileUp, Link as LinkIcon, Image as ImageIcon, CheckCircle, BarChart3, Download, HelpCircle, Info, Zap, Briefcase, ShieldCheck, Users, TrendingUp, Lock, Mail, History } from "lucide-react";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "../components/ConfirmDialog";
import { HERO_BACKGROUNDS, getHeroBackground } from "../constants/heroBackgrounds";
import { getDirectImageUrl } from "../lib/utils";

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const superAdminEmail = "manojprajapatiworks@gmail.com";
        const userEmail = u.email?.toLowerCase();
        console.log("Checking admin status for:", userEmail);
        if (userEmail === superAdminEmail) {
          console.log("User is superadmin");
          setIsAdminUser(true);
        } else {
          try {
            const adminDoc = await getDoc(doc(db, "admins", userEmail || ""));
            console.log("Admin doc exists:", adminDoc.exists());
            setIsAdminUser(adminDoc.exists());
          } catch (err) {
            console.error("Error checking admin status:", err);
            setIsAdminUser(false);
          }
        }
      } else {
        setIsAdminUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter email and password");
      return;
    }
    const email = loginEmail.trim().toLowerCase();
    setIsLoggingIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, loginPassword);
      const u = userCredential.user;
      
      // Log successful login
      try {
        const now = new Date();
        await addDoc(collection(db, "login_logs"), {
          email: u.email,
          timestamp: now.toISOString(),
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
          userAgent: navigator.userAgent
        });
      } catch (logErr) {
        console.error("Error logging login:", logErr);
      }
      
      toast.success("Logged in successfully");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        toast.error("Email/Password login is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.");
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error("Invalid email or password");
      } else {
        toast.error("Login failed: " + err.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    toast.success("Logged out successfully");
  };

  if (loading || (user && isAdminUser === null)) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  if (user && isAdminUser === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">You don't have permission to access the admin panel. Please contact the superadmin.</p>
          <button onClick={handleLogout} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
            <p className="text-slate-500">Sign in to manage V Mind content.</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="admin@vmind.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuGroups = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      title: "Context",
      items: [
        { id: "hero", label: "Hero Section", icon: ImageIcon },
        { id: "stats", label: "Company Stats", icon: TrendingUp },
        { id: "services", label: "Services", icon: List },
        { id: "gallery", label: "Project Gallery", icon: ImageIcon },
        { id: "why-us", label: "Why Choose Us", icon: HelpCircle },
        { id: "faqs", label: "FAQs", icon: HelpCircle },
      ]
    },
    {
      title: "Business",
      items: [
        { id: "projects", label: "Client Projects", icon: FolderKanban },
        { id: "inquiries", label: "Inquiries", icon: MessageSquare },
      ]
    },
    {
      title: "System",
      items: [
        { id: "settings", label: "Site Settings", icon: Settings },
        { id: "admins", label: "Manage Admins", icon: Users },
        { id: "logs", label: "Login History", icon: History },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap size={20} className="text-blue-400" /> V Mind Admin
          </h2>
          <p className="text-xs text-slate-400 mt-1 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2 px-4">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-sm ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                  >
                    <item.icon size={18} /> {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition text-sm"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === "dashboard" && <DashboardStats setActiveTab={setActiveTab} />}
        {activeTab === "hero" && <HeroEditor />}
        {activeTab === "stats" && <StatsEditor />}
        {activeTab === "settings" && <SettingsEditor />}
        {activeTab === "services" && <ServicesEditor openConfirm={openConfirm} />}
        {activeTab === "gallery" && <GalleryEditor openConfirm={openConfirm} />}
        {activeTab === "why-us" && <WhyUsEditor openConfirm={openConfirm} />}
        {activeTab === "faqs" && <FaqsEditor openConfirm={openConfirm} />}
        {activeTab === "projects" && <ProjectsEditor openConfirm={openConfirm} />}
        {activeTab === "inquiries" && <InquiriesViewer openConfirm={openConfirm} />}
        {activeTab === "admins" && <AdminsEditor openConfirm={openConfirm} />}
        {activeTab === "logs" && <LoginLogsViewer />}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

function DashboardStats({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    totalInquiries: 0,
    newInquiries: 0,
    avgProgress: 0,
    totalRevenue: 0 // Mock or placeholder if needed
  });

  useEffect(() => {
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      const projects = snapshot.docs.map(d => d.data());
      const totalProjects = projects.length;
      const completedProjects = projects.filter(p => p.status === "Completed").length;
      const inProgressProjects = projects.filter(p => p.status === "In Progress").length;
      const avgProgress = totalProjects > 0 
        ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / totalProjects) 
        : 0;

      setStats(prev => ({
        ...prev,
        totalProjects,
        completedProjects,
        inProgressProjects,
        avgProgress
      }));
    });

    const unsubInquiries = onSnapshot(collection(db, "inquiries"), (snapshot) => {
      const inquiries = snapshot.docs.map(d => d.data());
      setStats(prev => ({
        ...prev,
        totalInquiries: inquiries.length,
        newInquiries: inquiries.filter(i => i.status === "new").length
      }));
    });

    return () => {
      unsubProjects();
      unsubInquiries();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Real-time status of your business operations.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated</p>
          <p className="text-sm font-medium text-slate-900">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <FolderKanban size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Total Projects</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalProjects}</h3>
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-green-600 font-bold">{stats.completedProjects} Completed</span>
            <span className="text-blue-600 font-bold">{stats.inProgressProjects} Active</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Avg. Progress</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.avgProgress}%</h3>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.avgProgress}%` }}
              className="bg-purple-600 h-full" 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Inquiries</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalInquiries}</h3>
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-amber-600 font-bold">{stats.newInquiries} New Messages</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Success Rate</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">Based on completed projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            Project Progress Statistics
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Overall Completion Rate</span>
                <span className="text-blue-600 font-bold">{stats.avgProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.avgProgress}%` }}
                  className="bg-blue-600 h-full rounded-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">In Progress</p>
                <p className="text-2xl font-bold text-slate-900">{stats.inProgressProjects}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Not Started</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalProjects - stats.completedProjects - stats.inProgressProjects}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Info size={20} className="text-blue-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveTab("projects")} className="p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 hover:bg-blue-100 transition text-left">
              <Plus size={20} className="mb-2" />
              <p className="font-bold text-sm">New Project</p>
              <p className="text-xs opacity-70">Add a client project</p>
            </button>
            <button onClick={() => setActiveTab("inquiries")} className="p-4 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 hover:bg-purple-100 transition text-left">
              <MessageSquare size={20} className="mb-2" />
              <p className="font-bold text-sm">View Inquiries</p>
              <p className="text-xs opacity-70">Check new messages</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroEditor() {
  const [hero, setHero] = useState<any>({
    title_en: "", title_th: "", subtitle_en: "", subtitle_th: "", backgroundId: "modern-slate"
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "hero"), (doc) => {
      if (doc.exists()) setHero(doc.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, "settings/hero"));
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "hero"), hero);
      toast.success("Hero section updated successfully");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "settings/hero");
      toast.error("Failed to update hero section");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Hero Section Content</h2>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Hero Title (EN)</label>
            <input 
              type="text" 
              value={hero.title_en} 
              onChange={e => setHero({...hero, title_en: e.target.value})} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Hero Title (TH)</label>
            <input 
              type="text" 
              value={hero.title_th} 
              onChange={e => setHero({...hero, title_th: e.target.value})} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Hero Subtitle (EN)</label>
            <textarea 
              rows={3} 
              value={hero.subtitle_en} 
              onChange={e => setHero({...hero, subtitle_en: e.target.value})} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Hero Subtitle (TH)</label>
            <textarea 
              rows={3} 
              value={hero.subtitle_th} 
              onChange={e => setHero({...hero, subtitle_th: e.target.value})} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-4">Background Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {HERO_BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setHero({ ...hero, backgroundId: bg.id })}
                className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition ${hero.backgroundId === bg.id ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className={`absolute inset-0 ${bg.className}`} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">{bg.name}</span>
                </div>
                {hero.backgroundId === bg.id && (
                  <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                    <CheckCircle size={12} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsEditor() {
  const [stats, setStats] = useState<any>({
    yearsExp: 0, projects: 0, satisfaction: 0, support: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "stats"), (doc) => {
      if (doc.exists()) setStats(doc.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, "settings/stats"));
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "stats"), stats);
      toast.success("Company stats updated successfully");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "settings/stats");
      toast.error("Failed to update stats");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Company Statistics</h2>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Years of Experience</label>
            <input 
              type="number" 
              value={stats.yearsExp} 
              onChange={e => setStats({...stats, yearsExp: parseInt(e.target.value) || 0})} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Total Projects</label>
            <input 
              type="number" 
              value={stats.projects} 
              onChange={e => setStats({...stats, projects: parseInt(e.target.value) || 0})} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Customer Satisfaction (%)</label>
            <input 
              type="number" 
              value={stats.satisfaction} 
              onChange={e => setStats({...stats, satisfaction: parseInt(e.target.value) || 0})} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Support Availability</label>
            <input 
              type="text" 
              value={stats.support} 
              onChange={e => setStats({...stats, support: e.target.value})} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
              placeholder="e.g. 24/7 Support"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsEditor() {
  const [settings, setSettings] = useState<any>({
    companyName: "", logoUrl: "", phoneNumber: "", lineId: "", email: "", address: "", aboutText: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (doc) => {
      if (doc.exists()) setSettings(doc.data());
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/global");
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "global"), settings);
      toast.success("Settings saved successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "settings/global");
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Global Site Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={settings.companyName || ""}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., V Mind"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
            <input
              type="text"
              value={settings.logoUrl || ""}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://example.com/logo.png"
            />
            {settings.logoUrl && (
              <div className="mt-2 p-2 border border-slate-200 rounded-lg bg-slate-50 inline-block">
                <img src={getDirectImageUrl(settings.logoUrl)} alt="Logo Preview" className="h-12 w-auto object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={settings.phoneNumber || ""}
              onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">LINE ID</label>
            <input
              type="text"
              value={settings.lineId || ""}
              onChange={(e) => setSettings({ ...settings, lineId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={settings.email || ""}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={settings.address || ""}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">About Text (Footer)</label>
          <textarea
            rows={4}
            value={settings.aboutText || ""}
            onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}

function GalleryEditor({ openConfirm }: { openConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title_en: "", title_th: "", imageUrl: "", category: "", order: 0 });

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "gallery"));
    return () => unsub();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "gallery", editingId), form);
        toast.success("Gallery item updated");
      } else {
        await addDoc(collection(db, "gallery"), form);
        toast.success("Gallery item added");
      }
      setEditingId(null);
      setForm({ title_en: "", title_th: "", imageUrl: "", category: "", order: 0 });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, "gallery");
      toast.error("Failed to save gallery item");
    }
  };

  const handleDelete = async (id: string) => {
    openConfirm(
      "Delete Gallery Item",
      "Are you sure you want to delete this gallery item? This action cannot be undone.",
      async () => {
        try {
          await deleteDoc(doc(db, "gallery", id));
          toast.success("Item deleted");
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `gallery/${id}`);
          toast.error("Failed to delete item");
        }
      }
    );
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{editingId ? "Edit Gallery Item" : "Add Gallery Item"}</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title (EN)</label>
            <input required type="text" value={form.title_en} onChange={e => setForm({...form, title_en: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title (TH)</label>
            <input required type="text" value={form.title_th} onChange={e => setForm({...form, title_th: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
            <input required type="url" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            {form.imageUrl && (
              <div className="mt-2 aspect-video w-32 rounded-lg overflow-hidden border border-slate-200">
                <img src={getDirectImageUrl(form.imageUrl)} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
            <input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2">
              <Save size={18} /> {editingId ? "Update" : "Add Item"}
            </button>
            {editingId && <button type="button" onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
            <div className="aspect-video relative overflow-hidden">
              <img src={getDirectImageUrl(item.imageUrl)} alt={item.title_en} className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => { setEditingId(item.id); setForm({...item}); }} className="p-2 bg-white/90 text-blue-600 rounded-lg shadow-sm hover:bg-white transition"><Edit size={16}/></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 text-red-600 rounded-lg shadow-sm hover:bg-white transition"><Trash2 size={16}/></button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-900">{item.title_en}</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{item.category || "No Category"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhyUsEditor({ openConfirm }: { openConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title_en: "", title_th: "", description_en: "", description_th: "", iconName: "Zap", order: 0 });

  useEffect(() => {
    const q = query(collection(db, "why_us"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "why_us"));
    return () => unsub();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "why_us", editingId), form);
        toast.success("Feature updated");
      } else {
        await addDoc(collection(db, "why_us"), form);
        toast.success("Feature added");
      }
      setEditingId(null);
      setForm({ title_en: "", title_th: "", description_en: "", description_th: "", iconName: "Zap", order: 0 });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, "why_us");
      toast.error("Failed to save feature");
    }
  };

  const handleDelete = async (id: string) => {
    openConfirm(
      "Delete Feature",
      "Are you sure you want to delete this 'Why Choose Us' feature?",
      async () => {
        try {
          await deleteDoc(doc(db, "why_us", id));
          toast.success("Feature deleted");
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `why_us/${id}`);
          toast.error("Failed to delete feature");
        }
      }
    );
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{editingId ? "Edit Feature" : "Add Feature"}</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title (EN)</label>
            <input required type="text" value={form.title_en} onChange={e => setForm({...form, title_en: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title (TH)</label>
            <input required type="text" value={form.title_th} onChange={e => setForm({...form, title_th: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (EN)</label>
            <textarea required rows={2} value={form.description_en} onChange={e => setForm({...form, description_en: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (TH)</label>
            <textarea required rows={2} value={form.description_th} onChange={e => setForm({...form, description_th: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
            <select value={form.iconName} onChange={e => setForm({...form, iconName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Zap">Zap</option>
              <option value="ShieldCheck">Shield</option>
              <option value="Star">Star</option>
              <option value="CheckCircle">Check</option>
              <option value="Info">Info</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
            <input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2">
              <Save size={18} /> {editingId ? "Update" : "Add Feature"}
            </button>
            {editingId && <button type="button" onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900">{item.title_en}</h3>
              <p className="text-sm text-slate-600 mt-2">{item.description_en}</p>
            </div>
            <div className="flex gap-1 ml-4">
              <button onClick={() => { setEditingId(item.id); setForm({...item}); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18}/></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqsEditor({ openConfirm }: { openConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ question_en: "", question_th: "", answer_en: "", answer_th: "", order: 0 });

  useEffect(() => {
    const q = query(collection(db, "faqs"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "faqs"));
    return () => unsub();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "faqs", editingId), form);
        toast.success("FAQ updated");
      } else {
        await addDoc(collection(db, "faqs"), form);
        toast.success("FAQ added");
      }
      setEditingId(null);
      setForm({ question_en: "", question_th: "", answer_en: "", answer_th: "", order: 0 });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, "faqs");
      toast.error("Failed to save FAQ");
    }
  };

  const handleDelete = async (id: string) => {
    openConfirm(
      "Delete FAQ",
      "Are you sure you want to delete this FAQ?",
      async () => {
        try {
          await deleteDoc(doc(db, "faqs", id));
          toast.success("FAQ deleted");
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `faqs/${id}`);
          toast.error("Failed to delete FAQ");
        }
      }
    );
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{editingId ? "Edit FAQ" : "Add FAQ"}</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Question (EN)</label>
              <input required type="text" value={form.question_en} onChange={e => setForm({...form, question_en: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Question (TH)</label>
              <input required type="text" value={form.question_th} onChange={e => setForm({...form, question_th: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Answer (EN)</label>
              <textarea required rows={3} value={form.answer_en} onChange={e => setForm({...form, answer_en: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Answer (TH)</label>
              <textarea required rows={3} value={form.answer_th} onChange={e => setForm({...form, answer_th: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
            <input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="w-32 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2">
              <Save size={18} /> {editingId ? "Update" : "Add FAQ"}
            </button>
            {editingId && <button type="button" onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">{item.question_en}</h3>
              <p className="text-sm text-slate-600 mt-2">{item.answer_en}</p>
            </div>
            <div className="flex gap-1 ml-4">
              <button onClick={() => { setEditingId(item.id); setForm({...item}); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18}/></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesEditor({ openConfirm }: { openConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    title_en: "", title_th: "", 
    description_en: "", description_th: "", 
    category_en: "", category_th: "", 
    iconName: "Zap", order: 0 
  });

  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "services");
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "services", editingId), form);
        toast.success("Service updated successfully");
      } else {
        await addDoc(collection(db, "services"), form);
        toast.success("Service added successfully");
      }
      setEditingId(null);
      setForm({ 
        title_en: "", title_th: "", 
        description_en: "", description_th: "", 
        category_en: "", category_th: "", 
        iconName: "Zap", order: 0 
      });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, "services");
      toast.error("Failed to save service");
    }
  };

  const handleDelete = async (id: string) => {
    openConfirm(
      "Delete Service",
      "Are you sure you want to delete this service? This will remove it from the website.",
      async () => {
        try {
          await deleteDoc(doc(db, "services", id));
          toast.success("Service deleted");
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
          toast.error("Failed to delete service");
        }
      }
    );
  };

  const startEdit = (service: any) => {
    setEditingId(service.id);
    setForm({
      title_en: service.title_en || service.title || "",
      title_th: service.title_th || "",
      description_en: service.description_en || service.description || "",
      description_th: service.description_th || "",
      category_en: service.category_en || service.category || "",
      category_th: service.category_th || "",
      iconName: service.iconName || "Zap",
      order: service.order || 0
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {editingId ? "Edit Service" : "Add New Service"}
        </h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title (EN)</label>
            <input required type="text" value={form.title_en} onChange={e => setForm({...form, title_en: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title (TH)</label>
            <input required type="text" value={form.title_th} onChange={e => setForm({...form, title_th: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category (EN)</label>
            <input required type="text" value={form.category_en} onChange={e => setForm({...form, category_en: e.target.value})} placeholder="e.g., Electrical" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category (TH)</label>
            <input required type="text" value={form.category_th} onChange={e => setForm({...form, category_th: e.target.value})} placeholder="e.g., ไฟฟ้า" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (EN)</label>
            <textarea required rows={3} value={form.description_en} onChange={e => setForm({...form, description_en: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (TH)</label>
            <textarea required rows={3} value={form.description_th} onChange={e => setForm({...form, description_th: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Icon Name (Lucide)</label>
            <select value={form.iconName} onChange={e => setForm({...form, iconName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Zap">Zap (Electrical)</option>
              <option value="ShieldCheck">ShieldCheck (Security)</option>
              <option value="Network">Network (Networking)</option>
              <option value="Cable">Cable (Wiring)</option>
              <option value="Server">Server (IT)</option>
              <option value="Phone">Phone (Telecom)</option>
              <option value="Video">Video (CCTV)</option>
              <option value="AlertTriangle">AlertTriangle (Fire Alarm)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
            <input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="md:col-span-2 flex gap-3 mt-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2">
              {editingId ? <><Save size={18}/> Update</> : <><Plus size={18}/> Add Service</>}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ title_en: "", title_th: "", description_en: "", description_th: "", category_en: "", category_th: "", iconName: "Zap", order: 0 }); }} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4 font-medium">Order</th>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-slate-500">{s.order}</td>
                <td className="p-4">
                  <div className="font-medium text-slate-900">{s.title_en || s.title}</div>
                  <div className="text-xs text-slate-500">{s.title_th || "No Thai Title"}</div>
                </td>
                <td className="p-4 text-slate-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">{s.category_en || s.category}</span>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => startEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">No services added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectsEditor({ openConfirm }: { openConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerId: "",
    title: "",
    description: "",
    progress: 0,
    status: "Not Started",
    paymentStatus: "Unpaid",
    projectUrl: ""
  });
  const [uploading, setUploading] = useState(false);
  const [projectFiles, setProjectFiles] = useState<Record<string, any[]>>({});
  
  // URL Link Form State
  const [showLinkForm, setShowLinkForm] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState({ fileName: "", fileUrl: "", fileType: "link" });

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProjects(projs);
      
      // Fetch files for all projects
      projs.forEach(p => {
        const fq = query(collection(db, "project_files"), where("projectId", "==", p.id));
        onSnapshot(fq, (fSnap) => {
          setProjectFiles(prev => ({
            ...prev,
            [p.id]: fSnap.docs.map(fd => ({ id: fd.id, ...fd.data() }))
          }));
        });
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "projects");
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date().toISOString();
      if (editingId) {
        await updateDoc(doc(db, "projects", editingId), { ...form, updatedAt: now });
        toast.success("Project updated successfully");
      } else {
        await addDoc(collection(db, "projects"), { ...form, createdAt: now, updatedAt: now });
        toast.success("Project created successfully");
      }
      setEditingId(null);
      setForm({ customerId: "", title: "", description: "", progress: 0, status: "Not Started", paymentStatus: "Unpaid", projectUrl: "" });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, "projects");
      toast.error("Failed to save project");
    }
  };

  const handleDelete = async (id: string) => {
    openConfirm(
      "Delete Project",
      "Are you sure you want to delete this project? This action cannot be undone and will delete all associated files and links.",
      async () => {
        try {
          await deleteDoc(doc(db, "projects", id));
          // Also delete associated files
          const filesSnap = await getDocs(query(collection(db, "project_files"), where("projectId", "==", id)));
          for (const fileDoc of filesSnap.docs) {
            await deleteDoc(doc(db, "project_files", fileDoc.id));
          }
          toast.success("Project and associated files deleted");
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
          toast.error("Failed to delete project");
        }
      }
    );
  };

  const startEdit = (project: any) => {
    setEditingId(project.id);
    setForm({
      customerId: project.customerId,
      title: project.title,
      description: project.description || "",
      progress: project.progress,
      status: project.status,
      paymentStatus: project.paymentStatus || "Unpaid",
      projectUrl: project.projectUrl || ""
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1048576) {
      toast.error("File size must be less than 1MB");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        await addDoc(collection(db, "project_files"), {
          projectId,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileData: base64data,
          isExternalLink: false,
          uploadedAt: new Date().toISOString()
        });
        setUploading(false);
        toast.success("File uploaded successfully");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload file");
      setUploading(false);
    }
  };

  const handleAddLink = async (e: FormEvent, projectId: string) => {
    e.preventDefault();
    if (!linkForm.fileName || !linkForm.fileUrl) {
      toast.error("Please fill in both name and URL");
      return;
    }

    try {
      await addDoc(collection(db, "project_files"), {
        projectId,
        fileName: linkForm.fileName,
        fileType: linkForm.fileType,
        fileUrl: linkForm.fileUrl,
        isExternalLink: true,
        uploadedAt: new Date().toISOString()
      });
      setShowLinkForm(null);
      setLinkForm({ fileName: "", fileUrl: "", fileType: "link" });
      toast.success("External link added");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "project_files");
      toast.error("Failed to add link");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    openConfirm(
      "Delete File/Link",
      "Are you sure you want to delete this file or link?",
      async () => {
        try {
          await deleteDoc(doc(db, "project_files", fileId));
          toast.success("Deleted successfully");
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `project_files/${fileId}`);
          toast.error("Failed to delete");
        }
      }
    );
  };

  const exportToCSV = () => {
    const headers = ["Customer ID", "Title", "Status", "Progress", "Payment Status", "Project URL", "Created At"];
    const rows = projects.map(p => [
      p.customerId,
      p.title,
      p.status,
      `${p.progress}%`,
      p.paymentStatus,
      p.projectUrl || "",
      p.createdAt || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `projects_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported to CSV");
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">Client Projects</h2>
        <button 
          onClick={exportToCSV}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">{editingId ? "Edit Project" : "Create New Project"}</h3>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer ID</label>
            <input required type="text" value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., CUST-123" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
            <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Progress (%)</label>
            <input required type="number" min="0" max="100" value={form.progress} onChange={e => setForm({...form, progress: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Status</label>
            <select value={form.paymentStatus} onChange={e => setForm({...form, paymentStatus: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project URL (Optional)</label>
            <input type="url" value={form.projectUrl} onChange={e => setForm({...form, projectUrl: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
          </div>
          <div className="md:col-span-2 flex gap-3 mt-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2">
              {editingId ? <><Save size={18}/> Update</> : <><Plus size={18}/> Add Project</>}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ customerId: "", title: "", description: "", progress: 0, status: "Not Started", paymentStatus: "Unpaid", projectUrl: "" }); }} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Projects List</h2>
        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
            No projects added yet.
          </div>
        ) : (
          projects.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">ID: {p.customerId}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.status === 'Completed' ? 'bg-green-100 text-green-700' : p.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : p.paymentStatus === 'Partial' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>Payment: {p.paymentStatus || 'Unpaid'}</span>
                  </div>
                  <p className="text-sm text-slate-500">Progress: {p.progress}%</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Project Files & Links</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {projectFiles[p.id]?.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="truncate pr-4 flex items-center gap-2">
                        {file.isExternalLink ? <LinkIcon size={14} className="text-blue-500 shrink-0" /> : <FileUp size={14} className="text-slate-400 shrink-0" />}
                        <div className="truncate">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.fileName}</p>
                          <p className="text-xs text-slate-500">{file.isExternalLink ? 'External Link' : 'Uploaded File'} • {new Date(file.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {file.isExternalLink && (
                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                            Open
                          </a>
                        )}
                        <button onClick={() => handleDeleteFile(file.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!projectFiles[p.id] || projectFiles[p.id].length === 0) && (
                    <p className="text-sm text-slate-500 col-span-2">No files or links added yet.</p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <input 
                      type="file" 
                      id={`file-${p.id}`} 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, p.id)}
                      disabled={uploading}
                    />
                    <label 
                      htmlFor={`file-${p.id}`} 
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 cursor-pointer transition ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                      <FileUp size={16} />
                      {uploading ? "Uploading..." : "Upload File (Max 1MB)"}
                    </label>
                  </div>
                  
                  <button 
                    onClick={() => setShowLinkForm(showLinkForm === p.id ? null : p.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
                  >
                    <LinkIcon size={16} />
                    Add External Link
                  </button>
                </div>

                {/* Add Link Form */}
                {showLinkForm === p.id && (
                  <form onSubmit={(e) => handleAddLink(e, p.id)} className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Document Name</label>
                        <input required type="text" value={linkForm.fileName} onChange={e => setLinkForm({...linkForm, fileName: e.target.value})} placeholder="e.g., Final Report (Google Drive)" className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Document Type</label>
                        <select value={linkForm.fileType} onChange={e => setLinkForm({...linkForm, fileType: e.target.value})} className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none">
                          <option value="report">Report</option>
                          <option value="invoice">Invoice</option>
                          <option value="drawing">Drawing</option>
                          <option value="document">Document</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">URL (Google Drive, OneDrive, etc.)</label>
                        <input required type="url" value={linkForm.fileUrl} onChange={e => setLinkForm({...linkForm, fileUrl: e.target.value})} placeholder="https://..." className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition">Save Link</button>
                      <button type="button" onClick={() => setShowLinkForm(null)} className="bg-slate-200 text-slate-700 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-slate-300 transition">Cancel</button>
                    </div>
                  </form>
                )}

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


function InquiriesViewer({ openConfirm }: { openConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setInquiries(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "inquiries");
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "inquiries", id), { status });
      toast.success("Status updated");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
      toast.error("Failed to update status");
    }
  };

  const deleteInquiry = async (id: string) => {
    openConfirm(
      "Delete Inquiry",
      "Are you sure you want to delete this inquiry permanently?",
      async () => {
        try {
          await deleteDoc(doc(db, "inquiries", id));
          toast.success("Inquiry deleted");
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `inquiries/${id}`);
          toast.error("Failed to delete inquiry");
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h2 className="text-2xl font-bold text-slate-900">Customer Inquiries</h2>
      
      {inquiries.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
          No inquiries yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {inquiries.map(inq => (
            <div key={inq.id} className={`bg-white rounded-xl p-6 border ${inq.status === 'new' ? 'border-blue-300 shadow-md' : 'border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {inq.name}
                    {inq.status === 'new' && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">New</span>}
                  </h3>
                  <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-4">
                    {inq.email && <span>{inq.email}</span>}
                    {inq.phone && <span>{inq.phone}</span>}
                    <span>{new Date(inq.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={inq.status} 
                    onChange={(e) => updateStatus(inq.id, e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button onClick={() => deleteInquiry(inq.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg text-slate-700 whitespace-pre-wrap text-sm border border-slate-100">
                {inq.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoginLogsViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "login_logs"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "login_logs"));
    return () => unsub();
  }, []);

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const headers = ["Email", "Date", "Time", "Timestamp", "User Agent"];
    const rows = logs.map(log => [
      log.email,
      log.date,
      log.time,
      log.timestamp,
      `"${log.userAgent?.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `login_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Logs exported successfully");
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Login History</h2>
          <p className="text-slate-500 mt-1">Track admin sign-in activities.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 text-sm font-bold"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Email</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{log.email}</div>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{log.date}</td>
                  <td className="p-4 text-slate-600 text-sm">{log.time}</td>
                  <td className="p-4 text-slate-400 text-xs truncate max-w-[300px]" title={log.userAgent}>
                    {log.userAgent}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                    No login logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminsEditor({ openConfirm }: { openConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [admins, setAdmins] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "admins"), (snapshot) => {
      setAdmins(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "admins"));
    return () => unsub();
  }, []);

  const handleAddAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      toast.error("Please enter email and password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const email = newEmail.trim().toLowerCase();
    setLoading(true);
    try {
      // Add to admins collection for rules check FIRST while still logged in as current admin
      await setDoc(doc(db, "admins", email), {
        email: email,
        role: "admin",
        createdAt: new Date().toISOString()
      });

      // Create user in Firebase Auth using a secondary app instance to avoid signing out current admin
      const secondaryApp = getApps().find(a => a.name === "SecondaryApp") || initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      
      try {
        await createUserWithEmailAndPassword(secondaryAuth, email, newPassword);
        await signOut(secondaryAuth); // Clean up secondary auth
        toast.success("Admin account created successfully");
        setNewEmail("");
        setNewPassword("");
      } catch (authErr: any) {
        // If auth creation fails, we should probably remove the admin doc to keep it in sync
        await deleteDoc(doc(db, "admins", email));
        throw authErr;
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        toast.error("Email/Password authentication is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.");
      } else {
        toast.error("Failed to create admin: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (email: string) => {
    openConfirm(
      "Remove Admin Access",
      `Are you sure you want to remove admin access for ${email}? This will not delete their Auth account but they will lose access to this panel.`,
      async () => {
        try {
          await deleteDoc(doc(db, "admins", email));
          toast.success("Admin access removed");
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `admins/${email}`);
          toast.error("Failed to remove admin access");
        }
      }
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Manage Admin Accounts</h2>
        <p className="text-slate-500 mt-1">Create and manage authorized admin users.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Admin</h3>
        <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={newEmail} 
              onChange={e => setNewEmail(e.target.value)} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
              placeholder="admin@vmind.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Initial Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={18} /> {loading ? "Creating..." : "Add Admin"}
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-4 italic">
          * Note: New admins must use their email and the initial password you provide to sign in.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4 font-bold">Admin Email</th>
              <th className="p-4 font-bold">Role</th>
              <th className="p-4 font-bold">Created At</th>
              <th className="p-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="p-4 font-medium text-slate-900">{admin.email}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    {admin.role}
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-sm">
                  {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="p-4">
                  {admin.email !== "manojprajapatiworks@gmail.com" && (
                    <button 
                      onClick={() => handleDeleteAdmin(admin.email)} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                  No additional admins configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
