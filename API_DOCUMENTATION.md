# Centralized Clinic Token Appointment System - API Documentation

This document provides a comprehensive overview of the backend API endpoints and real-time socket events.

## 📡 REST API Endpoints

Base URL: `http://localhost:5000/api/v1`

### 🔐 Authentication
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login and receive JWT tokens | Public |
| POST | `/auth/refresh` | Refresh access token using refresh token | Public |
| POST | `/auth/forgot-password` | Request password reset email | Public |
| POST | `/auth/reset-password` | Reset password using token | Public |
| POST | `/auth/change-password` | Change password while logged in | Authenticated |

### 👤 User Profile
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/users/profile` | Get current user's profile | Authenticated |
| PATCH | `/users/profile` | Update user profile data | Authenticated |

### 🏥 Clinics
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/clinics` | List all clinics | Authenticated |
| GET | `/clinics/:clinicId` | Get detailed clinic info | Authenticated |
| POST | `/clinics` | Create a new clinic | Authenticated |
| PATCH | `/clinics/:clinicId` | Update clinic information | Admin |
| POST | `/clinics/:clinicId/invite` | Invite staff/doctors to clinic | Admin |
| GET | `/clinics/:clinicId/members` | List all members of a clinic | Authenticated |

### 👨‍⚕️ Doctors
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/clinics/:clinicId/doctors` | Add a doctor profile to a clinic | Admin |
| GET | `/clinics/:clinicId/doctors` | List doctors in a specific clinic | Authenticated |
| GET | `/doctors/:doctorId` | Get detailed doctor profile | Authenticated |
| PATCH | `/doctors/:doctorId` | Update doctor profile | Admin/Doctor |
| PATCH | `/doctors/:doctorId/status` | Toggle doctor active status | Admin |
| GET | `/doctors/:doctorId/availability`| Check if doctor is currently available | Authenticated |

### 📅 Doctor Schedules
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/doctors/:doctorId/schedules` | Create a new availability slot | Admin/Doctor |
| GET | `/doctors/:doctorId/schedules` | List doctor's scheduled slots | Authenticated |
| PATCH | `/schedules/:scheduleId` | Update a specific schedule slot | Admin/Doctor |
| DELETE | `/schedules/:scheduleId` | Delete a schedule slot | Admin/Doctor |

### 👥 Patients
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/clinics/:clinicId/patients` | Register a patient in a clinic | Admin/Staff |
| GET | `/clinics/:clinicId/patients` | List patients of a clinic | Admin/Staff |
| GET | `/clinics/:clinicId/patients/search`| Search patients by name/phone | Admin/Staff |
| GET | `/patients/:id` | Get detailed patient info | Authenticated |
| PATCH | `/patients/:id` | Update patient records | Admin/Staff |
| PATCH | `/patients/:id/status` | Toggle patient active status | Admin/Staff |

### 🎟️ Tokens & Queue
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/tokens` | Generate a new token for a patient | Authenticated |
| GET | `/doctors/:doctorId/current-token` | Get current token being served | Authenticated |
| GET | `/doctors/:doctorId/queue` | List all tokens in the queue | Authenticated |
| POST | `/tokens/next` | Move to next token in queue | Admin/Staff/Doctor |
| PATCH | `/tokens/:tokenId/skip` | Mark a token as skipped | Admin/Staff/Doctor |
| PATCH | `/tokens/:tokenId/cancel` | Cancel a token | Admin/Staff/Patient |
| GET | `/patients/:patientId/tokens` | Get token history for a patient | Authenticated |
| GET | `/tokens/:tokenId` | Get details for a specific token | Authenticated |
| GET | `/display/:clinicId/:doctorId` | Public data for display screens | Public |

---

## 🔌 Real-time Socket Events

Server URL: `http://localhost:5000`
Authentication: Required (JWT in `handshake.auth.token` or headers)

### Actions (Client to Server)
| Event | Payload | Description |
| :--- | :--- | :--- |
| `join_queue` | `{ clinicId: string, doctorId: string }` | Join the real-time room for a specific doctor's queue. |

### Events (Server to Client)
Room name format: `${clinicId}-${doctorId}`

| Event | Payload | Description |
| :--- | :--- | :--- |
| `token:created` | `{ tokenNumber: number, doctorId: string }` | Emitted when a new token is added to the queue. |
| `token:next` | `{ currentToken: number }` | Emitted when the "Call Next" action is performed. |
| `token:skipped` | `{ tokenNumber: number }` | Emitted when a token is skipped. |
| `token:cancelled` | `{ tokenNumber: number }` | Emitted when a token is cancelled. |

---

## 🛠️ Data Types (Brief)

### Token Status
- `WAITING`: Patient is in the queue.
- `IN_PROGRESS`: Patient is currently with the doctor.
- `COMPLETED`: Consultation finished.
- `SKIPPED`: Patient was not present when called.
- `CANCELLED`: Appointment withdrawn.

### Clinic Roles
- `CLINIC_ADMIN`: Full access to clinic data, settings, and staff.
- `STAFF`: Can manage patients and token queues.
- `DOCTOR`: Can view their own queue and manage their availability.
- `PATIENT`: Can book tokens and view their history (via phone number association).
