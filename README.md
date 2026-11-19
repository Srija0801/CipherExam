# CipherExam — Secure Exam Paper Distribution System

A secure, cryptography-based examination paper management and distribution system designed to protect question papers from unauthorized access, premature disclosure, and tampering.

CipherExam uses a hybrid encryption architecture combining **AES-256-GCM, RSA-OAEP, and digital signatures** to secure question papers throughout their lifecycle.

## Key Features

- **Secure Authentication:** User registration and login with password hashing and JWT-based authentication.
- **Role-Based Access Control:** Separate permissions for Admins, Examination Centers, and Students.
- **Hybrid Encryption:** AES-256-GCM encrypts question paper PDFs using a randomly generated AES key for each upload.
- **RSA Key Protection:** RSA-OAEP with SHA-256 protects the AES encryption key for authorized examination centers.
- **Digital Signatures:** RSA-based digital signatures allow the system to verify the integrity and authenticity of encrypted question papers.
- **Time-Controlled Release:** Question papers remain inaccessible for decryption until the configured release time.
- **Examination Management:** Admins can create examinations, assign centers, and manage question papers.
- **Center Management:** Examination centers can access papers associated with their assigned examinations.
- **Audit Logging:** Records important security events, including uploads, verification attempts, and decryption attempts.
- **Tamper Detection:** Modifications to signed encrypted data cause signature verification to fail.

## Technology Stack

| Layer                   | Technologies                  |
| ----------------------- | ----------------------------- |
| Frontend                | React, Vite, JavaScript, CSS  |
| Backend                 | Node.js, Express.js           |
| Database                | MongoDB Atlas, Mongoose       |
| Authentication          | JSON Web Tokens (JWT), bcrypt |
| Symmetric Encryption    | AES-256-GCM                   |
| Asymmetric Cryptography | RSA-OAEP with SHA-256         |
| Digital Signatures      | RSA with SHA-256              |
| API Testing             | Postman                       |

## System Architecture

```text
                  ┌──────────────────────┐
                  │    React Frontend    │
                  │   Admin / Center /   │
                  │       Student        │
                  └──────────┬───────────┘
                             │ REST API
                             ▼
                  ┌──────────────────────┐
                  │   Express Backend    │
                  │ Authentication & RBAC│
                  └──────────┬───────────┘
                             │
               ┌─────────────┼─────────────┐
               ▼             ▼             ▼
        ┌────────────┐ ┌────────────┐ ┌────────────┐
        │  Crypto    │ │   Exam &   │ │   Audit    │
        │  Module    │ │   Center   │ │   Logger   │
        └────────────┘ └────────────┘ └────────────┘
               │             │             │
               └─────────────┼─────────────┘
                             ▼
                  ┌──────────────────────┐
                  │       MongoDB         │
                  │ Encrypted Papers,     │
                  │ Metadata, Users, Logs │
                  └──────────────────────┘
```

## Cryptographic Workflow

### 1. Question Paper Encryption

When an administrator uploads a PDF:

1. The backend validates the uploaded file.
2. A fresh, cryptographically secure 256-bit AES key is generated.
3. A random 96-bit initialization vector (IV) is generated.
4. AES-256-GCM encrypts the PDF and produces an authentication tag.
5. The AES key is encrypted using the authorized center's RSA public key with RSA-OAEP and SHA-256.
6. A digital signature is generated over the encrypted content, IV, and authentication tag.
7. The encrypted paper, protected AES key, signature, and associated metadata are stored in MongoDB.

### 2. Paper Verification

When an examination center requests verification:

1. The backend authenticates the user and checks center authorization.
2. The stored digital signature is verified against the encrypted content and associated cryptographic data.
3. If the signed data has been modified, verification fails.
4. The result is returned to the frontend and recorded in the audit log.

### 3. Controlled Decryption

When a center requests decryption:

1. The backend checks the user's authorization and exam assignment.
2. The exam's publication and release conditions are checked.
3. The digital signature is verified before decryption.
4. The center's private RSA key decrypts the protected AES key.
5. AES-256-GCM decrypts the PDF and authenticates its contents.
6. The decrypted PDF is returned to the authorized center, and the operation is logged.

**Security principle:** The frontend displays the status, but the backend must enforce authorization, signature verification, and release-time restrictions.

## User Roles

### Admin

- Create and manage examinations.
- Assign examination centers.
- Upload question papers for encryption.
- Monitor security-related audit logs.

### Examination Center

- View assigned examinations and papers.
- Verify digital signatures.
- Request decryption when permitted by the backend's security rules.

### Student

- View published examination information.
- Access examination schedules available to their role.

Students are not provided with the examination center's private keys or the question-paper decryption workflow.

## Project Structure

```text
secure_exam_system/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── AuditLogs.jsx
│       │   ├── CenterManagement.jsx
│       │   ├── PaperManagement.jsx
│       │   └── ProtectedRoute.jsx
│       ├── pages/
│       │   ├── AdminDashboard.jsx
│       │   ├── CenterDashboard.jsx
│       │   ├── Login.jsx
│       │   └── StudentDashboard.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       └── index.css
├── server/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── crypto/
│   ├── server.js
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or a compatible MongoDB deployment
- Git
- Postman (optional, for API testing)

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd secure_exam_system
```

### 2. Configure the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=5001
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_strong_random_jwt_secret
```

Use your own secure values. Never commit `.env` or private cryptographic keys to GitHub.

### 3. Configure Cryptographic Keys

Generate the required RSA key pairs using the project's key-generation utilities, if provided:

```bash
node utils/generateCenterKeys.js
node utils/generateSigningKeys.js
```

Check the scripts and `cryptoUtils.js` to confirm the expected key paths and generation behavior before running them. Keep all private keys secure and outside version control. Configure each examination center's public key through the application's supported workflow.

**Important:** Generating new keys can make previously encrypted papers inaccessible if their corresponding private keys are lost. Back up keys securely and use the correct key pair for each test.

### 4. Start the Backend

From the `server/` directory:

```bash
npm start
```

If the package does not define a `start` script, use the entry point configured in `server/package.json`, for example:

```bash
node server.js
```

### 5. Start the Frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, commonly:

```text
http://localhost:5173
```

Ensure `client/src/services/api.js` points to your backend URL, such as `http://localhost:5001/api`, for local development.

## Security Testing

The following tests can be used to demonstrate the security mechanisms:

| Test                                             | Expected Result                        |
| ------------------------------------------------ | -------------------------------------- |
| Upload a valid PDF                               | Encrypted paper is stored successfully |
| Verify an unchanged paper                        | Signature verification succeeds        |
| Modify signed encrypted data                     | Signature verification fails           |
| Request decryption before release time           | Backend rejects the request            |
| Request access from an unauthorized center       | Backend rejects the request            |
| Attempt decryption with an incorrect private key | Decryption fails                       |
| Check audit records after operations             | Relevant events are recorded           |

Run destructive tampering tests only against disposable test papers.

## API Overview

The backend exposes REST API routes for authentication, examination management, center management, paper operations, and audit logs.

| Route prefix   | Purpose                                 |
| -------------- | --------------------------------------- |
| `/api/auth`    | Registration, login, and authentication |
| `/api/exams`   | Examination management                  |
| `/api/centers` | Examination center management           |
| `/api/papers`  | Upload, verification, and decryption    |
| `/api/audit`   | Audit log retrieval                     |

Authentication and role restrictions apply to protected endpoints. Refer to the backend route files for the exact HTTP methods, endpoint paths, and required request fields.

## Security Considerations

- AES encryption keys should be generated using a cryptographically secure random number generator.
- AES-GCM authentication tags must be validated during decryption.
- Digital signatures must be verified on the backend before releasing a decrypted paper.
- RSA private keys must never be exposed through the frontend, API responses, or public repositories.
- JWT secrets and database credentials must be stored in environment variables.
- Uploaded files should be validated for size, type, and content.
- Audit logs should not contain passwords, private keys, or other sensitive secrets.
- Production deployment should use HTTPS, strict access controls, secure key storage, and appropriate database permissions.

## Future Enhancements

- Hardware-backed or managed key storage.
- Stronger key rotation and recovery procedures.
- Automated cryptographic key lifecycle management.
- Enhanced audit monitoring and anomaly detection.
- Automated security and integration testing.
- Deployment hardening and rate limiting.

## License

Choose and add a license before permitting reuse or redistribution.

---

**CipherExam — Protecting the integrity, confidentiality, and controlled distribution of examination papers.**
