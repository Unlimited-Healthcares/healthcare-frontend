import React, { useState } from 'react';
import { 
    X, 
    ShieldCheck, 
    FileCheck, 
    Thermometer, 
    Activity, 
    CheckCircle2, 
    AlertCircle,
    UserCheck
} from 'lucide-react';
import { BloodDonor } from '../../types/blood-donation';

interface DonorVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    donor: BloodDonor;
    onVerify: (verificationData: any) => void;
}

const DonorVerificationModal: React.FC<DonorVerificationModalProps> = ({ 
    isOpen, 
    onClose, 
    donor, 
    onVerify 
}) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        identityVerified: false,
        tempCelsius: '',
        bloodPressure: '',
        hemoglobinLevel: '',
        pulseRate: '',
        weightVerified: false,
        healthStatementSigned: false,
        staffNotes: ''
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

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};
        
        if (currentStep === 1) {
            if (!formData.identityVerified) newErrors.identityVerified = 'Identity must be verified';
            if (!formData.weightVerified) newErrors.weightVerified = 'Weight must be verified';
        } else if (currentStep === 2) {
            if (!formData.tempCelsius) newErrors.tempCelsius = 'Temperature is required';
            if (!formData.bloodPressure) newErrors.bloodPressure = 'Blood pressure is required';
            if (!formData.hemoglobinLevel) newErrors.hemoglobinLevel = 'Hemoglobin level is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(step)) return;
        if (!formData.healthStatementSigned) {
            setErrors({ healthStatementSigned: 'Donor must sign the statement' });
            return;
        }

        setIsSubmitting(true);
        try {
            await onVerify(formData);
            onClose();
        } catch (error) {
            console.error('Verification error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Donor Verification</h2>
                            <p className="text-slate-400 font-medium text-sm">Case #{donor.donorNumber} • {donor.bloodType}</p>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex gap-2 mt-8">
                        {[1, 2, 3].map(i => (
                            <div 
                                key={i} 
                                className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                                    step >= i ? 'bg-emerald-400' : 'bg-slate-700'
                                }`} 
                            />
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-emerald-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <FileCheck className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Identity Check</h4>
                                        <p className="text-xs text-slate-500">Verify government-issued ID matches donor profile.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleInputChange('identityVerified', !formData.identityVerified)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${formData.identityVerified ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.identityVerified ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-emerald-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <Activity className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Physical Assessment</h4>
                                        <p className="text-xs text-slate-500">Verify weight ({donor.weightKg || 'N/A'}kg) and overall appearance.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleInputChange('weightVerified', !formData.weightVerified)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${formData.weightVerified ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.weightVerified ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            
                            {errors.identityVerified && (
                                <div className="p-4 bg-rose-50 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.identityVerified}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 px-1">Temp (°C)</label>
                                <div className="relative">
                                    <Thermometer className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        placeholder="36.5"
                                        value={formData.tempCelsius}
                                        onChange={(e) => handleInputChange('tempCelsius', e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-bold focus:ring-2 focus:ring-slate-900" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 px-1">BP (mmHg)</label>
                                <div className="relative">
                                    <Activity className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                                    <input 
                                        placeholder="120/80"
                                        value={formData.bloodPressure}
                                        onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-bold focus:ring-2 focus:ring-slate-900" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 px-1">Hb Level (g/dL)</label>
                                <input 
                                    placeholder="13.5"
                                    value={formData.hemoglobinLevel}
                                    onChange={(e) => handleInputChange('hemoglobinLevel', e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-slate-900" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 px-1">Pulse (bpm)</label>
                                <input 
                                    placeholder="72"
                                    value={formData.pulseRate}
                                    onChange={(e) => handleInputChange('pulseRate', e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-slate-900" 
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                                <div className="flex gap-4">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600 mt-1" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-emerald-900">Health Declaration</h4>
                                        <p className="text-sm text-emerald-700 leading-relaxed mt-1">
                                            The donor has verbally confirmed they meet all secondary eligibility criteria and have signed the consent form for the current session.
                                        </p>
                                        <label className="flex items-center gap-3 mt-4 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.healthStatementSigned}
                                                onChange={(e) => handleInputChange('healthStatementSigned', e.target.checked)}
                                                className="w-5 h-5 rounded-lg border-emerald-300 text-emerald-600 focus:ring-emerald-500" 
                                            />
                                            <span className="text-sm font-bold text-emerald-900">Donor has signed declaration</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 px-1">Medical Staff Notes</label>
                                <textarea 
                                    placeholder="Add any internal remarks..."
                                    value={formData.staffNotes}
                                    onChange={(e) => handleInputChange('staffNotes', e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 h-24 focus:ring-2 focus:ring-slate-900" 
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                    <button 
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="text-slate-500 font-bold hover:text-slate-900 transition-colors"
                    >
                        {step > 1 ? 'Go Back' : 'Cancel'}
                    </button>
                    
                    {step < 3 ? (
                        <button 
                            onClick={handleNext}
                            className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg"
                        >
                            Continue
                            <Activity className="h-4 w-4" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processing...' : 'Complete Verification'}
                            <UserCheck className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonorVerificationModal;
