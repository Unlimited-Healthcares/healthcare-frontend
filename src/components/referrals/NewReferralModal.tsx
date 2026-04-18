import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';
import { Activity } from 'lucide-react';
import {
  CreateReferralDto,
  ReferralType,
  ReferralPriority,
  MedicationInfo,
  AllergyInfo
} from '../../services/referralService';
import { HealthcareCenter } from '@/types/healthcare-centers';
import { backendSearchService, PatientSearchResult } from '@/services/backendSearchService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ClipboardDocumentCheckIcon,
  BeakerIcon,
  UserCircleIcon,
  BuildingOffice2Icon,
  ExclamationCircleIcon,
  DocumentArrowDownIcon,
  FolderIcon,
  FolderPlusIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { healthcareCentersService } from '@/services/healthcareCentersService';
import { cn } from '@/lib/utils';

interface NewReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (referralData: CreateReferralDto) => void;
  loading?: boolean;
}

const NewReferralModal: React.FC<NewReferralModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const { profile } = useAuth();

  const [formData, setFormData] = useState<CreateReferralDto>({
    patientId: '',
    referringCenterId: '',
    receivingCenterId: '',
    receivingProviderId: '',
    referralType: ReferralType.SPECIALIST,
    priority: ReferralPriority.NORMAL,
    reason: '',
    clinicalNotes: '',
    diagnosis: '',
    instructions: '',
    scheduledDate: undefined,
    expirationDate: undefined,
    medications: [],
    allergies: [],
    medicalHistory: '',
    metadata: {
      vitals: {
        heartRate: '',
        bp: '',
        temp: '',
        spO2: '',
        respiratoryRate: ''
      }
    }
  });

  const [centers, setCenters] = useState<HealthcareCenter[]>([]);
  const [patients, setPatients] = useState<PatientSearchResult[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);

  const [medications, setMedications] = useState<MedicationInfo[]>([]);
  const [allergies, setAllergies] = useState<AllergyInfo[]>([]);
  const [newMedication, setNewMedication] = useState<MedicationInfo>({
    name: '',
    dosage: '',
    frequency: ''
  });
  const [newAllergy, setNewAllergy] = useState<AllergyInfo>({
    allergen: '',
    reaction: '',
    severity: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Load centers
      loadCenters();

      // Reset form when modal opens
      const initialCenterId = profile?.center_id || '';
      setFormData({
        patientId: '',
        referringCenterId: initialCenterId,
        receivingCenterId: '',
        receivingProviderId: '',
        referralType: ReferralType.SPECIALIST,
        priority: ReferralPriority.NORMAL,
        reason: '',
        clinicalNotes: '',
        diagnosis: '',
        instructions: '',
        scheduledDate: undefined,
        expirationDate: undefined,
        medications: [],
        allergies: [],
        medicalHistory: '',
        metadata: {
          vitals: {
            heartRate: '',
            bp: '',
            temp: '',
            spO2: '',
            respiratoryRate: ''
          }
        }
      });
      setMedications([]);
      setAllergies([]);
    }
  }, [isOpen, profile]);

  const loadCenters = async () => {
    try {
      const allCenters = await healthcareCentersService.getAllCenters();
      // Filter out the current center from receiving options if needed, but for now just show all
      setCenters(allCenters);
    } catch (error) {
      console.error('Error loading centers:', error);
    }
  };

  const handlePatientSearch = async (query: string) => {
    setPatientSearch(query);
    if (query.length < 3) {
      setPatients([]);
      return;
    }

    setIsSearchingPatients(true);
    try {
      const response = await backendSearchService.searchPatients({ query });
      setPatients(response.data);
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setIsSearchingPatients(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? new Date(value) : undefined
    }));
  };

  const addMedication = () => {
    if (newMedication.name && newMedication.dosage && newMedication.frequency) {
      setMedications(prev => [...prev, { ...newMedication }]);
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  };

  const removeMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const addAllergy = () => {
    if (newAllergy.allergen && newAllergy.reaction && newAllergy.severity) {
      setAllergies(prev => [...prev, { ...newAllergy }]);
      setNewAllergy({ allergen: '', reaction: '', severity: '' });
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      medications,
      allergies
    };
    onSubmit(submissionData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] p-0 border-0 flex flex-col overflow-hidden sm:rounded-[2rem] bg-white">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="shrink-0 bg-white px-6 pt-5 pb-4 sm:p-8 sm:pb-6 border-b border-slate-100 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Create Referral Card</h3>
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-1 uppercase tracking-widest">
                    <FolderPlusIcon className="h-3 w-3" /> Tangible Document Vault Archival Active
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 pb-32 custom-scrollbar">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Information */}
              <div className="space-y-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wider">
                  <UserCircleIcon className="h-4 w-4 text-indigo-600" /> Patient Selection
                </h4>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                    Patient (Search Registry)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircleIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500" />
                    </div>
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => handlePatientSearch(e.target.value)}
                      required={!formData.patientId}
                      className="block w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                      placeholder="Name, email or Patient ID..."
                    />
                    {isSearchingPatients && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}

                    {patients.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        {patients.map(patient => (
                          <div
                            key={patient.id}
                            className="px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between border-b last:border-0 border-slate-50"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, patientId: patient.id }));
                              setPatientSearch(patient.name);
                              setPatients([]);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">{patient.name}</span>
                              <span className="text-[10px] font-medium text-slate-500 uppercase">{patient.email}</span>
                            </div>
                            <div className="p-1 px-2.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-tight italic">Registry Match</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.patientId && (
                    <div className="mt-2 flex items-center gap-1.5 px-2 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] font-bold text-emerald-700 w-fit">
                      <ClipboardDocumentCheckIcon className="h-3.5 w-3.5" /> ID Verified: {formData.patientId}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                    Receiving Facility
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BuildingOffice2Icon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500" />
                    </div>
                    <select
                      name="receivingCenterId"
                      value={formData.receivingCenterId}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    >
                      <option value="" className="text-slate-400">Select clinical center</option>
                      {centers.map(center => (
                        <option key={center.id} value={center.id}>
                          {center.name} - ({center.type?.toUpperCase()})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <FolderIcon className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Receiving Provider ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="receivingProviderId"
                    value={formData.receivingProviderId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter receiving provider ID"
                  />
                </div>
              </div>

              {/* Referral Details */}
              <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wider">
                  <ExclamationCircleIcon className="h-4 w-4 text-orange-600" /> Referral Details
                </h4>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                    Priority Classification
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="block w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                  >
                    {Object.values(ReferralPriority).map(priority => (
                      <option key={priority} value={priority}>
                        {priority.toUpperCase()} ACTION REQUIRED
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                      Scheduled Date
                    </label>
                    <div className="relative">
                      <ExclamationCircleIcon className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="datetime-local"
                        name="scheduledDate"
                        value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().slice(0, 16) : ''}
                        onChange={handleDateChange}
                        className="block w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                      Expiration Date
                    </label>
                    <div className="relative">
                      <ExclamationCircleIcon className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="datetime-local"
                        name="expirationDate"
                        value={formData.expirationDate ? new Date(formData.expirationDate).toISOString().slice(0, 16) : ''}
                        onChange={handleDateChange}
                        className="block w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-indigo-600 rounded-2xl shadow-lg relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                    <DocumentArrowDownIcon className="h-24 w-24 text-white" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <FolderPlusIcon className="h-5 w-5 text-indigo-100" />
                      <span className="text-xs font-black text-white uppercase tracking-widest">Persistence Engine Active</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-indigo-50/70 font-bold">
                      Finalizing this form will trigger the automatic generation of a **verified medical referral PDF**. This tangible document will be permanently archived in your vault and the receiving facility's registry.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Information */}
            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <ClipboardDocumentCheckIcon className="h-5 w-5 text-slate-600" />
                </div>
                <h4 className="text-md font-black text-slate-800 uppercase tracking-widest">Clinical Diagnosis & Findings</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                      Reason for Referral Card *
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="block w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
                      placeholder="Detailed clinical reason for this referral..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                      Official Diagnosis
                    </label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      placeholder="Primary diagnosis code or name"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                    <Label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                      <Activity className="h-3 w-3 text-emerald-500" />
                      Patient Physiological Parameters
                    </Label>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-400 uppercase">Heart Rate</Label>
                        <input
                          type="text"
                          className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-100 rounded-lg focus:ring-1 focus:ring-emerald-500"
                          placeholder="e.g. 72 bpm"
                          value={(formData.metadata as any)?.vitals?.heartRate || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, metadata: { ...(prev.metadata as any), vitals: { ...(prev.metadata as any)?.vitals, heartRate: e.target.value } } }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-400 uppercase">Blood Pressure</Label>
                        <input
                          type="text"
                          className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-100 rounded-lg focus:ring-1 focus:ring-emerald-500"
                          placeholder="e.g. 120/80"
                          value={(formData.metadata as any)?.vitals?.bp || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, metadata: { ...(prev.metadata as any), vitals: { ...(prev.metadata as any)?.vitals, bp: e.target.value } } }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-400 uppercase">Temp</Label>
                        <input
                          type="text"
                          className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-100 rounded-lg focus:ring-1 focus:ring-emerald-500"
                          placeholder="e.g. 36.5C"
                          value={(formData.metadata as any)?.vitals?.temp || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, metadata: { ...(prev.metadata as any), vitals: { ...(prev.metadata as any)?.vitals, temp: e.target.value } } }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-400 uppercase">SpO2</Label>
                        <input
                          type="text"
                          className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-100 rounded-lg focus:ring-1 focus:ring-emerald-500"
                          placeholder="e.g. 98%"
                          value={(formData.metadata as any)?.vitals?.spO2 || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, metadata: { ...(prev.metadata as any), vitals: { ...(prev.metadata as any)?.vitals, spO2: e.target.value } } }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                      Instructional Directives
                    </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      placeholder="Specific instructions for the receiving lab/pharmacy/specialist..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                      Expanded Medical History
                    </label>
                    <textarea
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      rows={4}
                      className="block w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      placeholder="Relevant past medical history for context..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Medications section updated */}
              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-wider mb-5">
                  <BeakerIcon className="h-4 w-4 text-pink-600" /> Existing Prescriptions
                </h4>

                <div className="space-y-3 mb-4">
                  {medications.map((med, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group hover:border-pink-200 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{med.name}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{med.dosage} · {med.frequency}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="p-1 px-3 bg-pink-50 text-pink-600 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 bg-white p-4 rounded-2xl border border-dashed border-slate-300">
                  <input
                    type="text"
                    placeholder="Medication name..."
                    value={newMedication.name}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-1 focus:ring-pink-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-1 focus:ring-pink-500"
                    />
                    <input
                      type="text"
                      placeholder="Frequency (e.g. BID)"
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95"
                  >
                    <PlusCircleIcon className="h-4 w-4" /> Add Medication
                  </button>
                </div>
              </div>

              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 text-slate-900 uppercase">
                {/* Allergies section updated similarly... (simplified for brevity) */}
                <div className="flex items-center justify-between mb-5">
                  <h4 className="flex items-center gap-2 text-[11px] font-black tracking-wider">
                    <ExclamationCircleIcon className="h-4 w-4 text-rose-600" /> Known Allergies
                  </h4>
                </div>

                <div className="space-y-3 mb-4">
                  {allergies.length === 0 && <div className="text-[10px] italic text-slate-400 font-bold p-3 border border-dashed border-slate-200 rounded-2xl text-center">No known allergies reported</div>}
                  {allergies.map((allergy, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-rose-50 rounded-2xl shadow-sm group">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{allergy.allergen}</span>
                        <span className={`text-[10px] font-black uppercase ${allergy.severity === 'Severe' ? 'text-rose-600' : 'text-orange-600'}`}>{allergy.severity} REACTION: {allergy.reaction}</span>
                      </div>
                      <button type="button" onClick={() => removeAllergy(index)} className="text-rose-600 p-1 opacity-0 group-hover:opacity-100">
                        <MinusCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 bg-white p-4 rounded-2xl border border-dashed border-slate-300">
                  <input
                    type="text"
                    placeholder="Allergen (e.g. Penicillin)"
                    value={newAllergy.allergen}
                    onChange={(e) => setNewAllergy(prev => ({ ...prev, allergen: e.target.value }))}
                    className="block w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reaction (e.g. Rash)"
                      value={newAllergy.reaction}
                      onChange={(e) => setNewAllergy(prev => ({ ...prev, reaction: e.target.value }))}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                    />
                    <select
                      value={newAllergy.severity}
                      onChange={(e) => setNewAllergy(prev => ({ ...prev, severity: e.target.value }))}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                    >
                      <option value="">Severity</option>
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95"
                  >
                    Log Allergy
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-slate-50/80 px-4 py-5 sm:px-8 border-t border-slate-200 flex flex-col sm:flex-row-reverse sm:items-center gap-4 z-50">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-2xl shadow-xl px-10 py-4 bg-indigo-600 text-sm font-black text-white hover:bg-indigo-700 hover:shadow-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'Processing Registry...' : 'Generate & Send Referral PDF'}
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center px-8 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
              Cancel Draft
            </button>
            <div className="flex-1 hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Persistence Layer Ready
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewReferralModal;
