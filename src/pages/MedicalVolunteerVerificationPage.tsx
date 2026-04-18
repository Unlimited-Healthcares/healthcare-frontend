import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ShieldCheck,
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/services/apiClient'; // Use apiClient for better consistency
import { toast } from 'sonner';
import { SPECIALIZATIONS } from '@/types/discovery';



const ROLES = [
    { value: 'doctor', label: 'Medical Doctor' },
    { value: 'nurse', label: 'Registered Nurse' },
    { value: 'specialist', label: 'Medical Specialist' },
    { value: 'practitioner', label: 'Allied Health Practitioner' },
    { value: 'paramedic', label: 'Paramedic / Emergency Responder' }
];

const MedicalVolunteerVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [submissionStatus, setSubmissionStatus] = useState<any>(null);

    // Form states
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        professionalRole: user?.roles?.includes('doctor') ? 'doctor' : (user?.roles?.includes('nurse') ? 'nurse' : ''),
        specialization: user?.profile?.specialization || '',
        practiceNumber: user?.profile?.practiceNumber || '',
        country: user?.profile?.location?.country || '',
        professionalBody: '',
        verificationLink: '',
        issueDate: '',
        expiryDate: '',
    });

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await apiClient.get('/medical-volunteer/my-status');
                if (response.data.success) {
                    setSubmissionStatus(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch volunteer status:', error);
            } finally {
                setCheckingStatus(false);
            }
        };

        fetchStatus();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.professionalRole || !formData.specialization || !formData.practiceNumber || !formData.country || !formData.professionalBody || !formData.verificationLink) {
            toast.error('Please fill in all required fields including the verification link');
            return;
        }

        if (!file) {
            toast.error('Please upload your professional license document');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('license', file);
            data.append('professionalRole', formData.professionalRole);
            data.append('specialization', formData.specialization);
            data.append('practiceNumber', formData.practiceNumber);
            data.append('country', formData.country);
            data.append('professionalBody', formData.professionalBody);
            data.append('verificationLink', formData.verificationLink);
            data.append('issueDate', formData.issueDate);
            data.append('expiryDate', formData.expiryDate);

            await apiClient.post('/medical-volunteer/submit', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Verification request submitted successfully!');
            // Update local status to avoid re-fetch if possible
            setSubmissionStatus({ status: 'PENDING', submittedAt: new Date().toISOString() });
            if (refreshUser) await refreshUser();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit verification');
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </DashboardLayout>
        );
    }

    if (submissionStatus?.status === 'APPROVED') {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto py-12 px-4">
                    <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden text-center p-8">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4">Verification Complete!</h1>
                        <p className="text-slate-500 mb-8">
                            Your professional credentials have been verified. You can now offer your services as a medical volunteer.
                        </p>
                        <Button
                            onClick={() => navigate('/voluntary-service')}
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-14 px-10 font-black"
                        >
                            Explore Opportunities
                        </Button>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    if (submissionStatus?.status === 'PENDING') {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto py-12 px-4">
                    <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden text-center p-8">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-10 h-10 animate-spin" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4">Verification Pending</h1>
                        <p className="text-slate-500 mb-8">
                            We are currently reviewing your professional credentials. This typically takes 24-48 hours. We'll notify you once the process is complete.
                        </p>
                        <p className="text-xs text-slate-400 mb-8">
                            Submitted on: {new Date(submissionStatus.submittedAt).toLocaleDateString()}
                        </p>
                        <Button
                            onClick={() => navigate('/voluntary-service')}
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-14 px-10 font-black"
                        >
                            Return to Programs
                        </Button>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/voluntary-service')}
                    className="mb-6 hover:bg-slate-100 rounded-xl"
                >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Opportunities
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Professional Verification</h1>
                    <p className="text-slate-500 mt-2">Verify your medical credentials to join our healthcare volunteer network.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                            <CardHeader className="bg-slate-900 text-white p-8">
                                <CardTitle className="text-2xl font-black text-white">Credential Details</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Provide your official professional registration information.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                                Professional Role
                                            </Label>
                                            <Select
                                                value={formData.professionalRole}
                                                onValueChange={(val) => handleInputChange('professionalRole', val)}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROLES.map(role => (
                                                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                                Specialization
                                            </Label>
                                            <Select
                                                value={formData.specialization}
                                                onValueChange={(val) => handleInputChange('specialization', val)}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="Select specialization" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SPECIALIZATIONS.map(spec => (
                                                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="practiceNumber" className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                                License / Practice Number
                                            </Label>
                                            <Input
                                                id="practiceNumber"
                                                value={formData.practiceNumber}
                                                onChange={(e) => handleInputChange('practiceNumber', e.target.value)}
                                                placeholder="e.g. MDCN/12345/ABC"
                                                className="h-12 rounded-xl border-slate-200"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="country" className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                                Country of Practice
                                            </Label>
                                            <Input
                                                id="country"
                                                value={formData.country}
                                                onChange={(e) => handleInputChange('country', e.target.value)}
                                                placeholder="e.g. Nigeria"
                                                className="h-12 rounded-xl border-slate-200"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="professionalBody" className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                            Professional Regulatory Body
                                        </Label>
                                        <Input
                                            id="professionalBody"
                                            value={formData.professionalBody}
                                            onChange={(e) => handleInputChange('professionalBody', e.target.value)}
                                            placeholder="e.g. Medical and Dental Council of Nigeria"
                                            className="h-12 rounded-xl border-slate-200"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="verificationLink" className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                            Official Verification Link (MUST BE COMPLETED)
                                        </Label>
                                        <Input
                                            id="verificationLink"
                                            value={formData.verificationLink}
                                            onChange={(e) => handleInputChange('verificationLink', e.target.value)}
                                            placeholder="e.g. https://portal.mdcn.gov.ng/verify/MDCN12345"
                                            className="h-12 rounded-xl border-slate-200 ring-2 ring-blue-500/20"
                                            required
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium">Link to the official regulatory body portal where your license can be verified.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="issueDate" className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                                License Issuance Date
                                            </Label>
                                            <Input
                                                id="issueDate"
                                                type="date"
                                                value={formData.issueDate}
                                                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                                                className="h-12 rounded-xl border-slate-200"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="expiryDate" className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                                License Expiry Date
                                            </Label>
                                            <Input
                                                id="expiryDate"
                                                type="date"
                                                value={formData.expiryDate}
                                                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                                className="h-12 rounded-xl border-slate-200"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                            License Document (PDF or Image)
                                        </Label>
                                        <div
                                            className={`border-2 border-dashed rounded-2xl p-8 transition-colors text-center ${file ? 'border-green-400 bg-green-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'}`}
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                        >
                                            <input
                                                id="file-upload"
                                                type="file"
                                                accept=".pdf,image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                            {file ? (
                                                <div className="flex flex-col items-center">
                                                    <FileText className="w-12 h-12 text-green-500 mb-2" />
                                                    <span className="font-bold text-slate-900">{file.name}</span>
                                                    <span className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                    <Button variant="ghost" className="mt-4 text-xs font-bold text-red-500 hover:text-red-600 h-8" type="button">
                                                        Change File
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center cursor-pointer">
                                                    <Upload className="w-12 h-12 text-slate-300 mb-2" />
                                                    <span className="font-bold text-slate-900 leading-tight">Click to upload license</span>
                                                    <span className="text-xs text-slate-400 mt-1">Maximum file size: 5MB</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 rounded-2xl p-4 flex gap-4 border border-amber-100">
                                        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                                        <p className="text-sm text-amber-800 font-medium leading-relaxed">
                                            By submitting, you authorize our team to verify these credentials with the respective medical council.
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading || !file}
                                        className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-14 font-black text-lg shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit for Verification'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-none bg-blue-600 text-white rounded-[2rem] p-6 shadow-xl shadow-blue-200">
                            <ShieldCheck className="w-10 h-10 mb-4 opacity-80" />
                            <h3 className="text-xl font-black mb-2 leading-tight text-white">Why verify?</h3>
                            <ul className="space-y-3">
                                {[
                                    "Build trust with patients",
                                    "Join restricted groups",
                                    "Issue medical opinions",
                                    "Verify clinical reports"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm font-bold text-blue-100">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <h4 className="font-black text-slate-900 mb-2 text-sm uppercase tracking-wider">Verification Steps</h4>
                            <div className="space-y-4 text-slate-900">
                                {[
                                    { t: "Submission", d: "You upload your practice license." },
                                    { t: "Verification", d: "Our team checks the medical registry." },
                                    { t: "Approval", d: "You get the verified badge." }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-900 font-black text-xs">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{step.t}</p>
                                            <p className="text-xs text-slate-500 font-medium">{step.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MedicalVolunteerVerificationPage;
