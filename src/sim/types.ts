export type SubjectId =
  | "chinese" | "math" | "english"
  | "physics" | "chemistry" | "biology"
  | "politics" | "history" | "geography";

export type FirstChoice = "physics" | "history";

export type Choice = { first: FirstChoice; second: SubjectId[] };

export type UnitState = { mastery: number; confusion: number; primed: boolean; lastStudied: number };

export type Difficulty = "easy" | "normal" | "hard";

export type NpcState = {
  id: string;
  kind: "classmate" | "teacher" | "parent";
  relation: number;
  last: string;
  game?: GameState;
  mood?: number;
  history: string[];
  friend?: boolean;
  friendSince?: number;
  lowFriendWeeks?: number;
  relTrace?: { w: number; v: number }[];
  lastExam?: { kind: string; total: number; rank: number; week: number };
};

export type Evaluation = {
  stageId: number;
  stageName: string;
  week: number;
  score: number;
  passed: boolean;
  dims: { moral: number; academic: number; health: number; art: number; labor: number };
};

export type Stats = { energy: number; stress: number; mood: number; health: number };

export type Dim = "moral" | "academic" | "health" | "art" | "labor";

export type Evidence = {
  id: string;
  dim: Dim;
  label: string;
  value: number;
  week: number;
  documented: boolean;
};

export type ExamScore = { subject: SubjectId; raw: number; final: number; graded?: number; grade?: string };

export type ExamRecord = {
  week: number;
  kind: "mid" | "final";
  scores: ExamScore[];
  total: number;
  percentile: number;
  classRank: number;
  weak: { key: string; label: string; rate: number }[];
  max?: number;
  factor?: number;
};

export type Slot = { a: string; s?: SubjectId };

export type Plan = { focus: Slot[]; evening: Slot[]; weekend: Slot[] };

export type Fact = { id: string; label: string };

export type EventEffect = {
  stats?: Partial<Stats>;
  mastery?: { subject: SubjectId; amount: number }[];
  relation?: { who: "deskmate" | "teacher" | "mother"; amount: number }[];
  evidence?: { dim: Dim; label: string; value?: number };
  choice?: Choice;
  penalty?: SubjectId[];
  resit?: boolean;
  romance?: boolean;
  breakup?: boolean;
};

export type EventChoice = { text: string; result: string; effects: EventEffect };

export type StoryEvent = {
  id: string;
  kind: "main" | "npc" | "random";
  title: string;
  text: string;
  prompt?: string;
  social?: boolean;
  group?: "main" | "daily" | "social" | "friend" | "crush" | "love";
  chainNpc?: string;
  chainIdx?: number;
  preRomance?: boolean;
  romance?: boolean;
  npcKind?: "parent" | "teacher" | "classmate";
  stage?: number;
  stages?: number[];
  perStage?: boolean;
  cooldown?: number;
  weeks?: [number, number];
  once?: boolean;
  weight?: number;
  requires?: {
    romance?: boolean;
    noRomance?: boolean;
    minRelation?: number;
    friend?: boolean;
    bonusCount?: number;
    lowRelWeeks?: number;
    actions?: string[];
    focus?: string[];
    minStress?: number;
    maxStress?: number;
    masteryBelow?: { subject: SubjectId; value: number };
  };
  choices: EventChoice[];
};

export type NarrativeLine = { text: string; cites: string[] };

export type WeekReport = {
  week: number;
  stageChanged?: { from: number; to: number };
  facts: Fact[];
  lines: NarrativeLine[];
  study: number;
  rest: number;
  minEnergy: number;
  gained: { subject: SubjectId; unit: string; amount: number }[];
  primed: string[];
  clashed: string[];
  label?: string;
  evaluation?: Evaluation;
  qualify?: { subject: string; pass: boolean }[];
  npc?: { id: string; text: string };
  exam?: ExamRecord;
};

export type GameState = {
  version: number;
  seed: number;
  week: number;
  totalWeeks: number;
  stage: number;
  weekInStage: number;
  difficulty: Difficulty;
  choice: Choice;
  stats: Stats;
  focus: number;
  units: Record<string, UnitState>;
  aptitude: Record<SubjectId, number>;
  relations: { deskmate: number; teacher: number; mother: number };
  evidence: Evidence[];
  exams: ExamRecord[];
  flags: Record<string, number>;
  lastPlan: Plan | null;
  ended: boolean;
  failed?: boolean;
  evaluations: Evaluation[];
  npcs: NpcState[];
  playerName?: string;
  choiceLocked?: boolean;
  playerSeat?: { col: number; row: number };
  seats?: Record<string, { col: number; row: number }>;
  socialTarget?: string;
  socialTarget2?: string;
  romance?: { npcId: string; since: number; chance: number };
  romanceBonus?: { amount: number; week: number }[];
  npcPairs?: Record<string, number>;
  npcCouples?: [string, string][];
  npcNews?: { week: number; text: string }[];
  pairBeyond?: Record<string, number>;
  classRanking?: { id: string; name: string; total: number; rank: number }[];
  chains?: Record<string, number>;
  beyond?: Record<string, number>;
  gender?: "m" | "f";
};