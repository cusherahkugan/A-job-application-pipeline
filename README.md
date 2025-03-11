# Metana Job Application Processor

A full-stack application for processing job applications, including CV handling, data extraction, cloud storage, and automated follow-up emails.

## Features

- Simple, user-friendly job application form
- CV upload and storage in Firebase Storage
- Automatic extraction of key information from CVs
- Storage of structured data in Google Sheets
- Webhook notifications for each processed application
- Scheduled follow-up emails based on application timing

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Storage:** Firebase Storage, Google Sheets
- **Email Service:** SendGrid
- **Parsing:** PDF.js, Mammoth.js
- **Scheduling:** Node-cron

## Project Structure

```
metana-job-app/
├── client/                  # React frontend
│   ├── src/
│   │   ├── App.js
│   │   └── components/
│   │       └── ApplicationForm.js
│
├── server/                  # Node.js backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Middleware functions
│   ├── models/              # Data models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Express server
│
├── .gitignore
├── package.json             # Root package.json
└── README.md                # Documentation
```

## Setup and Installation

### Prerequisites

- Node.js 14+
- npm or yarn
- Google Cloud Platform account
- Firebase account
- SendGrid account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/metana-job-app.git
   cd metana-job-app
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. Create environment variables:
   
   Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   
   # Google Sheets Config
   GOOGLE_SHEETS_ID=your_sheet_id
   
   # SendGrid Config
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_FROM=your_email@example.com
   
   # Webhook Config
   WEBHOOK_URL=https://rnd-assignment.automations-3d6.workers.dev/
   CANDIDATE_EMAIL=your_candidate_email@example.com
   
   # Firebase Config
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   
   # Google Service Account
   GOOGLE_SERVICE_ACCOUNT_CREDENTIALS={"type":"service_account",...}
   ```

4. Run the application in development mode:
   ```
   npm run dev
   ```

## API Endpoints

- **POST /api/applications/submit** - Submit a new job application
- **GET /api/applications/status/:email** - Get application status by email

## Webhooks

After processing each CV, the system sends a webhook to the specified endpoint with the following payload:

```json
{
  "cv_data": {
    "personal_info": {...},
    "education": [...],
    "qualifications": [...],
    "projects": [...],
    "cv_public_link": "..."
  },
  "metadata": {
    "applicant_name": "John Doe",
    "email": "john.doe@example.com",
    "status": "prod",
    "cv_processed": true,
    "processed_timestamp": "2023-03-01T12:00:00Z"
  }
}
```

## Scheduled Emails

The system schedules follow-up emails to be sent the next day after application submission, optimized for the applicant's time zone.

## License

MIT License