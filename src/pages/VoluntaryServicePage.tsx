import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
    Heart,
    HeartHandshake,
    Gift,
    Users,
    Award,
    ChevronRight,
    BadgeCheck,
    Calendar,
    Globe,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const VoluntaryServicePage: React.FC = () => {
    const navigate = useNavigate();

    const volunteerPrograms = [
        {
            title: "Blood Donation Hero",
            description: "Join our network of life-saving donors. Your contribution can save up to 3 lives per donation.",
            icon: Heart,
            color: "bg-rose-50 text-rose-600",
            link: "/blood-donation",
            action: "Register as Donor"
        },
        {
            title: "Community Outreach",
            description: "Help us reach underserved communities with medical supplies and educational materials.",
            icon: Users,
            color: "bg-blue-50 text-blue-600",
            link: "/community",
            action: "Join Discussions"
        },
        {
            title: "Medical Volunteer",
            description: "Are you a healthcare professional? Offer your expertise to those who need it most.",
            icon: HeartHandshake,
            color: "bg-teal-50 text-teal-600",
            link: "/volunteer/medical-verify",
            action: "Verify Identity"
        },
        {
            title: "Health Ambassador",
            description: "Spread awareness about preventive healthcare and wellness in your local area.",
            icon: Globe,
            color: "bg-indigo-50 text-indigo-600",
            link: "/community",
            action: "Start an Article"
        }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 py-8 pb-40">
                {/* Hero Section */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden mb-12 shadow-2xl shadow-slate-200">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>

                    <div className="relative z-10 max-w-2xl">
                        <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/30 mb-6 py-1 px-4 rounded-full font-bold uppercase tracking-widest text-[10px]">
                            Impact Program
                        </Badge>
                        <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
                            Give Back, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 italic">Save Lives.</span>
                        </h1>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            Join our network of healthcare volunteers and donors. Whether you give blood, time, or expertise, your contribution builds a healthier future.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                onClick={() => navigate('/blood-donation')}
                                className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-14 px-8 font-black text-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                Donate Blood Now
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/community')}
                                className="border-slate-700 text-white hover:bg-white/10 rounded-2xl h-14 px-8 font-bold text-lg"
                            >
                                View Opportunities
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Impact Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {[
                        { label: "Active Volunteers", val: "1.2k+", icon: Users },
                        { label: "Lives Impacted", val: "25k+", icon: Heart },
                        { label: "Regions Covered", val: "45+", icon: Globe },
                        { label: "Total Programs", val: "12", icon: Award }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:bg-blue-50/50 transition-colors">
                            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-black text-slate-900">{stat.val}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Volunteer Programs */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Volunteer Opportunities</h2>
                            <p className="text-slate-500 mt-2 font-medium">Choose a program that matches your passion and skills.</p>
                        </div>
                        <Button variant="ghost" className="text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50 px-4 rounded-xl">
                            View All Programs <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {volunteerPrograms.map((prog, i) => (
                            <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden group">
                                <CardContent className="p-8">
                                    <div className="flex gap-6 items-start">
                                        <div className={`${prog.color} w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                            <prog.icon className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-slate-900 mb-3">{prog.title}</h3>
                                            <p className="text-slate-500 leading-relaxed text-sm mb-6">
                                                {prog.description}
                                            </p>
                                            <Button
                                                onClick={() => navigate(prog.link)}
                                                className="rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 border-none transition-all group-hover:bg-slate-900 group-hover:text-white"
                                            >
                                                {prog.action}
                                                <ChevronRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Become a Partner Section */}
                <div className="mt-16 bg-blue-600 rounded-[2.5rem] p-10 text-white text-center relative overflow-hidden shadow-xl shadow-blue-200">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-transparent to-transparent opacity-50"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-black mb-4 uppercase">WANT TO COLLABORATE?</h2>
                        <p className="text-blue-50 opacity-90 mb-8 font-medium">
                            We collaborate with PATIENTS, hospitals, clinics, and NGOs to maximize our collective impact. Let's work together to provide better healthcare access.
                        </p>
                        <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-2xl h-14 px-6 sm:px-10 font-black text-xs sm:text-lg uppercase w-full sm:w-auto">
                            Contact Collaboration
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VoluntaryServicePage;
