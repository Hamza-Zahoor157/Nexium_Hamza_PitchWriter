# Pitch Writer - AI-Powered Pitch Deck Generator

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://nexium-hamza-pitch-writer.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Hamza-Zahoor157/Nexium_Hamza_PitchWriter)

## 🚀 Overview

Pitch Writer is a modern, AI-powered platform that helps entrepreneurs and startups generate professional pitch decks with ease. The application leverages advanced AI to create compelling pitch content, including titles, descriptions, problem statements, solutions, and more.

## ✨ Features

### Core Features
- **AI-Powered Pitch Generation**: Generate complete pitch decks using AI
- **Pitch Management**: Save and manage your past pitches
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Walkthrough Video**: [View Demo](https://nexium-hamza-pitch-writer.vercel.app/walkthrough/Pitch%20Writer%20Walkthrough.mp4) - See the app in action with our comprehensive walkthrough video

### Technical Features
- **Next.js 15**: Built with the latest React framework
- **TypeScript**: Type-safe codebase for better developer experience
- **MongoDB**: Scalable database for storing pitch data
- **Supabase**: Authentication with magic link
- **n8n Workflows**: Automated workflow management via Railway
- **Shadcn UI**: Beautiful, accessible UI components

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Supabase
- **AI Integration**: Custom AI workflows via n8n
- **Deployment**: Vercel (Frontend), Railway (n8n)
- **Styling**: Tailwind CSS, Shadcn UI

## 🚀 Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- MongoDB Atlas account
- Vercel account (for deployment)
- Railway account (for n8n)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Hamza-Zahoor157/Nexium_Hamza_PitchWriter.git
   cd Nexium_Hamza_PitchWriter/internship/grand-project/my-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🌐 Deployment

### Vercel Deployment
The frontend is deployed on Vercel. Push to the `main` branch to trigger automatic deployments.

### n8n on Railway
The n8n instance is deployed on Railway for workflow automation. The instance handles AI processing and other background tasks.

## 🔄 API Endpoints

- `POST /api/pitch/create` - Create a new pitch
- `GET /api/pitch/user/[id]` - Get pitches for a specific user

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [MongoDB](https://www.mongodb.com/) - The database for modern applications
- [n8n](https://n8n.io/) - Workflow automation tool
- [Shadcn UI](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
