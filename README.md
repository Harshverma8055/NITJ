# Campus Pulse – Smart Campus Infrastructure Platform

![Campus Pulse Banner](https://via.placeholder.com/1200x300/1e1b4b/818cf8?text=Campus Pulse+Smart+Operations)

**Campus Pulse** is a comprehensive, production-ready Smart Campus Operations Platform designed exclusively for educational institutions. The core objective of the platform is to centralize campus infrastructure management, streamline maintenance operations, and foster student engagement through a gamified reward system.

## 🚀 Features
- **Issue Reporting:** Report broken infrastructure, electrical faults, and network issues instantly.
- **Auto-GPS Tracking:** Capture exact coordinates of issues so maintenance staff can pinpoint the location.
- **Pulse Reward System:** Earn +5 "Pulse Points" to your discipline rating every time an issue you report is verified and resolved by the administration.
- **Admin Command Center:** A premium dashboard for administrators to view, assign, and resolve campus-wide tickets.
- **Student Directory:** Browse the student database and view public Pulse ratings and rankings.
- **Sleek UI:** Built with a stunning dark-theme glassmorphism aesthetic.

## 🛠️ Technology Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Vanilla CSS with Glassmorphism properties & Lucide-React Icons
- **Backend/Database:** Supabase (PostgreSQL)
- **Authentication:** Custom JWT-based authentication using `jose`

## 📦 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Harshverma8055/NITJ.git
   cd NITJ
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:** Navigate to `http://localhost:3000`

---
*Developed for efficient, transparent, and smart campus administration.*
