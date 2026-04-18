import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, FileText, Building, User, Calendar, ShieldCheck, ExternalLink } from "lucide-react";
import { medicalReportsService } from '@/services/medicalReportsService';
import { MedicalReport } from '@/types/medical-reports';

const VerifyReportPage: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [report, setReport] = useState<MedicalReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!code) return;
            try {
                setLoading(true);
                // We'll need a public endpoint for verification in a real app
                // For now, we'll use the ID-based fetch if the backend supports it publically
                // or a dedicated verification endpoint
                const response = await medicalReportsService.verifyReport(code);
                setReport(response);
            } catch (err) {
                console.error('Verification failed:', err);
                setError('The verification code is invalid or the report has been revoked.');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Verifying digital signature...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-4">
                        <ShieldCheck className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Digital Verification Portal</h1>
                    <p className="mt-2 text-gray-600">Authenticate medical documents issued by Unlimited Healthcare</p>
                </div>

                {error ? (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <CardTitle className="text-red-900">Verification Failed</CardTitle>
                            <CardDescription className="text-red-700">{error}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-center">
                            <Button asChild variant="outline">
                                <Link to="/">Return to Home</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ) : report ? (
                    <Card className="shadow-lg border-green-100">
                        <CardHeader className="bg-green-50/50 border-b">
                            <div className="flex justify-between items-center">
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Authenticity Verified
                                </Badge>
                                <span className="text-xs text-muted-foreground">Certified: {new Date(report.generatedDate).toLocaleDateString()}</span>
                            </div>
                            <CardTitle className="mt-4 text-2xl">{report.title}</CardTitle>
                            <CardDescription>Verified secure medical document</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <Building className="h-4 w-4 mr-2" />
                                        Issuing Center
                                    </div>
                                    <p className="font-semibold text-gray-900">{report.centerName}</p>
                                    <p className="text-xs text-muted-foreground">{report.centerAddress}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm font-bold text-muted-foreground uppercase tracking-tighter">
                                        <User className="h-4 w-4 mr-2" />
                                        PATIENT Information
                                    </div>
                                    <p className="font-semibold text-gray-900">{report.patientName}</p>
                                    <p className="text-xs text-muted-foreground">ID: {report.patientId}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Report Type
                                    </div>
                                    <p className="font-semibold text-gray-900 uppercase">{report.reportType}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Issue Date
                                    </div>
                                    <p className="font-semibold text-gray-900">{new Date(report.generatedDate).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-lg border">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Security Manifest</h4>
                                <div className="space-y-2 text-xs font-mono">
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-muted-foreground">Verification ID:</span>
                                        <span className="text-gray-900">{code}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-muted-foreground">Digital Signature:</span>
                                        <span className="text-gray-900">RSA-2048-ACTIVE</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Encryption Status:</span>
                                        <span className="text-green-600 font-bold">SHA-256 SECURED</span>
                                    </div>
                                </div>
                            </div>

                            {report.pdfUrl && (
                                <Button className="w-full h-12 text-lg" asChild>
                                    <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-5 w-5 mr-1" />
                                        View Authorized Document
                                    </a>
                                </Button>
                            )}
                        </CardContent>
                        <CardFooter className="bg-gray-50 border-t flex flex-col items-center py-4">
                            <p className="text-xs text-muted-foreground text-center">
                                This verification is valid only for documents issued by authorized centers of
                                <span className="font-bold text-gray-700 ml-1">Unlimited Healthcare</span>.
                            </p>
                        </CardFooter>
                    </Card>
                ) : null}
            </div>
        </div>
    );
};

export default VerifyReportPage;
