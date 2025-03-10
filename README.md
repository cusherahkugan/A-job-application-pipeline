Job Application Processing Pipeline
A complete solution for collecting, processing, and analyzing job applications with automated CV parsing, cloud storage, and follow-up communication.
Features

Modern responsive job application form with client-side validation
CV document upload (PDF/DOCX) with real-time validation
Secure cloud storage for CV files (Firebase Storage)
Intelligent CV parsing to extract education, qualifications, and projects
Automatic data storage in Google Sheets
Webhook notifications for application processing
Timezone-aware follow-up emails scheduled for the next day
Comprehensive error handling

Tech Stack

Frontend: React.js with Tailwind CSS
Backend: Node.js + Express
File Storage: Firebase Storage
Database: Google Sheets API
Email Service: SendGrid
Document Parsing: pdf-parse (PDF) and mammoth (DOCX)
Deployment: Heroku/Vercel/Netlify

Architecture
The application follows a clean architecture with the following components:

Client Layer: React.js application with modern UI components
API Layer: Express.js backend with RESTful endpoints
Service Layer: Business logic for application processing
Integration Layer: Firebase, Google Sheets, SendGrid integrations

Getting Started
Prerequisites

Node.js (v14+)
Firebase account
Google Cloud account with Sheets API enabled
SendGrid account

Installation

Clone the repository

bashCopygit clone https://github.com/your-username/job-application-processor.git
cd job-application-processor

Install server dependencies

bashCopynpm install

Install client dependencies

bashCopycd client
npm install
cd ..

Set up environment variables
Create a .env file in the root directory based on the provided .env.example.
Set up Firebase


Create a Firebase project
Enable Storage
Download the service account key and save it as serviceAccountKey.json in the root folder


Set up Google Sheets


Create a Google Sheet for storing application data
Download the service account key and save it as googleSheetsConfig.json in the root folder

Running the Application

Start the development server

bashCopynpm run dev

In a separate terminal, start the React client

bashCopynpm run client

Open your browser and navigate to http://localhost:3000