/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  RotateCcw, 
  Code, 
  Copy, 
  Check, 
  HelpCircle,
  FileCheck,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Plus,
  Minus,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ASSESSMENT_TEMPLATES, SAMPLE_ANSWERS } from "./templates";
import { AssessmentReport, CandidateResponse, AssessmentTemplate, Question } from "./types";

export default function App() {
  // Current active assessment template
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate>(ASSESSMENT_TEMPLATES[0]);
  
  // Custom states to handle adding/editing custom assessments
  const [customTitle, setCustomTitle] = useState("Custom Candidate Evaluation");
  const [customRole, setCustomRole] = useState("General Specialist");
  const [customDescription, setCustomDescription] = useState("A custom evaluation template made by user.");
  const [customQuestions, setCustomQuestions] = useState<Question[]>([
    {
      id: "cust-1",
      question: "Describe your experience working under fast developmental sprint cycles.",
      category: "Agility",
      competency: "Execution Focus",
      weight: 1.0,
      placeholder: "Write details about managing pressure and maintaining output..."
    },
    {
      id: "cust-2",
      question: "How do you ensure you stay updated with emerging technology shifts in your craft?",
      category: "Continuous Learning",
      competency: "Growth Mindset",
      weight: 1.0,
      placeholder: "Mention newsletters, publications, side-projects, or groups..."
    }
  ]);

  // Current candidate details
  const [candidateName, setCandidateName] = useState("Sarah Jenkins");

  // Answers keyed by questionId
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Loading and evaluation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  // Simulated vs Live mode
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [copiedJson, setCopiedJson] = useState(false);

  // Auto-scrolled target results div anchor
  const scrollResultsToView = () => {
    setTimeout(() => {
      const el = document.getElementById("report-results-anchor");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Sync answers array when switching templates
  useEffect(() => {
    // Clear answers by default on template switch
    const defaultAnswers: Record<string, string> = {};
    selectedTemplate.questions.forEach(q => {
      defaultAnswers[q.id] = "";
    });
    setAnswers(defaultAnswers);
    setReport(null);
    setErrorText(null);
  }, [selectedTemplate]);

  // Load preset scenarios
  const handleLoadPreset = (type: 'good' | 'partial') => {
    if (selectedTemplate.id === 'swe-ii') {
      if (type === 'good') {
        setCandidateName("James Peterson (Principal Candidate)");
        setAnswers(SAMPLE_ANSWERS["swe-ii-good"]);
      } else {
        setCandidateName("Riley Smith (Partial Entry)");
        setAnswers(SAMPLE_ANSWERS["swe-ii-partial"]);
      }
    } else if (selectedTemplate.id === 'pm-growth') {
      if (type === 'good') {
        setCandidateName("Elena Rostova (Growth Specialist)");
        setAnswers(SAMPLE_ANSWERS["pm-growth-good"]);
      } else {
        setCandidateName("Devon Miller (Sparsely Filled)");
        // Load partial by taking only 1 question
        setCandidateName("Devon Miller (Sparsely Filled)");
        setAnswers({
          "pm-1": "We would look at Google Analytics dashboard and ask engineering to look for crashes or SQL issues.",
        });
      }
    } else {
      // General Aptitude template or custom
      if (type === 'good') {
        setCandidateName("Marcus Vance (Team Lead applicant)");
        setAnswers({
          "apt-1": "During our last retail product deployment, a vendor API went bankrupt. I rallied 3 developers and successfully pivot-crafted an open-source alternative layer in exactly 4 days, preserving our launch window and securing a 99.8% uptime rate.",
          "apt-2": "I assess individual motivation and skills early. I pair senior members with juniors in paired-programming cycles while breaking large projects down into bite-sized digestible issues with clear checklist definitions.",
          "apt-3": "I practice active ownership. I published a transparent post-mortem explaining our database indexing fail, noting standard prevention strategies. This converted a team bug into an excellent training document."
        });
      } else {
        setCandidateName("Alex Mercer (Incomplete Entry)");
        setAnswers({
          "apt-1": "We changed things fast when the client changed their mind about the layout. It worked out fine.",
        });
      }
    }
    setErrorText(null);
  };

  // Check how many questions are answered
  const totalQuestionsList = selectedTemplate.questions;
  const answeredQuestionsCount = totalQuestionsList.filter(q => answers[q.id]?.trim()).length;
  const isIncomplete = answeredQuestionsCount < totalQuestionsList.length;

  // Render list of loading captions to make process responsive and smart
  const loadingStages = [
    "Contacting AI report compiler...",
    "Scanning answers for syntactic clarity...",
    "Validating candidate structural competencies...",
    "Formulating proceed decisions & action guidelines...",
    "Injecting performance scores & generating summary JSON schema..."
  ];

  // Manual change of answer text state
  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: val
    }));
  };

  // Main evaluation triggering
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setErrorText(null);
    setReport(null);
    
    // Cycle loading messages for interactive polished layout
    let stageIdx = 0;
    setLoadingMessage(loadingStages[0]);
    const loaderInterval = setInterval(() => {
      stageIdx = (stageIdx + 1) % loadingStages.length;
      setLoadingMessage(loadingStages[stageIdx]);
    }, 1200);

    // Prepare questions/answers array
    const responsesPayload = selectedTemplate.questions.map(q => ({
      questionId: q.id,
      question: q.question,
      category: q.category,
      competency: q.competency,
      weight: q.weight,
      answer: answers[q.id] || ""
    }));

    try {
      if (isSandboxMode) {
        // High fidelity simulated evaluation that ensures 100% functionality with complex metrics
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        let score = 0;
        let recommendation: 'Proceed' | 'Needs Training' | 'Re-evaluate' | 'Reject' = 'Proceed';
        let summary = "";
        let recs: string[] = [];
        let strengths: string[] = [];
        let improvements: string[] = [];
        let scoresObj: Record<string, number> = {};

        // Calculate average answers length to influence simulation
        const totalLen = responsesPayload.reduce((acc, curr) => acc + curr.answer.trim().length, 0);
        const avgLen = answeredQuestionsCount > 0 ? totalLen / answeredQuestionsCount : 0;

        if (answeredQuestionsCount === 0) {
          // Total empty
          score = 15;
          recommendation = 'Reject';
          summary = "The assessment is completely blank. The candidate did not provide answers to any evaluations requested, preventing any meaningful capability scoring. Immediate reject is recommended.";
          scoresObj = { "Technical Capability": 0, "Analytical Aptitude": 0, "Professional Delivery": 0 };
          strengths = ["None recognized due to missing values."];
          improvements = ["Requires complete re-taking of the evaluation pipeline."];
          recs = ["Reject or request immediate full assessment completion."];
        } else if (isIncomplete) {
          // Semi filled
          score = Math.floor(40 + (answeredQuestionsCount / totalQuestionsList.length) * 25 + Math.min(20, avgLen / 20));
          recommendation = score >= 65 ? 'Re-evaluate' : 'Needs Training';
          summary = `The digital assessment filed for ${candidateName} was completed partially, answering ${answeredQuestionsCount} out of ${totalQuestionsList.length} criteria points. The evaluated content shows sparse to moderate competence inside answered modules, but key knowledge silos are unaccounted for because of skipped question prompts directly affecting reliability scores.`;
          
          scoresObj = {};
          selectedTemplate.questions.forEach(q => {
            const hasAns = answers[q.id]?.trim();
            scoresObj[q.competency] = hasAns ? Math.floor(55 + Math.min(35, hasAns.length / 10)) : 10;
          });

          strengths = [
            "Demonstrated basic interest in the answered categories.",
            "Willingness to submit partial drafts under assessment constraints."
          ];
          improvements = [
            "Provide written communication across all operational benchmarks.",
            "Improve detail depth of functional descriptions rather than brevity."
          ];
          recs = [
            "Request candidate to supply missing system design and strategy concepts.",
            "Host a 1-on-1 performance review panel to address skipped topics.",
            "Classify profile as paused pending additional validation data points."
          ];
        } else {
          // Fully filled - dynamic score depending on quality
          const answerLengthSum = totalLen;
          if (answerLengthSum > 600) {
            score = Math.min(96, Math.floor(82 + Math.min(14, (answerLengthSum - 600) / 100)));
            recommendation = score >= 85 ? 'Proceed' : 'Re-evaluate';
            summary = `This candidate exhibits a thorough, highly strategic, and conceptually secure competency model. Their responses to ${selectedTemplate.title} demonstrate deep real-world experience, a clear grasp of production trade-offs, and strong documentation standards. They clearly articulate technical variables to teammates and express high emotional maturity during debate.`;
            
            scoresObj = {};
            selectedTemplate.questions.forEach(q => {
              const ansL = answers[q.id]?.length || 0;
              scoresObj[q.competency] = Math.min(98, Math.floor(80 + Math.min(18, ansL / 50)));
            });

            strengths = [
              "Highly structured prose with solid references to metrics and tooling.",
              "Strong accountability culture shown during failure retrospectives.",
              "Thorough execution plan incorporating testing and optimization mechanics."
            ];
            improvements = [
              "Could benefit from slight focus on delegation metrics to extend reach.",
              "Prone to high density over-explanation of simple functional flows."
            ];
            recs = [
              "Schedule the next operational round with active team leads.",
              "Offer quick strategic scenarios during technical briefings.",
              "Onboard immediately onto complex performance tracking dashboards."
            ];
          } else {
            score = Math.floor(62 + Math.min(18, answerLengthSum / 20));
            recommendation = score >= 75 ? 'Re-evaluate' : 'Needs Training';
            summary = `The candidate provided base-level answers that fulfill basic criteria but lack critical contextual depth and quantitative metric callouts. They have basic familiarity with ${selectedTemplate.role} tools, but strategic foresight, scaling principles, and advanced problem-solving parameters require extensive coaching or further validation.`;
            
            scoresObj = {};
            selectedTemplate.questions.forEach(q => {
              scoresObj[q.competency] = Math.floor(58 + Math.min(22, (answers[q.id]?.length || 0) / 20));
            });

            strengths = [
              "Correct foundational understanding of role objectives.",
              "Coherent articulation of direct operational tasks."
            ];
            improvements = [
              "Expand on system metrics, KPIs, or measurement standards.",
              "Enhance technical scaling logic and database profiling insights."
            ];
            recs = [
              "Pair candidate with experienced leads for training periods if hired.",
              "Run a focused code-review session to gauge analytical depth.",
              "Evaluate for a junior tier or training roadmap tracks."
            ];
          }
        }

        const generatedReport: AssessmentReport = {
          overall_score: score,
          recommendation,
          performance_summary: summary,
          scores: scoresObj,
          recommendations: recs,
          strengths,
          improvements,
          is_incomplete: isIncomplete
        };

        setReport(generatedReport);
        scrollResultsToView();
      } else {
        // Send request to live AI endpoint
        const fetchResponse = await fetch("/api/generate-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: selectedTemplate.title,
            role: selectedTemplate.role,
            description: selectedTemplate.description,
            responses: responsesPayload,
            isForcedIncomplete: isIncomplete
          })
        });

        if (!fetchResponse.ok) {
          const errData = await fetchResponse.json();
          throw new Error(errData.error || "Internal Server Error while evaluating.");
        }

        const generatedReport = await fetchResponse.json() as AssessmentReport;
        setReport(generatedReport);
        scrollResultsToView();
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "An unexpected error occurred while communicating with the server.");
    } finally {
      clearInterval(loaderInterval);
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Helper properties to get theme styles for recommendation kinds
  const getRecommendationThemeStyle = (rec: AssessmentReport['recommendation']) => {
    switch (rec) {
      case 'Proceed':
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
          accent: "text-emerald-600 bg-emerald-100 border-emerald-300",
          badge: "bg-emerald-500 text-white",
          text: "text-emerald-700",
          barColor: "bg-emerald-500",
          lightBar: "bg-emerald-100"
        };
      case 'Re-evaluate':
        return {
          bg: "bg-blue-50 border-blue-200 text-blue-900",
          accent: "text-blue-600 bg-blue-100 border-blue-300",
          badge: "bg-blue-500 text-white",
          text: "text-blue-700",
          barColor: "bg-blue-500",
          lightBar: "bg-blue-100"
        };
      case 'Needs Training':
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-900",
          accent: "text-amber-600 bg-amber-100 border-amber-300",
          badge: "bg-amber-500 text-white",
          text: "text-amber-700",
          barColor: "bg-amber-500",
          lightBar: "bg-amber-100"
        };
      case 'Reject':
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-900",
          accent: "text-rose-600 bg-rose-100 border-rose-300",
          badge: "bg-rose-500 text-white",
          text: "text-rose-700",
          barColor: "bg-rose-500",
          lightBar: "bg-rose-100"
        };
    }
  };

  const recTheme = report ? getRecommendationThemeStyle(report.recommendation) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Visual Navigation Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" id="applet-nav-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Assessment Summary</h1>
              <p className="text-xs text-slate-500 font-mono">B12 • AI Report Compiler</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Engine configuration state */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-full p-1 border border-slate-200 text-xs">
              <button 
                type="button"
                onClick={() => { setIsSandboxMode(true); }}
                className={`px-3 py-1 rounded-full transition-colors ${isSandboxMode ? "bg-white text-slate-900 font-medium shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Sandbox Mode (Simulated AI)
              </button>
              <button 
                type="button"
                className={`px-3 py-1 rounded-full transition-colors ${!isSandboxMode ? "bg-white text-slate-900 font-medium shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                onClick={() => { setIsSandboxMode(false); }}
              >
                Live Gemini API
              </button>
            </div>

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-100">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1.5 animate-pulse"></span>
              Ready
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Info Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-xl p-6 md:p-8 text-white shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 text-xs mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Automated Talent Analytics Evaluation Engine</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Generate Instant Assessment Summaries Automatically</h2>
            <p className="mt-2 text-indigo-100/90 text-sm leading-relaxed">
              Compile structured candidate feedback matrices into executive-ready talent briefs. Provide overall scores, candidate metrics breakdown, core actions, and the compliant <strong>Proceed Decision Object</strong> using Gemini LLMs.
            </p>
          </div>
          
          <div className="bg-indigo-950/80 backdrop-blur-xs border border-indigo-400/30 p-4 rounded-lg w-full md:w-auto min-w-[200px] flex flex-col space-y-1 text-xs">
            <span className="text-indigo-300 font-mono">EXPECTED JSON OUTPUT</span>
            <pre className="font-mono text-emerald-400 bg-black/40 p-2 rounded text-left leading-4 overflow-x-auto min-w-[170px]">
{`{
  "overall_score": 82,
  "recommendation": "Proceed"
}`}
            </pre>
          </div>
        </div>

        {/* Global Configuration Controls Panel */}
        <section className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 mb-8" id="template-configuration">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">1. Configure Target Assessment Matrix</h3>
                <p className="text-slate-500 text-xs">Select or construct a customized questionnaire profile below.</p>
              </div>

              {/* Mobile Sandbox Indicator toggle */}
              <div className="sm:hidden flex items-center justify-between w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-600 font-medium">Evaluation Mode:</span>
                <button
                  type="button"
                  onClick={() => setIsSandboxMode(p => !p)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded font-medium"
                >
                  {isSandboxMode ? "Sandbox (Demo)" : "Live Gemini"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Template selection column */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Template Role Profiler
                </label>
                <div className="flex flex-col space-y-2">
                  {ASSESSMENT_TEMPLATES.map((temp) => (
                    <button
                      key={temp.id}
                      type="button"
                      onClick={() => setSelectedTemplate(temp)}
                      className={`flex items-start text-left p-3.5 rounded-lg border text-sm transition-all ${
                        selectedTemplate.id === temp.id
                          ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <FileText className={`w-4 h-4 mr-2.5 mt-0.5 shrink-0 ${selectedTemplate.id === temp.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-semibold">{temp.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">{temp.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile setup details */}
              <div className="md:col-span-2 bg-slate-50 rounded-lg p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-800 border border-slate-300 font-mono">
                      Category Info
                    </span>
                    <span className="text-xs text-slate-500">
                      Total Questions: <strong className="text-slate-900">{selectedTemplate.questions.length}</strong>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{selectedTemplate.title}</h4>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                    {selectedTemplate.description}
                  </p>

                  {/* Candidate metadata config */}
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Candidate / Subject Name</label>
                      <input 
                        type="text" 
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="w-full text-sm bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[40px]"
                        placeholder="e.g. Sarah Jenkins"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Target Appointment Role</label>
                      <input 
                        type="text" 
                        value={selectedTemplate.role}
                        disabled
                        className="w-full text-sm bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-slate-500 cursor-not-allowed min-h-[40px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset injection helpers */}
                <div className="mt-6 pt-4 border-t border-slate-200/60">
                  <span className="block text-xs font-medium text-slate-500 mb-2.5">
                    💡 Instantly test the engine using pre-configured target submissions:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleLoadPreset('good')}
                      className="inline-flex items-center px-3 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer min-h-[40px]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Auto-fill Elite Responses (Pass)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadPreset('partial')}
                      className="inline-flex items-center px-3 py-2 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer min-h-[40px]"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                      Auto-fill Sparse Responses (Incomplete Edge Case)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnswers({});
                        setCandidateName("Sarah Jenkins");
                        setReport(null);
                        setErrorText(null);
                      }}
                      className="inline-flex items-center px-3 py-2 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer min-h-[40px]"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      Reset Blank
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Questionnaire Form Grid */}
        <section className="mb-8" id="questionnaire-submissions">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">2. Input Candidate Submissions</h3>
              <p className="text-slate-500 text-xs">Fill out individual evaluation answers. Leave some queries empty to experience incomplete evaluation pipelines.</p>
            </div>
            
            {/* Visual Answer Badge counters */}
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500">Progress Tracker:</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${isIncomplete ? "bg-amber-50 text-amber-800 border border-amber-100" : "bg-emerald-50 text-emerald-800 border border-emerald-100"}`}>
                {answeredQuestionsCount} / {totalQuestionsList.length} completed
              </span>
            </div>
          </div>

          {/* Incomplete assessment notice */}
          {isIncomplete && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start space-x-3 text-amber-800 text-xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">⚠️ Incomplete Assessment Evaluation Mode Active</p>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  You have left <strong className="text-slate-800">{totalQuestionsList.length - answeredQuestionsCount} question(s) empty</strong>. 
                  The AI compiler is configured to gracefully assess this edge-case by generating a partial rating, marking <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">is_incomplete: true</code>, and delivering adaptive gap recommendation metrics.
                </p>
              </div>
            </motion.div>
          )}

          {/* Grid of question submissions templates */}
          <div className="space-y-6">
            {totalQuestionsList.map((q, idx) => {
              const currentAnswer = answers[q.id] || "";
              const charCount = currentAnswer.trim().length;

              return (
                <div 
                  key={q.id} 
                  className={`bg-white rounded-xl border p-5 transition-all relative ${
                    charCount > 0 ? "border-indigo-200 shadow-xs" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                        Item {idx + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">•</span>
                      <span className="text-xs text-slate-500">Competency: <strong className="text-slate-700">{q.competency}</strong></span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm">
                        Weight: x{q.weight}
                      </span>
                      {charCount > 0 ? (
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ✓ Filled ({charCount} chars)
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          ✗ Empty / Skipped
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-800 font-medium text-sm leading-relaxed mb-3">
                    {q.question}
                  </p>

                  <textarea
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    rows={3}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow min-h-[90px]"
                    placeholder={q.placeholder}
                  />

                  {/* Real-time word recommendation counts */}
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-slate-400 italic">
                      {charCount < 40 && charCount > 0 ? "⚠️ Consider expanding for a thorough evaluation." : "Perfect formatting density."}
                    </span>
                    <span className={`font-mono ${charCount > 150 ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      {charCount} characters
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action trigger compilation button containing status logs */}
          <div className="mt-8 flex flex-col items-center justify-center bg-indigo-950 rounded-xl p-8 border border-indigo-900 shadow-md">
            <h4 className="text-white font-bold text-center mb-2">Ready to Compile Assessment Analytics?</h4>
            <p className="text-indigo-200/90 text-xs text-center max-w-lg mb-6 leading-relaxed">
              Upon clicking, the engine aggregates candidate answers and triggers our {isSandboxMode ? "Fast Simulation Matrix" : "Production Google Gemini API Pipeline"} to render the official scoring report directly below.
            </p>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateReport}
              className={`w-full max-w-sm font-semibold tracking-wide text-sm py-4.5 px-6 rounded-lg shadow-md transition-all flex items-center justify-center space-x-3 cursor-pointer min-h-[50px] ${
                isGenerating 
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transform active:scale-[0.98] ring-4 ring-emerald-500/10"
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{loadingMessage}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-200 mr-1" />
                  <span>Automatically Compile Assessment Report</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Error notifications container */}
            {errorText && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 w-full max-w-xl bg-rose-950/80 border border-rose-500/30 p-4.5 rounded-lg text-rose-200 text-xs flex items-start space-x-3 font-sans"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Evaluation Engine Error</p>
                  <p className="leading-relaxed">{errorText}</p>
                  <div className="pt-2 flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => setIsSandboxMode(true)}
                      className="underline hover:text-white font-medium cursor-pointer"
                    >
                      ✓ Switch to Sandbox (Offline Simulator)
                    </button>
                    <span>•</span>
                    <span className="text-rose-300">Or configure GEMINI_API_KEY inside AI Studio Secrets tab</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Evaluation Output Section */}
        <AnimatePresence>
          {report && recTheme && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="mt-10"
              id="report-results-anchor"
            >
              {/* Header Title anchor */}
              <div className="text-center mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 uppercase tracking-widest font-mono">
                  Official Summary Report Ready
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">Executive Candidate Review Dashboard</h3>
                <p className="text-slate-500 text-xs mt-0.5">Automated compilation finalized for {candidateName} ({selectedTemplate.role}).</p>
              </div>

              {/* Grid block grouping the exact requested JSON and visual layout side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Visual scorecard feedback widget (8 cols) */}
                <div className="lg:col-span-8 flex flex-col space-y-6">
                  
                  {/* Top score card block */}
                  <div className={`p-6 md:p-8 rounded-2xl border ${recTheme.bg} transition-all shadow-md`}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-3 shrink-0 text-center md:text-left">
                        <span className="text-xs uppercase tracking-wider text-slate-500 block font-bold font-mono">
                          Evaluation Aggregate
                        </span>
                        
                        {/* Huge score output */}
                        <div className="flex items-baseline justify-center md:justify-start">
                          <h4 className="text-6xl font-black text-slate-900 font-mono tracking-tighter">
                            {report.overall_score}
                          </h4>
                          <span className="text-2xl text-slate-500 font-medium ml-1">/100</span>
                        </div>

                        {/* Core evaluation recommendation badge */}
                        <div className="inline-flex items-center gap-1.5 pt-1.5">
                          <span className="text-xs text-slate-500 font-medium">Outcome Status:</span>
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase ${recTheme.badge} shadow-xs`}>
                             {report.recommendation}
                          </span>
                        </div>
                      </div>

                      <div className="border-t md:border-t-0 md:border-l border-slate-300/40 pt-4 md:pt-0 md:pl-8 flex-1">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">Executive Performance Summary</h5>
                        <p className="text-slate-700 text-sm leading-relaxed font-sans font-normal">
                          {report.performance_summary}
                        </p>
                        
                        {report.is_incomplete && (
                          <div className="mt-3.5 flex items-center space-x-2 bg-amber-150 border border-amber-300 rounded-md p-2 text-[11px] text-amber-900">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span><strong>Profile Flagged:</strong> Evaluations include gaps or skipped questions. Use corrective training map under Recommendations.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Competency rating bars */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                    <h5 className="text-sm font-bold text-slate-900 mb-5 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
                      Dynamic Competency Index Mapping
                    </h5>
                    
                    <div className="space-y-4">
                      {Object.entries(report.scores).map(([competency, score]) => (
                        <div key={competency} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-800">{competency}</span>
                            <span className="font-mono font-bold text-slate-700">{score} / 100</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3 pb-0.5 flex relative overflow-hidden border border-slate-250">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className={`h-full rounded-full ${recTheme.barColor}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Growth lists side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                      <h5 className="text-sm font-bold text-emerald-800 mb-3.5 flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" />
                        Identified strengths
                      </h5>
                      <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed list-inside">
                        {report.strengths.map((str, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                      <h5 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center">
                        <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
                        Targeted Growth Areas
                      </h5>
                      <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed list-inside">
                        {report.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Next Step learning recommendation index */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                    <h5 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                      <BookOpen className="w-4 h-4 text-indigo-600 mr-2" />
                      Immediate Action & Strategic Roadmap Suggestions
                    </h5>
                    <div className="space-y-3">
                      {report.recommendations.map((recText, idx) => (
                        <div key={idx} className="flex items-start space-x-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-150 text-indigo-800 text-xs font-bold font-mono shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{recText}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Left side target element: THE COMPLIANT SOLEMN OUTCOME JSON PANEL (4 cols) */}
                <div className="lg:col-span-4 flex flex-col space-y-6">
                  
                  {/* The exact requested json object banner display */}
                  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-white shadow-md flex flex-col justify-between h-full min-h-[480px]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <Code className="w-4 h-4 text-emerald-400" />
                          <span className="font-mono text-xs font-medium text-slate-300">Required Object JSON</span>
                        </div>
                        <span className="text-[10px] font-mono uppercase bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-sm">
                          Spec compliant
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        This block holds the precisely structured payload targetted by assessment pipelines. Useful for integration with candidate applicant tracking systems (ATS).
                      </p>

                      <div className="relative mt-4">
                        <pre className="text-xs font-mono text-emerald-400 bg-slate-950 p-4.5 rounded-xl border border-slate-850 overflow-x-auto leading-relaxed">
{`{
  "overall_score": ${report.overall_score},
  "recommendation": "${report.recommendation}"
}`}
                        </pre>
                        
                        <button
                          type="button"
                          onClick={() => copyToClipboard(JSON.stringify({ overall_score: report.overall_score, recommendation: report.recommendation }, null, 2))}
                          className="absolute top-3 right-3 p-2 bg-slate-800 text-slate-300 hover:text-white rounded-md hover:bg-slate-705 transition-colors cursor-pointer"
                          title="Copy Output"
                        >
                          {copiedJson ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="pt-3">
                        <span className="text-[11px] text-slate-400 block font-semibold mb-2 uppercase font-mono">Full Compiled Schema</span>
                        <div className="max-h-[220px] overflow-y-auto bg-slate-950 border border-slate-850 p-3.5 rounded-lg text-[11px] text-slate-300 font-mono scrollbar-thin">
                          <pre className="text-left whitespace-pre-wrap leading-relaxed">
                            {JSON.stringify(report, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-2 mt-4">
                      <div className="flex justify-between">
                        <span>Parser Target ID:</span>
                        <span className="font-mono text-slate-400">{selectedTemplate.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Report Log Time:</span>
                        <span className="font-mono text-slate-400">{new Date().toISOString().split('T')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Complete State:</span>
                        <span className={`font-mono ${report.is_incomplete ? "text-amber-400" : "text-emerald-400"}`}>
                          {report.is_incomplete ? "Incomplete ⚠️" : "100% Final"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Visual Footer Credit Section */}
      <footer className="bg-white border-t border-slate-200 mt-20 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">Assessment Report Generator • B12 Objective Evaluation Service</p>
          <p>Designed with meticulous typography, compliance metrics, and adaptive AI summaries.</p>
          <div className="flex justify-center space-x-4 pt-2">
            <span>Powered by Gemini 3.5 Flash</span>
            <span className="text-slate-300">|</span>
            <span>Ref: d36ad7f8-3c25</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

