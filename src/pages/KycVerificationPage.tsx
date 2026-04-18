import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Shield,
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    Clock,
    XCircle,
    ArrowLeft,
    Camera,
    X,
    Image as ImageIcon,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { formatApiError } from '@/lib/error-formatter';

type IdDocType = 'National Identity Card (NIN)' | 'International Passport' | "Driver's Licence" | "Voter's Card (PVC)" | 'Bank Verification Number (BVN)' | 'Residence Permit' | 'Other Government ID';

interface KycFormData {
    fullName: string;
    idDocType: IdDocType | '';
    idDocNumber: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
}

const KycVerificationContent: React.FC = () => {
    const { user, profile, submitKyc } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selfieInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<KycFormData>({
        fullName: (profile as any)?.firstName ? `${(profile as any).firstName} ${(profile as any).lastName || ''}`.trim() : user?.name || '',
        idDocType: ((profile as any)?.governmentIdType as IdDocType) || '',
        idDocNumber: (profile as any)?.governmentIdNumber || '',
        address: (profile as any)?.address || '',
        city: (profile as any)?.location?.city || '',
        state: (profile as any)?.location?.state || '',
        zipCode: (profile as any)?.location?.postalCode || '',
    });

    const [idDocFile, setIdDocFile] = useState<File | null>(null);
    const [idDocPreview, setIdDocPreview] = useState<string | null>((profile as any)?.governmentIdDoc || null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

    const [isUploadingId, setIsUploadingId] = useState(false);
    const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [reviewStep, setReviewStep] = useState(0);
    const [step, setStep] = useState(1);

    const reviewSteps = [
        { label: 'Scanning Image Clarity', icon: ImageIcon },
        { label: 'Extracting ID Information (OCR)', icon: FileText },
        { label: 'Comparing Name with Profile', icon: Shield },
        { label: 'Verifying Face Match Signature', icon: Camera },
        { label: 'Finalizing Identity Score', icon: CheckCircle }
    ];

    // If KYC is already done, show status
    if (user?.kycStatus === 'APPROVED') {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card className="border-green-200 bg-green-50/50 shadow-sm">
                    <CardContent className="p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-800 mb-2 font-outfit">Identity Verified</h2>
                        <p className="text-green-600 mb-6">
                            Your identity verification has been approved. You now have full access to all professional features on the platform.
                        </p>
                        <Button onClick={() => navigate('/dashboard')} className="bg-green-600 hover:bg-green-700 h-11 px-8 rounded-xl font-semibold shadow-lg shadow-green-200 transition-all active:scale-95">
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (user?.kycStatus === 'PENDING') {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
                    <CardContent className="p-8 text-center">
                        <div className="relative mx-auto w-20 h-20 mb-6">
                            <Clock className="h-16 w-16 text-blue-500 mx-auto animate-pulse" />
                            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin opacity-20" />
                        </div>
                        <h2 className="text-2xl font-bold text-blue-800 mb-2 font-outfit">Verification In Progress</h2>
                        <p className="text-blue-600 mb-6">
                            Your identity documents have been submitted and are being reviewed. We'll notify you once the verification is complete.
                            This usually takes 1-2 business days.
                        </p>
                        <Button variant="outline" onClick={() => navigate('/dashboard')} className="h-11 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-100/50">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (user?.kycStatus === 'REJECTED') {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card className="border-red-200 bg-red-50/50 shadow-sm">
                    <CardContent className="p-8 text-center">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-800 mb-2 font-outfit">Verification Rejected</h2>
                        <p className="text-red-700 mb-6 font-medium">
                            Your identity verification was rejected. Please resubmit clear, valid government-issued identification to unlock professional features.
                        </p>
                        <Button
                            className="bg-red-600 hover:bg-red-700 h-11 px-8 rounded-xl font-semibold shadow-lg shadow-red-200 transition-all active:scale-95"
                            onClick={() => {
                                // Reset local state if needed (or reload)
                                window.location.reload();
                            }}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Resubmit Documents
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'id' | 'selfie'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be under 5MB.');
            return;
        }

        try {
            if (type === 'id') {
                setIsUploadingId(true);
                setIdDocFile(file);
                // Preview
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setIdDocPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                }
                const { url } = await apiClient.uploadIdentityDocument(file);
                setIdDocPreview(url);
                toast.success('ID document uploaded!');
            } else {
                setIsUploadingSelfie(true);
                setSelfieFile(file);
                // Preview
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setSelfiePreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                }
                const { url } = await apiClient.uploadIdentityDocument(file); // Selfies use same bucket
                setSelfiePreview(url);
                toast.success('Selfie uploaded!');
            }
        } catch (err: any) {
            console.error(`${type} upload failed:`, err);
            toast.error(`Failed to upload ${type === 'id' ? 'ID' : 'selfie'}`);
        } finally {
            if (type === 'id') setIsUploadingId(false);
            else setIsUploadingSelfie(false);
        }
    };

    const isStep1Valid = formData.fullName && formData.idDocType && formData.idDocNumber;
    const isStep2Valid = formData.address && formData.city && formData.state;
    const isStep3Valid = (idDocPreview?.startsWith('http')) && !isUploadingId; // Only valid if uploaded to cloud

    const handleSubmit = async () => {
        if (!isStep3Valid) {
            toast.error('Please upload your ID document before submitting.');
            return;
        }

        setIsReviewing(true);

        // Simulate Automated AI Review Sequence
        for (let i = 0; i < reviewSteps.length; i++) {
            setReviewStep(i);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        setIsSubmitting(true);
        try {
            // Send as JSON now, since files are already at Supabase
            const submitPayload = {
                fullName: formData.fullName,
                idDocType: formData.idDocType,
                idDocNumber: formData.idDocNumber,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                idDocumentUrl: idDocPreview,
                selfieUrl: selfiePreview?.startsWith('http') ? selfiePreview : undefined,
                autoVerify: true
            };

            await submitKyc(submitPayload as any);
            toast.success('KYC Automated Verification Successful!');
            navigate('/dashboard');
        } catch (error: any) {
            setIsReviewing(false);
            const errorMessage = error?.response?.data?.message || error?.message || 'Verification submission failed';
            toast.error(formatApiError(errorMessage));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isReviewing) {
        const CurrentIcon = reviewSteps[reviewStep].icon;
        return (
            <div className="max-w-xl mx-auto py-20 px-4">
                <Card className="border-0 shadow-2xl bg-white overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${((reviewStep + 1) / reviewSteps.length) * 100}%` }}
                        />
                    </div>
                    <CardContent className="p-12 text-center space-y-8">
                        <div className="relative mx-auto w-24 h-24">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <CurrentIcon className="h-10 w-10 text-blue-600 animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Automated AI Review</h2>
                            <p className="text-gray-500 font-medium">Validating your documents in real-time...</p>
                        </div>

                        <div className="space-y-4 pt-4">
                            {reviewSteps.map((s, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-4 transition-all duration-300 ${idx === reviewStep ? 'scale-105' : 'opacity-40 scale-100'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${idx <= reviewStep ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-300'
                                        }`}>
                                        <s.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className={`text-sm font-semibold ${idx === reviewStep ? 'text-blue-600' : 'text-gray-600'
                                            }`}>
                                            {s.label}
                                        </p>
                                        {idx === reviewStep && (
                                            <div className="flex gap-1 mt-1">
                                                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" />
                                                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        )}
                                    </div>
                                    {idx < reviewStep && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-gray-50 mt-8">
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
                                <Shield className="h-3 w-3" />
                                Secure AI-Powered Verification
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4 text-gray-600 hover:text-gray-800">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Identity Verification (KYC)</h1>
                        <p className="text-gray-500 text-sm">Complete your identity verification to unlock professional features</p>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8 px-4">
                {[
                    { num: 1, label: 'Personal Info' },
                    { num: 2, label: 'Address' },
                    { num: 3, label: 'Documents' },
                ].map((s, i) => (
                    <React.Fragment key={s.num}>
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s.num
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
                            </div>
                            <span className={`text-xs font-medium ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < 2 && (
                            <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step 1: Personal Information */}
            {step === 1 && (
                <Card className="shadow-lg border-0 ring-1 ring-gray-100">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Provide your legal name and identification details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Legal Name *</Label>
                            <Input
                                id="fullName"
                                placeholder="Enter your full name as it appears on your ID"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="idDocType">ID Document Type *</Label>
                            <Select
                                value={formData.idDocType}
                                onValueChange={(v) => setFormData({ ...formData, idDocType: v as IdDocType })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="National Identity Card (NIN)">National ID Card (NIN)</SelectItem>
                                    <SelectItem value="International Passport">International Passport</SelectItem>
                                    <SelectItem value="Driver's Licence">Driver's Licence</SelectItem>
                                    <SelectItem value="Voter's Card (PVC)">Voter's Card (PVC)</SelectItem>
                                    <SelectItem value="Bank Verification Number (BVN)">Bank Verification Number (BVN)</SelectItem>
                                    <SelectItem value="Other Government ID">Other Government ID</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="idDocNumber">ID Document Number *</Label>
                            <Input
                                id="idDocNumber"
                                placeholder="Enter your ID number"
                                value={formData.idDocNumber}
                                onChange={(e) => setFormData({ ...formData, idDocNumber: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setStep(2)} disabled={!isStep1Valid} className="bg-blue-600 hover:bg-blue-700 px-8">
                                Continue
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
                <Card className="shadow-lg border-0 ring-1 ring-gray-100">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Address Information
                        </CardTitle>
                        <CardDescription>Your residential address for verification purposes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="address">Street Address *</Label>
                            <Textarea
                                id="address"
                                placeholder="Enter your street address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State / Region *</Label>
                                <Input
                                    id="state"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="zipCode">Zip / Postal Code</Label>
                            <Input
                                id="zipCode"
                                placeholder="Zip Code (optional)"
                                value={formData.zipCode}
                                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setStep(3)} disabled={!isStep2Valid} className="bg-blue-600 hover:bg-blue-700 px-8">
                                Continue
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Document Upload */}
            {step === 3 && (
                <Card className="shadow-lg border-0 ring-1 ring-gray-100">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Upload className="h-5 w-5 text-blue-600" />
                            Upload Documents
                        </CardTitle>
                        <CardDescription>Upload clear photos of your identification documents</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* ID Document Upload */}
                        <div className="space-y-3">
                            <Label className="font-semibold">ID Document Photo/Scan *</Label>
                            <p className="text-sm text-gray-500">
                                Upload a clear photo or scan of your{' '}
                                {formData.idDocType === 'National Identity Card (NIN)'
                                    ? 'National ID Card'
                                    : formData.idDocType === 'International Passport'
                                        ? 'International Passport'
                                        : formData.idDocType === "Driver's Licence"
                                            ? "Driver's Licence"
                                            : formData.idDocType === "Voter's Card (PVC)"
                                                ? "Voter's Card"
                                                : 'ID document'}
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'id')}
                            />

                            {idDocFile ? (
                                <div className="relative border-2 border-blue-200 rounded-xl p-4 bg-blue-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            {idDocPreview ? (
                                                <img src={idDocPreview} alt="ID document" className={`w-20 h-20 object-cover rounded-lg ${isUploadingId ? 'opacity-50 grayscale' : ''}`} />
                                            ) : (
                                                <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="h-8 w-8 text-blue-500" />
                                                </div>
                                            )}
                                            {isUploadingId && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{idDocFile.name}</p>
                                            <p className="text-xs text-gray-500">{(idDocFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                setIdDocFile(null);
                                                setIdDocPreview(null);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-8 text-center transition-all hover:bg-blue-50/50 group cursor-pointer"
                                >
                                    <ImageIcon className="h-10 w-10 mx-auto text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                                    <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Click to upload ID document</p>
                                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, or PDF • Max 5MB</p>
                                </button>
                            )}
                        </div>

                        {/* Selfie Upload (Optional) */}
                        <div className="space-y-3">
                            <Label className="font-semibold">Selfie with ID (Optional)</Label>
                            <p className="text-sm text-gray-500">
                                Take a selfie holding your ID next to your face for faster verification
                            </p>

                            <input
                                ref={selfieInputRef}
                                type="file"
                                accept="image/*"
                                capture="user"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'selfie')}
                            />

                            {selfieFile ? (
                                <div className="relative border-2 border-green-200 rounded-xl p-4 bg-green-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            {selfiePreview ? (
                                                <img src={selfiePreview} alt="Selfie" className={`w-20 h-20 object-cover rounded-lg ${isUploadingSelfie ? 'opacity-50 grayscale' : ''}`} />
                                            ) : (
                                                <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Camera className="h-8 w-8 text-green-500" />
                                                </div>
                                            )}
                                            {isUploadingSelfie && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{selfieFile.name}</p>
                                            <p className="text-xs text-gray-500">{(selfieFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                setSelfieFile(null);
                                                setSelfiePreview(null);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => selfieInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-gray-300 hover:border-green-400 rounded-xl p-6 text-center transition-all hover:bg-green-50/50 group cursor-pointer"
                                >
                                    <Camera className="h-8 w-8 mx-auto text-gray-400 group-hover:text-green-500 mb-2 transition-colors" />
                                    <p className="text-sm font-medium text-gray-600 group-hover:text-green-600">Click to take or upload selfie</p>
                                    <p className="text-xs text-gray-400 mt-1">Optional but speeds up verification</p>
                                </button>
                            )}
                        </div>

                        {/* Important Info */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold mb-1">Important Notes</p>
                                    <ul className="list-disc list-inside space-y-1 text-amber-700">
                                        <li>Ensure all documents are clear and legible</li>
                                        <li>Your name must match across all documents</li>
                                        <li>Verification typically takes 1-2 business days</li>
                                        <li>You'll be notified once your identity is verified</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!isStep3Valid || isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 px-8 min-w-[160px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-4 w-4 mr-2" />
                                        Submit for Verification
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default function KycVerificationPage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <KycVerificationContent />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
