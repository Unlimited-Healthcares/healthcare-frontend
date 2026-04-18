
/*
 * Migration Script: Add display_id to existing profiles and healthcare_centers
 * 
 * This script should be run once to update existing records
 * Run with: 
 * node src/scripts/migrate-display-ids.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Use environment variables directly
// Make sure to run this script with the required environment variables:
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Debug: SUPABASE_URL length:', SUPABASE_URL?.length);
console.log('Debug: SUPABASE_ANON_KEY length:', SUPABASE_ANON_KEY?.length);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required');
  console.error('Run this script with:');
  console.error('VITE_SUPABASE_URL=your-url VITE_SUPABASE_ANON_KEY=your-key node src/scripts/migrate-display-ids.js');
  process.exit(1);
}

// Remove quotes if present in the environment variables
const cleanUrl = SUPABASE_URL.replace(/^"|"$/g, '');
const cleanKey = SUPABASE_ANON_KEY.replace(/^"|"$/g, '');

console.log(`Debug: Connecting to Supabase at ${cleanUrl.substring(0, 15)}...`);

// Connect to Supabase
const supabase = createClient(cleanUrl, cleanKey);

/**
 * Generates a formatted unique ID
 */
function generateUniqueId(type) {
  const typeCode = type === 'patient' ? 'P' : 
                  type === 'doctor' ? 'D' : 
                  type === 'center' ? 'C' : 'A';
  
  // Generate a random alphanumeric string (4 characters)
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  // Use current timestamp (last 6 digits)
  const timestampPart = Date.now().toString().slice(-6);
  
  return `MED-${typeCode}-${randomPart}-${timestampPart}`;
}

/**
 * Test the Supabase connection
 */
async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
    
    console.log('✅ Connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed with exception:', error);
    return false;
  }
}

/**
 * Updates all profiles without a display_id
 */
async function updateProfiles() {
  console.log('🔄 Updating profiles...');
  
  try {
    // Get all profiles without a display_id
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, role')
      .is('display_id', null);
    
    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return;
    }
    
    console.log(`ℹ️ Found ${profiles?.length || 0} profiles to update`);
    
    // Update each profile with a new display_id
    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        const role = profile.role || 'patient';
        const displayId = generateUniqueId(
          role === 'doctor' ? 'doctor' : 
          role === 'admin' ? 'admin' : 
          role === 'center' ? 'center' : 'patient'
        );
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ display_id: displayId })
          .eq('id', profile.id);
        
        if (updateError) {
          console.error(`❌ Error updating profile ${profile.id}:`, updateError);
        } else {
          console.log(`✅ Updated profile ${profile.id} with display_id: ${displayId}`);
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      console.log('ℹ️ No profiles need updating');
    }
  } catch (error) {
    console.error('❌ Unexpected error in updateProfiles:', error);
  }
}

/**
 * Updates all healthcare centers without a display_id
 */
async function updateCenters() {
  console.log('🔄 Updating healthcare centers...');
  
  try {
    // Get all centers without a display_id
    const { data: centers, error } = await supabase
      .from('healthcare_centers')
      .select('id')
      .is('display_id', null);
    
    if (error) {
      console.error('❌ Error fetching healthcare centers:', error);
      return;
    }
    
    console.log(`ℹ️ Found ${centers?.length || 0} centers to update`);
    
    // Update each center with a new display_id
    if (centers && centers.length > 0) {
      for (const center of centers) {
        const displayId = generateUniqueId('center');
        
        const { error: updateError } = await supabase
          .from('healthcare_centers')
          .update({ display_id: displayId })
          .eq('id', center.id);
        
        if (updateError) {
          console.error(`❌ Error updating center ${center.id}:`, updateError);
        } else {
          console.log(`✅ Updated center ${center.id} with display_id: ${displayId}`);
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      console.log('ℹ️ No centers need updating');
    }
  } catch (error) {
    console.error('❌ Unexpected error in updateCenters:', error);
  }
}

/**
 * Run the migration
 */
async function runMigration() {
  console.log('🚀 Starting display_id migration...');
  
  try {
    // Test connection first
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Skipping migration due to connection issues');
      return;
    }
    
    // Update profiles first
    await updateProfiles();
    
    // Then update centers
    await updateCenters();
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
runMigration();
