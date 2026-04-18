import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Bell, Globe, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col">
            <Navbar />

            {/* Header Section */}
            <section className="bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-700 text-white py-20 pt-32">
                <div className="healthcare-container text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Shield className="w-16 h-16 mx-auto mb-6 text-cyan-300" />
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Privacy Policy</h1>
                        <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
                            How we protect your personal and health information at Unlimited Healthcare.
                        </p>
                        <p className="mt-6 text-sm text-cyan-200/60 uppercase tracking-widest font-bold">
                            Last Updated: April 5, 2026
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <main className="healthcare-container py-16 flex-1">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-blue max-w-none space-y-12">

                        {/* Introduction */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <Globe size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">1. Introduction</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Unlimited Healthcare ("we", "us", or "our") operates the Unlimited Healthcare mobile application and web platform. We are committed to protecting your privacy and ensuring the security of your dynamic health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                            </p>
                        </section>

                        {/* Information We Collect */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <FileText size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">2. Information We Collect</h2>
                            </div>
                            <p className="text-gray-600 mb-4">We collect information that you provide directly to us, including sensitive health data necessary for providing medical services:</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                                {[
                                    { title: "Personal Identification", desc: "Name, email, phone number, and government-issued ID for KYC verification." },
                                    { title: "Medical Records", desc: "Health history, symptoms, diagnostic reports (DICOM), and prescriptions." },
                                    { title: "Location Data", desc: "Used to help you find nearby healthcare centers and emergency services." },
                                    { title: "Financial Information", desc: "Payment details processed securely via third-party providers (Stripe, Paystack, Flutterwave)." }
                                ].map((item, i) => (
                                    <li key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <span className="block font-bold text-gray-800 mb-1">{item.title}</span>
                                        <span className="text-sm text-gray-500">{item.desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* How We Use Your Information */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <Bell size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">3. How We Use Your Information</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                We use the collected information to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Facilitate medical appointments and teleconsultations.</li>
                                <li>Verify your identity for safe medical care and regulatory compliance.</li>
                                <li>Process lab results and diagnostic images for your review.</li>
                                <li>Send important notifications regarding your health tests and appointments.</li>
                                <li>Analyze health trends (anonymously) to improve our AI symptom analysis and triage features.</li>
                            </ul>
                        </section>

                        {/* Data Sharing and Disclosure */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <Eye size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">4. Data Sharing and Disclosure</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                <strong>We do not sell your personal or health information to third parties.</strong> We only share information with:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                                <li><strong>Healthcare Providers:</strong> Only doctors and clinics you have explicitly booked or authorized.</li>
                                <li><strong>Service Providers:</strong> Platforms like Supabase (secure data storage), Gemini AI (triage analysis), and payment processors.</li>
                                <li><strong>Compliance & Legal:</strong> If required by law or to protect the safety of users.</li>
                            </ul>
                        </section>

                        {/* Security of Data */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">5. Security of Your Data</h2>
                            </div>
                            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl flex items-start gap-4">
                                <Shield className="flex-shrink-0 w-8 h-8 mt-1" />
                                <div>
                                    <p className="font-bold mb-2 text-lg">We take data security seriously.</p>
                                    <p className="text-blue-50 opacity-90 leading-relaxed">
                                        All medical transfers are encrypted using TLS/SSL. Information is stored in HIPAA-compliant cloud architectures with restricted access. We use secure hashing for sensitive passwords and identity tokens.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Your Rights */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
                            <p className="text-gray-600 leading-relaxed">
                                You have the right to access the personal data we hold about you. You can update your profile information within the app settings. If you wish to delete your account and associated data, please contact our support team.
                            </p>
                        </section>

                        {/* Contact Us */}
                        <section className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <Mail size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">Contact Us</h2>
                            </div>
                            <p className="text-gray-600 mb-4">
                                If you have any questions or concerns about this Privacy Policy, please reach out:
                            </p>
                            <div className="space-y-1 text-blue-600 font-medium">
                                <p>Email: codesphere@unlimitedhealthcares.com</p>
                                <p>Address: Federal housing New layout North bank Makurdi</p>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
                <div className="healthcare-container text-center">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Unlimited Healthcare. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
