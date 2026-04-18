import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Gift,
    Star,
    ChevronRight,
    Clock,
    Award,
    TrendingUp,
    Heart,
    Droplets,
    History,
    CheckCircle2,
    ShoppingBag,
    Coffee,
    Activity
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const DonorRewardsPage: React.FC = () => {
    const [points, setPoints] = useState(1250);
    const [level, setLevel] = useState('Silver Donor');

    const rewards = [
        {
            id: 'r1',
            title: 'Express Check-in Pass',
            description: 'Skip the queue for your next blood donation appointment.',
            points: 500,
            icon: Clock,
            color: 'bg-blue-100 text-blue-700'
        },
        {
            id: 'r2',
            title: 'Premium Health Checkup',
            description: 'Comprehensive blood panel and consultation voucher.',
            points: 2000,
            icon: Activity,
            color: 'bg-emerald-100 text-emerald-700'
        },
        {
            id: 'r3',
            title: 'Affiliate Merchant Voucher',
            description: '$10 voucher at associated healthy food outlets.',
            points: 300,
            icon: Coffee,
            color: 'bg-orange-100 text-orange-700'
        },
        {
            id: 'r4',
            title: 'Donor Merit Badge',
            description: 'Exclusive digital badge for your profile and certificate.',
            points: 100,
            icon: Award,
            color: 'bg-purple-100 text-purple-700'
        }
    ];

    const handleRedeem = (reward: any) => {
        if (points >= reward.points) {
            setPoints(points - reward.points);
            toast.success(`Successfully redeemed ${reward.title}! Check your email for details.`);
        } else {
            toast.error(`Insufficient points. You need ${reward.points - points} more.`);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-rose-500 to-orange-500 p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-4 py-1 text-sm font-bold">
                                {level}
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Impact is Rewarded</h1>
                            <p className="text-rose-50 font-medium max-w-lg">
                                Every drop matters. You've helped save up to 12 lives so far.
                                Earn points with every donation and redeem them for health and lifestyle perks.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-2 bg-black/10 backdrop-blur-sm rounded-xl px-4 py-2">
                                    <Droplets className="h-5 w-5 fill-white" />
                                    <span className="font-bold">4 Donations</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/10 backdrop-blur-sm rounded-xl px-4 py-2">
                                    <Heart className="h-5 w-5 fill-white" />
                                    <span className="font-bold">Active Donor</span>
                                </div>
                            </div>
                        </div>

                        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white w-full md:w-80 shadow-2xl">
                            <CardContent className="p-6 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                                    <Star className="h-8 w-8 fill-yellow-400 text-yellow-400 animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-rose-100 text-xs font-bold uppercase tracking-widest">Available Balance</p>
                                    <h2 className="text-5xl font-extrabold">{points}</h2>
                                    <p className="text-rose-200 text-sm mt-1">Health Points</p>
                                </div>
                                <Button className="w-full bg-white text-rose-600 hover:bg-rose-50 font-bold rounded-xl h-12">
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    Earn More
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Progress to Next Tier */}
                <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="p-4 bg-yellow-50 rounded-2xl">
                            <TrendingUp className="h-8 w-8 text-yellow-600" />
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="font-bold text-gray-900">Progress to Gold Tier</h4>
                                    <p className="text-sm text-gray-500">Collect 750 more points to reach the next level</p>
                                </div>
                                <span className="text-sm font-extrabold text-rose-600">62% Complete</span>
                            </div>
                            <Progress value={62} className="h-3 rounded-full bg-rose-50" />
                        </div>
                    </CardContent>
                </Card>

                {/* Rewards Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Gift className="h-6 w-6 text-rose-500" />
                            Featured Rewards
                        </h3>
                        <Button variant="ghost" className="text-rose-600 font-bold hover:text-rose-700">
                            See All
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {rewards.map((reward) => (
                            <Card key={reward.id} className="group border-none shadow-premium rounded-3xl overflow-hidden hover:scale-[1.02] transition-all bg-white flex flex-col">
                                <CardHeader className="p-6 pb-2">
                                    <div className={`${reward.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-transparent group-hover:ring-white/50 transition-all`}>
                                        <reward.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl font-bold">{reward.title}</CardTitle>
                                    <CardDescription className="text-sm font-medium leading-relaxed mt-2">{reward.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 pt-4 flex-1">
                                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Price</p>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                <span className="font-extrabold text-gray-900">{reward.points} Pts</span>
                                            </div>
                                        </div>
                                        {points < reward.points && (
                                            <Badge variant="outline" className="border-gray-200 text-gray-400 font-bold">Lock</Badge>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-6 pt-0">
                                    <Button
                                        className={`w-full h-12 rounded-xl font-bold transition-all shadow-sm ${points >= reward.points
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100 hover:shadow-rose-200'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
                                            }`}
                                        onClick={() => handleRedeem(reward)}
                                    >
                                        {points >= reward.points ? 'Redeem Now' : 'Not Enough Points'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* History Section */}
                <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <History className="h-5 w-5 text-gray-400" />
                                Points History
                            </CardTitle>
                            <Badge variant="outline" className="bg-white text-gray-500 border-gray-200">Last 3 Months</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {[
                            { id: 1, action: 'Major Blood Donation', date: 'Mar 10, 2026', points: '+500', icon: Droplets, color: 'text-rose-600 bg-rose-50' },
                            { id: 2, action: 'Referral Bonus (John D.)', date: 'Feb 28, 2026', points: '+200', icon: Award, color: 'text-indigo-600 bg-indigo-50' },
                            { id: 3, action: 'Redeemed Premium Checkup', date: 'Jan 15, 2026', points: '-2000', icon: ShoppingBag, color: 'text-gray-600 bg-gray-50' },
                            { id: 4, action: 'Birthday Celebration Points', date: 'Jan 05, 2026', points: '+500', icon: Star, color: 'text-yellow-600 bg-yellow-50' },
                        ].map((item, idx) => (
                            <div key={item.id} className={`flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors ${idx !== 3 ? 'border-bottom border-gray-50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${item.color}`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{item.action}</p>
                                        <p className="text-xs text-gray-500 font-medium">{item.date}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`text-lg font-extrabold ${item.points.startsWith('+') ? 'text-emerald-600' : 'text-gray-900'}`}>
                                        {item.points}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Verified
                                    </span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DonorRewardsPage;
