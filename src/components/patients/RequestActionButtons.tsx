import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/permissions';
import {
  FilePlus,
  ArrowRightLeft,
  Clipboard,
  Image as ImageIcon,
  Activity,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Phone,
  DollarSign,
  Stethoscope,
  Pill
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MEDICAL_TESTS, TREATMENT_PLAN_TYPES, IMAGE_DELIVERY_METHODS } from '@/data/medicalTests';
import { ClinicalEncounterDashboard } from '@/components/medical-records/ClinicalEncounterDashboard';
import { MedicalReportModal } from '@/components/dashboard/MedicalReportModal';
import { toast } from 'react-hot-toast';

interface RequestActionButtonsProps {
  patient: any;
  onRefresh?: () => void;
}

// Mock centers offering services
const MOCK_CENTERS = [
  { id: 'c1', name: 'Apex Diagnostic Center', phone: '+1234567890', price: 15000 },
  { id: 'c2', name: 'City General Hospital', phone: '+1234567891', price: 18000 },
  { id: 'c3', name: 'Elite Imaging Plus', phone: '+1234567892', price: 12000 },
];

export const RequestActionButtons: React.FC<RequestActionButtonsProps> = ({ patient }) => {
  const { user } = useAuth();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [currentMenu, setCurrentMenu] = useState<any[]>(MEDICAL_TESTS);
  const [menuPath, setMenuPath] = useState<any[]>([]);

  const handleCreateRequest = () => setActiveDialog('request');
  const handleCreatePlan = () => setActiveDialog('plan');
  const handleRefer = () => setActiveDialog('refer');
  const handleCreateReport = () => setActiveDialog('report');
  const handleImageRequest = () => setActiveDialog('image_request');
  const handleClinicalEncounter = () => setActiveDialog('encounter');

  const addToRequest = (test: any) => {
    // Select a random mock center for the "updated cost" feature
    const center = MOCK_CENTERS[Math.floor(Math.random() * MOCK_CENTERS.length)];
    const newEntry = {
      ...test,
      centerName: center.name,
      centerPhone: center.phone,
      price: center.price
    };
    setSelectedTests([...selectedTests, newEntry]);
    toast.success(`Added ${test.name} to request`);
    // Reset menu
    setCurrentMenu(MEDICAL_TESTS);
    setMenuPath([]);
  };

  const removeTest = (index: number) => {
    const newTests = [...selectedTests];
    newTests.splice(index, 1);
    setSelectedTests(newTests);
  };

  const navigateMenu = (item: any) => {
    if (item.subTests && item.subTests.length > 0) {
      setMenuPath([...menuPath, item]);
      setCurrentMenu(item.subTests);
    } else {
      addToRequest(item);
    }
  };

  const goBackSubMenu = () => {
    const newPath = [...menuPath];
    newPath.pop();
    setMenuPath(newPath);
    if (newPath.length === 0) {
      setCurrentMenu(MEDICAL_TESTS);
    } else {
      setCurrentMenu(newPath[newPath.length - 1].subTests);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 mt-6 border-t pt-6">
      {hasPermission(user?.roles, 'canViewOrdersOnly') && (
        <Button
          onClick={handleCreateRequest}
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 transition-all font-bold"
        >
          <FilePlus className="h-6 w-6" />
          CREATE REQUEST
        </Button>
      )}

      {hasPermission(user?.roles, 'canViewCarePlan') && (
        <Button
          onClick={handleCreatePlan}
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 transition-all font-bold"
        >
          <Clipboard className="h-6 w-6" />
          CLINICAL TREATMENT PLAN
        </Button>
      )}

      {hasPermission(user?.roles, 'canViewClinicalNotes') && (
        <Button
          onClick={handleRefer}
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/10 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 transition-all font-bold"
        >
          <ArrowRightLeft className="h-6 w-6" />
          REFER PATIENT
        </Button>
      )}

      {hasPermission(user?.roles, 'canViewClinicalNotes') && (
        <Button
          onClick={handleCreateReport}
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 transition-all font-bold"
        >
          <Activity className="h-6 w-6" />
          MEDICAL REPORT
        </Button>
      )}

      {hasPermission(user?.roles, 'canViewClinicalNotes') && (
        <Button
          onClick={handleClinicalEncounter}
          variant="default"
          className="h-24 flex flex-col items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-lg transition-all font-bold col-span-2"
        >
          <Stethoscope className="h-6 w-6" />
          CLINICAL ENCOUNTER WORKSPACE
        </Button>
      )}

      {/* CREATE REQUEST DIALOG */}
      <Dialog open={activeDialog === 'request'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-blue-700">
                <FilePlus className="h-6 w-6" />
                Diagnostic Test Request Form
              </DialogTitle>
              <DialogDescription>
                Select tests for {patient.profile?.displayName || 'this patient'}. Multi-level menu selection with center pricing.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left: Menu Selection */}
            <div className="w-1/2 border-r p-6 bg-gray-50 dark:bg-gray-900/50">
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                <button
                  onClick={() => { setCurrentMenu(MEDICAL_TESTS); setMenuPath([]); }}
                  className="hover:text-blue-600 font-medium"
                >
                  Root
                </button>
                {menuPath.map((m, i) => (
                  <React.Fragment key={m.id}>
                    <ChevronRight className="h-3 w-3" />
                    <button
                      onClick={() => {
                        const newPath = menuPath.slice(0, i + 1);
                        setMenuPath(newPath);
                        setCurrentMenu(m.subTests);
                      }}
                      className="hover:text-blue-600 font-medium"
                    >
                      {m.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {menuPath.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBackSubMenu}
                  className="mb-4 text-xs h-8"
                >
                  ← Back to {menuPath.length > 1 ? menuPath[menuPath.length - 2].name : 'Primary Menu'}
                </Button>
              )}

              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 gap-2">
                  {currentMenu.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigateMenu(item)}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-blue-500 hover:shadow-md transition-all group text-left"
                    >
                      <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600">
                        {item.name}
                      </span>
                      {item.subTests && item.subTests.length > 0 ? (
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      ) : (
                        <Plus className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right: Selected Tests Form */}
            <div className="w-1/2 p-6 flex flex-col">
              <h4 className="font-bold text-lg mb-4 flex items-center justify-between">
                Draft Request
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {selectedTests.length} Items Selected
                </Badge>
              </h4>

              <ScrollArea className="flex-1 pr-4">
                {selectedTests.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 py-12">
                    <Clipboard className="h-12 w-12 mb-2" />
                    <p>No tests selected yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedTests.map((test, index) => (
                      <div
                        key={`${test.id}-${index}`}
                        className="p-4 rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10 relative group"
                      >
                        <button
                          onClick={() => removeTest(index)}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>

                        <div className="font-black text-blue-900 dark:text-blue-100 mb-2">
                          {test.name}
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Building2 className="h-3 w-3" />
                            {test.centerName}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Phone className="h-3 w-3" />
                            {test.centerPhone}
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mt-2">
                            <DollarSign className="h-3 w-3" />
                            <span>Cost: ₦{test.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="mt-6 pt-4 border-t">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                  disabled={selectedTests.length === 0}
                  onClick={() => {
                    toast.success("Medical request generated and sent to centers!");
                    setActiveDialog(null);
                    setSelectedTests([]);
                  }}
                >
                  GENERATE & SEND REQUEST
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* TREATMENT PLAN DIALOG */}
      <Dialog open={activeDialog === 'plan'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-emerald-700 flex items-center gap-2">
              <Clipboard className="h-6 w-6" />
              CLINICAL TREATMENT PLAN
            </DialogTitle>
            <DialogDescription>
              Direct this plan to a specialized facility
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {TREATMENT_PLAN_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  toast.success(`Redirecting to create ${type.name} plan...`);
                  setActiveDialog(null);
                }}
                className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-emerald-50/30 hover:bg-emerald-50 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 hover:border-emerald-500 transition-all text-left group"
              >
                <div className="font-black text-emerald-900 dark:text-emerald-100 text-lg mb-1 group-hover:translate-x-1 transition-transform">
                  {type.name}
                </div>
                <p className="text-xs text-emerald-600">Click to configure and send</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* REFER PATIENT DIALOG */}
      <Dialog open={activeDialog === 'refer'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-md text-center">
          <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRightLeft className="h-8 w-8" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-purple-700">Patient Referral & Transfer</DialogTitle>
            <DialogDescription>
              Refer {patient.profile?.displayName} to another specialist or facility.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-sm font-medium">
            <p className="flex items-center gap-2 justify-center">
              <CheckCircle2 className="h-4 w-4" />
              All clinical info, images, and reports will be transferred.
            </p>
            <p className="mt-2 text-xs font-black uppercase text-amber-900 dark:text-amber-100">
              CRITICAL: YOU WILL LOSE ACCESS TO THIS PATIENT UPON COMPLETION.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12">
              INITIATE SECURE TRANSFER
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setActiveDialog(null)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MedicalReportModal
        isOpen={activeDialog === 'report'}
        onClose={() => setActiveDialog(null)}
        patientData={{
          fullName: patient.profile?.displayName,
          dob: patient.profile?.dob,
          gender: patient.profile?.gender,
          patientId: patient.id,
          phone: patient.profile?.phoneNumber,
          email: patient.profile?.email,
          address: patient.profile?.address
        }}
      />

      {/* IMAGE REQUEST DIALOG */}
      <Dialog open={activeDialog === 'image_request'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-indigo-700 flex items-center gap-2">
              <ImageIcon className="h-6 w-6" />
              Secure Image Request
            </DialogTitle>
            <DialogDescription>
              Request clinical images from a diagnostic center via secure protocols.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 mt-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">SELECT DELIVERY PLATFORM</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {IMAGE_DELIVERY_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => toast.success(`Method selected: ${method.name}`)}
                    className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-500 transition-all text-left font-bold text-indigo-900"
                  >
                    {method.name}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300">
              <p className="text-xs text-center text-gray-500 font-medium">
                The diagnostic center will receive a notification to export images through the selected secure portal once the request is approved.
              </p>
            </div>

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12">
              SEND NOTIFICATION TO CENTER
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* CLINICAL ENCOUNTER DIALOG */}
      <Dialog open={activeDialog === 'encounter'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-6xl p-10 bg-gray-50 overflow-hidden">
          <ClinicalEncounterDashboard
            patient={{
              id: patient.userId || patient.id,
              name: patient.profile?.displayName || 'Unknown Patient',
              userId: patient.userId,
              profile: patient.profile
            }}
            onComplete={(id) => {
              setActiveDialog(null);
              toast.success("Encounter workflow completed and recorded.");
            }}
            onCancel={() => setActiveDialog(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
