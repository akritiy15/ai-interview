import React, { useState, useEffect, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { 
  Wrench, FileText, MessageCircle, Briefcase, 
  ChevronRight, ArrowLeft, CheckCircle2, Circle,
  RefreshCcw, Copy, Share2, AlertTriangle, Check, Loader2, Sparkles, Timer
} from 'lucide-react';

// --- CONSTANTS & MOCKS ---
const ROLES = ["Software Engineer", "Data Analyst", "Product Manager", "UI-UX Designer", "DevOps", "Other"];

const TECH_SKILLS = {
  "Software Engineer": ["Python", "Java", "C++", "React", "Node.js", "SQL", "Git", "Docker", "System Design", "DSA"],
  "Data Analyst": ["Python", "SQL", "Excel", "Tableau", "Power BI", "ML", "Pandas", "Statistics"],
  "Product Manager": ["Figma", "JIRA", "SQL", "Analytics", "Roadmapping", "A/B Testing"],
  "UI-UX Designer": ["Figma", "Adobe XD", "Prototyping", "User Research", "CSS", "Illustrator"],
  "DevOps": ["Linux", "AWS", "CI/CD", "Kubernetes", "Terraform", "Docker", "Bash", "Python"],
  "Other": ["Python", "JavaScript", "SQL", "Git", "Project Management", "Design", "Communication"]
};

const PROJECT_TYPES = ["Web App", "ML Model", "Mobile App", "API", "Data Dashboard", "Design System", "None"];

// --- HELPER COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`glass-card p-6 ${className}`}>
    {children}
  </div>
);

const Chip = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
      selected 
        ? 'bg-primary/20 text-primary border border-primary/50' 
        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
    }`}
  >
    {label}
  </button>
);

const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
    <span className="text-gray-200">{label}</span>
    <div className="flex gap-2">
      <button
        onClick={() => onChange("Yes")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          value === "Yes" ? 'bg-green/20 text-green border border-green/50' : 'bg-white/5 text-gray-400 border border-transparent'
        }`}
      >
        Yes
      </button>
      <button
        onClick={() => onChange("No")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          value === "No" ? 'bg-red/20 text-red border border-red/50' : 'bg-white/5 text-gray-400 border border-transparent'
        }`}
      >
        No
      </button>
      {label.includes("ATS") && (
        <button
          onClick={() => onChange("Don't know")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            value === "Don't know" ? 'bg-amber/20 text-amber border border-amber/50' : 'bg-white/5 text-gray-400 border border-transparent'
          }`}
        >
          Don't know
        </button>
      )}
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  const [step, setStep] = useState(0); // 0-6
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [apiError, setApiError] = useState(false);
  const [resultData, setResultData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "Software Engineer",
    techSkills: [],
    dsa: "None",
    courses: "None",
    hasResume: null,
    resumeTailored: null,
    resumeReviewed: null,
    resumeImpact: null,
    resumeATS: null,
    mockInterviews: "0",
    explainProjects: 5,
    behavioralQs: 5,
    groupDiscussions: null,
    numProjects: "0",
    bestProjectType: "None",
    githubCommits: null,
    linkedinComplete: null,
    internship: null
  });

  // Action Plan State
  const [checkedTasks, setCheckedTasks] = useState(new Set());
  const [quickWinsChecked, setQuickWinsChecked] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0 && step >= 1 && step <= 4) {
      interval = setInterval(() => setTimeLeft(l => l - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, step]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerColor = timeLeft <= 10 ? 'text-red animate-pulse' : timeLeft <= 30 ? 'text-amber' : 'text-primary';

  // AI Loading Messages Effect
  const loadingMessages = [
    `Scanning your tech stack for ${formData.role}…`,
    "Evaluating resume completeness…",
    "Benchmarking communication readiness…",
    "Assessing portfolio strength…",
    "Calculating your Readiness Score…"
  ];

  useEffect(() => {
    if (step === 5) {
      const msgInterval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
      return () => clearInterval(msgInterval);
    }
  }, [step]);

  // Fetch AI Data
  const fetchAIAnalysis = async (useMock = false) => {
    setApiError(false);
    if (useMock) {
      setTimeout(() => {
        setResultData(getMockResult(formData));
        setStep(6);
      }, 2000);
      return;
    }

    try {
      const prompt = `You are a senior technical recruiter and career coach at a top tech company. A student has submitted their profile for interview readiness evaluation. Your job is to assess them STRICTLY and HONESTLY — do not inflate scores. Base scores purely on what they've answered.
Return ONLY a valid JSON object. No markdown. No explanation. No backticks. Just raw JSON.
Use this exact structure:
{
  "overallScore": number between 0-100,
  "level": one of exactly "Not Ready" | "Beginner" | "Developing" | "Intermediate" | "Advanced" | "Job-Ready",
  "levelDescription": "one sentence explaining what this level means for their job search",
  "pillars": {
    "technicalSkills": { "score": 0-100, "weight": 40, "keyFinding": "one specific sentence", "topAction": "the single most impactful thing" },
    "resume": { "score": 0-100, "weight": 20, "keyFinding": "one specific sentence", "topAction": "one specific action" },
    "communication": { "score": 0-100, "weight": 15, "keyFinding": "one specific sentence", "topAction": "one specific action" },
    "portfolio": { "score": 0-100, "weight": 25, "keyFinding": "one specific sentence", "topAction": "one specific action" }
  },
  "strengths": ["exactly 3 strings"],
  "criticalGaps": ["exactly 3 strings"],
  "weeklyPlan": [
    { "week": 1, "theme": "string", "goal": "string", "tasks": ["3 specific daily/weekly tasks"] },
    { "week": 2, "theme": "string", "goal": "string", "tasks": ["3 specific daily/weekly tasks"] },
    { "week": 3, "theme": "string", "goal": "string", "tasks": ["3 specific daily/weekly tasks"] }
  ],
  "quickWins": ["exactly 3 things completable in 24–48 hours"],
  "recruiterVerdict": "one honest sentence a recruiter would say",
  "motivationalNote": "one encouraging sentence"
}

Student Data:
${JSON.stringify(formData, null, 2)}
`;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY in .env");

      // Use Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) {
        let errMessage = `HTTP Error ${response.status}`;
        try {
          const errorData = await response.json();
          errMessage = errorData.error?.message || errMessage;
        } catch {
          const text = await response.text();
          errMessage = text || errMessage;
        }
        throw new Error(`Gemini API Error: ${errMessage}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response candidates returned from Gemini");
      }

      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(text);
      setResultData(parsed);
      setStep(6);

    } catch (err) {
      console.error(err);
      setApiError(err.message || "Unknown API error");
    }
  };

  useEffect(() => {
    if (step === 5 && !apiError) {
      fetchAIAnalysis();
    }
  }, [step]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);
  
  const startAssessment = () => {
    setStep(1);
    setTimeLeft(120);
    setTimerActive(true);
  };

  const toggleTask = (taskId) => {
    const newSet = new Set(checkedTasks);
    if (newSet.has(taskId)) newSet.delete(taskId);
    else newSet.add(taskId);
    setCheckedTasks(newSet);
  };

  const toggleQuickWin = (idx) => {
    const newSet = new Set(quickWinsChecked);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setQuickWinsChecked(newSet);

    if (newSet.size === 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const updateForm = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const toggleTechSkill = (skill) => {
    const current = formData.techSkills;
    if (current.includes(skill)) updateForm('techSkills', current.filter(s => s !== skill));
    else updateForm('techSkills', [...current, skill]);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "Not Ready": return "text-red";
      case "Beginner": return "text-amber";
      case "Developing": return "text-amber";
      case "Intermediate": return "text-primary";
      case "Advanced": return "text-green";
      case "Job-Ready": return "text-primary";
      default: return "text-primary";
    }
  };

  // Views
  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-xl w-full">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-primary blur-3xl opacity-20 rounded-full"></div>
            <Sparkles className="w-16 h-16 text-primary relative z-10 mx-auto" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-6 tracking-tight">
            Interview Readiness <span className="text-primary">Score</span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 font-body">
            Get a brutally honest, AI-powered assessment of your job hunt readiness across 4 critical pillars in under 2 minutes.
          </p>
          <button 
            onClick={startAssessment}
            className="bg-primary text-black font-bold text-lg px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,212,255,0.4)]"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      {step > 0 && step < 6 && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 w-full max-w-[200px] md:max-w-[300px]">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-mono text-gray-400">Step {step}/4</span>
            </div>
            <div className={`flex items-center gap-2 font-mono text-xl ${timerColor}`}>
              <Timer className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </header>
      )}

      <main className="max-w-3xl mx-auto px-6 py-10">
        
        {/* STEP 1: TECHNICAL */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-8">
              <Wrench className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-display font-bold">Technical Skills</h2>
            </div>
            
            <Card className="space-y-8">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => updateForm('name', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Alex"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Role</label>
                <select 
                  value={formData.role}
                  onChange={e => { updateForm('role', e.target.value); updateForm('techSkills', []); }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  {ROLES.map(r => <option key={r} value={r} className="bg-background">{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3">Core Tech Stack (Select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {TECH_SKILLS[formData.role]?.map(skill => (
                    <Chip 
                      key={skill} 
                      label={skill} 
                      selected={formData.techSkills.includes(skill)}
                      onClick={() => toggleTechSkill(skill)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3">DSA / Problem Solving Practice</label>
                <div className="flex flex-wrap gap-2">
                  {["None", "LeetCode Easy", "LeetCode Medium", "LeetCode Hard", "Competitive Prog."].map(opt => (
                    <Chip 
                      key={opt} label={opt} 
                      selected={formData.dsa === opt}
                      onClick={() => updateForm('dsa', opt)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3">Relevant Courses / Certifications</label>
                <div className="flex flex-wrap gap-2">
                  {["None", "1–2", "3–5", "5+"].map(opt => (
                    <Chip 
                      key={opt} label={opt} 
                      selected={formData.courses === opt}
                      onClick={() => updateForm('courses', opt)}
                    />
                  ))}
                </div>
              </div>
            </Card>

            <div className="mt-8 flex justify-end">
              <button onClick={handleNext} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: RESUME */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-display font-bold">Resume Quality</h2>
            </div>
            
            <Card className="space-y-2">
              <Toggle label="Do you have a completed resume?" value={formData.hasResume} onChange={v => updateForm('hasResume', v)} />
              {formData.hasResume !== "No" && (
                <>
                  <Toggle label="Is it tailored specifically to your Target Role?" value={formData.resumeTailored} onChange={v => updateForm('resumeTailored', v)} />
                  <Toggle label="Has it been reviewed by a mentor or peer?" value={formData.resumeReviewed} onChange={v => updateForm('resumeReviewed', v)} />
                  <Toggle label="Does it include measurable impacts (numbers/metrics)?" value={formData.resumeImpact} onChange={v => updateForm('resumeImpact', v)} />
                  <Toggle label="Is it in an ATS-friendly format?" value={formData.resumeATS} onChange={v => updateForm('resumeATS', v)} />
                </>
              )}
            </Card>

            <div className="mt-8 flex justify-between">
              <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-3">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={handleNext} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: COMMUNICATION */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-8">
              <MessageCircle className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-display font-bold">Communication Skills</h2>
            </div>
            
            <Card className="space-y-8">
              <div>
                <label className="block text-sm text-gray-400 mb-3">Mock interviews completed</label>
                <div className="flex flex-wrap gap-2">
                  {["0", "1–3", "4–6", "7+"].map(opt => (
                    <Chip 
                      key={opt} label={opt} 
                      selected={formData.mockInterviews === opt}
                      onClick={() => updateForm('mockInterviews', opt)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-400">Can explain your projects clearly in 2 mins?</label>
                  <span className="font-mono text-primary">{formData.explainProjects}/10</span>
                </div>
                <input 
                  type="range" min="1" max="10" 
                  value={formData.explainProjects} 
                  onChange={e => updateForm('explainProjects', parseInt(e.target.value))}
                  className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Struggle</span>
                  <span>Confident</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-400">Comfortable with HR/behavioral questions?</label>
                  <span className="font-mono text-primary">{formData.behavioralQs}/10</span>
                </div>
                <input 
                  type="range" min="1" max="10" 
                  value={formData.behavioralQs} 
                  onChange={e => updateForm('behavioralQs', parseInt(e.target.value))}
                  className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Anxious</span>
                  <span>Prepared</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <Toggle label="Have you done group discussions or presentations?" value={formData.groupDiscussions} onChange={v => updateForm('groupDiscussions', v)} />
              </div>
            </Card>

            <div className="mt-8 flex justify-between">
              <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-3">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={handleNext} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PORTFOLIO */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-8">
              <Briefcase className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-display font-bold">Portfolio & Experience</h2>
            </div>
            
            <Card className="space-y-8">
              <div>
                <label className="block text-sm text-gray-400 mb-3">Number of relevant projects</label>
                <div className="flex flex-wrap gap-2">
                  {["0", "1", "2–3", "4+"].map(opt => (
                    <Chip 
                      key={opt} label={opt} 
                      selected={formData.numProjects === opt}
                      onClick={() => updateForm('numProjects', opt)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3">Best project type</label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map(opt => (
                    <Chip 
                      key={opt} label={opt} 
                      selected={formData.bestProjectType === opt}
                      onClick={() => updateForm('bestProjectType', opt)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-white/10 pt-4">
                <Toggle label="GitHub with commits in last 3 months?" value={formData.githubCommits} onChange={v => updateForm('githubCommits', v)} />
                <Toggle label="LinkedIn profile complete (photo, bio, skills)?" value={formData.linkedinComplete} onChange={v => updateForm('linkedinComplete', v)} />
                <Toggle label="Any internship or freelance work?" value={formData.internship} onChange={v => updateForm('internship', v)} />
              </div>
            </Card>

            <div className="mt-8 flex justify-between">
              <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-3">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button 
                onClick={() => { setTimerActive(false); setStep(5); }} 
                className="flex items-center gap-2 bg-primary text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,212,255,0.3)]"
              >
                Analyze My Profile <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: LOADING */}
        {step === 5 && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in">
            {apiError ? (
              <Card className="max-w-md text-center border-red/50">
                <AlertTriangle className="w-12 h-12 text-red mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">AI Analysis Failed</h3>
                {typeof apiError === 'string' && (
                  <div className="bg-red/10 border border-red/20 text-red text-xs p-3 rounded mb-4 text-left overflow-auto max-h-32">
                    {apiError}
                  </div>
                )}
                <p className="text-gray-400 mb-6 text-sm">Could not connect to the API. Ensure you have added your <code>VITE_GEMINI_API_KEY</code> in a <code>.env</code> file and restarted the server.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => fetchAIAnalysis()} className="bg-white/10 py-3 rounded-lg hover:bg-white/20 transition-colors font-medium">
                    Try Again
                  </button>
                  <button onClick={() => fetchAIAnalysis(true)} className="bg-primary/20 text-primary border border-primary/50 py-3 rounded-lg hover:bg-primary/30 transition-colors font-medium">
                    Bypass AI (Use Mock Data)
                  </button>
                </div>
              </Card>
            ) : (
              <>
                <div className="relative w-64 h-64 mb-8">
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-4 border-2 border-primary/40 rounded-full animate-pulse-slow"></div>
                  <div className="absolute inset-8 border border-dashed border-primary/60 rounded-full animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold text-center h-8 transition-opacity duration-500">
                  {loadingMessages[loadingMsgIdx]}
                </h3>
              </>
            )}
          </div>
        )}

        {/* STEP 6: RESULTS */}
        {step === 6 && resultData && (
          <div className="animate-in fade-in duration-1000">
            {showConfetti && <div className="fixed inset-0 pointer-events-none z-50 flex justify-center"><div className="w-4 h-4 bg-primary animate-confetti"></div><div className="w-4 h-4 bg-amber animate-confetti" style={{animationDelay: '0.1s', marginLeft: '50px'}}></div><div className="w-4 h-4 bg-green animate-confetti" style={{animationDelay: '0.2s', marginRight: '80px'}}></div><div className="w-4 h-4 bg-red animate-confetti" style={{animationDelay: '0.15s', marginLeft: '120px'}}></div></div>}
            
            {/* Header Sticky */}
            <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-white/10 py-4 -mx-6 px-6 mb-8 flex justify-between items-center shadow-2xl">
              <div>
                <h2 className="text-xl font-display font-bold">{formData.name}'s Readiness</h2>
                <p className="text-sm text-gray-400">{formData.role}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 hidden sm:inline">✓ Assessed in {120 - timeLeft}s</span>
                <div className={`px-4 py-1.5 rounded-full font-bold text-sm bg-white/5 border border-white/10 ${getLevelColor(resultData.level)}`}>
                  {resultData.level}
                </div>
              </div>
            </div>

            {/* A. Hero Section */}
            <Card className="text-center mb-8 relative overflow-hidden">
              <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 blur-[100px] rounded-full"></div>
              
              <div className="relative z-10">
                <p className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-4">Overall Score</p>
                <div className="flex justify-center items-center mb-6">
                  {/* Fake circular dial SVG */}
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r="45" fill="none" 
                        stroke={resultData.overallScore < 50 ? '#ef4444' : resultData.overallScore < 75 ? '#f59e0b' : '#00d4ff'} 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        strokeDasharray={`${(resultData.overallScore / 100) * 283} 283`}
                        className="transition-all duration-1500 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-6xl font-display font-bold tracking-tighter">{resultData.overallScore}</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{resultData.levelDescription}</h3>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 inline-block mt-4">
                  <p className="text-gray-300 italic">"{resultData.recruiterVerdict}"</p>
                </div>
              </div>
            </Card>

            {/* B. Pillar Breakdown & C. Radar Chart */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              
              {/* Radar Chart */}
              <Card className="flex flex-col">
                <h3 className="font-bold text-lg mb-6">Profile Shape</h3>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                      { subject: 'Technical', A: resultData.pillars.technicalSkills.score, B: 80 },
                      { subject: 'Resume', A: resultData.pillars.resume.score, B: 80 },
                      { subject: 'Communication', A: resultData.pillars.communication.score, B: 80 },
                      { subject: 'Portfolio', A: resultData.pillars.portfolio.score, B: 80 },
                    ]}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="You" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.4} />
                      <Radar name="Job-Ready" dataKey="B" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" fill="transparent" />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-xs mt-4">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary/40 border border-primary"></span> Your Profile</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-dashed border-gray-400"></span> Job-Ready Benchmark</div>
                </div>
              </Card>

              {/* 4 Pillar Cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'technicalSkills', name: 'Technical', icon: Wrench, color: 'text-primary', ...resultData.pillars.technicalSkills },
                  { id: 'resume', name: 'Resume', icon: FileText, color: 'text-amber', ...resultData.pillars.resume },
                  { id: 'communication', name: 'Communication', icon: MessageCircle, color: 'text-green', ...resultData.pillars.communication },
                  { id: 'portfolio', name: 'Portfolio', icon: Briefcase, color: 'text-red', ...resultData.pillars.portfolio }
                ].map((p, i) => (
                  <div key={i} className="glass-card p-4 flex flex-col justify-between" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <p.icon className={`w-4 h-4 ${p.color}`} />
                        <span className="font-bold text-sm">{p.name}</span>
                      </div>
                      <span className="text-xs font-mono text-gray-500">{p.weight}% wt</span>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-display font-bold">{p.score}</span><span className="text-gray-500 text-sm">/100</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.keyFinding}</p>
                    <p className="text-xs font-medium text-amber bg-amber/10 px-2 py-1.5 rounded line-clamp-2">
                      <span className="font-bold">Action:</span> {p.topAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* D. Strengths vs Gaps */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="border-t-4 border-t-green">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green">
                  <CheckCircle2 className="w-5 h-5" /> Key Strengths
                </h3>
                <ul className="space-y-3">
                  {resultData.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="border-t-4 border-t-red">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red">
                  <AlertTriangle className="w-5 h-5" /> Critical Gaps
                </h3>
                <ul className="space-y-3">
                  {resultData.criticalGaps.map((g, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-red mt-0.5">•</span> {g}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* F. Quick Wins */}
            <div className="mb-8">
              <h3 className="font-display font-bold text-xl mb-4">Do This in 48 Hours</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {resultData.quickWins.map((qw, i) => {
                  const isChecked = quickWinsChecked.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleQuickWin(i)}
                      className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                        isChecked ? 'bg-primary/10 border-primary/50 text-gray-400 line-through' : 'bg-white/5 border-white/10 hover:border-white/30 text-gray-200'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-primary border-primary text-black' : 'border-gray-500'}`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-sm leading-tight">{qw}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* E. 3-Week Action Plan */}
            <div className="mb-12">
              <h3 className="font-display font-bold text-xl mb-4">Your Custom Action Plan</h3>
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[21px] before:w-[2px] before:bg-white/10">
                {resultData.weeklyPlan.map((week, wIdx) => (
                  <div key={wIdx} className="relative pl-12">
                    <div className={`absolute left-0 w-11 h-11 rounded-full border-4 border-background flex items-center justify-center font-bold text-sm z-10 ${
                      wIdx === 0 ? 'bg-primary text-black' : 'bg-gray-800 text-gray-400'
                    }`}>
                      W{week.week}
                    </div>
                    <Card className={wIdx === 0 ? "border-primary/50 shadow-[0_0_15px_rgba(0,212,255,0.1)]" : ""}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">{week.theme}</h4>
                          <p className="text-sm text-gray-400">{week.goal}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {week.tasks.map((task, tIdx) => {
                          const taskId = `${wIdx}-${tIdx}`;
                          const isChecked = checkedTasks.has(taskId);
                          return (
                            <button 
                              key={tIdx}
                              onClick={() => toggleTask(taskId)}
                              className="w-full text-left flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                              {isChecked ? (
                                <CheckCircle2 className="w-5 h-5 text-green flex-shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-500 group-hover:text-gray-400 flex-shrink-0" />
                              )}
                              <span className={`text-sm ${isChecked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                {task}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* G. Footer Actions */}
            <div className="flex flex-wrap gap-4 justify-center pt-8 border-t border-white/10">
              <button 
                onClick={() => {
                  const text = `My Interview Readiness Score is ${resultData.overallScore}/100 (${resultData.level}).\n\nTop priorities:\n- ${resultData.quickWins[0]}\n- ${resultData.weeklyPlan[0].tasks[0]}`;
                  navigator.clipboard.writeText(text);
                  alert("Plan copied to clipboard!");
                }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full text-sm font-bold transition-colors"
              >
                <Copy className="w-4 h-4" /> Copy My Full Plan
              </button>
              
              <button 
                onClick={() => {
                  const text = encodeURIComponent(`I just checked my Interview Readiness Score and I'm feeling confident! Got a ${resultData.overallScore}/100 on the AI evaluation. Time to crush these next 3 weeks of prep. 💪`);
                  window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank');
                }}
                className="flex items-center gap-2 bg-[#0a66c2] hover:bg-[#004182] px-6 py-3 rounded-full text-sm font-bold transition-colors text-white"
              >
                <Share2 className="w-4 h-4" /> Share on LinkedIn
              </button>
              
              <button 
                onClick={() => {
                  setStep(0);
                  setResultData(null);
                  setCheckedTasks(new Set());
                  setQuickWinsChecked(new Set());
                  setTimeLeft(120);
                }}
                className="flex items-center gap-2 bg-transparent border border-white/20 hover:bg-white/5 px-6 py-3 rounded-full text-sm font-bold transition-colors text-gray-300"
              >
                <RefreshCcw className="w-4 h-4" /> Retake
              </button>
            </div>
            
            <p className="text-center text-gray-500 text-sm mt-12">{resultData.motivationalNote}</p>

          </div>
        )}
      </main>
    </div>
  );
}

// --- MOCK DATA GENERATOR ---
function getMockResult(data) {
  // Simple heuristic scoring based on formData to make the mock somewhat realistic
  let techScore = data.techSkills.length > 5 ? 85 : data.techSkills.length > 2 ? 60 : 35;
  if (data.dsa !== "None") techScore += 10;
  
  let resumeScore = data.hasResume === "No" ? 10 : 50;
  if (data.resumeTailored === "Yes") resumeScore += 15;
  if (data.resumeImpact === "Yes") resumeScore += 20;
  if (data.resumeATS === "Yes") resumeScore += 15;
  
  let commScore = 40;
  commScore += (data.explainProjects * 3);
  commScore += (data.behavioralQs * 2);
  if (data.mockInterviews !== "0") commScore += 10;
  
  let portScore = data.numProjects === "0" ? 20 : 50;
  if (data.githubCommits === "Yes") portScore += 15;
  if (data.linkedinComplete === "Yes") portScore += 15;
  if (data.internship === "Yes") portScore += 20;

  techScore = Math.min(100, techScore);
  resumeScore = Math.min(100, resumeScore);
  commScore = Math.min(100, commScore);
  portScore = Math.min(100, portScore);

  let wT = 40, wR = 20, wC = 15, wP = 25;
  if (data.role === "Data Analyst") { wT=35; wP=25; wR=25; wC=15; }
  if (data.role === "Product Manager") { wC=35; wR=30; wP=20; wT=15; }
  if (data.role === "UI-UX Designer") { wP=40; wC=25; wR=25; wT=10; }

  const overall = Math.round((techScore*wT + resumeScore*wR + commScore*wC + portScore*wP) / 100);
  
  let level = "Not Ready";
  if (overall > 30) level = "Beginner";
  if (overall > 50) level = "Developing";
  if (overall > 70) level = "Intermediate";
  if (overall > 85) level = "Advanced";
  if (overall > 92) level = "Job-Ready";

  return {
    overallScore: overall,
    level: level,
    levelDescription: `You have a strong foundation but need targeted polishing before interviewing for ${data.role} roles.`,
    pillars: {
      technicalSkills: { score: techScore, weight: wT, keyFinding: "Solid grasp of core stack, but missing advanced application.", topAction: "Build a full-stack project using your selected skills." },
      resume: { score: resumeScore, weight: wR, keyFinding: data.resumeImpact === "No" ? "Lacking measurable impact metrics." : "Good structure, needs minor ATS formatting tweaks.", topAction: "Rewrite 3 bullet points using the XYZ formula." },
      communication: { score: commScore, weight: wC, keyFinding: "Hesitant on behavioral questions based on your rating.", topAction: "Do 2 mock interviews this week using the STAR method." },
      portfolio: { score: portScore, weight: wP, keyFinding: data.numProjects === "0" ? "No visible projects to show employers." : "Good project base, but GitHub activity could be higher.", topAction: "Pin your best project on GitHub and update the README." }
    },
    strengths: [
      `Selected a clear target role (${data.role})`,
      data.techSkills.length > 0 ? "Has a foundational tech stack" : "Honest about current skill gaps",
      data.behavioralQs > 5 ? "Confident in behavioral scenarios" : "Willingness to learn and adapt"
    ],
    criticalGaps: [
      data.hasResume === "No" ? "No resume ready" : "Resume lacks quantifiable results",
      data.mockInterviews === "0" ? "Zero mock interview practice" : "Need more live interview reps",
      data.numProjects === "0" ? "Missing portfolio projects" : "GitHub lacks recent commits"
    ],
    weeklyPlan: [
      { week: 1, theme: "Foundation & Resume", goal: "Lock down your story", tasks: ["Update resume with XYZ format bullets", "Write down 5 core STAR stories", "Fix ATS formatting issues"] },
      { week: 2, theme: "Technical Polish", goal: "Prove you can build", tasks: ["Complete 5 LeetCode problems", "Deploy your best project live", "Add comprehensive README to GitHub"] },
      { week: 3, theme: "Interview Execution", goal: "Perform under pressure", tasks: ["Schedule 1 live peer mock interview", "Record yourself answering 'Tell me about yourself'", "Research top 3 target companies"] }
    ],
    quickWins: [
      "Add a professional summary to your LinkedIn profile",
      "Run your resume through a free ATS scanner",
      "Draft your 2-minute personal pitch"
    ],
    recruiterVerdict: "They have potential, but I need to see more concrete evidence of their skills before passing them to the hiring manager.",
    motivationalNote: "Every expert was once a beginner. You have the raw materials, now it's just about packaging them correctly. You've got this!"
  };
}
