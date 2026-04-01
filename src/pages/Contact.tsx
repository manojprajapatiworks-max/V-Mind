import { useState, useEffect, FormEvent } from "react";
import { collection, addDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Contact() {
  const [settings, setSettings] = useState<any>({});
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (doc) => {
      if (doc.exists()) setSettings(doc.data());
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/global");
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await addDoc(collection(db, "inquiries"), {
        ...formData,
        status: "new",
        createdAt: new Date().toISOString()
      });
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      toast.success("Message sent successfully! We'll be in touch soon.");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "inquiries");
      setStatus("error");
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="text-center mb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Get In Touch</h2>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 tracking-tight mb-6">Contact Us</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
              Ready to start your next project? Reach out to our team of experts for professional electrical, security, and networking solutions.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-start relative z-10">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-100" />
              
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-8 relative z-10">Contact Information</h2>
              
              <div className="space-y-8 relative z-10">
                {settings.phoneNumber && (
                  <div className="flex items-start gap-5 group/item">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors shadow-sm">
                      <Phone size={24} />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</h3>
                      <a href={`tel:${settings.phoneNumber}`} className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                        {settings.phoneNumber}
                      </a>
                    </div>
                  </div>
                )}

                {settings.lineId && (
                  <div className="flex items-start gap-5 group/item">
                    <div className="w-14 h-14 bg-[#00B900]/10 text-[#00B900] rounded-2xl flex items-center justify-center shrink-0 border border-[#00B900]/20 group-hover/item:bg-[#00B900] group-hover/item:text-white transition-colors shadow-sm">
                      <MessageCircle size={24} />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">LINE App</h3>
                      <a href={`https://line.me/ti/p/~${settings.lineId}`} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-slate-900 hover:text-[#00B900] transition-colors">
                        {settings.lineId}
                      </a>
                    </div>
                  </div>
                )}

                {settings.email && (
                  <div className="flex items-start gap-5 group/item">
                    <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center shrink-0 border border-cyan-100 group-hover/item:bg-cyan-500 group-hover/item:text-white transition-colors shadow-sm">
                      <Mail size={24} />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Email</h3>
                      <a href={`mailto:${settings.email}`} className="text-lg font-semibold text-slate-900 hover:text-cyan-600 transition-colors break-all">
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}

                {settings.address && (
                  <div className="flex items-start gap-5 group/item">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100 group-hover/item:bg-purple-600 group-hover/item:text-white transition-colors shadow-sm">
                      <MapPin size={24} />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Address</h3>
                      <p className="text-lg font-medium text-slate-900 leading-relaxed">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Business Hours Card (Optional/Static for now) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl">
              <h3 className="text-xl font-display font-bold mb-4">Business Hours</h3>
              <div className="space-y-3 text-slate-300">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span>Monday - Friday</span>
                  <span className="font-medium text-white">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span>Saturday</span>
                  <span className="font-medium text-white">9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-slate-500">Closed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none" />
              
              <div className="mb-8 relative z-10">
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Send a Request</h2>
                <p className="text-slate-500">Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>
              
              {status === "success" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-8 text-center relative z-10"
                >
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-2">Message Sent!</h3>
                  <p className="text-green-700 mb-8">Thank you for reaching out. We will get back to you shortly.</p>
                  <button 
                    onClick={() => setStatus("idle")}
                    className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition shadow-lg shadow-green-600/20"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-2">How can we help? <span className="text-red-500">*</span></label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Describe your project or inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 text-lg"
                  >
                    {status === "submitting" ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>Send Message <Send size={20} /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
