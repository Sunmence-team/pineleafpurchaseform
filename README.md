# Pineleaf Client Management System

## Overview

Pineleaf helps real estate teams manage land purchase applications from start to finish. Clients fill out a guided multi-step form, and administrators get a centralized dashboard to review, search, filter, edit, and export records. It replaces scattered spreadsheets and manual tracking with one clean system that handles everything from applicant details to property assignments, payment verification, and document generation.

```mermaid
flowchart LR
    WebClient["Web Client"]
    ReactApp["React Frontend"]
    RestAPIs["REST APIs"]
    ExternalAPIs["External Services"]
    Database[("Database")]

    WebClient --> ReactApp
    ReactApp --> RestAPIs
    RestAPIs --> Database
    ReactApp --> ExternalAPIs

    style WebClient fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff
    style ReactApp fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff
    style RestAPIs fill:#2e1065,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style ExternalAPIs fill:#2e1065,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style Database fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
```

## Features

- **Multi-step application form**: Clients choose between individual or club/association purchases and complete a guided four-section form with validation, dynamic country and state selection, digital signature capture, and referral details.

- **Role-based admin dashboard**: Authenticated admins land on an overview with live statistics, then navigate through records, properties, users, purchases, refunds, subscriptions, and flagged accounts.

- **Property and inventory management**: Create, edit, view, and toggle online/offline status for estate properties. Each property shows its record count and assigned entries.

- **Barrister property assignments**: Assign one or more properties to barristers, enforce one-barrister-per-property rules, and view all entries tied to a barrister.

- **Payment verification workflow**: Review purchase applications and interest indications, inspect uploaded proof of payment, and approve or reject transactions with optional admin notes.

- **Refund processing**: View refund requests, inspect bank details, and settle or reject claims with a recorded note.

- **Data export and document library**: Export single records or filtered batches as PDF or CSV, browse the generated document library, and submit barrister feedback against exported batches.

- **User verification**: Review registered users, download statements of account, and verify or reject applicants with an approved monthly revenue figure.

- **Flagged account management**: Review security alerts, inspect failed login or verification attempts, and resolve flags with optional re-enabling of the user.

### Multi-step Application Submission

```mermaid
sequenceDiagram
    actor Client
    participant FormUI as Application Form
    participant API as Backend API
    participant Storage as File Storage

    Client->>FormUI: Select purchase type
    FormUI->>Client: Show personal details section
    Client->>FormUI: Enter client info
    Client->>FormUI: Enter next of kin
    Client->>FormUI: Sign declaration
    Client->>FormUI: Add referral
    FormUI->>API: Submit application
    API->>Storage: Store documents
    API->>Client: Return confirmation
```

### Admin Export and Download Flow

```mermaid
sequenceDiagram
    actor Admin
    participant Dashboard as Records Dashboard
    participant ExportService as Export Service
    participant Library as Document Library

    Admin->>Dashboard: Choose download scope
    Dashboard->>ExportService: Request export
    ExportService->>ExportService: Generate file
    ExportService->>Library: Save download record
    ExportService->>Admin: Provide download link
```

### Payment Verification

```mermaid
sequenceDiagram
    actor Admin
    participant PurchaseView as Purchase Details
    participant Backend as Backend API

    Admin->>PurchaseView: Review pending transaction
    PurchaseView->>Admin: Show payment proof
    Admin->>PurchaseView: Approve or reject
    PurchaseView->>Backend: Update payment status
    Backend->>PurchaseView: Confirm result
    PurchaseView->>Admin: Show updated status
```

## Usage

### Client Application Submission

From the home page, applicants choose their purchase category:

1. **Individual**: For personal land investment.
2. **Club / Association**: For cooperative or group purchases.

The form is split into four sections:

1. **Section 1: Client Details**
   - Upload a profile photo.
   - Enter name, gender, marital status, and address.
   - Select country of residence and state of origin from searchable dropdowns.
   - For clubs, add registered members.

2. **Section 2: Next of Kin / Representative**
   - Capture the name, relationship or role, phone, and email of the contact person.

3. **Section 3: Client Declaration**
   - Enter land price, number of plots, property name, plot numbers, and branch.
   - Sign digitally on the canvas.
   - Pick a declaration date.

4. **Section 4: Referral**
   - Add the referral name and mobile number.
   - Submit the application and view the success screen.

### Administrator Dashboard

1. **Log in** at `/login` with your username and password.
2. **Dashboard overview** at `/dashboard/overview` shows live counts for applications, properties, branches, barristers, and downloads.
3. **Manage records** at `/dashboard/records` to search, filter by branch, view details, edit, or delete entries.
4. **Export data** from the records page using the Download button, choosing either to continue from the last download or export all records, then selecting PDF or CSV.
5. **View applications** by clicking the view action on any record row to see full applicant details and add internal notes.
6. **Manage properties** at `/dashboard/properties` to toggle online/offline status and inspect entries per property.
7. **Manage barristers** under Settings to assign properties and view their linked entries.
8. **Process purchases, refunds, and subscriptions** from their respective sidebar sections.
9. **Verify users** from `/dashboard/manage/users` to approve salaries and download account statements.
10. **Handle flagged accounts** at `/dashboard/manage/flagged-accounts` to resolve security alerts.

## Technologies Used

| Category | Technology | Description |
| :------- | :--------- | :---------- |
| Language | [TypeScript](https://www.typescriptlang.org/) | Typed JavaScript for safer code. |
| Framework | [React](https://react.dev/) | Component-based UI library. |
| Build Tool | [Vite](https://vitejs.dev/) | Fast modern frontend tooling. |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework. |
| State Management | [TanStack Query](https://tanstack.com/query/latest) | Server-state caching and mutations. |
| Forms | [Formik](https://formik.org/) | Form state and handling. |
| Validation | [Yup](https://github.com/jquense/yup) | Schema-based form validation. |
| Routing | [React Router](https://reactrouter.com/) | Declarative client-side routing. |
| HTTP Client | [Axios](https://axios-http.com/) | Promise-based API requests. |
| Notifications | [Sonner](https://sonner.emilkowal.ski/) | Toast notifications. |
| Date Handling | [date-fns](https://date-fns.org/) and [React Datepicker](https://reactdatepicker.com/) | Date formatting and picker components. |
| Phone Validation | [libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js) | International phone validation. |
| PDF Export | [jsPDF](https://jspdf.org/) and [jspdf-autotable](https://www.npmjs.com/package/jspdf-autotable) | Client-side PDF generation. |
| Animations | [Framer Motion](https://www.framer.com/motion/) | Page transitions and UI animations. |

## Badges

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/latest)
[![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://dokugen.samueltuoyo.com)