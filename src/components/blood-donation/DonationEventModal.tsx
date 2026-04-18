import React, { useState } from 'react';
import { 
    X, 
    Droplets, 
    User, 
    Activity, 
    Calendar, 
    CheckCircle2, 
    AlertCircle,
    Save
} from 'lucide-react';
import { BloodDonor, BloodDonationRequest } from '../../types/blood-donation';

interface DonationEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    donors: BloodDonor[];
    requests?: BloodDonationRequest[];
    onSubmit: (donationData: any) => void;
    centerId?: string;
}

const DonationEventModal: React.FC<DonationEventModalProps> = ({ 
    isOpen, 
    onClose, 
    donors, 
    requests = [],
    onSubmit,
    centerId 
}) => {
    const [formData, setFormData] = useState({
        donorId: '',
        requestId: '',
        units: 1,
        bloodPressure: '',
        hemoglobin: '',
        temp: '36.5',
        donationType: 'whole_blood',
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.donorId) newErrors.donorId = 'Donor selection is required';
        if (!formData.units || formData.units < 1) newErrors.units = 'Valid units required';
        if (!formData.bloodPressure) newErrors.bloodPressure = 'BP reading is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                centerId,
                donationDate: new Date().toISOString()
            });
            onClose();
        } catch (error) {
            console.error('Donation recording error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedDonor = donors.find(d => d.id === formData.donorId);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-rose-700 p-8 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 text-white/60 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Droplets className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Record Donation Event</h2>
                            <p className="text-white/80 font-medium text-sm">Capture session details and vitals</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Donor Selection */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 px-1">Select Donor</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                                    <select 
                                        value={formData.donorId}
                                        onChange={(e) => handleInputChange('donorId', e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-bold focus:ring-2 focus:ring-red-500 appearance-none"
                                    >
                                        <option value="">Choose a donor...</option>
                                        {donors.map(donor => (
                                            <option key={donor.id} value={donor.id}>
                                                {donor.donorNumber} - {donor.bloodType}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.donorId && <p className="text-rose-500 text-xs font-bold px-1">{errors.donorId}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 px-1">Link to Request (Optional)</label>
                                <div className="relative">
                                    <Activity className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                                    <select 
                                        value={formData.requestId}
                                        onChange={(e) => handleInputChange('requestId', e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-bold focus:ring-2 focus:ring-red-500 appearance-none"
                                    >
                                        <option value="">Direct Donation</option>
                                        {requests.filter(r => r.status === 'approved').map(req => (
                                            <option key={req.id} value={req.id}>
                                                {req.requestNumber} ({req.bloodType})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {selectedDonor && (
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Status Validated</p>
                                        <p className="text-sm font-bold text-emerald-800">Donor is eligible for {selectedDonor.bloodType} donation</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Next Eligibility</p>
                                    <p className="text-sm font-black text-emerald-800">Ready Now</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    {/* Vitals & Details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400 px-1">Units (ml/bags)</label>
                            <input 
                                type="number" 
                                value={formData.units}
                                onChange={(e) => handleInputChange('units', parseInt(e.target.value))}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-red-500" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400 px-1">BP (mmHg)</label>
                            <input 
                                placeholder="120/80"
                                value={formData.bloodPressure}
                                onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-red-500" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400 px-1">Hemoglobin (g/dL)</label>
                            <input 
                                placeholder="14.2"
                                value={formData.hemoglobin}
                                onChange={(e) => handleInputChange('hemoglobin', e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-red-500" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-400 px-1">Staff Notes</label>
                        <textarea 
                            placeholder="Add session remarks..."
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 h-24 focus:ring-2 focus:ring-red-500" 
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                    <button 
                        onClick={onClose}
                        className="text-slate-500 font-bold hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Finalize Donation'}
                        <Save className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DonationEventModal;
