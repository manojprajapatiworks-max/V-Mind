import { useState, useEffect, FormEvent } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { LogOut, Plus, Edit, Trash2, Save, X, LayoutDashboard, Settings, List, MessageSquare } from "lucide-react";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("settings");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Login</h1>
          <p className="text-slate-500 mb-8">Sign in to manage V Mind website content.</p>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard size={20} /> Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "settings" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Settings size={18} /> Site Settings
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "services" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <List size={18} /> Services
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "inquiries" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <MessageSquare size={18} /> Inquiries
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === "settings" && <SettingsEditor />}
        {activeTab === "services" && <ServicesEditor />}
        {activeTab === "inquiries" && <InquiriesViewer />}
      </div>
    </div>
  );
}

function SettingsEditor() {
  const [settings, setSettings] = useState<any>({
    heroTitle: "", heroSubtitle: "", phoneNumber: "", lineId: "", email: "", address: "", aboutText: ""
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
      alert("Settings saved successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "settings/global");
      alert("Failed to save settings. Make sure you have admin privileges.");
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hero Title</label>
            <input
              type="text"
              value={settings.heroTitle || ""}
              onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hero Subtitle</label>
            <input
              type="text"
              value={settings.heroSubtitle || ""}
              onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
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

function ServicesEditor() {
  const [services, setServices] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", iconName: "Zap", order: 0 });

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
      } else {
        await addDoc(collection(db, "services"), form);
      }
      setEditingId(null);
      setForm({ title: "", description: "", category: "", iconName: "Zap", order: 0 });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, "services");
      alert("Failed to save service.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteDoc(doc(db, "services", id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
        alert("Failed to delete service.");
      }
    }
  };

  const startEdit = (service: any) => {
    setEditingId(service.id);
    setForm({
      title: service.title,
      description: service.description,
      category: service.category,
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <input required type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g., Electrical, Security" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
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
              <button type="button" onClick={() => { setEditingId(null); setForm({ title: "", description: "", category: "", iconName: "Zap", order: 0 }); }} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition">
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
                <td className="p-4 font-medium text-slate-900">{s.title}</td>
                <td className="p-4 text-slate-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">{s.category}</span>
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

function InquiriesViewer() {
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
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
      alert("Failed to update status");
    }
  };

  const deleteInquiry = async (id: string) => {
    if (window.confirm("Delete this inquiry permanently?")) {
      try {
        await deleteDoc(doc(db, "inquiries", id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `inquiries/${id}`);
      }
    }
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
