
/*
 * Script: Add display_id columns to profiles and healthcare_centers tables
 * 
 * This script adds the missing display_id columns to the tables
 * Run with: 
 * node src/scripts/add-display-id-columns.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Use environment variables directly
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log('Debug: SUPABASE_URL length:', SUPABASE_URL?.length);
console.log('Debug: SUPABASE_SERVICE_KEY length:', SUPABASE_SERVICE_KEY?.length);

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  console.error('Run this script with:');
  console.error('VITE_SUPABASE_URL=your-url SUPABASE_SERVICE_KEY=your-key node src/scripts/add-display-id-columns.js');
  process.exit(1);
}

// Remove quotes if present in the environment variables
const cleanUrl = SUPABASE_URL.replace(/^"|"$/g, '');
const cleanKey = SUPABASE_SERVICE_KEY.replace(/^"|"$/g, '');

console.log(`Debug: Connecting to Supabase at ${cleanUrl.substring(0, 15)}...`);

// Connect to Supabase with service key for admin privileges
const supabase = createClient(cleanUrl, cleanKey);

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
 * Execute SQL query with service role
 */
async function executeSql(query) {
  try {
    const { data, error } = await supabase.rpc('pg_query', { query_text: query });
    
    if (error) {
      // If pg_query RPC doesn't exist, try direct query
      const { data: directData, error: directError } = await supabase.auth.admin.executeSql(query);
      
      if (directError) {
        return { error: directError };
      }
      
      return { data: directData };
    }
    
    return { data };
  } catch (error) {
    return { error };
  }
}

/**
 * Add display_id column to profiles table
 */
async function addDisplayIdToProfiles() {
  console.log('🔄 Adding display_id column to profiles table...');
  
  try {
    // Use executeSql function to run the ALTER TABLE query
    const { data, error } = await executeSql(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS display_id TEXT;
    `);
    
    if (error) {
      console.error('❌ Error adding display_id to profiles:', error);
      return false;
    }
    
    console.log('✅ Added display_id column to profiles table');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error in addDisplayIdToProfiles:', error);
    return false;
  }
}

/**
 * Add display_id column to healthcare_centers table
 */
async function addDisplayIdToCenters() {
  console.log('🔄 Adding display_id column to healthcare_centers table...');
  
  try {
    // Use executeSql function to run the ALTER TABLE query
    const { data, error } = await executeSql(`
      ALTER TABLE healthcare_centers 
      ADD COLUMN IF NOT EXISTS display_id TEXT;
    `);
    
    if (error) {
      console.error('❌ Error adding display_id to healthcare_centers:', error);
      return false;
    }
    
    console.log('✅ Added display_id column to healthcare_centers table');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error in addDisplayIdToCenters:', error);
    return false;
  }
}

/**
 * Run the schema migration
 */
async function runSchemaMigration() {
  console.log('🚀 Starting schema migration to add display_id columns...');
  
  try {
    // Test connection first
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Skipping migration due to connection issues');
      return;
    }
    
    // Add columns to both tables
    const profilesSuccess = await addDisplayIdToProfiles();
    const centersSuccess = await addDisplayIdToCenters();
    
    if (profilesSuccess && centersSuccess) {
      console.log('✅ Schema migration completed successfully!');
      console.log('🔔 You can now run the display_id migration script:');
      console.log('   node src/scripts/migrate-display-ids.js');
    } else {
      console.error('❌ Schema migration completed with errors');
    }
  } catch (error) {
    console.error('❌ Schema migration failed:', error);
  }
}

// Run the schema migration
runSchemaMigration();
