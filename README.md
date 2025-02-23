# Social Media Application

A fullstack social media platform built with React and Express that allows users to share posts with images and engage through comments. It features user authentication (email/password) and post/comment functionality.

## Features

- User authentication (email/password)
- Create posts with text and images
- View posts from all users
- Comment on posts
- Real-time updates using React Query

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- NPM (comes with Node.js)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd social-media-app
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and configurations
│   │   └── pages/        # Page components
├── server/               # Backend Express application
│   ├── auth.ts          # Authentication setup
│   ├── routes.ts        # API routes
│   └── storage.ts       # In-memory data storage
└── shared/              # Shared TypeScript types and schemas
```

## Usage

1. Register a new account or login with existing credentials
2. Create posts with text and optional images
3. View posts from all users on the home page
4. Comment on posts by clicking the comment button

## File Storage

Images are stored locally in the `uploads/` directory. In a production environment, you should use a proper file storage service.

## Development

- The application uses an in-memory database for development
- All data will be reset when the server restarts
- The application includes hot-reloading for both frontend and backend changes

## Technical Notes

- Maximum image upload size: 5MB
- Supported image formats: JPEG, PNG, GIF
- Uses React Query for data fetching and caching
- Built with TypeScript for type safety
- Styled using Tailwind CSS and shadcn/ui components

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - TanStack Query (React Query)
  - Shadcn/UI Components
  - Tailwind CSS
  - Wouter (Routing)
  - React Hook Form

- Backend:
  - Express.js
  - TypeScript
  - In-memory Storage
  - Multer (File uploads)
  - Passport.js (Authentication)