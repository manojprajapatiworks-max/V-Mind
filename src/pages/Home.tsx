import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Network, PhoneCall, MessageCircle, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";

export default function Home() {
  const [settings, setSettings] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (doc) => {
      if (doc.exists()) setSettings(doc.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, "settings/global"));

    const qServices = query(collection(db, "services"), orderBy("order", "asc"), limit(6));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "services"));

    const qTestimonials = query(collection(db, "testimonials"), orderBy("order", "asc"), limit(3));
    const unsubTestimonials = onSnapshot(qTestimonials, (snapshot) => {
      setTestimonials(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "testimonials"));

    const qFaqs = query(collection(db, "faqs"), orderBy("order", "asc"));
    const unsubFaqs = onSnapshot(qFaqs, (snapshot) => {
      setFaqs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "faqs"));

    return () => {
      unsubSettings();
      unsubServices();
      unsubTestimonials();
      unsubFaqs();
    };
  }, []);

  const defaultHeroTitle = "Empowering Your Infrastructure";
  const defaultHeroSubtitle = "Professional solutions for electrical cables, panels, fire alarms, CCTV, LAN, fiber optics, and telephone systems.";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-32 md:py-48 flex items-center justify-center min-h-[90vh]">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-b from-blue-600/30 to-cyan-500/10 blur-[120px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-t from-purple-600/20 to-blue-500/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-300">Next-Gen Infrastructure Solutions</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8 leading-[1.1]">
              <span className="text-white">{settings.heroTitle || defaultHeroTitle}</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              {settings.heroSubtitle || defaultHeroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link
                to="/services"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-8 py-4 rounded-full transition-all shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_60px_-15px_rgba(6,182,212,0.7)] flex items-center justify-center gap-2 group text-lg"
              >
                Explore Services 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 text-lg"
              >
                Get a Free Quote
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500"
        >
          <div className="w-[30px] h-[50px] rounded-full border-2 border-slate-700 flex justify-center p-2">
            <div className="w-1 h-3 bg-slate-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-100 relative z-20 -mt-10 mx-4 md:mx-auto max-w-5xl rounded-3xl shadow-xl shadow-slate-200/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-slate-900 mb-1">10+</div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Years Exp.</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-slate-900 mb-1">500+</div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-slate-900 mb-1">100%</div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-slate-900 mb-1">24/7</div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Support</div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Our Expertise</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-slate-900">Systematic & Professional</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-blue-100" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Zap size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Electrical Projects</h3>
                  <p className="text-slate-600 text-lg max-w-md">Complete electrical panels, high-grade cables, and full-scale project execution with safety first.</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group text-white">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl -mr-10 -mb-10 transition-all group-hover:bg-cyan-500/30" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-500/30">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold mb-3">Security Systems</h3>
                  <p className="text-slate-400">State-of-the-art CCTV and Fire Alarm installations.</p>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-3xl -ml-10 -mt-10 transition-all group-hover:bg-purple-100" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <Network size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Networking</h3>
                  <p className="text-slate-600">LAN and Fiber Optics.</p>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border border-blue-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <PhoneCall size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Telecom Solutions</h3>
                  <p className="text-slate-600 text-lg max-w-md">Modern telephone system installation and reliable maintenance services.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Testimonials</h2>
              <h3 className="text-4xl font-display font-bold text-slate-900">What Our Clients Say</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <motion.div 
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative"
                >
                  <div className="flex gap-1 mb-6 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < testimonial.rating ? "currentColor" : "none"} className={i >= testimonial.rating ? "text-slate-300" : ""} />
                    ))}
                  </div>
                  <p className="text-slate-700 text-lg mb-8 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.author}</p>
                    {testimonial.role && <p className="text-sm text-slate-500">{testimonial.role}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-24 bg-slate-50 border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">FAQ</h2>
              <h3 className="text-4xl font-display font-bold text-slate-900">Frequently Asked Questions</h3>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div 
                  key={faq.id} 
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-blue-300"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
                  >
                    <span className="font-semibold text-slate-900 pr-8">{faq.question}</span>
                    <span className="text-blue-600 shrink-0">
                      {openFaq === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-blue-600">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-400/30 rounded-full blur-[100px] -mr-96 -mt-96 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Ready to upgrade your infrastructure?</h2>
          <p className="text-xl text-blue-100 mb-10 font-light">
            Get in touch with our team today for a consultation and quote. We respond quickly and professionally.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {settings.phoneNumber && (
              <a
                href={`tel:${settings.phoneNumber}`}
                className="flex items-center justify-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all shadow-xl shadow-black/10"
              >
                <PhoneCall size={24} />
                Call {settings.phoneNumber}
              </a>
            )}
            
            {settings.lineId && (
              <a
                href={`https://line.me/ti/p/~${settings.lineId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#00B900] text-white px-8 py-4 rounded-full font-bold hover:bg-[#009900] transition-all shadow-xl shadow-[#00B900]/20"
              >
                <MessageCircle size={24} />
                LINE: {settings.lineId}
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
