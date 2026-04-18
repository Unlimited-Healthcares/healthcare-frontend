import React from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Calendar,
  User,
  Tag,
  Share2,
  Download,
  Edit,
  MoreHorizontal,
  Shield,
  Clock,
  Image as ImageIcon,
  FileImage,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import { RecordCardProps } from '@/types/health-records';
import { motion } from 'framer-motion';

export const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onView,
  onEdit,
  onShare,
  onDownload
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
      case 'draft': return { color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
      case 'archived': return { color: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50' };
      default: return { color: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500/50 shadow-red-100';
      case 'high': return 'border-orange-500/50 shadow-orange-100';
      case 'normal': return 'border-blue-500/50 shadow-blue-100';
      case 'low': return 'border-slate-400/50 shadow-slate-100';
      default: return 'border-slate-200 shadow-slate-100';
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'imaging': return ImageIcon;
      case 'lab_result': return FileText;
      case 'prescription': return FileText;
      case 'consultation': return User;
      default: return FileText;
    }
  };

  const TypeIcon = getRecordTypeIcon(record.recordType);
  const status = getStatusConfig(record.status);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-[24px] border border-slate-100 shadow-soft hover:shadow-premium transition-all p-5 cursor-pointer relative overflow-hidden group ${getPriorityConfig(record.priority || 'normal')}`}
      onClick={() => onView(record.id)}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 ${record.categoryDetails?.color || 'bg-slate-100'} rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/20 blur-sm mix-blend-overlay" />
            <TypeIcon className="w-7 h-7 text-white relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${status.text} ${status.bg}`}>
                {record.status}
              </span>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                <Fingerprint className="w-3 h-3" /> {record.id.substring(0, 8)}
              </span>
            </div>
            <h3 className="font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{record.title}</h3>
          </div>
        </div>
        <button className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-slate-50/50 rounded-2xl p-4 mb-5 border border-slate-100/50 relative z-10">
        <p className="text-sm text-slate-600 line-clamp-2 font-medium leading-relaxed italic mb-4">"{record.description}"</p>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-300" />
            <span className="truncate">{record.patientName || 'Private Patient'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            <span>{format(new Date(record.recordDate || record.createdAt), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-secondary">{record.confidentialityLevel || 'PHI Restricted'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-300" />
            <span>v{record.version || '1.0'} REVISION</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 relative z-10">
        <div className="flex items-center -space-x-2">
          {[1, 2].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
              <div className="bg-slate-200 w-full h-full" />
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 text-[10px] font-black text-white flex items-center justify-center">
            +{record.sharedWith?.length || 0}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[
            { icon: Edit, action: onEdit, color: 'hover:bg-blue-50 hover:text-blue-600' },
            { icon: Share2, action: onShare, color: 'hover:bg-emerald-50 hover:text-emerald-600' },
            { icon: Download, action: onDownload, color: 'hover:bg-slate-900 hover:text-white' }
          ].map((btn, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); btn.action(record.id); }}
              className={`p-2.5 rounded-xl transition-all text-slate-400 ${btn.color}`}
            >
              <btn.icon className="w-4.5 h-4.5" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
