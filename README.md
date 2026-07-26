# GatherCraft

GatherCraft is a fully-functional 2D multiplayer virtual office experience inspired by Gather.town, built specifically for seamless team collaboration and organic spatial communication.

## 🚀 Tech Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/) (React)
- **Game Engine**: [Phaser 3](https://phaser.io/) (Handles 2D rendering, collision physics, and map generation)
- **Real-Time Communication**: [LiveKit](https://livekit.io/) (Powers ultra-low-latency WebRTC video and spatial audio)
- **Styling**: Tailwind CSS

## ✨ Features

- **Massive Custom Office Layout**: A beautifully rendered, sprawling virtual office featuring Private Offices, a massive Team Coworking area, Boardrooms, and a relaxing Koi Pond.
- **Dynamic Avatar Physics**: A custom-built movement engine featuring click-to-move synchronous pathfinding (via EasyStar.js) and buttery smooth WASD keyboard movement.
- **Interactive Environment**: Walk up to closed office doors and watch them automatically slide open, or walk into a chair to automatically transition your avatar into a sitting state!
- **Real-Time Multiplayer**: See your teammates moving around the office in real-time, fully synchronized with custom easing interpolation to prevent network jitter.
- **Proximity Video/Audio**: Powered by LiveKit, a dynamic RTC engine automatically connects you via video and audio to colleagues standing near you in the virtual office.

## 🛠️ Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd GatherCraft
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   You will need a LiveKit server (either self-hosted or via LiveKit Cloud). Ensure you have your `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` ready in your `.env.local` file.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to enter your new virtual office!

## 🎮 How to Play

- **Movement**: Use the `W`, `A`, `S`, `D` keys or the arrow keys to walk around the office. Alternatively, simply click anywhere on the floor to automatically pathfind your way there!
- **Doors**: Office doors are intelligent. Walk within 2 tiles of any closed door and it will automatically slide open for you.
- **Sitting**: Walk into any chair at a desk or meeting room table to automatically take a seat.

---

*GatherCraft — Bringing spatial presence back to remote work.*
