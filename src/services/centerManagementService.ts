import { supabase } from '@/lib/supabase-client';
import { v4 as uuidv4 } from 'uuid';
import type { Database } from '@/integrations/supabase/types';
import { 
  CenterServiceFormData, 
  CenterServiceResponse, 
  CenterFileFormData,
  CenterFileResponse,
  CenterServiceQueryParams,
  CenterFileQueryParams,
  CenterServiceUI,
  CenterFileWithDetails
} from '@/types/center-management';
import { notificationService } from '@/services/notificationService';

type CenterServices = Database['public']['Tables']['center_services'];
type CenterFiles = Database['public']['Tables']['center_files'];


/**
 * Service for center service management and file storage
 */
export const centerManagementService = {
  /**
   * Create a new center service
   */
  async createService(
    center_id: string,
    data: CenterServiceFormData
  ): Promise<CenterServiceResponse> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return {
          success: false,
          message: 'Supabase client not initialized'
        };
      }
      const { data: serviceData, error } = await supabase
        .from('center_services')
        .insert({
          center_id,
          name: data.name,
          description: data.description,
          duration_minutes: data.duration_minutes,
          price: data.price,
          is_available: data.is_available,
          requires_appointment: data.requires_appointment,
          category: data.category,
        } as CenterServices['Insert'])
        .select('id')
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Service created successfully',
        service_id: serviceData?.id || ''
      };
    } catch (error: unknown) {
      console.error('Error creating service:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create service'
      };
    }
  },

  /**
   * Update an existing center service
   */
  async updateService(
    service_id: string,
    data: Partial<CenterServiceFormData>
  ): Promise<CenterServiceResponse> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return {
          success: false,
          message: 'Supabase client not initialized'
        };
      }
      const { error } = await supabase
        .from('center_services')
        .update({
          name: data.name,
          description: data.description,
          duration_minutes: data.duration_minutes,
          price: data.price,
          is_available: data.is_available,
          requires_appointment: data.requires_appointment,
          category: data.category,
          updated_at: new Date().toISOString()
        } as CenterServices['Update'])
        .eq('id', service_id);

      if (error) throw error;

      return {
        success: true,
        message: 'Service updated successfully',
        service_id
      };
    } catch (error: unknown) {
      console.error('Error updating service:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update service'
      };
    }
  },

  /**
   * Delete a center service
   */
  async deleteService(service_id: string): Promise<CenterServiceResponse> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return {
          success: false,
          message: 'Supabase client not initialized'
        };
      }
      const { error } = await supabase
        .from('center_services')
        .delete()
        .eq('id', service_id);

      if (error) throw error;

      return {
        success: true,
        message: 'Service deleted successfully'
      };
    } catch (error: unknown) {
      console.error('Error deleting service:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete service'
      };
    }
  },

  /**
   * Get center services with filters
   */
  async getServices(params: CenterServiceQueryParams): Promise<CenterServiceUI[]> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return [];
      }
      const { data, error } = await supabase.rpc('get_center_services', {
        p_center_id: params.center_id,
        p_category: params.category,
        p_is_available: params.is_available,
        p_search: params.search,
        p_limit: params.limit || 100,
        p_offset: params.offset || 0
      } as any);

      if (error) throw error;

      return (data || []).map(service => ({
        ...service,
        is_available: service.is_available ?? false,
        requires_appointment: service.requires_appointment ?? false,
        created_at: service.created_at || new Date().toISOString(),
        updated_at: service.updated_at || new Date().toISOString()
      }));
    } catch (error: unknown) {
      console.error('Error fetching services:', error);
      return [];
    }
  },

  /**
   * Get a single service by ID
   */
  async getServiceById(service_id: string): Promise<CenterServiceUI | null> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return null;
      }
      const { data, error } = await supabase
        .from('center_services')
        .select('*')
        .eq('id', service_id)
        .single();

      if (error) throw error;

      return data ? {
        ...data,
        is_available: data.is_available ?? false,
        requires_appointment: data.requires_appointment ?? false,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      } : null;
    } catch (error: unknown) {
      console.error('Error fetching service:', error);
      return null;
    }
  },

  /**
   * Upload a file to the center's storage
   */
  async uploadFile(
    center_id: string,
    staff_id: string,
    data: CenterFileFormData
  ): Promise<CenterFileResponse> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return {
          success: false,
          message: 'Supabase client not initialized'
        };
      }
      // Generate a unique file name
      const fileExt = data.file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `centers/${center_id}/${data.category}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('center-files')
        .upload(filePath, data.file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('center-files')
        .getPublicUrl(filePath);

      // Insert record in database
      const { data: fileData, error: dbError } = await supabase
        .from('center_files')
        .insert({
          center_id,
          patient_id: data.patient_id,
          file_name: data.file.name,
          file_path: filePath,
          file_type: data.file.type,
          file_size: data.file.size,
          category: data.category,
          description: data.description,
          tags: data.tags,
          is_public: data.is_public,
          uploaded_by: staff_id
        } as CenterFiles['Insert'])
        .select('id')
        .single();

      if (dbError) {
        // Delete the uploaded file if database insert fails
        await supabase.storage.from('center-files').remove([filePath]);
        throw dbError;
      }

      // If this is a patient file, notify the patient
      if (data.patient_id) {
        // Get patient's user ID
        const { data: patientData } = await supabase
          .from('patients')
          .select('profile_id, name')
          .eq('id', data.patient_id)
          .single();

        if (patientData) {
          await notificationService.createNotification({
            userId: patientData?.profile_id || '',
            title: 'New File Uploaded',
            message: `A new ${data.category} file has been uploaded to your records.`,
            type: 'info'
          });
        }
      }

      return {
        success: true,
        message: 'File uploaded successfully',
        file_id: fileData?.id || '',
        file_path: publicUrlData.publicUrl
      };
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload file'
      };
    }
  },

  /**
   * Delete a file from storage and database
   */
  async deleteFile(file_id: string): Promise<CenterFileResponse> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return {
          success: false,
          message: 'Supabase client not initialized'
        };
      }
      // Get file path first
      const { data: fileData, error: fetchError } = await supabase
        .from('center_files')
        .select('file_path')
        .eq('id', file_id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('center-files')
        .remove([fileData?.file_path || '']);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('center_files')
        .delete()
        .eq('id', file_id);

      if (dbError) throw dbError;

      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error: unknown) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete file'
      };
    }
  },

  /**
   * Get files with filters
   */
  async getFiles(params: CenterFileQueryParams): Promise<CenterFileWithDetails[]> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return [];
      }
      const { data, error } = await supabase.rpc('get_center_files', {
        p_center_id: params.center_id,
        p_patient_id: params.patient_id,
        p_category: params.category,
        p_search: params.search,
        p_limit: params.limit || 100,
        p_offset: params.offset || 0
      } as any);

      if (error) throw error;

      return data || [];
    } catch (error: unknown) {
      console.error('Error fetching files:', error);
      return [];
    }
  },

  /**
   * Get a single file by ID
   */
  async getFileById(file_id: string): Promise<CenterFileWithDetails | null> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return null;
      }
      const { data, error } = await supabase
        .from('center_files')
        .select('*')
        .eq('id', file_id)
        .single();

      if (error) throw error;

      return data ? {
        ...data,
        is_public: data.is_public ?? false,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        uploaded_by_name: 'Unknown',
        patient_name: undefined
      } : null;
    } catch (error: unknown) {
      console.error('Error fetching file:', error);
      return null;
    }
  },

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    file_id: string,
    metadata: {
      category?: string;
      description?: string;
      tags?: string[];
      is_public?: boolean;
    }
  ): Promise<CenterFileResponse> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return {
          success: false,
          message: 'Supabase client not initialized'
        };
      }
      const { error } = await supabase
        .from('center_files')
        .update({
          category: metadata.category,
          description: metadata.description,
          tags: metadata.tags,
          is_public: metadata.is_public,
          updated_at: new Date().toISOString()
        } as CenterFiles['Update'])
        .eq('id', file_id);

      if (error) throw error;

      return {
        success: true,
        message: 'File metadata updated successfully'
      };
    } catch (error: unknown) {
      console.error('Error updating file metadata:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update file metadata'
      };
    }
  }
}; 