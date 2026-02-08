import type { Difficulty } from '@/types/sat'

export function buildQuestionPrompt(params: {
  section: string
  domain: string
  topicName: string
  difficulty: Difficulty
  count: number
  lang: 'en' | 'ko'
}): string {
  const { section, domain, topicName, difficulty, count, lang } = params

  const sectionLabel = section === 'rw' ? 'Reading & Writing' : 'Math'
  const difficultyGuide = {
    easy: 'straightforward, testing basic understanding',
    medium: 'moderate complexity, requiring multi-step reasoning',
    hard: 'challenging, requiring deep analysis or advanced techniques',
  }[difficulty]

  const mathNote = section === 'math'
    ? `\n- Use LaTeX notation for math: inline $...$ and display $$...$$
- Include numerical answer choices (A, B, C, D)
- For word problems, provide realistic scenarios`
    : `\n- Include a short passage (2-4 sentences for easy, 4-8 for medium/hard)
- Passages should feel authentic (literature, science, history, social science)
- Test comprehension, analysis, or grammar as appropriate for the domain
- Each wrong answer choice must use one of these CollegeBoard trap types (wrongAnswerDNA):
  "극단어 함정", "지문 밖 상식", "반만 맞는 키메라", "시제 뒤틀기",
  "주어 바꿔치기", "범위 확대", "인과 날조", "감정 과장",
  "진짜 같은 가짜 디테일", "패러프레이즈 함정"
- Include the trap type for each wrong answer in the choiceDNA array`

  const explanationLang = lang === 'ko'
    ? 'Provide "explanationKo" in Korean AND "explanation" in English.'
    : 'Provide "explanation" in English AND "explanationKo" in Korean.'

  // For R&W, include DNA classification in the output
  const dnaField = section === 'rw'
    ? `\n  "choiceDNA": ["극단어 함정", null, "반만 맞는 키메라", null],  // DNA for each choice (null = correct answer or no specific trap)`
    : ''

  return `You are an expert SAT question writer for the Digital SAT (2024+).

Generate exactly ${count} ${sectionLabel} questions.
- Domain: ${domain}
- Topic: ${topicName}
- Difficulty: ${difficulty} (${difficultyGuide})
${mathNote}

${explanationLang}

Return ONLY a JSON array. Each object must have:
{
  "stimulus": "The question text (include passage inline if R&W)",
  "passage": "Optional separate passage text for R&W questions, or null for Math",
  "choices": [
    { "label": "A", "text": "choice text" },
    { "label": "B", "text": "choice text" },
    { "label": "C", "text": "choice text" },
    { "label": "D", "text": "choice text" }
  ],
  "correctAnswer": 0,
  "explanation": "Step-by-step explanation in English",
  "explanationKo": "한국어 단계별 해설",
  "tags": ["relevant", "topic", "tags"]${dnaField}
}

correctAnswer is the 0-based index of the correct choice.
Make questions feel like real College Board SAT questions. Avoid trivial or trick questions.
Return ONLY the JSON array, no other text.`
}

// Legacy export — kept for backward compatibility but now mainly uses byeorak-system.ts
export function buildTutorSystemPrompt(lang: 'en' | 'ko'): string {
  if (lang === 'ko') {
    return `당신은 SAT 전문 AI 튜터입니다. 학생이 SAT 문제와 개념에 대해 질문하면 친절하고 명확하게 설명합니다.

규칙:
- 한국어로 답변하되, SAT 관련 영어 용어는 영어로 표기 후 한국어 설명을 덧붙이세요
- 수학 공식은 LaTeX로 작성 (인라인: $...$, 블록: $$...$$)
- 단계별로 풀이를 설명하세요
- 학생의 이해 수준에 맞춰 설명 깊이를 조절하세요
- 필요하면 유사 문제를 추가 예시로 제시하세요`
  }

  return `You are an expert SAT tutor AI. Help students understand SAT questions and concepts clearly.

Rules:
- Explain step-by-step in clear, encouraging language
- Use LaTeX for math formulas (inline: $...$, display: $$...$$)
- Reference specific SAT strategies when helpful
- If asked about a specific question, break down the reasoning
- Suggest similar practice areas when relevant`
}
