import React, { useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Search, FileText, Download, CheckCircle2, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";

export default function ClientPortal() {
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectFiles, setProjectFiles] = useState<Record<string, any[]>>({});
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      const q = query(collection(db, "projects"), where("customerId", "==", customerId.trim()));
      const snapshot = await getDocs(q);
      
      const foundProjects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProjects(foundProjects);
      
      // Fetch files for each project
      const filesMap: Record<string, any[]> = {};
      for (const proj of foundProjects) {
        const fq = query(collection(db, "project_files"), where("projectId", "==", proj.id));
        const fSnapshot = await getDocs(fq);
        filesMap[proj.id] = fSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      setProjectFiles(filesMap);
      
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "projects");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'In Review': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={18} />;
      case 'In Progress': return <Clock size={18} />;
      case 'In Review': return <AlertCircle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">Client Portal</h1>
          <p className="text-lg text-slate-600">Track your project progress and download reports.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Enter your Customer ID"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-70 whitespace-nowrap"
            >
              {loading ? "Searching..." : "Track Project"}
            </button>
          </form>
        </div>

        {searched && !loading && projects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 text-lg">No projects found for this Customer ID.</p>
          </div>
        )}

        {projects.length > 0 && (
          <div className="space-y-8">
            {projects.map((project) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{project.title}</h2>
                    <p className="text-slate-500 text-sm mt-1">Project ID: {project.id}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      {project.status}
                    </div>
                    {project.paymentStatus && (
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium ${project.paymentStatus === 'Paid' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : project.paymentStatus === 'Partial' ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                        Payment: {project.paymentStatus}
                      </div>
                    )}
                  </div>
                </div>

                {project.description && (
                  <p className="text-slate-600 mb-8">{project.description}</p>
                )}

                <div className="mb-8">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-700">Overall Progress</span>
                    <span className="text-blue-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-blue-600 h-full rounded-full"
                    />
                  </div>
                </div>

                {projectFiles[project.id] && projectFiles[project.id].length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-slate-400" />
                      Documents & Reports
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {projectFiles[project.id].map((file) => (
                        <a
                          key={file.id}
                          href={file.isExternalLink ? file.fileUrl : file.fileData}
                          download={!file.isExternalLink ? file.fileName : undefined}
                          target={file.isExternalLink ? "_blank" : undefined}
                          rel={file.isExternalLink ? "noopener noreferrer" : undefined}
                          className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                              {file.isExternalLink ? <ExternalLink size={20} /> : <FileText size={20} />}
                            </div>
                            <div className="truncate">
                              <p className="font-medium text-slate-900 truncate">{file.fileName}</p>
                              <p className="text-xs text-slate-500 uppercase">{file.isExternalLink ? 'External Link' : (file.fileType.split('/')[1] || 'FILE')}</p>
                            </div>
                          </div>
                          {file.isExternalLink ? (
                            <ExternalLink size={20} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                          ) : (
                            <Download size={20} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
