import React, { useState, useEffect } from 'react';
import { 
    X, 
    Search, 
    Bell, 
    User, 
    AlertCircle,
    Info,
    ChevronRight,
    SearchCheck
} from 'lucide-react';
import { BloodDonor, BloodDonationRequest } from '../../types/blood-donation';
import bloodDonationService from '../../services/bloodDonationService';

interface DonorMatchingModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: BloodDonationRequest;
    onNotify: (donorId: string) => void;
}

const DonorMatchingModal: React.FC<DonorMatchingModalProps> = ({ 
    isOpen, 
    onClose, 
    request,
    onNotify
}) => {
    const [matches, setMatches] = useState<BloodDonor[]>([]);
    const [loading, setLoading] = useState(false);
    const [notifying, setNotifying] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadMatches();
        }
    }, [isOpen, request]);

    const loadMatches = async () => {
        setLoading(true);
        try {
            // Fetch eligible donors of the same blood type
            const response = await bloodDonationService.getEligibleDonors(request.bloodType);
            setMatches(response.data || []);
        } catch (error) {
            console.error('Error loading matches:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleNotify = async (donorId: string) => {
        setNotifying(donorId);
        try {
            await onNotify(donorId);
        } finally {
            setNotifying(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <SearchCheck className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Smart Match Explorer</h2>
                            <p className="text-slate-400 font-medium text-sm">Finding compatible donors for {request.bloodType}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider">Urgent: {request.priority}</span>
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                            <Info className="w-3 h-3 text-slate-400" />
                            <span className="text-xs font-bold uppercase tracking-wider">{request.unitsNeeded} Units Needed</span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Potential Candidates</h3>
                        <span className="text-xs font-bold text-slate-400 uppercase">{matches.length} Matches Found</span>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-4">
                                <Search className="h-10 w-10 animate-bounce" />
                                <p className="font-bold">Analyzing donor database...</p>
                            </div>
                        ) : matches.length > 0 ? (
                            matches.map(donor => (
                                <div 
                                    key={donor.id}
                                    className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 hover:bg-white transition-all shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">#{donor.donorNumber}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">Compatible: {donor.bloodType}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">• 4.8★ Reliability</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleNotify(donor.id)}
                                        disabled={notifying === donor.id}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                                            notifying === donor.id 
                                            ? 'bg-slate-200 text-slate-400' 
                                            : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 group-hover:shadow-lg'
                                        }`}
                                    >
                                        {notifying === donor.id ? 'Sending...' : (
                                            <>
                                                <Bell className="h-4 w-4" />
                                                Notify
                                                <ChevronRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto">
                                    <AlertCircle className="h-8 w-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500 font-medium">No active eligible donors found for this type.</p>
                                <button className="text-blue-600 font-bold text-sm hover:underline">Broadcast to All Types</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400 max-w-[280px]">Matching is based on ABO compatibility and donor eligibility status.</p>
                    <button 
                        onClick={onClose}
                        className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DonorMatchingModal;
