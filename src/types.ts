export interface Question {
  id: string;
  question: string;
  category: string;
  competency: string;
  weight: number; // impact of this question
  placeholder: string;
}

export interface AssessmentTemplate {
  id: string;
  title: string;
  role: string;
  description: string;
  questions: Question[];
}

export interface CandidateResponse {
  questionId: string;
  question: string;
  category: string;
  competency: string;
  weight: number;
  answer: string;
}

export interface AssessmentReport {
  overall_score: number;
  recommendation: 'Proceed' | 'Needs Training' | 'Re-evaluate' | 'Reject';
  performance_summary: string;
  scores: Record<string, number>;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
  is_incomplete: boolean;
}
