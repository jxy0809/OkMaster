export enum ClassType {
  PROGRAMMER = 'PROGRAMMER',
  POLICE = 'POLICE',
  DESIGNER = 'DESIGNER',
  DOCTOR = 'DOCTOR',
  CIVIL = 'CIVIL',
  PM = 'PM'
}

export enum CardType {
  ATTACK = 'ATTACK', // Red
  SKILL = 'SKILL',   // Blue
  POWER = 'POWER',   // Yellow/Green
  STATUS = 'STATUS'  // Gray (Unplayable/Debuff)
}

export enum TargetType {
  ENEMY = 'ENEMY',
  SELF = 'SELF',
  ALL = 'ALL'
}

export enum StatusType {
  OVERTIME = 'OVERTIME',     // 加班
  INVOLUTION = 'INVOLUTION', // 内卷
  POISON = 'POISON',         // 中毒
  THORNS = 'THORNS',         // 反伤
  STUN = 'STUN',             // 眩晕
  DODGE = 'DODGE',           // 闪避
  STRENGTH = 'STRENGTH',     // 力量
  REGEN = 'REGEN',           // 再生
  VULNERABLE = 'VULNERABLE', // 易伤
  WEAK = 'WEAK',             // 虚弱
  COUNTER_HEAL = 'COUNTER_HEAL', // 报销驳回
  SILENCE_ATTACK = 'SILENCE_ATTACK', // 禁武
  CARD_LIMIT = 'CARD_LIMIT',  // 严控预算
  COST_UP = 'COST_UP',        // 降薪
  TRUE_DMG_ON_PLAY = 'TRUE_DMG_ON_PLAY' // 价值观考核
}

export interface CardStatusEffect {
  type: StatusType;
  amount: number;
  target: TargetType;
}

export interface CardData {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  displayType: string; // "咒术", "攻击", etc.
  description: string;
  flavor: string;
  val?: number; // Base damage or shield
  heal?: number;
  draw?: number;
  energy?: number;
  status?: CardStatusEffect;
  special?: string; // For complex custom logic strings
}

export interface Entity {
  name: string;
  maxHp: number;
  currentHp: number;
  maxMp: number;
  currentMp: number;
  shield: number;
  imgUrl: string;
  statuses: Record<string, number>; // Flexible key for StatusType
}

export interface Player extends Entity {
  classType: ClassType;
  gold: number; // 绩效
  deck: CardData[];
}

export enum EnemyType {
  NORMAL = 'NORMAL',
  HR = 'HR',
  FINANCE = 'FINANCE',
  CLIENT = 'CLIENT',
  INVOLUTION = 'INVOLUTION'
}

export interface Enemy extends Entity {
  id: string;
  type: EnemyType;
  intent: string; // Description of next move
  intentValue: number;
  nextMoveCard?: CardData; // The specific card they will play
  deck: CardData[]; // The pool of moves
}

export enum GameScreen {
  MENU = 'MENU',
  STORY = 'STORY', // New Story Screen
  BATTLE = 'BATTLE',
  VICTORY = 'VICTORY',
  GAMEOVER = 'GAMEOVER',
  YEAR_END_BONUS = 'YEAR_END_BONUS'
}

// Story Mode Types
export interface StoryChoice {
  text: string;
  description: string; // hover or subtext
  actionType: 'BATTLE' | 'BUFF' | 'DEBUFF' | 'SKIP' | 'GAME_OVER';
  value?: number;
  specialEffect?: string;
}

export interface StoryNode {
  id: number;
  title: string;
  location: string;
  description: string;
  dialogue: string; // The "boss" speaking
  bossType?: EnemyType; // If this node leads to a battle
  choices: StoryChoice[];
}

// Deprecated Map types kept for compatibility if needed, but we are moving to Story flow
export enum NodeType {
  BATTLE = 'BATTLE',
  ELITE = 'ELITE',
  REST = 'REST', 
  EVENT = 'EVENT', 
  BOSS = 'BOSS' 
}

export interface GameNode {
  id: number;
  type: NodeType;
  cleared: boolean;
  label: string;
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  options: {
    text: string;
    effectDescription: string;
    action: (player: Player) => Player;
  }[];
}

export interface RunStats {
  bossesKilled: number;
  levelsCleared: number;
  maxGold: number;
  turnsPlayed: number;
}