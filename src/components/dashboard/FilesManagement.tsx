'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Search, Filter, FileIcon, Download, Trash2, 
  FileText, Eye, EyeOff, Upload, File 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

import { centerManagementService } from '@/services/centerManagementService';
import { 
  FILE_CATEGORIES, 
  CenterFileWithDetails, 
  CenterFileFormData 
} from '@/types/center-management';
import { supabase } from '@/lib/supabase-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { DateRange } from 'react-day-picker';
import { format, isWithinInterval } from 'date-fns';

const fileFormSchema = z.object({
  patient_id: z.string().optional(),
  category: z.string({
    required_error: "Please select a category"
  }),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(false),
});

interface FilesManagementProps {
  centerId?: string;
  patientId?: string;
}

export function FilesManagement({ centerId, patientId }: FilesManagementProps) {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<CenterFileWithDetails[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<CenterFileWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<CenterFileWithDetails | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [patients, setPatients] = useState<{id: string, name: string}[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [staffId, setStaffId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      patient_id: undefined,
      category: undefined,
      description: '',
      tags: [],
      is_public: false,
    },
  });

  const fetchStaffId = useCallback(async () => {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !centerId) return;

      const { data, error } = await supabase
        .from('center_staff')
        .select('id')
        .eq('user_id', user.id)
        .eq('center_id', centerId)
        .single();

      if (error) throw error;
      if (data && 'id' in data) {
        setStaffId((data as { id: string }).id);
      }
    } catch (error) {
      console.error('Error fetching staff ID:', error);
    }
  }, [centerId]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      if (!centerId) return;
      const filesData = await centerManagementService.getFiles({
        center_id: centerId,
        patient_id: patientId
      });
      setFiles(filesData);
      setFilteredFiles(filesData);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  const fetchPatients = useCallback(async () => {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return;
      }
      
      const { data, error } = await supabase
        .from('patients')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...files];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (file) =>
          file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (file.patient_name && file.patient_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((file) => file.category === selectedCategory);
    }

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((file) => {
        const fileDate = new Date(file.created_at);
        return isWithinInterval(fileDate, {
          start: dateRange.from!,
          end: dateRange.to!,
        });
      });
    }

    setFilteredFiles(filtered);
  }, [files, searchTerm, selectedCategory, dateRange]);

  useEffect(() => {
    fetchFiles();
    fetchPatients();
    fetchStaffId();
  }, [fetchFiles, fetchPatients, fetchStaffId]);

  useEffect(() => {
    if (files.length > 0) {
      applyFilters();
    }
  }, [applyFilters, files.length]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setDateRange(undefined);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
  });

  const handleOpenUploadDialog = () => {
    setUploadedFile(null);
    form.reset();
    setUploadDialogOpen(true);
  };

  const handleOpenDeleteDialog = (file: CenterFileWithDetails) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const handlePreviewFile = (file: CenterFileWithDetails) => {
    setSelectedFile(file);
    setPreviewDialogOpen(true);
  };

  const handleUploadFile = async (data: z.infer<typeof fileFormSchema>) => {
    if (!uploadedFile || !staffId || !centerId) return;

    try {
      const fileData: CenterFileFormData = {
        file: uploadedFile,
        patient_id: data.patient_id,
        category: data.category,
        description: data.description,
        tags: data.tags || [],
        is_public: data.is_public,
      };

      const response = await centerManagementService.uploadFile(centerId, staffId, fileData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        setUploadDialogOpen(false);
        fetchFiles();
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    try {
      const response = await centerManagementService.deleteFile(selectedFile.id);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        setDeleteDialogOpen(false);
        fetchFiles();
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6" />;
    if (fileType.includes('image')) return <FileIcon className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  useEffect(() => {
    setFilteredFiles(
      files.filter(file => {
        const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            file.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedCategory === null || file.category === selectedCategory;
        return matchesSearch && matchesType;
      })
    );
  }, [files, searchTerm, selectedCategory]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Files Management</h2>
      <p className="text-muted-foreground">
        Upload, manage, and share files with patients and other healthcare providers.
      </p>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Medical Report Files</CardTitle>
              <CardDescription>Upload and manage patient files and medical reports</CardDescription>
            </div>
            <Button onClick={handleOpenUploadDialog}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={selectedCategory || 'all'}
                onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {FILE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DatePickerWithRange
                selected={dateRange}
                onSelect={setDateRange}
              />
            </div>

            <Button variant="outline" size="sm" onClick={resetFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No files found.</p>
              <Button className="mt-4" onClick={handleOpenUploadDialog}>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file.file_type)}
                        <span className="font-medium">{file.file_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{file.category}</TableCell>
                    <TableCell>{file.patient_name || 'General'}</TableCell>
                    <TableCell>{formatFileSize(file.file_size)}</TableCell>
                    <TableCell>{format(new Date(file.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {file.is_public ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <Eye className="mr-1 h-3 w-3" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800">
                          <EyeOff className="mr-1 h-3 w-3" />
                          Private
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePreviewFile(file)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <a
                          href={supabase ? `${supabase.storage.from('center-files').getPublicUrl(file.file_path).data.publicUrl}` : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleOpenDeleteDialog(file)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload File Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Upload a file to your center's storage. Attach it to a patient or keep it general.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUploadFile)} className="space-y-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
                  isDragActive ? 'border-primary' : 'border-muted-foreground'
                }`}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileIcon className="h-10 w-10 text-primary" />
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      Drag & drop a file here, or click to select a file
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported formats: PDF, DOCX, JPEG, PNG, etc.
                    </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select file category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FILE_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General (No patient)</SelectItem>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Attach this file to a specific patient
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description for this file"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Public Access</FormLabel>
                      <FormDescription>
                        Anyone with the link can access this file
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={!uploadedFile}>
                  Upload File
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="flex items-center space-x-3 py-2">
              {getFileIcon(selectedFile.file_type)}
              <div>
                <p className="font-medium">{selectedFile.file_name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedFile.category} • {formatFileSize(selectedFile.file_size)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteFile}>
              Delete File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>File Preview</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getFileIcon(selectedFile.file_type)}
                  <div>
                    <p className="font-medium">{selectedFile.file_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.file_size)} • Uploaded on{' '}
                      {format(new Date(selectedFile.created_at), 'PPP')}
                    </p>
                  </div>
                </div>
                <a
                  href={supabase ? `${supabase.storage.from('center-files').getPublicUrl(selectedFile.file_path).data.publicUrl}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </a>
              </div>

              <div className="rounded-md border overflow-hidden p-4">
                {selectedFile.file_type.includes('image') ? (
                  <img
                    src={supabase ? `${supabase.storage.from('center-files').getPublicUrl(selectedFile.file_path).data.publicUrl}` : ''}
                    alt={selectedFile.file_name}
                    className="max-h-[500px] mx-auto object-contain"
                  />
                ) : selectedFile.file_type.includes('pdf') ? (
                  <iframe
                    src={supabase ? `${supabase.storage.from('center-files').getPublicUrl(selectedFile.file_path).data.publicUrl}` : ''}
                    className="w-full h-[500px] border-0"
                    title={selectedFile.file_name}
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileIcon className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                    <p>This file type cannot be previewed.</p>
                    <a
                      href={supabase ? `${supabase.storage.from('center-files').getPublicUrl(selectedFile.file_path).data.publicUrl}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block"
                    >
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download to View
                      </Button>
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span> {selectedFile.category}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Patient:</span>{' '}
                    {selectedFile.patient_name || 'General'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Visibility:</span>{' '}
                    {selectedFile.is_public ? 'Public' : 'Private'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded by:</span>{' '}
                    {selectedFile.uploaded_by_name || 'Staff'}
                  </div>
                </div>
                {selectedFile.description && (
                  <div className="mt-2">
                    <h4 className="font-medium">Description</h4>
                    <p className="text-sm mt-1">{selectedFile.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 