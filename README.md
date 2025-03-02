# SaaS Starter Kit

A modern SaaS starter kit built with Next.js, TypeScript, Tailwind CSS, Prisma, and Auth.js.

## Features

- 🔐 Authentication with Auth.js (NextAuth)
- 👥 User management with profiles
- 🏢 Organization/team management
- 📧 Team invitations
- 🖼️ Profile image uploads
- 🔄 Modern React patterns with Server Components
- 🗃️ Database with Prisma ORM
- 🎨 Beautiful UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/saas-starter.git
cd saas-starter
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Update the `.env` file with your own values

5. Set up the database
```bash
npx prisma db push
```

6. Start the development server
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
saas-starter/
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Authentication routes
│   │   ├── dashboard/    # Dashboard routes
│   │   ├── settings/     # User settings
│   │   └── organizations/# Organization management
│   ├── components/       # React components
│   │   ├── auth/         # Authentication components
│   │   ├── forms/        # Form components
│   │   ├── organizations/# Organization components
│   │   └── ui/           # UI components
│   ├── lib/              # Utility functions
│   │   ├── actions/      # Server actions
│   │   ├── auth/         # Authentication utilities
│   │   └── utils.ts      # Common utilities
│   └── types/            # TypeScript type definitions
└── ...
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
