import { AssessmentTemplate } from "./types";

export const ASSESSMENT_TEMPLATES: AssessmentTemplate[] = [
  {
    id: "swe-ii",
    title: "Software Engineer II Core Evaluation",
    role: "Software Engineer II",
    description: "Evaluates capability in writing scalable code, designing robust software systems, and writing high-character developer collaboration documentation.",
    questions: [
      {
        id: "swe-1",
        question: "Explain your process for diagnosing and fixing a memory leak in a high-traffic production service.",
        category: "System Performance",
        competency: "Technical Capability",
        weight: 1.2,
        placeholder: "Describe profiling tools, heap logs, GC analysis, and the resolution steps you would take..."
      },
      {
        id: "swe-2",
        question: "How do you guarantee that your software design scales gracefully when user traffic increases tenfold?",
        category: "Software Design",
        competency: "System Design",
        weight: 1.5,
        placeholder: "Mention cache strategies, database sharding/indexing, load balancing, or queue systems..."
      },
      {
        id: "swe-3",
        question: "Describe a situation where a team member proposed a design path you disagreed with. How did you handle it?",
        category: "Teamwork & Collaboration",
        competency: "Communication",
        weight: 1.0,
        placeholder: "Detail your conflict resolution steps, objective data-driven debates, and final team alignment..."
      },
      {
        id: "swe-4",
        question: "What is your approach to automated testing? When do you choose integration tests over unit tests?",
        category: "Code Quality",
        competency: "Technical Excellence",
        weight: 1.0,
        placeholder: "Detail test pyramid ratios, mocking tactics, CI/CD inclusion, and pragmatic trade-offs..."
      }
    ]
  },
  {
    id: "pm-growth",
    title: "Growth Product Manager Matrix",
    role: "Growth Product Manager",
    description: "Measures metrics-oriented product management capability, experiment definitions, and customer alignment frameworks.",
    questions: [
      {
        id: "pm-1",
        question: "Your core conversion funnel drops by 15% overnight. Walk us through your framework to identify the root cause.",
        category: "Funnel Analysis",
        competency: "Data-Driven Decisions",
        weight: 1.4,
        placeholder: "Define segmentation by device/region, check release changes, analyze tracking drops, or review UX friction..."
      },
      {
        id: "pm-2",
        question: "Explain how you prioritize a product backlog containing 50+ divergent feature requests from enterprise clients, sales, and support.",
        category: "Backlog Management",
        competency: "Prioritization Frameworks",
        weight: 1.2,
        placeholder: "Explain RICE, WSJF, or ROI sizing, dealing with noisy customer signals, and maintaining core vision..."
      },
      {
        id: "pm-3",
        question: "How do you frame a product delay notice to technical engineers versus strategic commercial stakeholders?",
        category: "Stakeholder Alignment",
        competency: "Communication",
        weight: 1.0,
        placeholder: "Mention technical root causes vs business impact, milestones, empathy, and mitigation options..."
      },
      {
        id: "pm-4",
        question: "Describe your strategy for launching an initial A/B test with an ambiguous user interface revision.",
        category: "Experimentation",
        competency: "Execution Strategy",
        weight: 1.1,
        placeholder: "State hypothesis generation, sample size calculations, statistical significance, and success criteria..."
      }
    ]
  },
  {
    id: "gen-aptitude",
    title: "Leadership & Communications Assessment",
    role: "General / Cross-functional Lead",
    description: "Evaluates standard competencies in creative problem solving, public speaking, decision priority, and situational judgement.",
    questions: [
      {
        id: "apt-1",
        question: "Provide an example of a project you led that required major, rapid adaptation mid-cycle due to industry or client shifts.",
        category: "Adaptability",
        competency: "Strategic Agility",
        weight: 1.2,
        placeholder: "Detail the external catalyst, how you rallied resources, adjusted timelines, and kept client trust intact..."
      },
      {
        id: "apt-2",
        question: "How do you ensure task delegation is balanced across team members with polarized experience levels?",
        category: "Management Focus",
        competency: "Leadership & Coaching",
        weight: 1.0,
        placeholder: "Describe your scaffolding practices, peer mentoring, clear expectations, and regular check-in plans..."
      },
      {
        id: "apt-3",
        question: "Explain how you handle failure or a high-impact mistake made publicly by either yourself or your direct report.",
        category: "Response to Failure",
        competency: "Resilience & Integrity",
        weight: 1.3,
        placeholder: "Discuss transparent blame-free retrospectives, root-cause fixes, alignment, and emotional-safety containment..."
      }
    ]
  }
];

export const SAMPLE_ANSWERS: Record<string, Record<string, string>> = {
  "swe-ii-good": {
    "swe-1": "I configure and attach Node production profiling agents like clinic.js or v8-profiler to stream CPU and heap profile snapshots. I capture a heapdump at regular intervals (e.g. 10m post-start vs 2h post-start) and analyze them in Chrome DevTools. I look for growing structures such as uncleaned event listeners, cached client singletons, or global reference closures. This process is immediately mirrored in an isolated staging replication where we write regression tests to check memory consumption stabilizes.",
    "swe-2": "Scaling requires multiple tiers. First, application layers remain strictly stateless so they scale horizontally on Kubernetes pods under an HPA (Horizontal Pod Autoscaler). Second, I utilize a multi-layer cache pattern: in-memory Redis cluster for hot datasets, and CDN caching for static assets. Third, to handle high write loads without overloading our relational database, I introduce an event broker like Apache Kafka or RabbitMQ to queue writes, and implement database read-replicas with optimized indexing strategies.",
    "swe-3": "During a key system proposal, a peer proposed implementing a custom, complex in-house pub/sub router over a simple AWS SNS/SQS setup. I suggested we map out the quantitative tradeoffs: time-to-market, long-term support overhead, latency requirements, and financial cost. After creating an objective priority matrix, the team saw that SQS met 99.9% of our requirements with 85% less maintenance. My peer agreed with the data, and we deployed the SQS path with zero friction, while acknowledging his technical points in the documentation.",
    "swe-4": "Automated testing requires a pragmatic balance. I prefer a solid base of 70% Unit tests to verify branch logic, calculation algorithms, edge boundaries, and utility pure functions. I deploy Integration testing for database migrations, network integrations, and API routes containing multi-system side effects (e.g., Stripe charge paths, third-party syncs). This ensures high deployment safety scores with minimized flaky CI/CD runs."
  },
  "swe-ii-partial": {
    "swe-1": "I would check server CPU charts and look at RAM consumption. If it is flatlining, I will reboot the process container to prevent catastrophic server crashes.",
    "swe-2": "I'd use a cloud provider auto-scaling group and add more servers so we don't crash when traffic happens."
    // Question 3 and 4 are skipped to simulate incompleted state!
  },
  "pm-growth-good": {
    "pm-1": "My immediate framework follows a structured triage. First, I segment data: is the drop localized to a specific platform (iOS/Android/Web), geographical region, customer tier, or acquisition channel (organic vs paid)? This isolates technical outages or target marketing issues. Second, I run a deployment diff check to see if any release, webhook shift, or localization text updated within 24 hours. Third, I verify that funnel tracking coordinates aren't broken, checking raw volume against event counts.",
    "pm-2": "I utilize the RICE framework (Reach, Impact, Confidence, Effort) to assign objective criteria, mapping them alongside strategic theme scores. I host bi-weekly priority reviews where stakeholders can see and discuss raw scores. For high-impact enterprise requests that break the framework, I negotiate modular increments rather than full-scale features, ensuring our core product path remains clean and reusable across multiple tenants rather than bespoke.",
    "pm-3": "For engineering, I clarify the core technical roadblock, how it adjusts their current sprints, and map immediate secondary workflows so momentum doesn't stall. For commercial leaders, I avoid deep technical jargon and instead translate the delay into business outcomes: risk impact, new release date, marketing campaign alignments, and a clear explanation of how the extra polish mitigates customer churn risks.",
    "pm-4": "I first lock down the primary indicator: click-through-rate, add-to-cart, or checkouts. I set the minimum detectable effect (MDE) at 2% and calculate the required sample size to guarantee 80% power at 95% confidence using historic funnel metrics. This sets the test's lifespan (typically 2 weeks). I ensure clean isolated group assignments via split keys so users do not experience structural jumping between styles."
  }
};
