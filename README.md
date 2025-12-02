# Pineleaf Client Management System 🌿

## Overview
The Pineleaf Client Management System is a robust web application built with **React** and **Vite**, designed to streamline the process of managing client land purchase applications. It features a dynamic multi-step form for new submissions and a comprehensive dashboard for administrators to view, search, filter, edit, and export client data. The application prioritizes a responsive user experience and leverages modern frontend technologies for efficient data handling and presentation.

## Features
-   **Multi-Step Client Application Form**: A guided, intuitive four-section form for new land purchase applications, ensuring all necessary details are captured.
-   **Dashboard for Administrators**: A centralized hub offering an overview of all client applications with powerful search and filtering capabilities.
-   **Advanced Filtering Options**: Filter records by specific branches or custom date/time ranges, including convenient presets like "Today", "This Week", and "Last Month".
-   **Data Export Capabilities**: Download filtered client data as CSV or professionally formatted PDF reports directly from the dashboard.
-   **Client Record Management (CRUD)**: Easily view, edit, and delete individual client records through dedicated pages.
-   **Robust Form Validation**: Implemented using Formik and Yup for real-time, comprehensive input validation, including international phone number validation with `libphonenumber-js`.
-   **Dynamic Country & State Selection**: Automatically fetches states based on the selected country, enhancing data accuracy and user experience.
-   **Secure Authentication**: Features a login system to restrict dashboard access to authorized personnel, protecting sensitive client information.
-   **Responsive User Interface**: Crafted with Tailwind CSS to ensure a seamless and optimized experience across various devices and screen sizes.

## Usage

### Client Application Submission
To submit a new client application, navigate to the home page. The form is divided into four sections to guide users through the process:

1.  **Section 1: Client's Details**
    -   Fill in personal information, contact details, and upload a profile picture.
    -   Dynamic country and state selection will assist in accurate address details.
    -   Marital status influences the visibility of spouse details.

2.  **Section 2: Next of Kin Details**
    -   Provide contact and address information for the client's next of kin.

3.  **Section 3: Client's Declaration**
    -   Confirm personal declaration, provide land purchase details (land price, number of plots, site/plot number, branch).
    -   Includes a digital signature pad and date declaration.

4.  **Section 4: Referral Details**
    -   Input information about the referrer, if applicable.

After completing all sections, click "Submit" to finalize the application. A success page will confirm the submission.

### Administrator Dashboard Access
1.  **Login**: Access the administrator login page by navigating to `/login`.
    -   Enter your `username` and `password`.
    -   Successful login will redirect you to the dashboard.

2.  **Dashboard Overview**:
    -   The dashboard displays a paginated list of all client applications.
    -   Use the **search bar** to quickly find clients by name, email, or phone number.
    -   **Filter by Branch**: Click the "Branch" button to open a modal and select a specific branch to filter records.
    -   **Filter by Date and Time**: Click the "Filter" button to open a modal where you can specify a date and time range or use quick presets (Today, Yesterday, This Week, etc.) to narrow down results.
    -   **Download Records**: Click the "Download" button to export records. You can specify a date range for the download. The system tracks your last download time and will offer to download new records since then for subsequent exports.

3.  **Viewing Client Details**:
    -   Click the <FaEye /> icon next to any client record in the table (or card on mobile) to view their complete details on a dedicated page.
    -   From the view page, you can print or download the client's full details as a PDF.

4.  **Editing Client Details**:
    -   Click the <FaEdit /> icon next to any client record to open the edit page.
    -   Modify any client information and click "Update Client" to save changes.

5.  **Deleting Client Records**:
    -   Click the <FaTrashAlt /> icon next to a client record to delete it. A confirmation prompt may appear.

## Technologies Used
This project leverages a modern stack to deliver a high-quality user experience and efficient development:

| Category          | Technology                                                                                                  | Description                                                          |
| :---------------- | :---------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| **Frontend**      | [React ⚛️](https://react.dev/)                                                                           | A declarative, component-based JavaScript library for building user interfaces. |
|                   | [Vite](https://vitejs.dev/)                                                                                 | A next-generation frontend tooling that provides an extremely fast development experience. |
|                   | [Tailwind CSS](https://tailwindcss.com/)                                                                    | A utility-first CSS framework for rapidly building custom designs.   |
| **State/Forms**   | [Formik](https://formik.org/)                                                                               | A popular React library for building forms, handling state, validation, and submission. |
|                   | [Yup](https://github.com/jquense/yup)                                                                       | A JavaScript schema builder for value parsing and validation.        |
| **Data Fetching** | [Axios](https://axios-http.com/)                                                                            | A promise-based HTTP client for making API requests.                 |
| **Date Handling** | [React Datepicker](https://reactdatepicker.com/)                                                            | A customizable and accessible date picker component for React.       |
|                   | [Date-fns](https://date-fns.org/)                                                                           | A comprehensive JavaScript date utility library.                     |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/)                                                                     | An opinionated toast component for React, designed for ease of use and style. |
| **Routing**       | [React Router DOM](https://reactrouter.com/en/main)                                                         | Declarative routing for React applications.                          |
| **PDF Generation**| [jsPDF](https://jspdf.org/) & [jspdf-autotable](https://www.npmjs.com/package/jspdf-autotable)             | Client-side JavaScript PDF generation, with enhanced table creation. |
| **Phone Validation**| [libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js)                                  | International phone number parsing, formatting, and validation.      |

## Author Info

👋 Connect with me!

- **Portfolio**: [Your Portfolio](https://your-portfolio-link.com)
- **LinkedIn**: [Your LinkedIn](https://linkedin.com/in/yourusername)
- **Twitter**: [@YourTwitterHandle](https://twitter.com/YourTwitterHandle)

---

[![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-purple?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![Formik](https://img.shields.io/badge/Formik-2.x-lightgray?style=for-the-badge)](https://formik.org/)
[![Yup](https://img.shields.io/badge/Yup-1.x-orange?style=for-the-badge)](https://github.com/jquense/yup)
[![date--fns](https://img.shields.io/badge/date--fns-2.x-red?style=for-the-badge&logo=date-fns&logoColor=white)](https://date-fns.org/)
[![jsPDF](https://img.shields.io/badge/jsPDF-2.x-red?style=for-the-badge)](https://jspdf.org/)

[<img alt="Deployed with FTP Deploy Action" src="https://img.shields.io/badge/Deployed With-FTP DEPLOY ACTION-%3CCOLOR%3E?style=for-the-badge&color=2b9348">](https://github.com/SamKirkland/FTP-Deploy-Action)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)