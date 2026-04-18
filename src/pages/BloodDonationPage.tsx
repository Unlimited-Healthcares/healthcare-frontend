import React, { useState } from 'react';
import BloodDonationDashboard from '../components/blood-donation/BloodDonationDashboard';
import { ClinicalSecurityGate } from '../components/medical-records/ClinicalSecurityGate';
import { useNavigate } from 'react-router-dom';

const BloodDonationPage: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const navigate = useNavigate();

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-blue-100">
          <ClinicalSecurityGate
            onUnlock={() => setIsUnlocked(true)}
            onCancel={() => navigate('/dashboard')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-0">
      <BloodDonationDashboard />
    </div>
  );
};

export default BloodDonationPage;
