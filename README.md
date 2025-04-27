# TeamSpace - Collaborative Workspace Platform

## Introduction

**TeamSpace** is a collaborative workspace application designed for teams to efficiently create, manage, and share documents in real-time.  
It allows users to join or create workspaces, edit documents collaboratively, manage members, and streamline team communication — all in a clean, responsive interface.

## Project Type

Fullstack

## Deployed App

Frontend: https://team-space-collaboration.vercel.app/
Backend/Database: Firebase Services (Authentication + Firestore Database)

## Directory Structure

```
teamspace/
├─ src/
│  ├─ Components/
│  │  ├─ workspace/
│  │  │  ├─ DocumentEditor.jsx
│  │  │  ├─ DocumentEditorContent.jsx
│  │  │  ├─ DocumentsTab.jsx
│  │  │  ├─ MembersTab.jsx
│  │  │  ├─ RenameDocumentModel.jsx
│  │  │  ├─ UseDocumentData.jsx
│  │  |  ├─WorkspaceCard.jsx
│  │  ├─ CreateWorkspace.jsx
│  │  ├─ ForgotPassword.jsx
│  │  ├─ Header.jsx
│  │  ├─ Home.jsx
│  │  ├─ JoinWorkspaceModel..jsx
│  │  ├─ Login.jsx
│  │  ├─ MemberTab.jsx
│  │  ├─ NotFound.jsx
│  │  ├─ Register.jsx
│  │  ├─ WorskpaceDashboard.jsx
│  ├─ context/
│  │  ├─ AuthContext.jsx
│  ├─ firebase/
│  │  ├─ firebaseConfig.js
│  ├─ App.jsx
│  ├─ index.js
```

## Features

- 🔒 User Authentication (Login, Register, Forgot Password) with Firebase
- 🏢 Create and Join Workspaces
- 📄 Real-time Collaborative Document Editing with Auto-Save
- 👥 View and Manage Workspace Members
- 📚 Sorting and Searching Workspaces
- 🗂 Export Documents as HTML or Print them
- 🔄 Responsive design for both desktop and mobile

## Design Decisions & Assumptions

- Firebase is used as backend for authentication, real-time data sync, and Firestore as database.
- Only "admin" users can create new workspaces; regular users can join existing ones.
- Auto-saving of documents happens after 5 seconds of inactivity.
- Workspace privacy is handled through metadata like `isPublic` and membership lists.
- Chakra UI provides a consistent, accessible design system out-of-the-box.

## Installation & Getting Started

1. Clone the repository

```bash
git clone https://github.com/your-username/teamspace.git
```

2. Install dependencies

```bash
cd teamspace
npm install
```

3. Set up Firebase

- Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
- Enable **Authentication** (Email/Password)
- Create **Firestore Database**
- Get your Firebase config object and create a `firebaseConfig.js` inside `/src/firebase/`

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```

4. Start the development server

```bash
npm run dev
```

## Usage

- **Login/Register:** Start by creating an account or logging in.
- **Create/Join Workspace:** Admins can create workspaces; all users can join existing workspaces via ID.
- **Edit Documents:** Create and collaborate on documents inside each workspace. Auto-saving enabled!
- **Manage Members:** View members of a workspace, admin access can manage more.

Include screenshots of:

- Home Page
- Create Workspace
- Document Editor
- Members Modal

## Credentials

```
Admin User:
email: admin@example.com
password: password123

Normal User:
email: user@example.com
password: password123
```

## APIs Used

- **Firebase Authentication:** For handling user login, registration, password recovery
- **Firebase Firestore Database:** For storing users, workspaces, and document data

## API Endpoints

_(Firebase Firestore handles most backend logic. Example Firestore Collections:)_

- `/users` — Stores user profile information
- `/workspaces` — Stores workspaces info
- `/documents` — Stores document data inside a workspace

Example:

- **GET** `/workspaces/{workspaceId}`
- **POST** `/documents` (inside workspace)
- **PATCH** `/workspaces/{workspaceId}/members`
- **DELETE** `/documents/{documentId}`

## Technology Stack

- React.js (Frontend framework)
- Chakra UI (Component library and styling)
- Firebase (Authentication, Firestore database)
- React Router DOM (Routing and protected routes)
