import React, { useState } from 'react';
import { X, User, Phone, Calendar, Heart, AlertCircle } from 'lucide-react';
import { CreateBloodDonorDto, BloodType } from '../../types/blood-donation';

interface RegisterDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBloodDonorDto) => void;
}

const RegisterDonorModal: React.FC<RegisterDonorModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateBloodDonorDto>({
    bloodType: BloodType.O_POSITIVE,
    weightKg: undefined,
    heightCm: undefined,
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: [],
    medications: [],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bloodTypes = Object.values(BloodType);

  const handleInputChange = (field: keyof CreateBloodDonorDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMedicalConditionAdd = () => {
    const condition = prompt('Enter medical condition:');
    if (condition && condition.trim()) {
      setFormData(prev => ({
        ...prev,
        medicalConditions: [...(prev.medicalConditions || []), condition.trim()]
      }));
    }
  };

  const handleMedicationAdd = () => {
    const medication = prompt('Enter medication:');
    if (medication && medication.trim()) {
      setFormData(prev => ({
        ...prev,
        medications: [...(prev.medications || []), medication.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'medicalConditions' | 'medications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bloodType) {
      newErrors.bloodType = 'Blood type is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 16 || age > 65) {
        newErrors.dateOfBirth = 'Age must be between 16 and 65 years';
      }
    }

    if (formData.weightKg && (formData.weightKg < 40 || formData.weightKg > 200)) {
      newErrors.weightKg = 'Weight must be between 40-200 kg';
    }

    if (formData.heightCm && (formData.heightCm < 120 || formData.heightCm > 250)) {
      newErrors.heightCm = 'Height must be between 120-250 cm';
    }

    if (formData.emergencyContactPhone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.emergencyContactPhone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.emergencyContactPhone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        bloodType: BloodType.O_POSITIVE,
        weightKg: undefined,
        heightCm: undefined,
        dateOfBirth: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        medicalConditions: [],
        medications: [],
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 md:p-6">
      <div className="bg-white rounded-[40px] md:rounded-[60px] shadow-premium max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-10 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-[24px] md:rounded-[32px] shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-red-500 relative z-10" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Register Donor</h2>
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Onboarding Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-inner"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-4 custom-scrollbar">
          <form id="donor-form" onSubmit={handleSubmit} className="space-y-8 pb-4">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Vitals & Parameters</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Blood Type Node</label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => handleInputChange('bloodType', e.target.value as BloodType)}
                    className={`w-full h-14 md:h-16 px-6 bg-slate-50 border-none rounded-2xl md:rounded-[24px] font-black text-slate-900 shadow-inner focus:ring-4 focus:ring-red-500/10 transition-all appearance-none cursor-pointer ${errors.bloodType ? 'ring-2 ring-red-500' : ''
                      }`}
                  >
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.bloodType && (
                    <p className="px-2 text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">{errors.bloodType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Temporal Origin (DOB)</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={`w-full h-14 md:h-16 pl-14 pr-6 bg-slate-50 border-none rounded-2xl md:rounded-[24px] font-black text-slate-900 shadow-inner focus:ring-4 focus:ring-red-500/10 transition-all ${errors.dateOfBirth ? 'ring-2 ring-red-500' : ''
                        }`}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="px-2 text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Mass (kg)</label>
                  <input
                    type="number"
                    value={formData.weightKg || ''}
                    onChange={(e) => handleInputChange('weightKg', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-14 md:h-16 px-6 bg-slate-50 border-none rounded-2xl md:rounded-[24px] font-black text-slate-900 shadow-inner focus:ring-4 focus:ring-red-500/10"
                    placeholder="70.5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Stature (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm || ''}
                    onChange={(e) => handleInputChange('heightCm', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-14 md:h-16 px-6 bg-slate-50 border-none rounded-2xl md:rounded-[24px] font-black text-slate-900 shadow-inner focus:ring-4 focus:ring-red-500/10"
                    placeholder="175"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Emergency Uplink</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Contact Name</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.emergencyContactName || ''}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      className="w-full h-14 md:h-16 pl-14 pr-6 bg-slate-50 border-none rounded-2xl md:rounded-[24px] font-black text-slate-900 shadow-inner"
                      placeholder="Jane Smith"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Emergency Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone || ''}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      className={`w-full h-14 md:h-16 pl-14 pr-6 bg-slate-50 border-none rounded-2xl md:rounded-[24px] font-black text-slate-900 shadow-inner ${errors.emergencyContactPhone ? 'ring-2 ring-red-500' : ''
                        }`}
                      placeholder="+1-555-0123"
                    />
                  </div>
                  {errors.emergencyContactPhone && (
                    <p className="px-2 text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">{errors.emergencyContactPhone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Clinical Anomalies</label>
                <div className="flex flex-wrap gap-2">
                  {(formData.medicalConditions || []).map((condition, index) => (
                    <div key={index} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                      <span>{condition}</span>
                      <button type="button" onClick={() => removeArrayItem('medicalConditions', index)} className="hover:text-red-800 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleMedicalConditionAdd}
                    className="px-4 py-2 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-inner"
                  >
                    + Append Info
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Current Regimen</label>
                <div className="flex flex-wrap gap-2">
                  {(formData.medications || []).map((medication, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      <span>{medication}</span>
                      <button type="button" onClick={() => removeArrayItem('medications', index)} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleMedicationAdd}
                    className="px-4 py-2 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-inner"
                  >
                    + Log Spec
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Clinical Observations</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full p-6 bg-slate-50 border-none rounded-2xl md:rounded-[32px] font-medium italic text-slate-600 shadow-inner focus:ring-4 focus:ring-primary/10 transition-all min-h-[120px]"
                placeholder="Additional biological metadata..."
              />
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 md:p-10 bg-white border-t border-slate-50 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-16 md:h-20 px-8 rounded-2xl md:rounded-[24px] bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase text-[10px] md:text-xs tracking-widest transition-all"
          >
            Abort Protocol
          </button>
          <button
            form="donor-form"
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] h-16 md:h-20 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 text-white rounded-2xl md:rounded-[24px] font-black uppercase text-[10px] md:text-xs tracking-widest shadow-premium transition-all relative overflow-hidden"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Synchronizing...
              </span>
            ) : (
              'Finalize Donor Registry'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterDonorModal;
