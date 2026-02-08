/**
 * 오답 DNA 도감 — CollegeBoard의 10대 함정 유형
 * 각 오답은 이 DNA 유형 중 하나로 분류됨
 */

export interface WrongAnswerDNA {
  id: string
  number: number
  name: string
  nameKo: string
  nickname: string
  icon: string
  detectionKeywords: string[]    // AI가 선택지에서 탐지할 키워드
  killSwitch: string             // 1줄 킬 스위치
  killSwitchKo: string
  description: string
  descriptionKo: string
}

export const WRONG_ANSWER_DNA_LIST: WrongAnswerDNA[] = [
  {
    id: 'extreme-words',
    number: 1,
    name: 'Extreme Words Trap',
    nameKo: '극단어 함정',
    nickname: '항상맨 & 절대맨',
    icon: '🧬',
    detectionKeywords: ['always', 'never', 'all', 'none', 'every', 'only', 'must', 'impossible', 'certainly'],
    killSwitch: 'Did the passage use the same strong word? If not, dead.',
    killSwitchKo: '지문에서 이 강한 단어를 똑같이 썼나? 안 썼으면 사망',
    description: 'The choice uses absolute language (always, never) when the passage uses qualified language (often, sometimes).',
    descriptionKo: '지문은 "자주"라고 했는데 선택지는 "항상"이라고 바꾼 것. "자주"와 "항상"은 SAT에서 완전히 다른 말이다.',
  },
  {
    id: 'outside-knowledge',
    number: 2,
    name: 'Outside Knowledge Ghost',
    nameKo: '지문 밖 상식',
    nickname: '내 머리가 만든 유령',
    icon: '👻',
    detectionKeywords: [],
    killSwitch: "Can you point to the evidence in the passage? If not, it's wrong.",
    killSwitchKo: '손가락으로 지문의 근거를 짚을 수 없으면 오답',
    description: 'The answer sounds right based on common sense, but the passage never actually says it.',
    descriptionKo: '상식적으로 맞는 말인데, 지문에는 이 내용이 없다. SAT의 철칙: "네 머리에서 나온 생각은 다 오답이다."',
  },
  {
    id: 'half-right-chimera',
    number: 3,
    name: 'Half-Right Chimera',
    nameKo: '반만 맞는 키메라',
    nickname: '앞은 맞고 뒤는 사기',
    icon: '🐉',
    detectionKeywords: [],
    killSwitch: 'Split the choice in half. Check each half against the passage separately.',
    killSwitchKo: '선택지를 반으로 쪼개서 각각 지문 대조',
    description: 'First half matches the passage perfectly, but the second half subtly distorts or adds information.',
    descriptionKo: '앞부분은 고개가 끄덕여지는데 뒷부분이 슬쩍 다르다. CollegeBoard 최애 함정.',
  },
  {
    id: 'tense-twist',
    number: 4,
    name: 'Tense Twist',
    nameKo: '시제 뒤틀기',
    nickname: '과거를 현재로, 현재를 미래로',
    icon: '⏰',
    detectionKeywords: ['will', 'would', 'could', 'might', 'may', 'shall'],
    killSwitch: 'Does the tense of the passage match the tense of the choice?',
    killSwitchKo: '지문의 시제와 선택지의 시제가 일치하는가?',
    description: 'The passage says something happened (past), but the choice says it will happen (future) or is happening (present).',
    descriptionKo: '지문은 "~했다"인데 선택지는 "~할 것이다"로 바꿔놨다.',
  },
  {
    id: 'subject-swap',
    number: 5,
    name: 'Subject Swap',
    nameKo: '주어 바꿔치기',
    nickname: '남의 말을 글쓴이 말로',
    icon: '🎭',
    detectionKeywords: ['the author', 'the researcher', 'the speaker', 'the narrator'],
    killSwitch: "Who actually said this? The author or someone being quoted?",
    killSwitchKo: '이 말을 한 사람이 누구인가? 글쓴이인가 인용된 사람인가?',
    description: "Attributes someone else's opinion to the author, or the author's view to a different person.",
    descriptionKo: "지문에서 '다른 사람'이 한 말을 '글쓴이' 의견으로 포장했다.",
  },
  {
    id: 'scope-expansion',
    number: 6,
    name: 'Scope Expansion',
    nameKo: '범위 확대',
    nickname: '손가락을 팔로',
    icon: '📏',
    detectionKeywords: ['all students', 'everyone', 'the entire', 'completely'],
    killSwitch: "Check the passage's qualifier words: some, most, many, certain.",
    killSwitchKo: '지문의 범위 한정어(some, most, many)를 체크',
    description: 'The passage says "some students" but the choice says "students" (implying all).',
    descriptionKo: '지문은 "일부 학생"인데 선택지는 "학생들" — 범위를 슬쩍 늘렸다.',
  },
  {
    id: 'false-causation',
    number: 7,
    name: 'False Causation',
    nameKo: '인과 날조',
    nickname: '같이 일어났다 ≠ 때문에 일어났다',
    icon: '🔗',
    detectionKeywords: ['caused', 'led to', 'resulted in', 'because of', 'therefore'],
    killSwitch: 'Does the passage actually say "because"? Or just list two events?',
    killSwitchKo: '지문에 because, caused, led to가 진짜 있는가?',
    description: 'The passage mentions two events together, but the choice claims one caused the other.',
    descriptionKo: '지문은 두 사건을 나열했을 뿐인데 선택지가 "A가 B를 야기했다"로 바꿨다.',
  },
  {
    id: 'emotion-exaggeration',
    number: 8,
    name: 'Emotion Exaggeration',
    nameKo: '감정 과장',
    nickname: '살짝 아쉬움을 극도의 분노로',
    icon: '🎭',
    detectionKeywords: ['outraged', 'devastated', 'ecstatic', 'furious', 'terrified', 'despise'],
    killSwitch: 'Rate emotion intensity 1-10. Passage and choice should be within ±2.',
    killSwitchKo: '감정 강도를 1-10으로 측정, 지문과 선택지가 ±2 이내인가?',
    description: "The passage's tone is mild, but the choice uses extreme emotional language.",
    descriptionKo: '지문의 톤은 mild한데 선택지의 감정 단어가 극단적이다.',
  },
  {
    id: 'true-but-irrelevant',
    number: 9,
    name: 'True But Irrelevant Detail',
    nameKo: '진짜 같은 가짜 디테일',
    nickname: '있었지만 답이 아닌 것',
    icon: '🎯',
    detectionKeywords: [],
    killSwitch: "It's in the passage ✅ → But does it answer THIS question? ❌ → Dead.",
    killSwitchKo: '이 내용이 지문에 있는가? ✅ → 근데 질문이 묻는 것에 답하는가? ❌ → 사망',
    description: 'The choice mentions something actually in the passage, but it doesn\'t answer what the question is asking.',
    descriptionKo: '지문에 실제로 언급된 내용이지만 질문이 묻는 것과는 무관하다.',
  },
  {
    id: 'paraphrase-trap',
    number: 10,
    name: 'Paraphrase Trap',
    nameKo: '패러프레이즈 함정',
    nickname: '다른 옷 같은 뜻 vs 다른 옷 다른 뜻',
    icon: '👔',
    detectionKeywords: [],
    killSwitch: "Is the core verb/adjective meaning preserved from the original?",
    killSwitchKo: '원문의 핵심 동사/형용사의 의미가 선택지에서 보존되었는가?',
    description: 'Both correct and wrong choices paraphrase the passage. One preserves meaning, one subtly changes it.',
    descriptionKo: '정답과 오답 모두 지문을 다른 말로 바꿨다. 하나는 의미 보존, 하나는 살짝 변형.',
  },
]

/** Get DNA by ID */
export function getDNAById(id: string): WrongAnswerDNA | undefined {
  return WRONG_ANSWER_DNA_LIST.find((d) => d.id === id)
}

/** Get DNA by number (1-10) */
export function getDNAByNumber(num: number): WrongAnswerDNA | undefined {
  return WRONG_ANSWER_DNA_LIST.find((d) => d.number === num)
}
