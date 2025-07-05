Learnify – AI-Powered Learning Platform (Frontend)

Learnify is a modern AI-powered learning platform designed to make education more engaging, interactive, and personalized. This is the frontend application built using cutting-edge web technologies and best practices.

Tech Stack
- Next.js 13+ – App Router, SSR, and optimized routing
- TypeScript – Strong typing for better development experience
- shadcn/ui – Accessible and customizable components built on Radix UI
- Tailwind CSS – Utility-first CSS framework
- Vercel – Zero-config deployment and CDN optimization

Folder Structure
ai-learning-platform/
├── app/              # Route handlers and pages (auth, course, dashboard, etc.)
├── components/       # Reusable UI components
├── context/          # Global state/context providers
├── lib/              # Utility functions and API services
├── public/           # Static assets
├── styles/           # Tailwind & global styles
├── .gitignore
├── .gitattributes
├── README.md
├── package.json
├── tsconfig.json

Getting Started
Prerequisites
- Node.js 18+
- npm or yarn

Development Setup
npm install
npm run dev

Then open http://localhost:3000 in your browser to see the result.

Available Scripts
npm run dev       # Start development server
npm run build     # Build production-ready app
npm run start     # Run production server
npm run lint      # Run linter checks

Deployment
Deploy on Vercel (Recommended)
1. Push your code to a GitHub repository
2. Go to https://vercel.com/import
3. Select your repository
4. Click Deploy

Features
- Authentication (Login/Register)
- Course Modules with dynamic routing
- AI-Powered Doubt Solving
- Gamified Learning (Flashcards, Quizzes, Puzzle Games)
- Feedback, Profile & Dashboard pages
- Dark/Light mode toggle
- Responsive UI across devices

Documentation
- Next.js Docs – https://nextjs.org/docs
- shadcn/ui Docs – https://ui.shadcn.com
- Tailwind CSS Docs – https://tailwindcss.com/docs
- TypeScript Docs – https://www.typescriptlang.org/docs/

Contributing
Contributions are welcome! Feel free to submit issues or pull requests.

Author
Surjeet Karan – https://github.com/SurjeetKaran

License
This project is licensed under the MIT License – https://opensource.org/licenses/MIT
"""