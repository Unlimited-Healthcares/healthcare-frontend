
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Upload, 
  X, 
  FileText, 
  Film, 
  File, 
  Image, 
  Loader2,
  Eye
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type FileType = 'dicom' | 'image' | 'pdf' | 'other';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: FileType;
  patientId?: string;
  uploadDate: Date;
  url: string;
}

export const FileUploader = () => {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [patientId, setPatientId] = useState('');
  const [fileType, setFileType] = useState<FileType>('dicom');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const fileTypeIcons = {
    dicom: <Film className="h-5 w-5" />,
    image: <Image className="h-5 w-5" />,
    pdf: <FileText className="h-5 w-5" />,
    other: <File className="h-5 w-5" />
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload.",
        variant: "destructive"
      });
      return;
    }

    if (!patientId) {
      toast({
        title: "Missing patient ID",
        description: "Please enter a patient ID for the files.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    // Simulate file upload
    setTimeout(() => {
      const newUploadedFiles = selectedFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 10),
        name: file.name,
        size: file.size,
        type: fileType,
        patientId: patientId,
        uploadDate: new Date(),
        url: URL.createObjectURL(file)
      }));

      setUploadedFiles([...uploadedFiles, ...newUploadedFiles]);
      setSelectedFiles([]);
      setIsUploading(false);

      toast({
        title: "Files uploaded successfully",
        description: `${selectedFiles.length} file(s) have been uploaded for patient ID: ${patientId}`,
      });
    }, 2000);
  };

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const viewFile = (file: UploadedFile) => {
    // In a real application, this would open a file viewer based on the file type
    toast({
      title: "Opening file viewer",
      description: `Opening ${file.name} in ${file.type === 'dicom' ? 'DICOM viewer' : 'default viewer'}.`,
    });
    
    // For demonstration, just open the file URL in a new tab
    window.open(file.url, '_blank');
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">File Uploader</h1>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Upload diagnostic files, images, and documents for patients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input 
                  id="patientId"
                  placeholder="Enter patient ID" 
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fileType">File Type</Label>
                <Select value={fileType} onValueChange={(value: FileType) => setFileType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dicom">DICOM Medical Image</SelectItem>
                    <SelectItem value="image">Regular Image</SelectItem>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fileUpload">Select Files</Label>
                <div className="flex items-center">
                  <Input
                    id="fileUpload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-full">
                    <label 
                      htmlFor="fileUpload"
                      className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-gray-300 hover:border-healthcare-500 transition-colors duration-200"
                    >
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Click to browse files</p>
                        <p className="text-xs text-muted-foreground mt-1">or drop files here</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Files to upload:</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                      >
                        <div className="truncate flex-1 mr-2">{file.name}</div>
                        <div className="text-muted-foreground text-xs mr-2">{getFileSize(file.size)}</div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleUpload} 
                disabled={isUploading || selectedFiles.length === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>
                Recently uploaded files and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedFiles.length > 0 ? (
                      uploadedFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>
                            <div className="flex items-center">
                              {fileTypeIcons[file.type]}
                              <span className="ml-2 text-xs capitalize">{file.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{file.name}</TableCell>
                          <TableCell>{file.patientId}</TableCell>
                          <TableCell>{getFileSize(file.size)}</TableCell>
                          <TableCell>
                            {file.uploadDate.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => viewFile(file)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No files uploaded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
