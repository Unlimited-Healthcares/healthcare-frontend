import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { SPECIALIZATIONS } from "@/types/discovery";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecialtyUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSpecialty?: string;
    role: string;
}

const ALLIED_SPECIALIZATIONS = [
    'Art Therapist',
    'Athletic Trainer / Sports Therapist',
    'Audiologist',
    'Biomedical Scientist / Medical Laboratory Scientist',
    'Cardiovascular Technologist / Cardiac Sonographer',
    'Chiropractor',
    'Clinical Laboratory Technologist / Technician',
    'Cytotechnologist / Cytogenetic Technologist',
    'Dietitian / Nutritionist',
    'Dramatherapist',
    'Exercise Physiologist',
    'Massage Therapist',
    'Medical Laboratory Professional (Microbiologist, Immunologist, etc.)',
    'Medical Radiation Scientist / Radiographer (Diagnostic Imaging)',
    'Medical Sonographer',
    'Music Therapist',
    'Occupational Therapist',
    'Optometrist',
    'Orthotist and Prosthetist',
    'Osteopath',
    'Paramedic / Emergency Medical Technician (EMT)',
    'Pharmacist Technician',
    'Pharmacist',
    'Physiotherapist / Physical Therapist',
    'Podiatrist',
    'Public Health / Environmental Health Inspector',
    'Radiation Therapist',
    'Radiographer / Medical Imaging Technologist',
    'Rehabilitation Technician',
    'Respiratory Therapist',
    'Social Worker',
    'Speech and Language Therapist (Speech‑Language Pathologist)',
    'Anesthesia Technician / Anesthesiologist Assistant',
    'Anesthetic Technologist',
    'Blood‑Bank Technologist',
    'Cardiology / Vascular / Pulmonary Technologist',
    'Counseling / Behavioral Health Counselor',
    'Dental Hygienist',
    'Dental Assistant',
    'Dental Technician',
    'Dialysis / Renal Technologist',
    'Endoscopy Technologist',
    'Forensic / Medico‑Legal Laboratory Technologist',
    'Health‑Information / Medical‑Record Technician',
    'Genetic Counselor',
    'Lactation Consultant',
    'Medical Assistant',
    'Medical Dosimetrist',
    'Medical Physicist',
    'Medical Secretary / Administrative Health Staff',
    'Medical Transcriptionist',
    'Mental Health Counselor / Behavioral‑Health Counselor',
    'Operating Department Practitioner / Surgical Technologist',
    'Physician Assistant / Physician Associate',
    'Sanitary / Infection‑Control Inspector',
    'Surgical and Anesthesia‑Related Technologist',
    'Urology / Renal Technologist',
    'Nurse',
    'Fitness Therapist',
    'Others'
];

const DOCTOR_SPECIALIZATIONS = SPECIALIZATIONS.filter(s =>
    !['Nursing', 'Maternity Care', 'Specialist Nurse', 'Biotechnology', 'Biotech Engineer', 'Biotech Engineering', 'Fitness Therapist', ...ALLIED_SPECIALIZATIONS].includes(s)
);

const NURSE_SPECIALIZATIONS = ['Nursing', 'Maternity Care', 'Specialist Nurse'];
const BIOTECH_SPECIALIZATIONS = ['Biotechnology', 'Biotech Engineer', 'Biotech Engineering'];

export function SpecialtyUpdateModal({
    isOpen,
    onClose,
    currentSpecialty,
    role,
}: SpecialtyUpdateModalProps) {
    const { profile, updateUserProfile } = useAuth();
    const [specialty, setSpecialty] = useState(currentSpecialty || "");
    const [isManual, setIsManual] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isNurse = role === 'nurse';
    const isBiotech = role === 'biotech_engineer';
    const isAllied = role === 'allied_practitioner';

    const relevantList = isBiotech ? BIOTECH_SPECIALIZATIONS :
        isNurse ? NURSE_SPECIALIZATIONS :
            isAllied ? ALLIED_SPECIALIZATIONS :
                DOCTOR_SPECIALIZATIONS;

    useEffect(() => {
        if (isOpen) {
            setSpecialty(currentSpecialty || "");
            setIsManual(currentSpecialty ? !(relevantList as any[]).includes(currentSpecialty) : false);
        }
    }, [isOpen, currentSpecialty, relevantList]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateUserProfile({
                specialization: specialty.trim() || undefined,
            } as any);
            toast.success("Specialty updated successfully!");
            onClose();
        } catch (error) {
            console.error("Failed to update specialty:", error);
            toast.error("Failed to update specialty");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Plus className="h-6 w-6 text-blue-600" />
                        Update Clinical Specialty
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">
                        Define your primary professional subspecialty for clinical discovery.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="specialty-select" className="text-blue-700 font-bold">Select Specialty</Label>
                        {!isManual ? (
                            <Select
                                value={(relevantList as any[]).includes(specialty) ? specialty : ""}
                                onValueChange={(v) => {
                                    if (v === "manual") {
                                        setIsManual(true);
                                        setSpecialty("");
                                    } else {
                                        setSpecialty(v);
                                    }
                                }}
                            >
                                <SelectTrigger id="specialty-select" className="rounded-xl border-gray-200 h-12 shadow-sm">
                                    <SelectValue placeholder="Choose a specialty..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl border-gray-100">
                                    {relevantList.map((s) => (
                                        <SelectItem key={s} value={s} className="rounded-lg py-2.5">
                                            {s}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="manual" className="rounded-lg py-2.5 font-bold text-blue-600">
                                        + Type it manually
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <Input
                                    autoFocus
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    placeholder="Enter your specialty manually..."
                                    className="rounded-xl border-blue-200 h-12 shadow-sm focus:ring-blue-500"
                                />
                                <Button
                                    variant="link"
                                    onClick={() => setIsManual(false)}
                                    className="text-[10px] text-blue-600 font-bold uppercase p-0 h-auto mt-2"
                                >
                                    Return to list
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} className="rounded-xl h-11 px-6 font-bold flex-1 sm:flex-none">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-xl h-11 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 flex-1 sm:flex-none"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Save Specialty"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
