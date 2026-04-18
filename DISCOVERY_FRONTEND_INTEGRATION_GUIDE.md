# Discovery Frontend Integration Guide

This guide explains exactly when to use Requests vs Invitations, with real DTOs and endpoints from the backend, to achieve the Discovery → Connection/Staffing → Appointment workflow.

## API Base

- Use `https://api.unlimtedhealth.com/api` for all calls.

## When to Use Requests vs Invitations

- Requests: in-app actionable requests between existing users (UUID → UUID)
  - Patient → Doctor: `connection`
  - Doctor → Center Owner (user): `job_application`
  - Doctor → Doctor: `collaboration`
  - Center/Staff → Doctor (already registered): `staff_invitation` (optional path using requests)
- Invitations: email-based onboarding for not-yet-registered users (email-first)
  - Center → Doctor: `staff_invitation` (email)
  - Doctor → Patient: `patient_invitation`
  - Doctor → Doctor: `doctor_invitation`
  - Collaboration via invitation: `collaboration_invitation`

## Discovery Data to Use

- Center search now returns both identifiers:
  - `publicId`: human display ID (e.g., `MAT580137205`)
  - `id`: UUID for API operations. Always use this for center actions.

- For center details, call: `GET /centers/:id`
- To target the owner user for applications: `GET /centers/:id/owner` → `{ userId: string, ... }`

## DTOs (Exact from Backend)

### Requests

CreateRequestDto

```json
{
  "recipientId": "<user-uuid>",
  "requestType": "connection | job_application | collaboration | patient_request | staff_invitation | referral",
  "message": "<string>",
  "metadata": { "...": "..." }
}
```

RespondRequestDto

```json
{
  "action": "approve | reject",
  "message": "<optional string>"
}
```

GetRequestsDto (query)

```json
{
  "status": "<optional string>",
  "type": "<optional string>",
  "page": 1,
  "limit": 20
}
```

RequestResponseDto (response fields)

```json
{
  "id": "<uuid>",
  "senderId": "<uuid>",
  "recipientId": "<uuid>",
  "requestType": "<string>",
  "status": "pending | approved | rejected | cancelled",
  "message": "<optional string>",
  "metadata": { "...": "..." },
  "createdAt": "<date>",
  "respondedAt": "<optional date>",
  "responseMessage": "<optional string>",
  "createdBy": "<uuid>",
  "updatedAt": "<date>",
  "sender": { /* SafeUserDto */ },
  "recipient": { /* SafeUserDto */ }
}
```

### Invitations

CreateInvitationDto

```json
{
  "email": "user@example.com",
  "invitationType": "staff_invitation | doctor_invitation | patient_invitation | collaboration_invitation",
  "role": "<optional string for staff>",
  "message": "<optional string>",
  "centerId": "<optional center uuid for staff_invitation>",
  "metadata": { "...": "..." }
}
```

AcceptInvitationDto

```json
{
  "name": "<string>",
  "password": "<min 8 chars>",
  "phone": "<optional string>",
  "profileData": { "...": "..." }
}
```

DeclineInvitationDto

```json
{
  "reason": "<optional string>"
}
```

## Endpoints (Exact)

### Requests (in-app)

- POST `/requests`
- GET `/requests/received?status=&type=&page=&limit=`
- GET `/requests/sent?status=&type=&page=&limit=`
- GET `/requests/:id`
- PATCH `/requests/:id/respond`
- DELETE `/requests/:id`

### Invitations (email-based)

- POST `/invitations`
- GET `/invitations/pending?email=:email`
- GET `/invitations/:id`
- GET `/invitations/center/:centerId?page=&limit=`
- POST `/invitations/:token/accept`
- POST `/invitations/:token/decline`

### Centers & Discovery

- GET `/centers/search?type=&location=&page=&limit=` → items include `publicId` and `id` (UUID)
- GET `/centers/:id`
- GET `/centers/:id/owner` → `{ userId: string, ... }`
- GET `/centers/:id/staff`
- GET `/users/search?...`
- GET `/users/:id/public-profile`

## Frontend Integration Examples

### 1) Doctor applies to a Center (Requests → job_application)

```ts
// discoveryService.ts
export async function createJobApplication(centerId: string, message: string, metadata: Record<string, unknown>) {
  const owner = await apiClient.get(`/centers/${centerId}/owner`).then(r => r.data);
  if (!owner?.userId) throw new Error('Center owner not found');
  const res = await apiClient.post('/requests', {
    recipientId: owner.userId,
    requestType: 'job_application',
    message,
    metadata
  });
  return res.data;
}
```

### 2) Center invites a Doctor (Invitations → staff_invitation)

```ts
// discoveryService.ts
export async function inviteDoctorByEmail(centerId: string, email: string, message?: string, metadata?: Record<string, unknown>) {
  const res = await apiClient.post('/invitations', {
    email,
    invitationType: 'staff_invitation',
    role: 'doctor',
    centerId,
    message,
    metadata
  });
  return res.data;
}
```

### 3) Patient connects to a Doctor (Requests → connection)

```ts
export async function connectToDoctor(doctorUserId: string, message: string, medicalContext?: Record<string, unknown>) {
  const res = await apiClient.post('/requests', {
    recipientId: doctorUserId,
    requestType: 'connection',
    message,
    metadata: medicalContext
  });
  return res.data;
}
```

### 4) Doctor invites Patient (Invitations → patient_invitation)

```ts
export async function invitePatient(email: string, doctorName: string, specialty: string) {
  const res = await apiClient.post('/invitations', {
    email,
    invitationType: 'patient_invitation',
    message: `I would like to invite you to join our patient portal`,
    metadata: { doctorName, specialty }
  });
  return res.data;
}
```

### 5) Resolve IDs in UI

- Centers: use `center.id` (UUID) from `/centers/search` directly. Do not call `/centers/:publicId/public-profile`.
- Users: for public pages, `GET /users/:id/public-profile` still valid if you only have `publicId`.

### 6) Full Workflow (Diagram-aligned)

1. Patient searches doctors → `/users/search`
2. Patient views doctor profile → `/users/:id/public-profile`
3. Patient sends connection request → POST `/requests`
4. Doctor approves → PATCH `/requests/:id/respond`
5. Patient books appointment → POST `/appointments`
6. Center searches doctors → `/users/search`
7. Center invites doctor via email → POST `/invitations`
8. Doctor (existing) can alternatively apply to center → POST `/requests` with `job_application` to center owner

## Notes

- Always target UUIDs for `recipientId` in requests.
- For center actions use `center.id` (UUID) from search results.
- Base URL: `https://api.unlimtedhealth.com/api`.
