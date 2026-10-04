# BLINDSPOT AI

> **"Challenge your thinking. Find what you're missing."**

**BlindSpot AI** is an AI-powered Decision Blind Spot Analyzer and cognitive reflection platform built for the AI Innovation Challenge. It helps people examine the reasoning behind major career, academic, and personal decisions by uncovering hidden assumptions, unstated risks, missing factors, and alternative perspectives — **without ever making the decision for the user**.

---

## 1. Project Problem

People often make major decisions based strictly on the information that is most visible or immediately attractive to them. During decision-making, people frequently:
- Overlook critical operational and environmental factors
- Rely on unexamined, unstated assumptions
- Focus solely on obvious upfront benefits (e.g. stipend, location)
- Ignore downstream execution risks and cognitive burnout
- Fail to formulate viable alternative options
- Overlook second-order, long-term consequences (1–3 years out)
- Confuse personal assumptions with verified empirical facts
- Fail to question their own cognitive reasoning

The result is premature closure, post-decision regret, or costly commitments that could have been prevented with structured reflection.

---

## 2. Solution & Core Product Ethos

BlindSpot AI serves as an objective, non-prescriptive AI thinking partner. When the user explains what decision they face and why they are leaning a certain way, BlindSpot AI scans their rationale for cognitive blind spots.

### 🛡️ Non-Prescriptive Mandate
The AI **NEVER** says:
- ❌ *"Choose Option A"*
- ❌ *"Accept this"*
- ❌ *"Reject this"*
- ❌ *"The best choice is..."*

Instead, it employs reflective critical inquiry:
- ✅ *"You may want to consider..."*
- ✅ *"You have not mentioned..."*
- ✅ *"This appears to be an assumption because..."*
- ✅ *"An alternative perspective is..."*
- ✅ *"Consider asking yourself..."*
- ✅ *"Before deciding, you may want to verify..."*

The user remains 100% sovereign and accountable for their ultimate choice.

---

## 3. Key Features

1. **Abstract Cognitive Visualization**: A multi-path, radar-sweeping visual that illustrates the concept of visible factors vs. hidden blind spots and alternative trajectories.
2. **Multi-Step Progressive Decision Form**:
   - `01 Decision`: Frame the core question.
   - `02 Options`: List competing choices (with dynamic options list).
   - `03 Reasoning`: Describe current thoughts, perceived benefits, and rationale.
   - `04 Priorities`: Interactive chip selector (Cost, Time, Career, Education, Growth, Risk, Health, Stability, etc.).
   - `05 Context`: Identify worries, deadlines, and unique constraints.
3. **Structured Blind Spot Dashboard**:
   - **Severity Badges**: High, Medium, and Low priority blind spot cards with "Why It Matters" and reflection prompts.
   - **Assumptions Section**: Contrasts *"You said"* vs. *"This may be an assumption because"* vs. *"How could you verify it?"*.
   - **What You Mentioned vs. What You Didn't Mention**: Side-by-side comparative focus audit.
   - **Decision Coverage Map**: Visual matrix mapping categories (Cost, Career, Time, Risk, Education, Growth, Convenience, Long-term impact) to *Considered (✓)*, *Partially considered (⚠)*, or *Not mentioned (✕)*.
   - **"Challenge My Thinking" Interactive Tool**: Sharp, respectful reality checks that challenge the user's strongest stated assumptions with counter-arguments and reflection questions.
   - **Inquiry Checklist**: 5–8 customized, non-generic reflective questions with interactive check-off states.
   - **Trade-Offs, Risks & Alternatives**: Inherent gains/losses, alternative lenses (Inversion, 10/10/10 Rule), and unstated options.
   - **Final Reflection Prompts**: Post-analysis synthesis (*"Has your thinking changed?"*, *"What's one thing you want to investigate before deciding?"*).
   - **Copy Reflection Summary**: One-click markdown summary export.
   - **"Try an Example" (Internship Challenge)**: Instant pre-loaded scenario for quick evaluation.

---

## 4. How AI is Used

BlindSpot AI integrates with **Google Gemini (Gemini 1.5 Flash)** via a secure, server-side API endpoint (`/api/analyze`).

- **Server-Side Security**: The Gemini API key is managed securely in server environment variables and never exposed to the client.
- **Strict Output Schema**: Enforced JSON generation adhering to the complete `BlindSpotAnalysis` interface.
- **High-Fidelity Contextual Fallback Engine**: If no API key is provided, or in offline/demo scenarios, the built-in heuristic analysis engine generates customized, contextual blind spots, decision maps, and challenges based on the user's specific text and selected priority chips.

---

## 5. Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
- **Build Tool**: Vite
- **Backend**: Node.js, Express, `@google/generative-ai`, `dotenv`, `cors`
- **Deployment Compatibility**: Vercel (with included `vercel.json` and `api/analyze.js`), Netlify, or Node host

---

## 6. Project Structure

```
blindspot-ai/
├── api/
│   └── analyze.js            # Serverless endpoint for Vercel/Netlify deployment
├── public/
│   └── favicon.svg           # Custom SVG brand favicon
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AssumptionsSection.tsx
│   │   │   ├── BlindSpotsSection.tsx
│   │   │   ├── ChallengeThinkingSection.tsx
│   │   │   ├── DecisionMapSection.tsx
│   │   │   ├── FinalReflectionSection.tsx
│   │   │   ├── QuestionsSection.tsx
│   │   │   ├── ResultDashboard.tsx
│   │   │   ├── TradeoffsAndRisksSection.tsx
│   │   │   └── WhatYouMentionedSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── AbstractVisual.tsx
│   │   ├── AnalysisLoading.tsx
│   │   ├── ApiKeyModal.tsx
│   │   ├── DecisionForm.tsx
│   │   ├── Footer.tsx        # Features: "Created by Sarthak Shende"
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   └── Navbar.tsx
│   ├── services/
│   │   ├── api.ts            # Client API caller with graceful fallbacks
│   │   └── mockData.ts       # Challenge demo scenario & contextual engine
│   ├── types/
│   │   └── index.ts          # Complete TypeScript definitions
│   ├── App.tsx               # Master App router and state coordinator
│   ├── index.css             # Tailwind base & glassmorphic styles
│   └── main.tsx              # React DOM entrypoint
├── .env.example              # Environment variables template
├── index.html                # SEO metadata and OpenGraph tags
├── package.json
├── server.js                 # Express server with Gemini API route
├── tailwind.config.js
├── tsconfig.json
├── vercel.json               # Vercel deployment configuration
└── README.md
```

---

## 7. Environment Variables

Create a `.env` file in the root directory:

```bash
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (optional, defaults to 3001)
PORT=3001
NODE_ENV=development
```

*(Note: If `GEMINI_API_KEY` is omitted, the application runs seamlessly in high-fidelity demo mode with full interactive functionality.)*

---

## 8. How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Quick Start
1. Clone the repository and navigate into the folder:
   ```bash
   git clone <repo-url>
   cd blindspot-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up your Gemini API key in `.env`:
   ```bash
   cp .env.example .env
   # Add your key to .env
   ```

4. Start the development server:
   ```bash
   # Starts the Express backend on http://localhost:3001
   npm run dev:server

   # In another terminal, start Vite frontend:
   npm run dev:frontend
   ```

   *Or start the unified fullstack server:*
   ```bash
   npm run build
   npm start
   ```
   Open **http://localhost:3001** (or **http://localhost:3000** for Vite dev) in your browser.

---

## 9. How to Build & Test

```bash
# Run TypeScript type check
npm run lint

# Compile production bundle
npm run build
```

---

## 10. Deployment

### Deploying to Vercel
This repository is pre-configured with `vercel.json` and a serverless `/api/analyze.js` handler:
1. Push this repository to GitHub.
2. Import the project into Vercel.
3. In Project Settings > Environment Variables, add `GEMINI_API_KEY`.
4. Deploy!

---

## 11. Credits

**Created by Sarthak Shende**  
Built for the AI Innovation Challenge.
