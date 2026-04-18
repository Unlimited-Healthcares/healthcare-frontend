import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Search,
  ExternalLink,
  UserPlus,
  ShieldCheck,
  Settings,
  AlertCircle,
  ChevronRight,
  Plus,
  ArrowRight,
  BookOpen,
  Code2,
  Activity,
  Bug,
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supportService, SupportTicketPriority } from '@/services/supportService';
import { SupportChatBot } from '@/components/support/SupportChatBot';
import { API_BASE_URL } from '@/config/api';

const KNOWLEDGE_BASE = {
  getting_started: [
    {
      question: "How do I create my first healthcare profile?",
      answer: "After signing up, go to your Profile page. Fill in your personal details, emergency contacts, and medical history. A complete profile unlocks faster booking and personalized AI health insights."
    },
    {
      question: "How do I verify my account?",
      answer: "Check your email for a verification code after registration. Enter this code in the verification screen to activate your account features."
    }
  ],
  account_billing: [
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login screen. We'll send a secure reset link to your registered email address."
    },
    {
      question: "What payment methods are supported for My Wallet?",
      answer: "We support Credit/Debit cards (Visa, Mastercard), Bank Transfers, and local mobile money via Flutterwave integration."
    }
  ],
  features: [
    {
      question: "How do I start an AI Nurse consultation?",
      answer: "Navigate to 'Nurse Assistant' in the sidebar. Click 'Start New Session' to begin a symptom analysis or general health inquiry."
    },
    {
      question: "Can I share my medical reports with private doctors?",
      answer: "Yes. In the Medical Reports section, you can generate a secure share link or add a doctor to your 'Approved Providers' list to give them direct access."
    }
  ],
  troubleshooting: [
    {
      question: "The video conference link isn't loading?",
      answer: "Ensure your browser has camera and microphone permissions enabled. Try refreshing the page or using a supported browser like Chrome or Firefox."
    },
    {
      question: "I'm not receiving notifications?",
      answer: "Check your 'Security Center' settings to ensure 'Push Notifications' are enabled. Also, check your browser's site settings to allow notifications from unlimitedhealthcares.com."
    }
  ]
};

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('getting_started');

  // Ticket form state
  const [ticketData, setTicketData] = useState({
    subject: '',
    description: '',
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showChatBot, setShowChatBot] = useState(false);

  const handleStartSupportChat = () => {
    setShowChatBot(true);
    toast.success("Connecting you to UHC Assistant...");
  };

  const handleReportBug = () => {
    setTicketData(prev => ({
      ...prev,
      subject: 'BUG REPORT: [Summary of issue]',
      description: `Environment: ${navigator.userAgent}\nOS: ${navigator.platform}\n\nSteps to reproduce:\n1.\n2.\n\nExpected behavior:\n\nActual behavior:`
    }));
    toast.info("Bug report template applied to ticket form.");
    const formElement = document.getElementById('ticket-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.subject || !ticketData.description) {
      toast.error("Please provide at least a subject and description.");
      return;
    }

    try {
      setIsSubmitting(true);
      await supportService.createTicket({
        ...ticketData,
        priority: ticketData.subject.includes('BUG') ? SupportTicketPriority.HIGH : SupportTicketPriority.MEDIUM,
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      });

      toast.success("Ticket submitted successfully! We'll get back to you soon.");
      setTicketData({ subject: '', description: '', name: '', email: '' });
    } catch (error) {
      console.error('Ticket submission failed:', error);
      toast.error("Failed to submit ticket. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen pb-20 max-w-7xl mx-auto px-4 sm:px-6">
          {/* 1. Header and Quick-start Section */}
          <div className="relative pt-12 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6 border border-blue-100 shadow-sm">
              <HelpCircle className="h-4 w-4" /> Help Center
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              Find answers, troubleshoot issues,<br />or <span className="text-blue-600">contact our team.</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              We're here to ensure your healthcare journey is smooth and secure. Search our knowledge base or reach out to us directly.
            </p>

            <div className="max-w-xl mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 h-16 bg-white border-slate-200 shadow-xl rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* 2. Self-service Help (FAQ / Knowledge Base) */}
            <div className="lg:col-span-8 space-y-10">
              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <h2 className="text-2xl font-black text-slate-900">Knowledge Base</h2>
                </div>

                <Tabs defaultValue="getting_started" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-2.5 rounded-3xl h-auto mb-10 border border-slate-100 shadow-inner">
                    <TabsTrigger value="getting_started" className="rounded-2xl py-5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl font-black text-[13px] uppercase tracking-[0.15em] transition-all duration-300">
                      <UserPlus className="h-5 w-5 mr-3" /> Start
                    </TabsTrigger>
                    <TabsTrigger value="account_billing" className="rounded-2xl py-5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl font-black text-[13px] uppercase tracking-[0.15em] transition-all duration-300">
                      <ShieldCheck className="h-5 w-5 mr-3" /> Account
                    </TabsTrigger>
                    <TabsTrigger value="features" className="rounded-2xl py-5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl font-black text-[13px] uppercase tracking-[0.15em] transition-all duration-300">
                      <Settings className="h-5 w-5 mr-3" /> Features
                    </TabsTrigger>
                    <TabsTrigger value="troubleshooting" className="rounded-2xl py-5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl font-black text-[13px] uppercase tracking-[0.15em] transition-all duration-300">
                      <AlertCircle className="h-5 w-5 mr-3" /> Errors
                    </TabsTrigger>
                  </TabsList>

                  {Object.entries(KNOWLEDGE_BASE).map(([key, items]) => (
                    <TabsContent key={key} value={key} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Accordion type="single" collapsible className="space-y-4">
                        {items.map((item, index) => (
                          <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border border-slate-100 rounded-3xl px-8 bg-slate-50/20 hover:bg-white hover:shadow-xl transition-all duration-500 group overflow-hidden"
                          >
                            <AccordionTrigger className="text-left font-black text-slate-800 hover:no-underline py-6 text-lg group-hover:text-blue-600">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 font-medium leading-relaxed pb-8 pt-2 border-t border-slate-100/30 mt-2 text-base">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* 5. Technical / Developer Resources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-2">
                      <Code2 className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-xl font-black">API Documentation</CardTitle>
                    <CardDescription className="text-slate-300 font-medium">Explore our integrations and developer tools.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="ghost"
                      className="p-0 text-blue-400 font-black flex items-center gap-2 hover:bg-transparent hover:text-white transition-all group"
                      onClick={() => window.open(`${API_BASE_URL}/docs`, '_blank')}
                    >
                      Browse Docs <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden group border border-slate-100">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-2">
                      <Activity className="h-6 w-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900">System Status</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Real-time performance and service availability.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-sm font-black text-emerald-600 uppercase tracking-widest">All Systems Operational</span>
                    </div>
                    <Button variant="ghost" size="icon" className="group">
                      <ExternalLink className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar Columns: 3. Support Channels & 4. In-app Features */}
            <div className="lg:col-span-4 space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 mb-4">Support Channels</h3>

              {/* Live Chat Channel */}
              <Card className="rounded-[2rem] border-none shadow-2xl bg-white overflow-hidden group hover:ring-2 hover:ring-blue-500/10 transition-all">
                <CardHeader className="pb-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900">Live Chat</CardTitle>
                  <CardDescription className="font-bold text-slate-400">Response time: ~2 mins</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed">
                    Need immediate help? Chat with our specialized technical support team directly in the app.
                  </p>
                  <Button
                    onClick={handleStartSupportChat}
                    className="w-full bg-blue-600 hover:bg-black text-white font-black h-14 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    Start Real-time Chat <Plus className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Email Channel */}
              <Card className="rounded-[2rem] border-none shadow-xl bg-slate-50 border border-slate-100 group overflow-hidden">
                <CardContent className="pt-8 text-center p-4 sm:p-6 w-full">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-sm">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-1">Email Support</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Replies within 1 business day</p>
                  <a href="mailto:codesphere@unlimitedhealthcares.com" className="text-blue-600 font-extrabold hover:underline block mb-4 break-all">
                    codesphere@unlimitedhealthcares.com
                  </a>
                </CardContent>
              </Card>

              {/* Contact Form Element */}
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden" id="ticket-form">
                <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Plus className="h-6 w-6 text-blue-600" /> Send a Ticket
                </h4>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <Input
                    placeholder="Your Name"
                    value={ticketData.name}
                    onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                    className="h-12 bg-slate-50 border-none rounded-xl"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={ticketData.email}
                    onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
                    className="h-12 bg-slate-50 border-none rounded-xl"
                    required
                  />
                  <Input
                    placeholder="Subject of your inquiry"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                    className="h-12 bg-slate-50 border-none rounded-xl"
                    required
                  />
                  <textarea
                    placeholder="Describe your issue in detail..."
                    value={ticketData.description}
                    onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                    className="w-full min-h-[120px] bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    required
                  ></textarea>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black h-12 rounded-xl flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                    ) : (
                      <>Submit Ticket <Send className="h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              </div>

              {/* 4. In-App help Elements */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-[2rem] border border-pink-100 overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <Bug className="h-6 w-6 text-pink-600" />
                  <h4 className="text-lg font-black text-slate-900">Found a Bug?</h4>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed break-words">
                  Help us improve. Reporting bugs automatically includes your environment data (Browser, OS) to help our devs fix it faster.
                </p>
                <Button
                  onClick={handleReportBug}
                  variant="outline"
                  className="w-full border-pink-200 text-pink-700 font-black hover:bg-pink-600 hover:text-white rounded-xl h-11 transition-all"
                >
                  Report a Problem
                </Button>
              </div>

            </div>
          </div>

          {/* breadcrumbs-like navigation footer */}
          <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <Button variant="ghost" className="font-extrabold text-slate-400 hover:text-blue-600 p-0 h-auto">Legal Policy</Button>
              <Button variant="ghost" className="font-extrabold text-slate-400 hover:text-blue-600 p-0 h-auto">Privacy</Button>
              <Button variant="ghost" className="font-extrabold text-slate-400 hover:text-blue-600 p-0 h-auto">Security</Button>
            </div>
            <p className="text-slate-400 font-bold text-sm text-center">© 2026 Unlimited Healthcare Support Center</p>
          </div>
          {/* AI Support ChatBot */}
          <SupportChatBot isOpen={showChatBot} onOpenChange={setShowChatBot} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SupportPage;
