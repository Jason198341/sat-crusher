import type { SATTopic } from '@/types/sat'

export const SAT_TOPICS: SATTopic[] = [
  // ─── Reading & Writing ─────────────────────
  // Craft and Structure
  { id: 'rw-cs-words', section: 'rw', domain: 'craft-structure', name: 'Words in Context', nameKo: '문맥 속 어휘', description: 'Determine meaning of words/phrases in context' },
  { id: 'rw-cs-text-structure', section: 'rw', domain: 'craft-structure', name: 'Text Structure & Purpose', nameKo: '글의 구조와 목적', description: 'Analyze how text is organized and why' },
  { id: 'rw-cs-cross-text', section: 'rw', domain: 'craft-structure', name: 'Cross-Text Connections', nameKo: '지문 간 연결', description: 'Compare ideas across paired texts' },

  // Information and Ideas
  { id: 'rw-ii-central', section: 'rw', domain: 'information-ideas', name: 'Central Ideas & Details', nameKo: '중심 내용과 세부사항', description: 'Identify main ideas and supporting details' },
  { id: 'rw-ii-inferences', section: 'rw', domain: 'information-ideas', name: 'Inferences', nameKo: '추론', description: 'Draw logical conclusions from text' },
  { id: 'rw-ii-command', section: 'rw', domain: 'information-ideas', name: 'Command of Evidence', nameKo: '근거 활용', description: 'Use textual/quantitative evidence to support claims' },

  // Standard English Conventions
  { id: 'rw-se-boundaries', section: 'rw', domain: 'standard-english', name: 'Boundaries', nameKo: '문장 경계', description: 'Correct sentence boundaries (run-ons, fragments)' },
  { id: 'rw-se-form', section: 'rw', domain: 'standard-english', name: 'Form, Structure & Sense', nameKo: '어법과 문장 구조', description: 'Subject-verb agreement, pronoun clarity, tense' },

  // Expression of Ideas
  { id: 'rw-ei-rhetorical', section: 'rw', domain: 'expression-of-ideas', name: 'Rhetorical Synthesis', nameKo: '수사적 종합', description: 'Combine information from notes effectively' },
  { id: 'rw-ei-transitions', section: 'rw', domain: 'expression-of-ideas', name: 'Transitions', nameKo: '전환어', description: 'Choose logical transitions between ideas' },

  // ─── Math ──────────────────────────────────
  // Algebra
  { id: 'math-alg-linear', section: 'math', domain: 'algebra', name: 'Linear Equations', nameKo: '일차 방정식', description: 'Solve and graph linear equations and inequalities' },
  { id: 'math-alg-systems', section: 'math', domain: 'algebra', name: 'Systems of Equations', nameKo: '연립 방정식', description: 'Solve systems of linear equations' },
  { id: 'math-alg-linear-func', section: 'math', domain: 'algebra', name: 'Linear Functions', nameKo: '일차 함수', description: 'Interpret and create linear functions' },

  // Advanced Math
  { id: 'math-adv-quadratic', section: 'math', domain: 'advanced-math', name: 'Quadratics & Polynomials', nameKo: '이차식과 다항식', description: 'Factor, solve, and graph quadratics' },
  { id: 'math-adv-exponential', section: 'math', domain: 'advanced-math', name: 'Exponential Functions', nameKo: '지수 함수', description: 'Model and solve exponential growth/decay' },
  { id: 'math-adv-nonlinear', section: 'math', domain: 'advanced-math', name: 'Nonlinear Equations', nameKo: '비선형 방정식', description: 'Solve equations with rational/radical expressions' },

  // Problem Solving & Data Analysis
  { id: 'math-ps-ratios', section: 'math', domain: 'problem-solving', name: 'Ratios & Proportions', nameKo: '비율과 비례', description: 'Solve ratio, rate, and proportion problems' },
  { id: 'math-ps-percent', section: 'math', domain: 'problem-solving', name: 'Percentages', nameKo: '백분율', description: 'Calculate and interpret percentages' },
  { id: 'math-ps-statistics', section: 'math', domain: 'problem-solving', name: 'Statistics & Probability', nameKo: '통계와 확률', description: 'Mean, median, standard deviation, probability' },

  // Geometry & Trigonometry
  { id: 'math-gt-area-volume', section: 'math', domain: 'geometry-trig', name: 'Area & Volume', nameKo: '넓이와 부피', description: 'Calculate area, surface area, and volume' },
  { id: 'math-gt-lines-angles', section: 'math', domain: 'geometry-trig', name: 'Lines, Angles & Triangles', nameKo: '직선, 각도, 삼각형', description: 'Angle relationships, triangle properties' },
  { id: 'math-gt-trig', section: 'math', domain: 'geometry-trig', name: 'Trigonometry', nameKo: '삼각법', description: 'Right triangle trig and unit circle basics' },
]

export const DOMAIN_LABELS: Record<string, { en: string; ko: string }> = {
  'craft-structure':     { en: 'Craft and Structure',            ko: '구조와 기법' },
  'information-ideas':   { en: 'Information and Ideas',          ko: '정보와 관점' },
  'standard-english':    { en: 'Standard English Conventions',   ko: '표준 영어 어법' },
  'expression-of-ideas': { en: 'Expression of Ideas',            ko: '표현과 전달' },
  'algebra':             { en: 'Algebra',                        ko: '대수' },
  'advanced-math':       { en: 'Advanced Math',                  ko: '심화 수학' },
  'problem-solving':     { en: 'Problem-Solving & Data Analysis',ko: '문제해결과 데이터 분석' },
  'geometry-trig':       { en: 'Geometry and Trigonometry',       ko: '기하와 삼각법' },
}

export const SECTION_LABELS: Record<string, { en: string; ko: string }> = {
  rw:   { en: 'Reading & Writing', ko: '읽기 & 쓰기' },
  math: { en: 'Math',             ko: '수학' },
}
