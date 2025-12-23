import { CardData, CardType, ClassType, NodeType, RandomEvent, GameNode, StatusType, TargetType, EnemyType, StoryNode } from './types';

// Helper to create cards quickly
const createCard = (
  id: string, name: string, type: CardType, displayType: string, cost: number, desc: string, flavor: string, 
  props: Partial<CardData> = {}
): CardData => ({
  id, name, type, displayType, cost, description: desc, flavor, ...props
});

// --- Generic Starter Cards ---
const GENERIC_ATTACK = createCard('gen_atk', '平A', CardType.ATTACK, '攻击', 1, '造成 6 点伤害。', '普通的攻击。', { val: 6 });
const GENERIC_DEFEND = createCard('gen_def', '踢皮球', CardType.SKILL, '行动', 1, '获得 5 点护甲。', '这事不归我管。', { val: 5 });

// --- Programmer Cards (Existing) ---
export const PROGRAMMER_CARDS: CardData[] = [
  createCard('prog_01', '基础注释', CardType.ATTACK, '攻击', 1, '造成 6 点伤害，获得 3 点护甲。', '至少得让人看懂。', { val: 6, status: { type: StatusType.THORNS, amount: 0, target: TargetType.SELF }, special: 'GAIN_BLOCK_3' }), 
  createCard('prog_02', '冗余代码', CardType.SKILL, '行动', 1, '获得 10 点护甲，摸 1 张牌。', '多写两行准没错。', { val: 10, draw: 1 }),
  createCard('prog_03', '逻辑死循环', CardType.POWER, '装备', 2, '每当你获得护甲，对随机敌方造成 2 点伤害。', '进去了就别想出来。', { status: { type: StatusType.THORNS, amount: 2, target: TargetType.SELF }, special: 'DMG_ON_BLOCK' }),
  createCard('prog_04', '重构发布', CardType.ATTACK, '攻击', 2, '消耗所有护甲，造成护甲值 150% 的伤害。', '这一次绝对没有 Bug。', { special: 'SHIELD_SLAM_150' }),
  createCard('prog_05', '单元测试', CardType.SKILL, '行动', 0, '摸 2 张牌，丢弃 1 张。', '跑一遍看看。', { draw: 2, special: 'DISCARD_1' }), 
  createCard('prog_06', '灰度发布', CardType.SKILL, '咒术', 2, '获得 15 点护甲，下回合少摸 1 张牌。', '风险可控，人不可控。', { val: 15, status: { type: StatusType.OVERTIME, amount: 1, target: TargetType.SELF } }),
  createCard('prog_07', '内卷核心', CardType.POWER, '装备', 3, '回合结束时，若你有护甲，下回合能量 +1。', '只要我不走，谁也别想走。', { special: 'ENERGY_ON_BLOCK' }),
  createCard('prog_08', '修复 Bug', CardType.SKILL, '咒术', 1, '回复 5 点血量，移除一个随机负面状态。', '这是一个 Feature。', { heal: 5, special: 'CLEANSE' }),
  createCard('prog_09', '高并发防御', CardType.SKILL, '行动', 2, '获得 12 点护甲。', '顶住这波流量。', { val: 12 }), 
  createCard('prog_10', '代码屎山', CardType.POWER, '装备', 2, '获得 3 层反伤。', '谁敢动这段代码？', { status: { type: StatusType.THORNS, amount: 3, target: TargetType.SELF } }),
  createCard('prog_11', '技术债', CardType.ATTACK, '攻击', 0, '造成 15 点伤害，对自己造成 5 点伤害。', '出来混迟早要还的。', { val: 15, special: 'SELF_DMG_5' }),
  createCard('prog_12', '堆栈溢出', CardType.SKILL, '咒术', 3, '获得 20 点护甲，摸 3 张牌。', '脑子快炸了。', { val: 20, draw: 3 }),
  createCard('prog_13', '删库跑路', CardType.ATTACK, '攻击', 3, '造成 30 点伤害。', '最后一票。', { val: 30 }),
  createCard('prog_14', '版本回滚', CardType.SKILL, '反制', 1, '获得 8 点护甲，摸 2 张牌。', '回到还没出事的时候。', { val: 8, draw: 2 }),
  createCard('prog_15', '黑盒测试', CardType.ATTACK, '攻击', 1, '造成 5-20 点随机伤害。', '谁也不知道结果。', { special: 'RANDOM_DMG_5_20' }),
];

// --- Police Cards ---
export const POLICE_CARDS: CardData[] = [
  createCard('pol_01', '例行盘查', CardType.ATTACK, '攻击', 1, '造成 7 点伤害，敌方下回合造成伤害 -2。', '配合一下工作。', { val: 7, status: { type: StatusType.WEAK, amount: 2, target: TargetType.ENEMY } }),
  createCard('pol_02', '通宵蹲守', CardType.SKILL, '行动', 0, '失去 5 点生命，摸 2 张牌。', '烟抽完了，天也亮了。', { special: 'PAY_HP_DRAW_2' }),
  createCard('pol_03', '审讯时刻', CardType.POWER, '装备', 2, '每当你失去生命，下一次攻击伤害 +3。', '劝你坦白从宽。', { special: 'BERSERK_MODE' }),
  createCard('pol_04', '正义铁拳', CardType.ATTACK, '攻击', 1, '造成 10 点伤害，血低 50% 时伤害翻倍。', '这一拳，是为民除害。', { val: 10, special: 'LOW_HP_DOUBLE' }),
  createCard('pol_05', '格斗压制', CardType.ATTACK, '攻击', 1, '造成 6 点伤害，给予 1 层眩晕。', '别动，抱头蹲下！', { val: 6, status: { type: StatusType.STUN, amount: 1, target: TargetType.ENEMY } }),
  createCard('pol_06', '紧急出警', CardType.SKILL, '行动', 1, '获得 2 能量。', '刻不容缓。', { energy: 2 }),
  createCard('pol_07', '防弹背心', CardType.POWER, '装备', 2, '每回合开始获得 4 点护甲。', '命只有一条。', { special: 'PASSIVE_BLOCK_4' }),
  createCard('pol_08', '破釜沉舟', CardType.SKILL, '咒术', 2, '失去 10 点生命，获得 3 能量。', '没退路了。', { special: 'PAY_HP_ENERGY_3' }),
  createCard('pol_09', '连环追击', CardType.ATTACK, '攻击', 1, '造成 5 点伤害，摸 1 张牌。', '别想跑！', { val: 5, draw: 1 }),
  createCard('pol_10', '线人情报', CardType.SKILL, '行动', 0, '摸 1 张牌，随机一张手牌耗能 -1。', '我在里头有人。', { draw: 1, special: 'REDUCE_COST_1' }),
  createCard('pol_11', '强制拘留', CardType.SKILL, '咒术', 2, '给予 2 层眩晕。', '跟我走一趟吧。', { status: { type: StatusType.STUN, amount: 2, target: TargetType.ENEMY } }),
  createCard('pol_12', '热血难凉', CardType.POWER, '装备', 3, '生命值不会低于 1，持续 2 回合。', '我还不能倒下。', { special: 'IMMORTAL_2' }),
  createCard('pol_13', '证据确凿', CardType.ATTACK, '攻击', 2, '造成 18 点伤害。', '铁证如山。', { val: 18 }),
  createCard('pol_14', '便衣伪装', CardType.SKILL, '反制', 1, '获得 1 层闪避。', '你没认出我？', { status: { type: StatusType.DODGE, amount: 1, target: TargetType.SELF } }),
  createCard('pol_15', '收网行动', CardType.ATTACK, '攻击', 3, '造成 25 伤害，敌血低 25% 直接斩杀。', '结束了。', { val: 25, special: 'EXECUTE_25' }),
];

// --- Designer Cards ---
export const DESIGNER_CARDS: CardData[] = [
  createCard('des_01', '吸取色值', CardType.SKILL, '法力', 0, '获得 2 能量。', '拿来吧你。', { energy: 2 }),
  createCard('des_02', '五彩斑斓黑', CardType.ATTACK, '咒术', 2, '造成 12 点伤害，敌方力量 -2。', '甲方说要这种感觉。', { val: 12, status: { type: StatusType.STRENGTH, amount: -2, target: TargetType.ENEMY } }),
  createCard('des_03', '图层叠加', CardType.POWER, '装备', 2, '回合结束时获得 1 能量。', '还没合并呢。', { special: 'PASSIVE_ENERGY_1' }),
  createCard('des_04', '流动的光影', CardType.ATTACK, '咒术', 1, '造成 8 点伤害，摸 1 张牌。', '加点质感。', { val: 8, draw: 1 }),
  createCard('des_05', '像素级调整', CardType.SKILL, '行动', 1, '摸 2 张牌。', '往左挪一个像素。', { draw: 2 }),
  createCard('des_06', '黄金分割', CardType.ATTACK, '咒术', 2, '造成 15 点伤害。', '完美的比例。', { val: 15 }),
  createCard('des_07', '甲方审美', CardType.ATTACK, '咒术', 3, '造成 25 点伤害，丢弃 1 张手牌。', '审美崩坏。', { val: 25, special: 'DISCARD_1' }),
  createCard('des_08', '锁定图层', CardType.POWER, '装备', 1, '你受到的所有伤害 -2。', '别动我原件。', { special: 'DMG_REDUCE_2' }),
  createCard('des_09', '矢量绘图', CardType.ATTACK, '攻击', 1, '造成 5 点伤害，重复 1 次。', '无损缩放。', { val: 5, special: 'REPEAT_1' }),
  createCard('des_10', '素材搬运', CardType.SKILL, '法力', 1, '获得 3 能量，回复 5 血。', '库里多得是。', { energy: 3, heal: 5 }),
  createCard('des_11', '疯狂改稿', CardType.ATTACK, '咒术', 1, '造成 7 伤害，洗入 1 张复制到牌堆。', '改改改改改！', { val: 7, special: 'COPY_SELF' }),
  createCard('des_12', '渲染输出', CardType.ATTACK, '咒术', 4, '造成 40 伤害。', '进度条终于满了。', { val: 40 }),
  createCard('des_13', '撤销操作', CardType.SKILL, '反制', 1, '回复 10 血。', 'Ctrl + Z。', { heal: 10 }),
  createCard('des_14', '全屏泛光', CardType.ATTACK, '咒术', 2, '造成 12 伤害，给予 1 层眩晕。', '闪瞎你的眼。', { val: 12, status: { type: StatusType.STUN, amount: 1, target: TargetType.ENEMY } }),
  createCard('des_15', '大师灵感', CardType.SKILL, '行动', 2, '摸 4 张牌。', '灵感迸发！', { draw: 4 }),
];

// --- Doctor Cards ---
export const DOCTOR_CARDS: CardData[] = [
  createCard('doc_01', '安慰剂', CardType.ATTACK, '攻击', 1, '造成 5 点伤害，回复 3 点生命。', '心理作用也很重要。', { val: 5, heal: 3 }),
  createCard('doc_02', '强效鸡血', CardType.SKILL, '行动', 1, '回复 8 血，摸 1 张牌。', '还能再写一个 PPT。', { heal: 8, draw: 1 }),
  createCard('doc_03', '医患关系', CardType.POWER, '装备', 2, '获得 5 层反伤。', '要死一起死。', { status: { type: StatusType.THORNS, amount: 5, target: TargetType.SELF } }),
  createCard('doc_04', '挂葡萄糖', CardType.SKILL, '法力', 1, '获得 3 能量，获得 2 层再生。', '续命神器。', { energy: 3, status: { type: StatusType.REGEN, amount: 2, target: TargetType.SELF } }),
  createCard('doc_05', '副作用', CardType.SKILL, '咒术', 1, '给敌方施加 3 层中毒。', '是药三分毒。', { status: { type: StatusType.POISON, amount: 3, target: TargetType.ENEMY } }),
  createCard('doc_06', '全科诊断', CardType.SKILL, '行动', 0, '敌方护甲归零，施加 3 层中毒。', '查出病根了。', { special: 'STRIP_SHIELD_POISON' }),
  createCard('doc_07', '以毒攻毒', CardType.SKILL, '咒术', 2, '敌方中毒层数翻倍。', '变质了。', { special: 'DOUBLE_POISON' }),
  createCard('doc_08', '手术麻醉', CardType.SKILL, '咒术', 2, '给予 2 层眩晕。', '睡一觉就好了。', { status: { type: StatusType.STUN, amount: 2, target: TargetType.ENEMY } }),
  createCard('doc_09', '回光返照', CardType.POWER, '装备', 3, '每回合回复 5 生命。', '还能抢救一下。', { status: { type: StatusType.REGEN, amount: 5, target: TargetType.SELF } }),
  createCard('doc_10', '过度医疗', CardType.SKILL, '咒术', 2, '回复 20 血。', '有钱没病也要治。', { heal: 20 }),
  createCard('doc_11', '病毒采样', CardType.ATTACK, '攻击', 1, '造成 6 点伤害，施加 2 层中毒。', '样本很有研究价值。', { val: 6, status: { type: StatusType.POISON, amount: 2, target: TargetType.ENEMY } }),
  createCard('doc_12', '紧急除颤', CardType.SKILL, '行动', 2, '回复 30 生命。', '挺住！', { heal: 30 }),
  createCard('doc_13', '慢性衰竭', CardType.POWER, '咒术', 1, '敌方每回合开始额外获得 2 层中毒。', '慢慢折磨。', { special: 'PASSIVE_POISON_2' }),
  createCard('doc_14', '处方签', CardType.SKILL, '反制', 1, '获得 15 点护甲。', '医嘱最大。', { val: 15 }),
  createCard('doc_15', '生命提取', CardType.ATTACK, '攻击', 2, '造成 20 点伤害，回复 20 点生命。', '能量守恒。', { val: 20, heal: 20 }),
];

// --- Civil Engineer Cards ---
export const CIVIL_CARDS: CardData[] = [
  createCard('civ_01', '连夜打灰', CardType.ATTACK, '攻击', 1, '造成 3 点伤害，重复 2 次。', '晚上干活快。', { val: 3, special: 'REPEAT_2' }),
  createCard('civ_02', '提桶跑路', CardType.SKILL, '行动', 1, '获得 1 层闪避。', '此处不留爷。', { status: { type: StatusType.DODGE, amount: 1, target: TargetType.SELF } }),
  createCard('civ_03', '结构裂缝', CardType.POWER, '装备', 2, '敌方获得 3 层易伤。', '内部不稳。', { status: { type: StatusType.VULNERABLE, amount: 3, target: TargetType.ENEMY } }),
  createCard('civ_04', '搬砖之怒', CardType.ATTACK, '攻击', 1, '造成 12 点伤害。', '别惹老实人。', { val: 12 }),
  createCard('civ_05', '测量偏差', CardType.SKILL, '咒术', 1, '获得 1 层闪避。', '差之毫厘。', { status: { type: StatusType.DODGE, amount: 1, target: TargetType.SELF } }),
  createCard('civ_06', '工地午睡', CardType.SKILL, '行动', 1, '回复 10 血，回复 1 能量。', '眯一会儿。', { heal: 10, energy: 1 }),
  createCard('civ_07', '钢筋缠绕', CardType.ATTACK, '攻击', 2, '造成 12 伤害，给予 1 层眩晕。', '捆得结实。', { val: 12, status: { type: StatusType.STUN, amount: 1, target: TargetType.ENEMY } }),
  createCard('civ_08', '甲级资质', CardType.POWER, '装备', 3, '每回合开始获得 2 能量。', '牌照齐全。', { special: 'PASSIVE_ENERGY_2' }),
  createCard('civ_09', '偷工减料', CardType.SKILL, '行动', 0, '获得 2 能量，受到 5 伤害。', '节省成本。', { energy: 2, special: 'SELF_DMG_5' }),
  createCard('civ_10', '精准爆破', CardType.ATTACK, '攻击', 3, '造成 35 点伤害。', '轰！', { val: 35 }),
  createCard('civ_11', '安全帽', CardType.POWER, '装备', 1, '获得 10 点护甲。', '安全第一。', { val: 10 }),
  createCard('civ_12', '项目结算', CardType.ATTACK, '攻击', 2, '造成 25 点伤害，获得 50 金币。', '算总账。', { val: 25, special: 'GAIN_GOLD_50' }),
  createCard('civ_13', '暗箱操作', CardType.SKILL, '行动', 1, '摸 3 张牌。', '潜规则。', { draw: 3 }),
  createCard('civ_14', '临时加固', CardType.SKILL, '反制', 1, '获得 20 点护甲。', '还能撑住。', { val: 20 }),
  createCard('civ_15', '连轴转', CardType.SKILL, '行动', 2, '获得 1 层闪避，回复 20 血。', '猝死边缘。', { status: { type: StatusType.DODGE, amount: 1, target: TargetType.SELF }, heal: 20 }),
];

// --- PM Cards ---
export const PM_CARDS: CardData[] = [
  createCard('pm_01', '同步进度', CardType.ATTACK, '攻击', 1, '造成 8 伤害，摸 1 张牌。', '到哪一步了？', { val: 8, draw: 1 }),
  createCard('pm_02', '画饼艺术', CardType.SKILL, '行动', 1, '获得 2 能量。', '前景广阔。', { energy: 2 }),
  createCard('pm_03', '疯狂催办', CardType.ATTACK, '攻击', 2, '造成 15 伤害，敌方获得 1 层虚弱。', '明天就要上线！', { val: 15, status: { type: StatusType.WEAK, amount: 1, target: TargetType.ENEMY } }),
  createCard('pm_04', '资源对接', CardType.SKILL, '法力', 0, '摸 2 张牌。', '我去协调一下。', { draw: 2 }),
  createCard('pm_05', '召唤外包', CardType.SKILL, '咒术', 2, '施加 3 层中毒（外包伤害）。', '钱给够，啥都行。', { status: { type: StatusType.POISON, amount: 3, target: TargetType.ENEMY } }),
  createCard('pm_06', '紧急会议', CardType.SKILL, '行动', 2, '敌方获得 1 层眩晕。', '先停一下。', { status: { type: StatusType.STUN, amount: 1, target: TargetType.ENEMY } }),
  createCard('pm_07', '锅甩出去', CardType.SKILL, '反制', 1, '获得 10 点护甲，移除自身所有负面状态。', '不是我的问题。', { val: 10, special: 'CLEANSE_ALL' }),
  createCard('pm_08', 'PPT 大师', CardType.POWER, '装备', 2, '每回合获得 8 点护甲。', '表面功夫。', { special: 'PASSIVE_BLOCK_8' }),
  createCard('pm_09', '需求变更', CardType.SKILL, '咒术', 1, '丢弃所有手牌，摸 5 张牌。', '改个需求很简单。', { special: 'WHEEL' }),
  createCard('pm_10', '团建活动', CardType.SKILL, '行动', 2, '回复 20 生命。', '吃顿好的。', { heal: 20 }),
  createCard('pm_11', '里程碑达成', CardType.POWER, '装备', 3, '每回合回复 5 生命，获得 1 能量。', '阶段性胜利。', { special: 'PASSIVE_HEAL_ENERGY' }),
  createCard('pm_12', '绩效考核', CardType.ATTACK, '攻击', 2, '造成 15 伤害，若敌方有负面状态，伤害翻倍。', '季度末到了。', { val: 15, special: 'COND_DOUBLE_DMG' }),
  createCard('pm_13', '敏捷开发', CardType.SKILL, '行动', 1, '获得 2 能量，摸 2 张牌。', '快，跑起来！', { energy: 2, draw: 2 }),
  createCard('pm_14', '预算削减', CardType.SKILL, '咒术', 2, '敌方获得 3 层虚弱。', '没钱了，省着点。', { status: { type: StatusType.WEAK, amount: 3, target: TargetType.ENEMY } }),
  createCard('pm_15', '上市敲钟', CardType.ATTACK, '攻击', 5, '造成 60 点伤害。', '功成名就。', { val: 60 }),
];

// --- HOSTILE FORCES ---
export const HR_CARDS: CardData[] = [
  createCard('hr_01', '入职背调', CardType.SKILL, '行动', 0, '查看玩家手牌，丢弃其中所有攻击牌。', '这段简历有点水分。', { special: 'DISCARD_ALL_ATTACKS' }),
  createCard('hr_02', '绩效面谈', CardType.ATTACK, '攻击', 1, '造成 10 点伤害，玩家下回合摸牌数 -2。', '谈谈你这季度的产出。', { val: 10, special: 'DEBUFF_DRAW_2' }),
  createCard('hr_03', '强制休假', CardType.SKILL, '咒术', 2, '玩家本回合无法使用任何行动牌。', '是公司关怀，不是开除。', { status: { type: StatusType.STUN, amount: 1, target: TargetType.ENEMY } }), 
  createCard('hr_04', '价值观考核', CardType.POWER, '装备', 2, '玩家每打出一张非攻击牌，受到 5 点真伤。', '你似乎不符合企业文化。', { status: { type: StatusType.TRUE_DMG_ON_PLAY, amount: 5, target: TargetType.ENEMY } }),
  createCard('hr_05', '降薪警告', CardType.SKILL, '咒术', 1, '玩家所有卡牌消耗本回合 +1。', '公司现在也很困难。', { status: { type: StatusType.COST_UP, amount: 1, target: TargetType.ENEMY } }),
  createCard('hr_06', '优化红线', CardType.ATTACK, '攻击', 2, '造成 15 点伤害，若玩家血量低于 30% 则直接斩杀。', '你被优化了。', { val: 15, special: 'EXECUTE_30' }),
  createCard('hr_07', '连坐惩罚', CardType.SKILL, '咒术', 2, '玩家每有一张手牌，受到 3 点伤害。', '团队责任，人人有份。', { special: 'DMG_PER_HAND' }),
  createCard('hr_08', '简历入库', CardType.SKILL, '反制', 1, '移除玩家所有护甲。', '我们会把你放进人才库。', { special: 'STRIP_SHIELD' }),
  createCard('hr_09', '考勤扣款', CardType.ATTACK, '攻击', 1, '造成 10 点伤害，并偷取 20 金币。', '迟到一秒也是迟到。', { val: 10, special: 'STEAL_GOLD_20' }),
  createCard('hr_10', '狼性文化', CardType.POWER, '装备', 3, 'HR 每次受到伤害，下回合伤害 +3。', '', { special: 'BUFF_ON_HIT' }),
  createCard('hr_11', '画饼充饥', CardType.SKILL, '行动', 1, '回复 20 点生命，但下回合防御 -5。', '', { heal: 20 }),
  createCard('hr_12', '劳动合同', CardType.SKILL, '咒术', 2, '给予玩家 2 层虚弱。', '', { status: { type: StatusType.WEAK, amount: 2, target: TargetType.ENEMY } }),
  createCard('hr_13', '岗位调动', CardType.SKILL, '行动', 1, '强迫玩家重抽所有手牌。', '', { special: 'RESHUFFLE_PLAYER' }),
  createCard('hr_14', '背景抹黑', CardType.SKILL, '咒术', 2, '造成 10 点伤害，玩家获得 3 层易伤。', '', { val: 10, status: { type: StatusType.VULNERABLE, amount: 3, target: TargetType.ENEMY } }),
  createCard('hr_15', '终极劝退', CardType.ATTACK, '攻击', 3, '造成 40 点伤害。', '', { val: 40 }),
];

export const FINANCE_CARDS: CardData[] = [
  createCard('fin_01', '报销驳回', CardType.SKILL, '反制', 1, '玩家回复转为伤害。', '发票抬头不对。', { status: { type: StatusType.COUNTER_HEAL, amount: 1, target: TargetType.ENEMY } }),
  createCard('fin_02', '成本核算', CardType.POWER, '装备', 2, '每回合获得 10 点护甲。', '每一分钱都要花在刀刃上。', { special: 'PASSIVE_BLOCK_10' }),
  createCard('fin_03', '资金冻结', CardType.SKILL, '咒术', 2, '玩家下回合初始能量 -2。', '流程还在审批。', { special: 'DRAIN_ENERGY_2' }),
  createCard('fin_04', '坏账摊销', CardType.ATTACK, '攻击', 1, '造成 8 点伤害，并偷取玩家 20 金币。', '这笔账得平了。', { val: 8, special: 'STEAL_GOLD_20' }),
  createCard('fin_05', '避税方案', CardType.SKILL, '行动', 1, '获得 2 层闪避。', '这叫财务优化。', { status: { type: StatusType.DODGE, amount: 2, target: TargetType.SELF } }),
  createCard('fin_06', '严控预算', CardType.POWER, '装备', 3, '玩家每回合只能打出 3 张牌。', '重复建设是不被允许的。', { status: { type: StatusType.CARD_LIMIT, amount: 3, target: TargetType.ENEMY } }),
  createCard('fin_07', '折旧损耗', CardType.SKILL, '咒术', 1, '造成 5 点伤害，玩家护甲减半。', '用久了就不值钱了。', { val: 5, special: 'HALVE_SHIELD' }),
  createCard('fin_08', '审计入场', CardType.ATTACK, '攻击', 2, '造成 12 点穿透伤害，清除玩家所有增益。', '经得起查吗？', { val: 12, special: 'TRUE_DMG' }),
  createCard('fin_09', '延期付账', CardType.SKILL, '行动', 0, '回复 20 血。', '', { heal: 20 }),
  createCard('fin_10', '现金流断裂', CardType.SKILL, '咒术', 3, '造成 25 点伤害。', '', { val: 25 }),
  createCard('fin_11', '抵税凭证', CardType.POWER, '装备', 2, '获得 20 护甲。', '', { val: 20 }),
  createCard('fin_12', '资产重组', CardType.SKILL, '行动', 2, '回复 30 生命，获得 10 护甲。', '', { heal: 30, val: 10 }),
  createCard('fin_13', '固定资产', CardType.ATTACK, '攻击', 1, '造成等同于自身护甲值 50% 的伤害。', '', { special: 'SHIELD_SLAM_50' }),
  createCard('fin_14', '砍掉项目', CardType.SKILL, '咒术', 2, '玩家能量上限 -1 (本场)。', '', { special: 'MAX_MP_DOWN' }),
  createCard('fin_15', '破产清算', CardType.ATTACK, '攻击', 4, '造成 50 点伤害，偷取 100 金币。', '', { val: 50, special: 'STEAL_GOLD_100' }),
];

export const CLIENT_CARDS: CardData[] = [
  createCard('cli_01', '突发奇想', CardType.ATTACK, '攻击', 1, '造成 10 点伤害，往玩家抽牌堆塞入 1 张废卡。', '我昨天做梦有个新想法。', { val: 10, special: 'ADD_TRASH' }),
  createCard('cli_02', '这个不要', CardType.SKILL, '行动', 1, '移除玩家所有护甲。', '感觉不对，删了吧。', { special: 'STRIP_SHIELD' }),
  createCard('cli_03', '尽快上线', CardType.ATTACK, '攻击', 0, '造成 5 点伤害，Boss 额外行动一次。', '明天能弄好吗？', { val: 5, special: 'EXTRA_TURN' }),
  createCard('cli_04', '色彩玄学', CardType.SKILL, '咒术', 2, '施加 3 种随机负面状态。', '要那种流动的质感。', { special: 'RANDOM_DEBUFFS' }),
  createCard('cli_05', '尾款消失', CardType.ATTACK, '攻击', 3, '造成 30 点伤害。', '最近公司账上没钱。', { val: 30 }),
  createCard('cli_06', '全都要', CardType.POWER, '装备', 3, '本回合获得 20 护甲，下回合攻击翻倍。', '小孩子才做选择。', { val: 20, special: 'NEXT_TURN_DOUBLE' }),
  createCard('cli_07', '换个方案', CardType.SKILL, '咒术', 1, '玩家丢弃所有手牌。', '还是第一版好。', { special: 'DISCARD_HAND' }),
  createCard('cli_08', '专家评审', CardType.SKILL, '反制', 1, '玩家造成伤害降低 50%，持续 2 回合。', '我觉得这里不够大气。', { status: { type: StatusType.WEAK, amount: 2, target: TargetType.ENEMY } }),
  createCard('cli_09', '电话轰炸', CardType.ATTACK, '攻击', 1, '造成 3 点伤害，重复 5 次。', '接电话！接电话！', { val: 3, special: 'REPEAT_5' }),
  createCard('cli_10', '逻辑漏洞', CardType.SKILL, '咒术', 2, '造成 15 点伤害。', '', { val: 15 }),
  createCard('cli_11', '跨界对标', CardType.SKILL, '行动', 1, '回复 20 生命。', '', { heal: 20 }),
  createCard('cli_12', '无理取闹', CardType.ATTACK, '攻击', 2, '造成 20 伤害。', '', { val: 20 }),
  createCard('cli_13', '战略合作', CardType.POWER, '装备', 2, '每回合回复 5 生命。', '', { status: { type: StatusType.REGEN, amount: 5, target: TargetType.SELF } }),
  createCard('cli_14', '重新定位', CardType.SKILL, '咒术', 2, '玩家获得 3 层易伤。', '', { status: { type: StatusType.VULNERABLE, amount: 3, target: TargetType.ENEMY } }),
  createCard('cli_15', '终稿地狱', CardType.ATTACK, '攻击', 5, '造成 80 点伤害。', '这是第 99 版。', { val: 80 }),
];

export const INVOLUTION_CARDS: CardData[] = [
  createCard('inv_01', '降维打击', CardType.ATTACK, '攻击', 2, '造成 20 点伤害，无视护甲。', '我是来毁灭各位的。', { val: 20, special: 'TRUE_DMG' }),
  createCard('inv_02', '凌晨三点', CardType.POWER, '装备', 3, '双方每回合开始时受到 5 点伤害。', '你见过凌晨三点的办公室吗？', { special: 'GLOBAL_DOT_5' }),
  createCard('inv_03', '强制对标', CardType.SKILL, '咒术', 2, '造成 30 点伤害。', '跟我比产出？', { val: 30 }),
  createCard('inv_04', '迭代升级', CardType.SKILL, '行动', 1, '永久增加 5 点攻击力。', '我一直在进化。', { status: { type: StatusType.STRENGTH, amount: 5, target: TargetType.SELF } }),
  createCard('inv_05', '全栈碾压', CardType.ATTACK, '攻击', 2, '造成 15 点伤害，并施加 2 层虚弱。', '我会你们所有的技能。', { val: 15, status: { type: StatusType.WEAK, amount: 2, target: TargetType.ENEMY } }),
  createCard('inv_06', '行业垄断', CardType.POWER, '装备', 4, '玩家每回合只能打出 3 张牌。', '这个赛道不需要第二个人。', { status: { type: StatusType.CARD_LIMIT, amount: 3, target: TargetType.ENEMY } }),
  createCard('inv_07', '吞噬简历', CardType.SKILL, '咒术', 2, '造成 10 点伤害，并偷取 50 金币。', '你被替代了。', { val: 10, special: 'STEAL_GOLD_50' }),
  createCard('inv_08', '上升通道', CardType.SKILL, '行动', 1, '偷取玩家所有增益状态。', '机会是留给我的。', { special: 'STEAL_BUFFS' }),
  createCard('inv_09', '财务自由', CardType.ATTACK, '攻击', 3, '造成 40 点伤害。', '我已上岸，你们继续。', { val: 40 }),
  createCard('inv_10', '007福报', CardType.POWER, '装备', 5, '每回合回复 10 生命，增加 2 力量。', '', { heal: 10, status: { type: StatusType.STRENGTH, amount: 2, target: TargetType.SELF } }),
  createCard('inv_11', '降本增效', CardType.ATTACK, '攻击', 1, '消耗自身 10 生命，造成 30 伤害。', '', { val: 30, special: 'SELF_DMG_10' }),
  createCard('inv_12', '架构封锁', CardType.SKILL, '反制', 1, '玩家无法使用装备牌 2 回合。', '', { special: 'SILENCE_POWER' }),
  createCard('inv_13', '认知觉醒', CardType.SKILL, '咒术', 2, '玩家获得 3 层易伤。', '', { status: { type: StatusType.VULNERABLE, amount: 3, target: TargetType.ENEMY } }),
  createCard('inv_14', '资源黑洞', CardType.POWER, '装备', 2, '每回合吸取玩家 1 能量。', '', { special: 'DRAIN_ENERGY_1' }),
  createCard('inv_15', '时代的一粒灰', CardType.ATTACK, '攻击', 99, '造成 99 点伤害。', '落在个人头上就是一座山。', { val: 99 }),
];

// --- Class Definitions ---

export const CLASSES = {
  [ClassType.PROGRAMMER]: { name: '耐艹程序员', role: '肉盾', hp: 80, mp: 3, desc: '核心机制：叠加护甲。通过“冗余代码”产生格挡，通过“重构”转化伤害。', cards: PROGRAMMER_CARDS },
  [ClassType.POLICE]: { name: '铁打刑警', role: '狂战士', hp: 100, mp: 3, desc: '核心机制：卖血流。压力值（血量）越低，伤害越高。', cards: POLICE_CARDS },
  [ClassType.DESIGNER]: { name: '设计老法师', role: '法师', hp: 60, mp: 5, desc: '核心机制：元素爆发。高耗能，大范围AOE伤害。', cards: DESIGNER_CARDS },
  [ClassType.DOCTOR]: { name: '医药奶妈', role: '牧师', hp: 70, mp: 4, desc: '核心机制：恢复与净化。利用“副作用”对敌施加Debuff。', cards: DOCTOR_CARDS },
  [ClassType.CIVIL]: { name: '土木刺客', role: '刺客', hp: 65, mp: 4, desc: '核心机制：连击与隐身。擅长“提桶跑路”和“打灰”。', cards: CIVIL_CARDS },
  [ClassType.PM]: {
    name: 'PM星君',
    role: '德鲁伊',
    hp: 75,
    mp: 3,
    desc: '核心机制：形态转换（画饼）。召唤“外包团队”协助战斗。',
    // 5 Initial Cards as requested: 2 Attacks, 2 Defends, 1 Class Special
    cards: [
        PM_CARDS[0], // 同步进度 (Atk)
        PM_CARDS[2], // 疯狂催办 (Atk)
        GENERIC_DEFEND, // 踢皮球 (Def)
        GENERIC_DEFEND, // 踢皮球 (Def)
        PM_CARDS[1]  // 画饼艺术 (Class Special)
    ]
  }
};

// --- Story Nodes ---

export const STORY_NODES: StoryNode[] = [
  {
    id: 1,
    title: "入门：洗髓池",
    location: "公司大堂 - 漏水的饮水机旁",
    description: "空气中弥漫着廉价咖啡豆和打印机炭粉的味道。HR 师太端坐在“洗髓池”旁，手里挥舞着你的简历。",
    dialogue: "“凡人，你的简历上写着精通 Excel，但你的神魂中却没有‘VLOOKUP’的灵光。想要入我门下，须先斩断‘双休’的尘缘，签下这份名为‘自愿奋斗’的灵魂契约。”",
    bossType: EnemyType.HR,
    choices: [
      {
        text: "彻底断念",
        description: "交出所有防御牌，换取“入职大礼包”（获得 2 张强力攻击牌）。",
        actionType: "BATTLE",
        specialEffect: "TRADE_DEFENSE_FOR_ATTACK"
      },
      {
        text: "隐瞒修为",
        description: "保留实力，但 HP 上限 -10。",
        actionType: "BATTLE",
        value: -10,
        specialEffect: "MAX_HP_DOWN"
      },
      {
        text: "据理力争",
        description: "立刻进入战斗（BOSS：HR 师太）。",
        actionType: "BATTLE"
      }
    ]
  },
  {
    id: 2,
    title: "小成：结界",
    location: "会议室 - 无尽回廊",
    description: "你被困在了一个名为“同步周会”的阵法中。时间在这里变得扭曲，每一个小时的讨论在体感上都像过去了一个甲子。",
    dialogue: "老板正在上方悬浮，口中喷吐着金色的“大饼”：“我们要赋能赛道，打通闭环，下沉市场，寻找抓手……”你感到神识恍惚，如果不找点事做，你的道心就要崩塌了。",
    bossType: EnemyType.NORMAL, // Placeholder, this node might skip boss or spawn elite
    choices: [
      {
        text: "深度共鸣",
        description: "丢弃所有能量牌，随机升级 3 张手牌（悟出了新黑话）。",
        actionType: "SKIP", // Skip battle reward logic implemented via event
        specialEffect: "UPGRADE_CARDS"
      },
      {
        text: "带薪如厕",
        description: "回复 30% 血量，但本场战斗奖励金币减半（尿遁是唯一的避风港）。",
        actionType: "SKIP",
        specialEffect: "HEAL_AND_LOSE_GOLD"
      },
      {
        text: "暴力破阵",
        description: "大喊“我有不同意见！”，触发精英战（技术总监）。",
        actionType: "BATTLE",
        specialEffect: "ELITE_BATTLE"
      }
    ]
  },
  {
    id: 3,
    title: "瓶颈：渡劫",
    location: "财务部 - 报销雷劫",
    description: "你手持一叠被揉皱的打车发票，走向财务部的“禁地”。那里雷光闪烁，每一道雷霆都化作一个鲜红的红色印章。",
    dialogue: "“你的滴滴发票比规定迟了三秒，此乃‘违背天道’。想要报销这 35 块钱，须经过这九九八十一道审计流程。或者……你选择献祭掉你的午休时间？”",
    bossType: EnemyType.FINANCE,
    choices: [
      {
        text: "破财消灾",
        description: "失去所有金币，回复满额生命。",
        actionType: "BATTLE",
        specialEffect: "LOSE_ALL_GOLD_HEAL_FULL"
      },
      {
        text: "硬抗雷劫",
        description: "受到 20 点穿透伤害，随机删除牌组中 2 张“废牌”。",
        actionType: "BATTLE",
        specialEffect: "TAKE_DMG_REMOVE_CARDS"
      },
      {
        text: "法票合一",
        description: "展示你的“土木/编程”神功，强行冲卡。",
        actionType: "BATTLE"
      }
    ]
  },
  {
    id: 4,
    title: "走火入魔：幻境",
    location: "周五晚八点 - 甲方幻象",
    description: "就在你准备打卡下班时，四周的灯光突然变成诡异的“五彩斑斓的黑”。手机屏幕疯狂闪烁，跳出无数个“在吗？”。",
    dialogue: "甲方大魔王的声音从四面八方传来：“方案不错，但我还是想要第一版。另外，把 Logo 放大一点，要那种‘低调的奢华’，最好能体现出‘元宇宙的呼吸感’。”",
    bossType: EnemyType.CLIENT,
    choices: [
      {
        text: "连夜重画",
        description: "生命上限 +5，但获得一张诅咒卡“肝硬化”。",
        actionType: "BATTLE",
        specialEffect: "GAIN_CURSE_HP_UP"
      },
      {
        text: "一稿过",
        description: "消耗 100 金币，直接跳过此节点，并获得一件装备“甲方之泪”。",
        actionType: "SKIP", // Skip battle
        specialEffect: "PAY_GOLD_SKIP"
      },
      {
        text: "怒删库位",
        description: "获得短时间内的“无敌”Buff，但接下来的 3 场战斗敌方攻击力翻倍。",
        actionType: "BATTLE",
        specialEffect: "HARD_MODE_BUFF"
      }
    ]
  },
  {
    id: 5,
    title: "飞升：天门",
    location: "公司顶层 - KPI 灵气层",
    description: "你终于登上了公司顶层。这里没有氧气，只有纯净的“KPI 灵气”。内卷之王背对着你，坐在由 996 块废弃显示器拼成的王座上。",
    dialogue: "“你终于来了。其实根本没有什么飞升，所谓的神仙，不过是能一天开 24 小时会而不眨眼的怪胎。加入我，成为这大厦的一部分，或者……被时代的灰尘抹去。”",
    bossType: EnemyType.INVOLUTION,
    choices: [
      {
        text: "拒绝同化",
        description: "进入最终 BOSS 战（VS 内卷之王）。",
        actionType: "BATTLE"
      },
      {
        text: "取而代之",
        description: "解锁隐藏结局“恶龙竟是我自己”（如果你持有特定道具）。",
        actionType: "GAME_OVER",
        specialEffect: "HIDDEN_ENDING"
      },
      {
        text: "提桶跑路",
        description: "立即结束游戏，获得评价“职场散人”，金币转换为真实分数。",
        actionType: "GAME_OVER",
        specialEffect: "NORMAL_ENDING"
      }
    ]
  }
];

// Keep basic defaults for compatibility, though we mostly use Story Logic now
export const INITIAL_MAP: GameNode[] = [
  { id: 1, type: NodeType.BATTLE, cleared: false, label: 'Story Mode Active' }
];

export const EVENTS: RandomEvent[] = []; // Deprecated in favor of Story Nodes