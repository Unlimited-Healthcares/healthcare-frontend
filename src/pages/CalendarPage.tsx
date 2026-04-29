
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { SchedulingCalendar } from '@/components/dashboard/SchedulingCalendar';

const CalendarPage: React.FC = () => {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 pb-28 md:pb-0">
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-32">
                        <SchedulingCalendar />
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
};

export default CalendarPage;
