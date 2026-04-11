import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";
import { useLanguage } from "../contexts/LanguageContext";
import { getDirectImageUrl } from "../lib/utils";

export default function Projects() {
  const { language } = useLanguage();
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setGallery(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "gallery");
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">
            {language === 'en' ? "Our Project Gallery" : "แกลเลอรีโครงการของเรา"}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {language === 'en' 
              ? "Explore our portfolio of successful infrastructure projects across various industries."
              : "สำรวจผลงานโครงการโครงสร้างพื้นฐานที่ประสบความสำเร็จของเราในอุตสาหกรรมต่างๆ"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {gallery.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg bg-white"
            >
              <img 
                src={getDirectImageUrl(item.imageUrl)} 
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

        {gallery.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500">
              {language === 'en' ? "No projects found in the gallery." : "ไม่พบโครงการในแกลเลอรี"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
