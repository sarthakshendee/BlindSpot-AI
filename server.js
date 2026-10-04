import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasGeminiKey: hasKey,
    environment: process.env.NODE_ENV || 'development'
  });
});

const SYSTEM_INSTRUCTION = `
You are BlindSpot AI, an elite AI decision-reflection advisor and cognitive bias detective for an innovation challenge.
Your core mission is to help users think more critically by identifying potential BLIND SPOTS, HIDDEN ASSUMPTIONS, MISSING FACTORS, ONE-SIDED REASONING, RISKS, TRADE-OFFS, ALTERNATIVE PERSPECTIVES, and CHALLENGES TO THEIR THINKING.

CRITICAL PRODUCT PRINCIPLE:
1. You MUST NEVER make the decision for the user.
2. NEVER say: "Choose Option A", "Choose Option B", "Accept it", "Reject it", "The best choice is", "Recommended decision", "Winner".
3. Instead, use reflective critical language:
   - "You may want to consider..."
   - "You have not mentioned..."
   - "This appears to be an assumption..."
   - "An alternative perspective is..."
   - "Consider asking yourself..."
   - "Before deciding, you may want to verify..."
4. The user remains 100% responsible for their final decision. Your goal is critical thinking, not recommendation.

OUTPUT REQUIREMENT:
You MUST respond with VALID, PARSEABLE JSON ONLY. Do NOT wrap in markdown backticks or extra prose.
The JSON must follow this exact schema:

{
  "summary": "Concise summary of their reasoning and core blind spots",
  "blindSpots": [
    {
      "title": "Title of blind spot",
      "description": "Explanation of what they overlooked",
      "severity": "low|medium|high",
      "whyItMatters": "Why this overlooked factor affects the decision",
      "question": "Sharp question to prompt reflection"
    }
  ],
  "assumptions": [
    {
      "statement": "What statement in their reasoning is an assumption",
      "whyItMayBeAnAssumption": "Why it may not be a verified fact",
      "howToVerify": "Concrete step to verify or test it"
    }
  ],
  "missingFactors": [
    {
      "factor": "Important factor not mentioned",
      "whyItMatters": "Why it matters"
    }
  ],
  "risks": [
    {
      "risk": "Name of risk",
      "description": "How this risk might manifest",
      "question": "Question to evaluate tolerance or mitigation"
    }
  ],
  "tradeoffs": [
    {
      "tradeoff": "Key trade-off",
      "description": "What is gained vs what is lost"
    }
  ],
  "alternativePerspectives": [
    {
      "perspective": "Different lens or angle (e.g., Skills-first, Inversion, Long-term)",
      "description": "How this situation looks through that lens"
    }
  ],
  "alternatives": [
    {
      "alternative": "Alternative option or approach not mentioned by the user",
      "description": "How this alternative might work"
    }
  ],
  "longTermConsiderations": [
    {
      "consideration": "Long term effect beyond the immediate decision",
      "description": "Potential consequence 1-3 years out"
    }
  ],
  "questionsToConsider": [
    "5 to 8 deeply targeted, non-generic reflective questions specifically about their situation"
  ],
  "challengeMyThinking": [
    {
      "assumption": "Their assumption or belief",
      "challenge": "A thoughtful, polite, rigorous counter-argument or reality check",
      "reflectionQuestion": "Direct question challenging that belief"
    }
  ],
  "whatYouMentioned": [
    "Specific factor or priority the user actively mentioned in their reasoning"
  ],
  "whatYouDidNotMention": [
    "Critical factor or blind spot the user did NOT mention at all"
  ],
  "decisionReflection": "Empowering concluding reflection encouraging critical verification before deciding",
  "decisionMap": [
    {
      "category": "Cost",
      "status": "Considered|Partially considered|Not mentioned",
      "notes": "Short analysis of how they treated Cost"
    },
    {
      "category": "Time",
      "status": "Considered|Partially considered|Not mentioned",
      "notes": "Short analysis of how they treated Time"
    },
    {
      "category": "Career",
      "status": "Considered|Partially considered|Not mentioned",
      "notes": "Short analysis of how they treated Career"
    },
    {
      "category": "Education",
      "status": "Considered|Partially considered|Not mentioned",
      "notes": "Short analysis of how they treated Education"
    },
    {
      "category": "Growth",
      "status": "Considered|Partially considered|Not mentioned",
      "notes": "Short analysis of how they treated Growth"
    },
    {
      "category": "Convenience",
      "status": "Considered|Partially considered|Not mentioned",
      "notes": "Short analysis of how they treated Convenience"
    },
    {
      "category": "Risk",
      "status": "Considered|Partially considered|Not mentioned",
      "notes": "Short analysis of how they treated Risk"
    },
    {
      "category": "Long-term impact",
      "status": "Considered|Partially considered|Not mentioned",
      "notes": "Short analysis of how they treated Long-term impact"
    }
  ]
}
`;

// Helper for fallback simulation when API key is missing or calls fail
function generateFallbackAnalysis(body) {
  const decision = body.decision || "Decision";
  const reasoning = body.reasoning || "Reasoning";
  const priorities = Array.isArray(body.priorities) && body.priorities.length > 0 
    ? body.priorities 
    : ["Career", "Time", "Growth"];
  const options = Array.isArray(body.options) ? body.options.filter(Boolean) : [];
  
  const text = `${decision} ${reasoning} ${body.concerns || ''} ${body.additionalContext || ''}`.toLowerCase();

  const factorChecks = [
    { name: "Academic workload & exams", key: ["academic", "exam", "course", "college", "degree", "study", "gpa"] },
    { name: "Direct mentorship & guidance", key: ["mentor", "lead", "senior", "guide", "review", "feedback"] },
    { name: "Work-life balance & burnout", key: ["burnout", "balance", "tired", "sleep", "exhaustion", "stress"] },
    { name: "Reversibility & exit strategy", key: ["quit", "cancel", "reverse", "exit", "contract", "lock"] },
    { name: "Long-term 2-year trajectory", key: ["long-term", "trajectory", "future", "2-year", "3-year"] },
    { name: "Financial & hidden costs", key: ["cost", "expense", "stipend", "salary", "tax", "travel"] },
    { name: "Day-to-day role quality", key: ["tasks", "responsibilities", "daily", "routine", "tech stack"] },
  ];

  const mentioned = [];
  const notMentioned = [];

  factorChecks.forEach(fc => {
    if (fc.key.some(k => text.includes(k))) {
      mentioned.push(fc.name);
    } else {
      notMentioned.push(fc.name);
    }
  });

  if (mentioned.length === 0) {
    mentioned.push("Immediate visible benefits", "Stated core intention");
  }

  const decisionCategories = [
    "Cost", "Time", "Career", "Education", "Growth", 
    "Convenience", "Risk", "Long-term impact"
  ];

  const decisionMap = decisionCategories.map(cat => {
    const isPri = priorities.includes(cat);
    const inTxt = text.includes(cat.toLowerCase());
    let status = 'Not mentioned';
    if (isPri && inTxt) status = 'Considered';
    else if (isPri || inTxt) status = 'Partially considered';

    return {
      category: cat,
      status,
      notes: status === 'Considered' 
        ? 'Explicitly detailed in your reasoning.' 
        : status === 'Partially considered' 
        ? 'Touched on briefly, but underlying friction remains unverified.' 
        : 'Not actively accounted for in your supplied explanation.'
    };
  });

  return {
    summary: `Your reasoning regarding "${decision.slice(0, 60)}..." emphasizes your immediate visible priorities (${priorities.slice(0, 3).join(', ')}), but leaves key secondary friction points, unstated assumptions, and opportunity costs unexamined.`,
    blindSpots: [
      {
        title: "Opportunity Cost of the Chosen Path",
        description: "You have evaluated the appeal of this path in isolation, without weighing what alternatives or recruiting windows you will close.",
        severity: "high",
        whyItMatters: "Every major commitment is simultaneously an implicit rejection of all other opportunities during that timeframe.",
        question: "What is the single most valuable alternative you are shutting down by pursuing this?"
      },
      {
        title: "Actual Day-to-Day Reality vs. Label",
        description: "You appear to assume that the formal title or role description guarantees high-quality, growth-oriented daily responsibilities.",
        severity: "high",
        whyItMatters: "Day-to-day administrative or mundane tasks can consume months with minimal real skill compounding.",
        question: "What specific projects or workflows will you personally own on a regular Wednesday?"
      },
      {
        title: "Reversibility & Sunk Cost Buffer",
        description: "You have not formulated a clear exit trigger or plan if the opportunity turns out to be substantially worse than advertised.",
        severity: "medium",
        whyItMatters: "Two-way door decisions allow quick pivots; one-way door commitments require structured upfront verification.",
        question: "If this arrangement turns toxic or unproductive after 6 weeks, what is your graceful exit plan?"
      },
      {
        title: "Cumulative Energy & Cognitive Bandwidth",
        description: "Your calculation treats energy as constant, rather than acknowledging how daily friction drains motivation over extended months.",
        severity: "medium",
        whyItMatters: "High cognitive fatigue often causes collateral damage to personal health, relationships, and secondary projects.",
        question: "How will your schedule accommodate inevitable weeks when multiple personal and work crises hit together?"
      },
      {
        title: "Second-Order Career Trajectory",
        description: "You have looked at the immediate next step, but have not modeled how this choice positions your profile 24 months from now.",
        severity: "low",
        whyItMatters: "Short-term convenience can sometimes steer you into specialized cul-de-sacs with limited upward mobility.",
        question: "Will this experience qualify you for higher-tier opportunities, or reinforce the current plateau?"
      }
    ],
    assumptions: [
      {
        statement: "The stated benefits will materialize without friction or hidden caveats.",
        whyItMayBeAnAssumption: "Organizational promises, job scopes, and external conditions frequently diverge from verbal agreements.",
        howToVerify: "Ask for concrete deliverables in writing or speak directly to someone who recently held this exact position."
      },
      {
        statement: "Your current motivation and health will remain at baseline levels throughout the duration.",
        whyItMayBeAnAssumption: "Life events, burnout, and fatigue accumulate; decisions should be resilient to low-energy seasons.",
        howToVerify: "Evaluate whether you could maintain this commitment during your most stressful month of the past year."
      },
      {
        statement: "The decision is strictly binary between accepting or rejecting.",
        whyItMayBeAnAssumption: "Most proposals can be negotiated (e.g. part-time, trial period, modified scope, staggered start date).",
        howToVerify: "Ask the other party if there is flexibility for a 30-day review or hybrid structure."
      }
    ],
    missingFactors: notMentioned.slice(0, 4).map(item => ({
      factor: item,
      whyItMatters: `You did not explicitly include ${item.toLowerCase()} in your evaluation, which could significantly affect sustainability.`
    })),
    risks: [
      {
        risk: "Execution Friction Exceeding Estimates",
        description: "Logistical hurdles, organizational politics, or shifting priorities often consume 30% more energy than budgeted.",
        question: "Can your personal bandwidth withstand a 30% increase in required time?"
      },
      {
        risk: "Psychological Sunk Cost Trap",
        description: "Once committed, human psychology makes it very difficult to admit an error and change course promptly.",
        question: "What predetermined threshold will trigger you to reconsider your participation?"
      }
    ],
    tradeoffs: [
      {
        tradeoff: "Immediate Security vs. High-Upside Exploration",
        description: "Taking the comfortable path provides short-term reassurance, but can sacrifice the compounding upside of higher-risk moves."
      },
      {
        tradeoff: "Short-term Cash/Title vs. Deep Mastery",
        description: "Immediate tangible perks may divert attention away from building core foundational expertise."
      }
    ],
    alternativePerspectives: [
      {
        perspective: "The Inversion Principle",
        description: "Instead of planning how to succeed, analyze how this decision could fail most catastrophically, and systematically eliminate those vulnerabilities."
      },
      {
        perspective: "The 10/10/10 Rule",
        description: "Evaluate how this choice will impact your life in 10 weeks, in 10 months, and in 10 years."
      }
    ],
    alternatives: options.length > 1 ? [
      {
        alternative: "Propose a conditional 60-day trial period",
        description: "Test the dynamics, culture, and workload before locking in for an extended period."
      },
      {
        alternative: "Formulate a third hybrid option",
        description: "Combine the risk mitigation of Option B with the core upside of Option A."
      }
    ] : [
      {
        alternative: "Develop at least two contrasting competing choices",
        description: "Single-choice evaluations carry a 50%+ higher regret rate. Actively generate an attractive alternative."
      }
    ],
    longTermConsiderations: [
      {
        consideration: "Skill Compounding vs. Stagnation",
        description: "Will this path demand continuous growth in high-value capabilities, or settle into repetitive execution?"
      },
      {
        consideration: "Reputational & Network Capital",
        description: "Will the people you collaborate with become high-trust advocates and peers for years to come?"
      }
    ],
    questionsToConsider: [
      "What verifiable piece of data would immediately cause you to rethink your current direction?",
      "Which of your stated reasons is based on verified fact rather than optimistic assumption?",
      "If a trusted mentor evaluated this situation objectively, what uncomfortable question would they ask you?",
      "What is the realistic worst-case scenario, and how would you recover from it?",
      "Who else will be impacted by your choice that you have not yet consulted?",
      "If this opportunity vanished tomorrow, what would be your immediate next move?"
    ],
    challengeMyThinking: [
      {
        assumption: "Because the immediate perks look good, the overall experience will be beneficial.",
        challenge: "Attractive upfront features frequently blind us to severe daily friction. A great title or compensation package can still accompany an exhausting, low-learning environment.",
        reflectionQuestion: "What daily annoyances or stressors are you willing to tolerate for this opportunity?"
      },
      {
        assumption: "You have all the necessary information to evaluate this accurately right now.",
        challenge: "You have seen what the other party presented. You have not yet inspected what is omitted or downplayed.",
        reflectionQuestion: "What questions haven't you asked yet because you were hesitant about hearing the truth?"
      },
      {
        assumption: "Saying yes to this is your best or only viable step right now.",
        challenge: "Fear of missing out often forces premature closure on decisions that would benefit from wider exploration.",
        reflectionQuestion: "What would happen if you simply paused for one week before making any commitment?"
      }
    ],
    whatYouMentioned: mentioned,
    whatYouDidNotMention: notMentioned.length > 0 ? notMentioned : [
      "Exit strategy and reversibility",
      "Hidden secondary costs",
      "Long-term energy sustainability"
    ],
    decisionReflection: "This decision deserves thoughtful scrutiny. You've outlined valid reasons, but some of your strongest arguments rest on untested assumptions. Before you finalize anything, run experiments to verify the points of highest uncertainty.",
    decisionMap
  };
}

// POST /api/analyze
app.post('/api/analyze', async (req, res) => {
  try {
    const { decision, options, reasoning, priorities, concerns, additionalContext, userApiKey } = req.body;

    if (!decision || !reasoning) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both a decision and your current reasoning.'
      });
    }

    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    // If Gemini key is available, call the real Gemini API
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        
        // Try gemini-1.5-flash or gemini-2.5-flash / gemini-2.0-flash
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          }
        });

        const promptText = `
Analyze the following user decision and reasoning for blind spots, hidden assumptions, missing factors, and alternative perspectives:

DECISION UNDER CONSIDERATION:
"${decision}"

OPTIONS CONSIDERED:
${Array.isArray(options) && options.length > 0 ? options.map((opt, i) => `${i + 1}. ${opt}`).join('\n') : 'No specific options listed'}

USER'S CURRENT REASONING:
"${reasoning}"

FACTORS THAT MATTER MOST TO THE USER (PRIORITIES):
${Array.isArray(priorities) ? priorities.join(', ') : 'None specified'}

CONCERNS / WORRIES:
"${concerns || 'None stated'}"

ADDITIONAL CONTEXT:
"${additionalContext || 'None stated'}"

Remember: Return strictly valid JSON conforming to the requested schema. Never recommend an option. Provide sharp, respectful, critical-thinking reflections.
`;

        const result = await model.generateContent([
          { text: SYSTEM_INSTRUCTION },
          { text: promptText }
        ]);

        const responseText = result.response.text();
        
        // Clean markdown backticks if any
        let cleanedJson = responseText.trim();
        if (cleanedJson.startsWith('```json')) {
          cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedJson.startsWith('```')) {
          cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsedData = JSON.parse(cleanedJson);

        return res.json({
          success: true,
          isLiveAi: true,
          modelUsed: 'gemini-1.5-flash',
          data: parsedData
        });
      } catch (geminiError) {
        console.warn('Gemini API call failed, using high-fidelity fallback synthesis engine:', geminiError.message);
        // Fallback to our high-fidelity contextual engine if API has rate-limit or network issue
        const fallbackData = generateFallbackAnalysis(req.body);
        return res.json({
          success: true,
          isLiveAi: false,
          modelUsed: 'offline-synthesis-engine',
          message: `Live Gemini API encountered an issue (${geminiError.message}). High-fidelity contextual analysis generated successfully.`,
          data: fallbackData
        });
      }
    }

    // No API key configured: return structured fallback analysis
    const fallbackData = generateFallbackAnalysis(req.body);
    return res.json({
      success: true,
      isLiveAi: false,
      modelUsed: 'simulation-engine',
      message: 'Running in Demo/Simulation Mode. Configure GEMINI_API_KEY in .env or enter your key in the app for live Gemini AI analysis.',
      data: fallbackData
    });

  } catch (error) {
    console.error('Error in /api/analyze:', error);
    return res.status(500).json({
      success: false,
      message: 'We could not complete the analysis right now. Please check your inputs and try again.'
    });
  }
});

// Serve frontend automatically if built dist directory exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`BlindSpot AI Server listening on http://localhost:${PORT}`);
  console.log(`Gemini API Key configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
});
