# Certificate Generation and Email Delivery System

A Node.js application that generates certificates dynamically using backend data and delivers them via email with both PDF and JPEG formats.

## Tech Stack

- Node.js (v22+)
- Express.js
- TypeScript
- Supabase (PostgreSQL)
- Puppeteer (Certificate Generation)
- Nodemailer (Email Delivery)
- Docker & Docker Compose

## Features

- Generate certificates with custom data (Name, Email, GST Number, Business Name, Address)
- Export certificates in both PDF and JPEG formats
- Automatically send certificates via email with attachments
- Store certificate records in Supabase PostgreSQL database
- Comprehensive input validation (email format, GST number format, field lengths)
- Data sanitization (trimming, case normalization)
- RESTful API with proper error handling
- Docker support for consistent deployment

## Prerequisites

- Node.js v22+ and npm (for local development)
- Docker and Docker Compose (for containerized deployment)
- Gmail account with App Password enabled
- Supabase account and project
- VS Code with REST Client extension (optional, for testing)

## Installation & Setup

### Option 1: Local Development Environment

1. Clone the repository

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-anon-key
   ```

4. Build the project:
   ```
   npm run build
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. The API will be available at `http://localhost:3000`

### Option 2: Docker Deployment (Production-Ready)

1. Clone the repository

2. Create a `.env` file with the same variables as above

3. Build and start the Docker container:
   ```
   docker-compose up --build
   ```

4. The API will be available at `http://localhost:3000`

5. To stop the container:
   ```
   docker-compose down
   ```

## Gmail Setup

To send emails via Gmail:

1. Go to your Google Account → Security
2. Enable 2-Step Verification
3. Search for "App passwords"
4. Generate a new app password for "Mail"
5. Use this password in your `.env` file as `EMAIL_PASS`

## Supabase Setup

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to SQL Editor and run:
   ```
   CREATE TABLE certificates (
     id BIGSERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     gst_number TEXT NOT NULL,
     business_name TEXT NOT NULL,
     business_address TEXT NOT NULL,
     pdf_path TEXT NOT NULL,
     jpg_path TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
4. Get your Project URL and anon key from Settings → API
5. Add them to your `.env` file

## API Documentation

### Generate Certificate

**Endpoint:** `POST /api/certificate/generate`

**Request Body:**
```
{
  "name": "John Doe",
  "email": "john@example.com",
  "gstNumber": "27ABCDE1234F1Z5",
  "businessName": "Example Business Ltd",
  "businessAddress": "123 Main Street, Andheri West, Mumbai, Maharashtra 400058"
}
```

**Validation Rules:**
- `name`: String, 2-100 characters, required
- `email`: Valid email format, required
- `gstNumber`: Valid Indian GST format (15 characters: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric), required
- `businessName`: String, 2-200 characters, required
- `businessAddress`: String, 10-500 characters, required

**Success Response (200):**
```
{
  "success": true,
  "message": "Certificate generated, saved to database, and sent successfully",
  "data": {
    "email": "john@example.com",
    "gstNumber": "27ABCDE1234F1Z5",
    "files": {
      "pdf": "/app/output/certificate-1234567890.pdf",
      "jpg": "/app/output/certificate-1234567890.jpeg"
    }
  }
}
```

**Error Response (400):**
```
{
  "success": false,
  "error": "Invalid email format",
  "message": "Please provide a valid email address"
}
```

**Error Response (500):**
```
{
  "success": false,
  "error": "Failed to process certificate",
  "message": "Detailed error message"
}
```

## Testing the API

### Option 1: Using REST Client (VS Code Extension)

1. Install the **REST Client** extension in VS Code
2. Open the `api.http` file in the project root
3. Click "Send Request" above any request to test
4. The file includes:
   - Valid request examples
   - 10+ validation error test cases
   - Various Indian state GST examples

### Option 2: Using cURL

```
curl -X POST http://localhost:3000/api/certificate/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "gstNumber": "27ABCDE1234F1Z5",
    "businessName": "Example Business Ltd",
    "businessAddress": "123 Main Street, Andheri West, Mumbai, Maharashtra 400058"
  }'
```

### Option 3: Using Postman

1. Import the requests from `api.http` or create a new POST request
2. Set URL: `http://localhost:3000/api/certificate/generate`
3. Set Headers: `Content-Type: application/json`
4. Set Body (raw JSON) with the request payload

## Project Structure

```
certificate-system/
├── src/
│   ├── index.ts                    # Main application entry point
│   ├── routes/
│   │   └── certificateRoutes.ts    # API routes with validation
│   ├── services/
│   │   ├── certificateService.ts   # Certificate generation (Puppeteer)
│   │   ├── emailService.ts         # Email sending (Nodemailer)
│   │   └── supabaseService.ts      # Database operations (Supabase)
│   └── templates/
│       └── certificate.html        # Certificate HTML template
├── output/                          # Generated certificates (PDF & JPEG)
├── api.http                         # REST Client test file
├── .env                            # Environment variables
├── .dockerignore                   # Docker ignore file
├── Dockerfile                      # Docker configuration
├── docker-compose.yml              # Docker Compose configuration
├── package.json                    # Node.js dependencies
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Project documentation
```

## Scripts

- `npm run dev` - Start development server with hot reload (using tsx)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript (production mode)

## Input Validation

The API performs comprehensive validation on all inputs:

### Email Validation
- Must be a valid email format
- Maximum 254 characters
- Automatically converted to lowercase

### GST Number Validation
- Must follow Indian GST format: `DDLLLLLDDDDLALAL`
  - DD: 2-digit state code
  - LLLLL: 5 letters (PAN first 5 characters)
  - DDDD: 4 digits (PAN last 4 characters)
  - L: 1 letter (PAN last character)
  - A: 1 alphanumeric
  - Z: Literal 'Z'
  - A: 1 alphanumeric (checksum)
- Example: `27ABCDE1234F1Z5`
- Automatically converted to uppercase

### Name & Business Validation
- Name: 2-100 characters
- Business Name: 2-200 characters
- Business Address: 10-500 characters
- All fields are trimmed of extra whitespace

## Technologies Used

- **Express.js**: Fast, minimalist web framework for Node.js
- **TypeScript**: Strongly typed programming language built on JavaScript
- **Puppeteer**: Headless Chrome automation for PDF/JPEG generation
- **Nodemailer**: Module for Node.js applications to send emails
- **Supabase**: Open source Firebase alternative with PostgreSQL database
- **Docker**: Platform for developing, shipping, and running applications in containers

## Error Handling

The application includes comprehensive error handling:
- 400 Bad Request: Invalid input data
- 500 Internal Server Error: Server-side errors during processing
- Detailed error messages for debugging
- Proper validation feedback for all fields