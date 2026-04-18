import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Users, Building2 } from 'lucide-react';
import { RequestModal } from './RequestModal';
import { StaffRequestManagement } from './StaffRequestManagement';
import { Center } from '@/types/discovery';
import { cn } from '@/lib/utils';

export const RequestFlowTest: React.FC = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [testMode, setTestMode] = useState<'doctor' | 'center'>('doctor');

  // Mock data for testing
  const mockCenter: Center = {
    id: 'center-123',
    publicId: 'center-123',
    name: 'Marvelous Hospital',
    type: 'Hospital',
    address: '123 Medical Drive',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    phone: '+1-555-123-4567',
    email: 'info@marveloushospital.com',
    website: 'https://marveloushospital.com',
    services: ['Emergency Care', 'Cardiology', 'Surgery'],
    staff: [],
    operatingHours: {},
    latitude: 40.7128,
    longitude: -74.0060,
    generalLocation: {
      city: 'New York',
      state: 'NY',
      country: 'USA'
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    acceptingNewPatients: true
  };

  const handleSendRequest = (center: Center) => {
    setSelectedCenter(center);
    setShowRequestModal(true);
  };

  const handleRequestSent = () => {
    console.log('🎉 REQUEST SENT FROM TEST COMPONENT');
    setShowRequestModal(false);
    setSelectedCenter(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Request Flow Test Dashboard
        </h1>
        <p className="text-gray-600 mb-6 font-medium">
          Verify staff invitation and connection workflows
        </p>

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setTestMode('doctor')}
            variant={testMode === 'doctor' ? 'default' : 'outline'}
            className="flex items-center gap-2 rounded-full px-6"
          >
            <Users className="h-4 w-4" />
            Provider View
          </Button>
          <Button
            onClick={() => setTestMode('center')}
            variant={testMode === 'center' ? 'default' : 'outline'}
            className="flex items-center gap-2 rounded-full px-6"
          >
            <Building2 className="h-4 w-4" />
            Healthcare Center View
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900 border-none shadow-2xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <AlertCircle className="h-5 w-5" />
            Workflow Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm relative z-10">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Active Interface</h4>
              <Badge className={cn("px-4 py-1 rounded-full font-black uppercase text-[10px]", testMode === 'doctor' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white')}>
                {testMode === 'doctor' ? 'Provider Portal' : 'Administrator Dashboard'}
              </Badge>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Verification Protocol</h4>
              <p className="text-slate-300 leading-relaxed font-medium">
                {testMode === 'doctor'
                  ? 'Initiate staff invitations or clinical connection requests to healthcare facilities.'
                  : 'Review and process incoming credentials and professional invitations.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {testMode === 'doctor' && (
        <div className="space-y-6">
          <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-2 text-slate-900 font-black">
                <Users className="h-5 w-5 text-blue-600" />
                Outgoing Staff Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Target Facility</h3>
                  <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 space-y-4 transition-all hover:border-blue-200">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">{mockCenter.name}</h4>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none font-bold uppercase text-[9px]">{mockCenter.type}</Badge>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          {mockCenter.city}, {mockCenter.state}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <strong>Services:</strong> {mockCenter.services?.join(', ')}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleSendRequest(mockCenter)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 font-bold shadow-lg shadow-slate-200"
                    >
                      Initialize Staff Invitation
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Verification Process</h3>
                  <div className="space-y-4">
                    {[
                      'Trigger invitation interface via button',
                      'Specify professional role and details',
                      'Submit and monitor system logs',
                      'Verify receipt in center dashboard'
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-medium text-slate-700">
                        <div className="w-8 h-8 bg-white border-2 border-blue-500 text-blue-600 rounded-xl flex items-center justify-center text-xs font-black">
                          {i + 1}
                        </div>
                        <span className="text-xs">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {testMode === 'center' && (
        <div className="space-y-6">
          <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-slate-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-900 font-black">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Administrative Oversight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 font-medium leading-relaxed max-w-2xl text-sm italic">
                Manage incoming staff requests and connections. Ensure professional credentials are valid before approval.
              </p>
            </CardContent>
          </Card>

          <StaffRequestManagement
            centerId="test-center-123"
            centerName="Test Healthcare Center"
          />
        </div>
      )}

      {showRequestModal && selectedCenter && (
        <RequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          recipient={selectedCenter}
          onSend={handleRequestSent}
        />
      )}
    </div>
  );
};
