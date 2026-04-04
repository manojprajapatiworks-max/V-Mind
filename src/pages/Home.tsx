import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Network, PhoneCall, MessageCircle, Star, ChevronDown, ChevronUp, BarChart3, Info, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";
import { useLanguage } from "../contexts/LanguageContext";
import { getHeroBackground } from "../constants/heroBackgrounds";

const iconMap: Record<string, any> = {
  Zap, ShieldCheck, Network, PhoneCall, MessageCircle, Star, ChevronDown, ChevronUp, BarChart3, Info, Globe, Shield: ShieldCheck, Flash: Zap
};

export default function Home() {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<any>({});
  const [hero, setHero] = useState<any>({});
  const [stats, setStats] = useState<any>({
    yearsExp: 10, projects: 500, satisfaction: 100, support: "24/7"
  });
  const [services, setServices] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [whyUs, setWhyUs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (doc) => {
      if (doc.exists()) setSettings(doc.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, "settings/global"));

    const unsubHero = onSnapshot(doc(db, "settings", "hero"), (doc) => {
      if (doc.exists()) setHero(doc.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, "settings/hero"));

    const unsubStats = onSnapshot(doc(db, "settings", "stats"), (doc) => {
      if (doc.exists()) setStats(doc.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, "settings/stats"));

    const qServices = query(collection(db, "services"), orderBy("order", "asc"), limit(6));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "services"));

    const qGallery = query(collection(db, "gallery"), orderBy("order", "asc"), limit(6));
    const unsubGallery = onSnapshot(qGallery, (snapshot) => {
      setGallery(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "gallery"));

    const qWhyUs = query(collection(db, "why_us"), orderBy("order", "asc"));
    const unsubWhyUs = onSnapshot(qWhyUs, (snapshot) => {
      setWhyUs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "why_us"));

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
      unsubHero();
      unsubStats();
      unsubServices();
      unsubGallery();
      unsubWhyUs();
      unsubTestimonials();
      unsubFaqs();
    };
  }, []);

  const defaultHeroTitle = language === 'en' ? "Empowering Your Infrastructure" : "เสริมสร้างโครงสร้างพื้นฐานของคุณ";
  const defaultHeroSubtitle = language === 'en' 
    ? "Professional solutions for electrical cables, panels, fire alarms, CCTV, LAN, fiber optics, and telephone systems."
    : "โซลูชันระดับมืออาชีพสำหรับสายไฟฟ้า แผงควบคุม สัญญาณเตือนไฟไหม้ CCTV LAN ไฟเบอร์ออปติก และระบบโทรศัพท์";

  const heroTitle = language === 'en' ? (hero.title_en || settings.heroTitle || defaultHeroTitle) : (hero.title_th || defaultHeroTitle);
  const heroSubtitle = language === 'en' ? (hero.subtitle_en || settings.heroSubtitle || defaultHeroSubtitle) : (hero.subtitle_th || defaultHeroSubtitle);

  const heroBg = getHeroBackground(hero.backgroundId || "modern-slate");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className={`relative text-white overflow-hidden py-32 md:py-48 flex items-center justify-center min-h-[90vh] ${heroBg.className}`}>
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
              <span className="text-white">{heroTitle}</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              {heroSubtitle}
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
            <div className="text-4xl font-display font-bold text-slate-900 mb-1">{stats.yearsExp}+</div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Years Exp.</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-slate-900 mb-1">{stats.projects}+</div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-slate-900 mb-1">{stats.satisfaction}%</div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-slate-900 mb-1">{stats.support}</div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Support</div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features (Services) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">{t('services.subtitle')}</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-slate-900">{t('services.title')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => {
              const Icon = iconMap[service.iconName] || Zap;
              return (
                <motion.div 
                  key={service.id}
                  whileHover={{ y: -5 }} 
                  className={`bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group ${idx === 0 ? 'md:col-span-2' : ''}`}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-blue-100" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                      <Icon size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">
                        {language === 'en' ? (service.title_en || service.title) : (service.title_th || service.title_en || service.title)}
                      </h3>
                      <p className="text-slate-600 text-lg max-w-md">
                        {language === 'en' ? (service.description_en || service.description) : (service.description_th || service.description_en || service.description)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/services" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
              {language === 'en' ? "View All Services" : "ดูบริการทั้งหมด"} <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Project Gallery Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">
                {language === 'en' ? "Our Portfolio" : "ผลงานของเรา"}
              </h2>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-slate-900">
                {language === 'en' ? "Project Gallery" : "แกลเลอรีโครงการ"}
              </h3>
            </div>
            <Link to="/projects" className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition">
              {language === 'en' ? "View Projects" : "ดูโครงการ"}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {gallery.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title_en} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                  <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-2">{item.category}</p>
                  <h4 className="text-white text-2xl font-bold">
                    {language === 'en' ? item.title_en : (item.title_th || item.title_en)}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -ml-64 -mb-64" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">
              {language === 'en' ? "Why Us" : "ทำไมต้องเลือกเรา"}
            </h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold">
              {language === 'en' ? "Why Choose V Mind?" : "ทำไมต้องเลือก V Mind?"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUs.map((feature) => {
              const Icon = iconMap[feature.iconName] || Zap;
              return (
                <div key={feature.id} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
                  <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon size={28} />
                  </div>
                  <h4 className="text-xl font-bold mb-4">
                    {language === 'en' ? feature.title_en : (feature.title_th || feature.title_en)}
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    {language === 'en' ? feature.description_en : (feature.description_th || feature.description_en)}
                  </p>
                </div>
              );
            })}
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
                    <span className="font-semibold text-slate-900 pr-8">
                      {language === 'en' ? faq.question_en : (faq.question_th || faq.question_en)}
                    </span>
                    <span className="text-blue-600 shrink-0">
                      {openFaq === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                      {language === 'en' ? faq.answer_en : (faq.answer_th || faq.answer_en)}
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
