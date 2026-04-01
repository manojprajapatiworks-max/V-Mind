import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Network, Cable, Server, Phone, Video, AlertTriangle } from "lucide-react";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";

const iconMap: Record<string, any> = {
  Zap, ShieldCheck, Network, Cable, Server, Phone, Video, AlertTriangle
};

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "services");
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const categories = Array.from(new Set(services.map(s => s.category)));

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="text-center mb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">What We Do</h2>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 tracking-tight mb-6">Our Services</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
              Comprehensive, professional solutions for electrical, security, and networking infrastructure. We deliver quality and reliability in every project.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-lg">No services listed yet.</p>
          </div>
        ) : (
          <div className="space-y-24">
            {categories.map((category, catIdx) => (
              <motion.div 
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-3xl font-display font-bold text-slate-900">{category}</h2>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {services.filter(s => s.category === category).map((service, idx) => {
                    const Icon = iconMap[service.iconName] || Zap;
                    // Alternating colors for cards based on index
                    const colorClasses = [
                      "from-blue-50 to-white border-blue-100 text-blue-600 shadow-blue-900/5",
                      "from-cyan-50 to-white border-cyan-100 text-cyan-600 shadow-cyan-900/5",
                      "from-purple-50 to-white border-purple-100 text-purple-600 shadow-purple-900/5",
                    ];
                    const colorClass = colorClasses[idx % colorClasses.length];
                    
                    return (
                      <motion.div
                        key={service.id}
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className={`bg-gradient-to-br ${colorClass} rounded-3xl p-8 border shadow-xl transition-all relative overflow-hidden group`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:scale-150" />
                        
                        <div className="relative z-10">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/50 group-hover:shadow-md transition-all">
                            <Icon size={32} strokeWidth={1.5} />
                          </div>
                          <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">{service.title}</h3>
                          <p className="text-slate-600 leading-relaxed text-lg">{service.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
