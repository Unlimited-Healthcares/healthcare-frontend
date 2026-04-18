import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MedicalReportFile } from "@/types/patient";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Upload,
  Search,
  Share,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface MedicalReportFilesProps {
  patientId?: string;
  centerId?: string;
}

export const MedicalReportFiles: React.FC<MedicalReportFilesProps> = ({ patientId, centerId }) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [files, setFiles] = useState<MedicalReportFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<MedicalReportFile | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFileForConsent, setSelectedFileForConsent] = useState<MedicalReportFile | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("medical_report_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      if (centerId) {
        query = query.eq("center_id", centerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFiles((data as any) || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [patientId, centerId, toast]);

  useEffect(() => {
    fetchFiles();
    // Set hasSearched to true after initial fetch
    setHasSearched(true);
  }, [fetchFiles]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!patientId) {
      toast({
        title: "Error",
        description: "Patient ID is required to upload a file",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive"
      });
      return;
    }

    setUploadingFile(true);

    try {
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${patientId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("medical_reports")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("medical_reports")
        .getPublicUrl(filePath);

      // Create a record in the database
      const { error: fileError } = await supabase
        .from("medical_report_files")
        .insert({
          report_id: `REP-${Math.floor(Math.random() * 1000000)}`,
          patient_id: patientId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          created_by: profile.id,
          center_id: centerId || null,
          is_shared: false,
          patient_consent: false
        });

      if (fileError) throw fileError;

      toast({
        title: "Success",
        description: "File uploaded successfully"
      });

      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(false);
      // Reset the file input
      e.target.value = "";
    }
  };

  const handleDownload = async (file: MedicalReportFile) => {
    try {
      // Extract the file path from the URL
      const urlParts = file.file_url.split('/');
      const filePath = urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];

      // Download the file
      const { data, error } = await supabase.storage
        .from("medical_reports")
        .download(filePath);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    try {
      // Delete the file from storage
      const urlParts = selectedFile.file_url.split('/');
      const filePath = urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];

      const { error: storageError } = await supabase.storage
        .from("medical_reports")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete the database record
      const { error: dbError } = await supabase
        .from("medical_report_files")
        .delete()
        .eq("id", selectedFile.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File deleted successfully"
      });

      fetchFiles(); // Refresh the file list
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  };

  const handleUpdateConsent = async (consent: boolean) => {
    if (!selectedFileForConsent) return;

    try {
      const { error } = await supabase
        .from("medical_report_files")
        .update({ patient_consent: consent })
        .eq("id", selectedFileForConsent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Consent ${consent ? "granted" : "revoked"} successfully`
      });

      fetchFiles(); // Refresh the file list
      setShowConsentDialog(false);
    } catch (error) {
      console.error("Error updating consent:", error);
      toast({
        title: "Error",
        description: "Failed to update consent status",
        variant: "destructive"
      });
    }
  };

  const handleShareFile = async (file: MedicalReportFile) => {
    try {
      const { error } = await supabase
        .from("medical_report_files")
        .update({ is_shared: !file.is_shared })
        .eq("id", file.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `File ${file.is_shared ? "unshared" : "shared"} successfully`
      });

      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error("Error sharing file:", error);
      toast({
        title: "Error",
        description: "Failed to update sharing status",
        variant: "destructive"
      });
    }
  };

  const filteredFiles = files.filter(file =>
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.report_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.patient_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes("image")) {
      return <Eye className="h-5 w-5 text-blue-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Medical Report Files</CardTitle>
          <CardDescription>
            Manage and view medical report files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead>Shared</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.file_type)}
                          <span className="truncate max-w-[150px]">{file.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{file.report_id}</TableCell>
                      <TableCell>{file.patient_id}</TableCell>
                      <TableCell>{formatFileSize(file.file_size)}</TableCell>
                      <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {file.patient_consent ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" /> Granted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {file.is_shared ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Share className="h-3 w-3 mr-1" /> Shared
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            <Lock className="h-3 w-3 mr-1" /> Private
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedFileForConsent(file);
                              setShowConsentDialog(true);
                            }}
                          >
                            {file.patient_consent ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShareFile(file)}
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedFile(file);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {hasSearched ? "No files match your search" : "No medical report files found"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consent Dialog */}
      <AlertDialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manage Patient Consent</AlertDialogTitle>
            <AlertDialogDescription>
              Update consent status for file: {selectedFileForConsent?.file_name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Patient consent is required to share medical reports between healthcare facilities.
              This ensures patient privacy and compliance with healthcare regulations.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent-granted"
                  checked={selectedFileForConsent?.patient_consent}
                  onCheckedChange={(checked) => {
                    if (selectedFileForConsent) {
                      setSelectedFileForConsent({
                        ...selectedFileForConsent,
                        patient_consent: checked as boolean
                      });
                    }
                  }}
                />
                <label
                  htmlFor="consent-granted"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Patient has provided consent to share this medical report
                </label>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleUpdateConsent(selectedFileForConsent?.patient_consent || false)}>
              Update Consent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 