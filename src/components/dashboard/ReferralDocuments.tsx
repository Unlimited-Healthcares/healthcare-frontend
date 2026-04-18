import { useState } from "react";
import { ReferralDocument, referralService } from "@/services/referralService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Download,
  Image,
  Archive,
  FileType,
  FileSpreadsheet,
  Code,
  FileX,
  Loader2,
  Eye,
  Share2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReferralDocumentsProps {
  referralId: string;
  documents: ReferralDocument[];
  onDocumentUploaded?: () => void;
  readOnly?: boolean;
  className?: string;
}

export const ReferralDocuments: React.FC<ReferralDocumentsProps> = ({
  referralId,
  documents,
  onDocumentUploaded,
  readOnly = false,
  className,
}) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isShared, setIsShared] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);

    try {
      const { error } = await referralService.uploadReferralDocument({
        referralId,
        file: selectedFile,
        documentData: {
          referralId,
          name: selectedFile.name,
          documentType: "other" as any,
          description,
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Document uploaded successfully");
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setDescription("");
      setIsShared(true);

      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) {
      return <Image className="h-6 w-6 text-blue-500" />;
    } else if (fileType.includes("pdf")) {
      return <FileType className="h-6 w-6 text-red-500" />;
    } else if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    } else if (fileType.includes("zip") || fileType.includes("compressed")) {
      return <Archive className="h-6 w-6 text-amber-500" />;
    } else if (fileType.includes("html") || fileType.includes("javascript") || fileType.includes("json")) {
      return <Code className="h-6 w-6 text-purple-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return String(dateString);
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Manage documents related to this referral
              </CardDescription>
            </div>
            {!readOnly && (
              <Button
                onClick={() => setIsUploadDialogOpen(true)}
                size="sm"
                className="h-8"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileX className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No documents uploaded yet</p>
              {!readOnly && (
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="mt-4"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(doc.mimeType || doc.file_type || "")}
                    <div>
                      <p className="font-medium text-sm">{doc.originalFilename || doc.file_name || doc.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(doc.fileSize || doc.file_size || 0)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.createdAt || doc.created_at || "")}</span>
                        {(doc.is_shared || doc.description) && (
                          <>
                            <span>•</span>
                            <span className="flex items-center">
                              <Share2 className="h-3 w-3 mr-1" />
                              Shared
                            </span>
                          </>
                        )}
                      </div>
                      {(doc.description || doc.description) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" asChild>
                      <a
                        href={doc.filePath || doc.file_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <a
                        href={doc.filePath || doc.file_url || "#"}
                        download={doc.originalFilename || doc.file_name || doc.name}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a document to this referral. Documents can be shared with the receiving center.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter a description for this document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="shared"
                checked={isShared}
                onCheckedChange={(checked) => setIsShared(!!checked)}
                disabled={isUploading}
              />
              <Label htmlFor="shared" className="text-sm">
                Share this document with the receiving center
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferralDocuments; 