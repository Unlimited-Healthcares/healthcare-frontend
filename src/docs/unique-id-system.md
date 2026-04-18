
# Unique ID Generation System

This document explains the unique ID generation system implemented in Med-ID Nexus.

## Overview

Every user and healthcare center in the system has a unique, readable ID that is displayed prominently in the dashboard. These IDs follow a consistent format and are used for identification, referrals, and data sharing.

## ID Format

The format of the IDs is:

```
MED-[TYPE]-[RANDOM]-[TIMESTAMP]
```

Where:
- **MED**: Prefix for all Medical IDs
- **TYPE**: Single letter code indicating the entity type:
  - P: Patient
  - D: Doctor
  - C: Center
  - A: Admin
- **RANDOM**: 4-character random alphanumeric string
- **TIMESTAMP**: Last 6 digits of the timestamp when the ID was generated

Example: `MED-P-A7B3-123456`

## Implementation

The ID generation is handled by the `generateUniqueId` function in `src/lib/utils.ts`. IDs are generated in the following scenarios:

1. When a new user registers
2. When a new healthcare center is registered
3. When a user logs in and doesn't have an ID yet

The IDs are stored in the `display_id` field in both the `profiles` and `healthcare_centers` tables.

## Migration

For existing users and centers, a migration script (`src/scripts/migrate-display-ids.js`) is provided to generate and assign IDs. 

To run the migration:

1. Ensure you have the `SUPABASE_SERVICE_KEY` environment variable set
2. Run `node src/scripts/migrate-display-ids.js`

## UI Integration

The user's ID is displayed prominently in the dashboard header using the `UserIdDisplay` component:

```tsx
<UserIdDisplay />
```

This component shows the ID and provides a copy-to-clipboard functionality.

## Future Enhancements

Planned enhancements to the ID system include:

1. QR code generation for easy scanning
2. Barcode integration for medical reports
3. NFC compatibility for physical ID cards
4. Verification system for ID authenticity 
