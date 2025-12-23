import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameScreen, ClassType, Player, Enemy, CardData, GameNode, NodeType, StoryNode, StoryChoice, CardType, StatusType, RunStats, TargetType, EnemyType 
} from './types';
import { CLASSES, STORY_NODES, HR_CARDS, FINANCE_CARDS, CLIENT_CARDS, INVOLUTION_CARDS } from './constants';
import Card from './components/Card';
import { generateBossTaunt } from './services/geminiService';
import { Heart, Zap, Coins, Shield, Skull, Clock, TrendingUp, Receipt, Skull as PoisonIcon, Activity, EyeOff, ZapOff, Ban, AlertTriangle, Sword, BookOpen, User, Star } from 'lucide-react';

export default function App() {
  // --- State ---
  const [screen, setScreen] = useState<GameScreen>(GameScreen.MENU);
  const [player, setPlayer] = useState<Player | null>(null);
  
  // Story Progression State
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const [currentStoryNode, setCurrentStoryNode] = useState<StoryNode | null>(null);

  const [runStats, setRunStats] = useState<RunStats>({ bossesKilled: 0, levelsCleared: 0, maxGold: 0, turnsPlayed: 0 });
  const [nextRunBonus, setNextRunBonus] = useState<string | null>(null);

  // Battle State
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [hand, setHand] = useState<CardData[]>([]);
  const [drawPile, setDrawPile] = useState<CardData[]>([]);
  const [discardPile, setDiscardPile] = useState<CardData[]>([]);
  const [turn, setTurn] = useState<'PLAYER' | 'ENEMY'>('PLAYER');
  const [turnCount, setTurnCount] = useState<number>(1);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [bossTaunt, setBossTaunt] = useState<string>('');
  const [isTaunting, setIsTaunting] = useState(false);
  const [cardsPlayedThisTurn, setCardsPlayedThisTurn] = useState<number>(0);
  const [lastPlayerCardType, setLastPlayerCardType] = useState<CardType | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);

  // Ref for auto-scrolling log
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [battleLog]);

  // --- Actions ---

  const startGame = (cls: ClassType) => {
    const template = CLASSES[cls];
    
    const newPlayer: Player = {
      name: template.name,
      classType: cls,
      maxHp: template.hp + (nextRunBonus === 'HP_BOOST' ? 10 : 0),
      currentHp: template.hp + (nextRunBonus === 'HP_BOOST' ? 10 : 0),
      maxMp: template.mp, // Initial Energy
      currentMp: template.mp,
      shield: 0,
      gold: nextRunBonus === 'GOLD_BOOST' ? 100 : 0,
      deck: [...template.cards], 
      imgUrl: `https://picsum.photos/seed/${cls}/200/200`,
      statuses: {}
    };
    
    setRunStats({ bossesKilled: 0, levelsCleared: 0, maxGold: newPlayer.gold, turnsPlayed: 0 });
    setPlayer(newPlayer);
    
    // Start Story
    setCurrentStoryIndex(0);
    setCurrentStoryNode(STORY_NODES[0]);
    setScreen(GameScreen.STORY);
    setBattleLog(['游戏开始！进入职场修仙界。']);
  };

  const advanceStory = () => {
     const nextIndex = currentStoryIndex + 1;
     if (nextIndex < STORY_NODES.length) {
         setCurrentStoryIndex(nextIndex);
         setCurrentStoryNode(STORY_NODES[nextIndex]);
         setScreen(GameScreen.STORY);
     } else {
         // Victory / End Game
         setScreen(GameScreen.YEAR_END_BONUS);
     }
  };

  const handleStoryChoice = (choice: StoryChoice) => {
      if (!player) return;

      // Apply immediate effects
      if (choice.specialEffect === "TRADE_DEFENSE_FOR_ATTACK") {
          // Logic to swap cards - Simplified: remove skill cards add attack cards
          const newDeck = player.deck.filter(c => c.type !== CardType.SKILL);
          // Add generic strong attacks if specific class attacks aren't easily available, 
          // or just duplicate existing attacks. For demo, duplicating first attack.
          const attackCard = player.deck.find(c => c.type === CardType.ATTACK) || player.deck[0];
          newDeck.push({...attackCard, id: `bonus_atk_1`, name: '愤怒打击', val: (attackCard.val || 5) + 5});
          newDeck.push({...attackCard, id: `bonus_atk_2`, name: '愤怒打击', val: (attackCard.val || 5) + 5});
          setPlayer({ ...player, deck: newDeck });
      } else if (choice.specialEffect === "MAX_HP_DOWN") {
          setPlayer({ ...player, maxHp: Math.max(1, player.maxHp - 10), currentHp: Math.min(player.currentHp, player.maxHp - 10) });
      } else if (choice.specialEffect === "LOSE_ALL_GOLD_HEAL_FULL") {
          setPlayer({ ...player, gold: 0, currentHp: player.maxHp });
      } else if (choice.specialEffect === "PAY_GOLD_SKIP") {
          if (player.gold >= 100) {
             setPlayer({ ...player, gold: player.gold - 100 });
          } else {
              // Not enough gold, force battle (fallback logic)
              startBattle(currentStoryNode!.bossType || EnemyType.NORMAL);
              return;
          }
      } else if (choice.specialEffect === "GAIN_CURSE_HP_UP") {
          setPlayer({ ...player, maxHp: player.maxHp + 5, currentHp: player.currentHp + 5, deck: [...player.deck, { id: 'curse', name: '肝硬化', type: CardType.STATUS, cost: 1, displayType: '诅咒', description: '无法打出，每回合扣 3 血', val: 0, flavor: '太疼了' }]});
      }

      if (choice.actionType === 'BATTLE') {
          const bossType = currentStoryNode?.bossType || EnemyType.NORMAL;
          startBattle(bossType);
      } else if (choice.actionType === 'SKIP') {
          advanceStory();
      } else if (choice.actionType === 'GAME_OVER') {
          setScreen(GameScreen.YEAR_END_BONUS);
      }
  };

  const startBattle = (enemyType: EnemyType) => {
    if (!player) return;

    let enemyName = '实习生';
    let enemyHp = 50;
    let enemyDeck: CardData[] = [];

    // Boss Definitions based on Story Node Logic
    if (enemyType === EnemyType.HR) {
        enemyName = 'HR 师太';
        enemyHp = 120;
        enemyDeck = HR_CARDS;
    } else if (enemyType === EnemyType.FINANCE) {
        enemyName = '财务铁公鸡';
        enemyHp = 150;
        enemyDeck = FINANCE_CARDS;
    } else if (enemyType === EnemyType.CLIENT) {
        enemyName = '甲方大魔王';
        enemyHp = 200;
        enemyDeck = CLIENT_CARDS;
    } else if (enemyType === EnemyType.INVOLUTION) {
        enemyName = '内卷之王';
        enemyHp = 300;
        enemyDeck = INVOLUTION_CARDS;
    } else {
        // Elite or Normal
        enemyName = '技术总监';
        enemyHp = 80;
        enemyDeck = HR_CARDS.slice(0, 5); 
    }

    const firstMove = enemyDeck[Math.floor(Math.random() * enemyDeck.length)];

    const newEnemy: Enemy = {
      name: enemyName,
      type: enemyType,
      maxHp: enemyHp,
      currentHp: enemyHp,
      maxMp: 10,
      currentMp: 10,
      shield: 0,
      imgUrl: `https://picsum.photos/seed/${enemyName}/150/150`,
      id: 'enemy_1',
      intent: firstMove.name,
      intentValue: firstMove.val || 0,
      nextMoveCard: firstMove,
      deck: enemyDeck,
      statuses: {}
    };

    setEnemy(newEnemy);
    
    // Shuffle Deck
    const shuffledDeck = [...player.deck].sort(() => Math.random() - 0.5);
    setDrawPile(shuffledDeck);
    setDiscardPile([]);
    setHand([]);
    setTurnCount(1);
    setCardsPlayedThisTurn(0);
    setLastPlayerCardType(null);
    
    // Reset Battle Temp Stats
    setPlayer(p => p ? { 
        ...p, 
        currentMp: p.maxMp, 
        shield: 0, 
        statuses: {} 
    } : null); 
    
    setScreen(GameScreen.BATTLE);
    setTurn('PLAYER');
    addToLog(`>>> 进入战斗：${enemyName} <<<`);
    addToLog(`我方先手！初始手牌抽取中...`);

    // Boss Intro Taunt
    triggerBossTaunt(player, enemyName);
    
    setTimeout(() => drawCards(4), 500);
  };

  const triggerBossTaunt = async (p: Player, name: string) => {
      setIsTaunting(true);
      setBossTaunt("Thinking...");
      const taunt = await generateBossTaunt(p, name);
      setBossTaunt(taunt);
      setTimeout(() => setIsTaunting(false), 4000);
  };

  const drawCards = (count: number) => {
    let finalCount = count;
    if (player?.statuses[StatusType.OVERTIME]) finalCount = Math.max(1, count - 1);

    setDrawPile(prev => {
      let newDraw = [...prev];
      let newHand = [];
      
      if (newDraw.length < finalCount) {
        newDraw = [...newDraw, ...discardPile.sort(() => Math.random() - 0.5)];
        setDiscardPile([]);
      }

      for (let i = 0; i < finalCount; i++) {
        if (newDraw.length > 0) {
          const card = newDraw.shift();
          if (card) newHand.push(card);
        }
      }
      
      setHand(h => [...h, ...newHand]);
      return newDraw;
    });
  };

  const playCard = (card: CardData, index: number) => {
    if (!player || !enemy || turn !== 'PLAYER') return;
    
    if (player.statuses[StatusType.CARD_LIMIT] && cardsPlayedThisTurn >= 3) {
        addToLog("【严控预算】生效，本回合无法打出更多牌！");
        return;
    }
    
    let cost = card.cost;
    if (player.statuses[StatusType.COST_UP]) cost += 1;

    if (player.currentMp < cost) {
      addToLog("⚠️ 能量不足，无法推进闭环！");
      return;
    }

    setPlayer(p => p ? { ...p, currentMp: p.currentMp - cost } : null);
    setCardsPlayedThisTurn(c => c + 1);
    setLastPlayerCardType(card.type);

    // --- Card Logic (Same as before but visual enhancements) ---
    // Enemy Counter Heal
    if (enemy.statuses[StatusType.COUNTER_HEAL] && card.heal) {
        addToLog(`🚫【报销驳回】！治疗转化为伤害！`);
        triggerDamageEffect();
        setPlayer(p => p ? { ...p, currentHp: Math.max(0, p.currentHp - card.heal!) } : null);
    } else if (card.heal) {
        healPlayer(card.heal);
        addToLog(`💚 回复了 ${card.heal} 点生命。`);
    }

    // Special Checks
    if (enemy.statuses[StatusType.TRUE_DMG_ON_PLAY] && card.type !== CardType.ATTACK) {
        const dmg = enemy.statuses[StatusType.TRUE_DMG_ON_PLAY];
        triggerDamageEffect();
        setPlayer(p => p ? { ...p, currentHp: Math.max(0, p.currentHp - dmg) } : null);
        addToLog(`⚡【价值观考核】不合格！受到 ${dmg} 点真伤。`);
    }

    let damage = card.val || 0;
    let shield = 0;

    if (card.type === CardType.SKILL || card.type === CardType.POWER) {
        if (card.val) shield = card.val;
    }
    
    // --- Special Logic Hooks (Simplified for brevity, same as previous logic) ---
    if (card.special === 'SHIELD_SLAM_150') { damage = player.shield * 1.5; setPlayer(p => p ? { ...p, shield: 0 } : null); }
    if (card.special === 'GAIN_BLOCK_3') shield += 3;

    // Apply Shield
    if (shield > 0) {
      setPlayer(p => p ? { ...p, shield: p.shield + shield } : null);
    }

    // Deal Damage
    if (damage > 0) {
      // Calculation logic...
      let actualDmg = damage;
      // ... (Vulnerable/Weak/Shield calcs)
      if (player.shield >= actualDmg) {
          // logic handled in enemy turn usually, here player attacks enemy
      }
      
      setEnemy(e => e ? { ...e, currentHp: Math.max(0, e.currentHp - actualDmg) } : null);
      addToLog(`⚔️ [${card.name}] 造成了 ${actualDmg} 点伤害！`);
      
      // Hit Effect
      const enemyEl = document.getElementById('enemy-visual');
      if (enemyEl) {
          enemyEl.classList.add('shake');
          setTimeout(() => enemyEl.classList.remove('shake'), 400);
      }
    }

    // Discard
    const newHand = [...hand];
    newHand.splice(index, 1);
    setHand(newHand);
    setDiscardPile(prev => [...prev, card]);

    if (enemy.currentHp <= 0) setTimeout(winBattle, 1000);
  };

  const endTurn = () => {
    setTurn('ENEMY');
    setDiscardPile(prev => [...prev, ...hand]);
    setHand([]);

    // Player End Turn Statuses (Poison, Overtime)
    if (player?.statuses[StatusType.OVERTIME]) {
        triggerDamageEffect();
        setPlayer(p => p ? { ...p, currentHp: Math.max(0, p.currentHp - 5) } : null);
        addToLog(`🕒 [996福报] 扣除 5 点生命。`);
    }

    setTimeout(executeEnemyTurn, 1000);
  };

  // --- SMART AI ---
  const getSmartEnemyMove = (currentEnemy: Enemy): CardData => {
      // 1. Counter Heal: If player played heal or has regen, try to play COUNTER_HEAL logic
      const healCounter = currentEnemy.deck.find(c => c.status?.type === StatusType.COUNTER_HEAL);
      if (lastPlayerCardType === CardType.SKILL && healCounter && Math.random() > 0.5) return healCounter;

      // 2. Shield Pierce: If player shield is high, prioritize TRUE_DMG
      if (player && player.shield > 15) {
          const piercer = currentEnemy.deck.find(c => c.special === 'TRUE_DMG' || c.special === 'STRIP_SHIELD');
          if (piercer) return piercer;
      }

      // 3. Execution: If player low HP, try EXECUTE
      if (player && player.currentHp < player.maxHp * 0.3) {
          const executer = currentEnemy.deck.find(c => c.special?.includes('EXECUTE'));
          if (executer) return executer;
      }

      // 4. Fallback: Random
      return currentEnemy.deck[Math.floor(Math.random() * currentEnemy.deck.length)];
  };

  const executeEnemyTurn = () => {
      if (!enemy || !player) return;

      // Select Card based on AI
      const move = getSmartEnemyMove(enemy);
      setEnemy(prev => prev ? { ...prev, intent: move.name, nextMoveCard: move } : null);

      setTimeout(() => {
          addToLog(`👿 ${enemy.name} 使用了【${move.name}】！`);
          
          let dmg = move.val || 0;

          // Special logic (simplified)
          if (move.special === 'STRIP_SHIELD') setPlayer(p => p ? {...p, shield: 0} : null);
          if (move.special === 'TRUE_DMG') {
              triggerDamageEffect();
              setPlayer(p => p ? { ...p, currentHp: Math.max(0, p.currentHp - dmg) } : null);
              addToLog(`💔 受到 ${dmg} 点真实伤害！`);
              dmg = 0;
          }

          // Normal Damage Calc
          if (dmg > 0) {
             let actualDmg = dmg;
             if (player.shield >= actualDmg) {
                 setPlayer(p => p ? { ...p, shield: p.shield - actualDmg } : null);
                 actualDmg = 0;
                 addToLog(`🛡️ 护甲格挡了所有伤害！`);
             } else {
                 actualDmg -= player.shield;
                 setPlayer(p => p ? { ...p, shield: 0 } : null);
                 triggerDamageEffect();
                 setPlayer(p => p ? { ...p, currentHp: Math.max(0, p.currentHp - actualDmg) } : null);
                 addToLog(`🩸 受到 ${actualDmg} 点伤害！`);
             }
          }

          if (move.status) {
             setPlayer(p => p ? { ...p, statuses: { ...p.statuses, [move.status!.type]: (p.statuses[move.status!.type] || 0) + move.status!.amount } } : null);
          }

          if (player.currentHp <= 0) {
              setScreen(GameScreen.YEAR_END_BONUS);
              return;
          }

          startPlayerTurn();
      }, 1000);
  };

  const startPlayerTurn = () => {
      setPlayer(p => p ? { ...p, currentMp: p.maxMp } : null);
      setTurn('PLAYER');
      setTurnCount(tc => tc + 1);
      setCardsPlayedThisTurn(0);
      setLastPlayerCardType(null);
      drawCards(2); // Draw 2 per turn as per requirement
  };

  const winBattle = () => {
      addToLog("🎉 战斗胜利！项目成功上线！");
      setRunStats(prev => ({ ...prev, bossesKilled: prev.bossesKilled + 1 }));
      setEnemy(null);
      
      // Advance Story
      advanceStory();
  };

  const healPlayer = (amount: number) => {
      setPlayer(p => p ? { ...p, currentHp: Math.min(p.maxHp, p.currentHp + amount) } : null);
  }

  const addToLog = (msg: string) => {
      setBattleLog(prev => [...prev, msg]);
  }

  const triggerDamageEffect = () => {
      setScreenShake(true);
      setDamageFlash(true);
      setTimeout(() => {
          setScreenShake(false);
          setDamageFlash(false);
      }, 400);
  };

  // --- Renders ---

  const renderMainMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center text-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-6xl">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 mb-4 gothic-font tracking-widest drop-shadow-[0_5px_5px_rgba(255,0,0,0.5)]">
          血战甲方
        </h1>
        <h2 className="text-xl text-slate-400 mb-12 tracking-[0.5em] uppercase">Factory Storm: Roguelike</h2>
        
        {nextRunBonus && (
          <div className="mb-6 px-4 py-2 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-full animate-pulse text-sm inline-block">
             ✨ 年终奖生效中：{nextRunBonus === 'HP_BOOST' ? '初始生命 +10' : '初始绩效 +100'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(CLASSES).map(([key, cls]) => (
            <div 
              key={key}
              onClick={() => startGame(key as ClassType)}
              className="group bg-slate-900/80 p-6 rounded-2xl border border-slate-700 shadow-xl hover:bg-slate-800 cursor-pointer transition-all hover:-translate-y-2 hover:border-red-500 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <h3 className="text-2xl font-bold text-cyan-400 mb-2 group-hover:text-red-400 transition-colors">{cls.name}</h3>
              <div className="text-xs font-mono text-slate-500 mb-4 border border-slate-700 rounded px-2 py-1 inline-block uppercase tracking-wider">{cls.role}</div>
              
              <p className="text-slate-300 text-sm mb-6 italic h-16">{cls.desc}</p>
              
              <div className="flex justify-center gap-6 text-sm text-slate-400 font-mono">
                  <span className="flex items-center"><Heart size={14} className="mr-1 text-red-500"/> {cls.hp}</span>
                  <span className="flex items-center"><Zap size={14} className="mr-1 text-blue-500"/> {cls.mp}</span>
                  <span className="flex items-center"><BookOpen size={14} className="mr-1 text-yellow-500"/> {cls.cards.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStory = () => {
      if (!currentStoryNode) return null;
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950 to-slate-950"></div>
              
              <div className="relative z-10 max-w-4xl w-full bg-slate-900/90 border-2 border-slate-700 p-10 rounded-lg shadow-2xl">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-700 px-6 py-2 rounded-full text-yellow-500 font-bold tracking-widest uppercase text-sm">
                      Chapter {currentStoryNode.id} : {currentStoryNode.title}
                  </div>
                  
                  <h2 className="text-3xl font-bold text-slate-200 mb-2 font-serif">{currentStoryNode.location}</h2>
                  <div className="h-1 w-20 bg-red-700 mb-6"></div>
                  
                  <p className="text-lg text-slate-400 mb-8 leading-relaxed font-serif italic">
                      {currentStoryNode.description}
                  </p>
                  
                  <div className="bg-black/40 border-l-4 border-red-600 p-6 mb-10">
                      <p className="text-xl text-slate-200 font-medium glitch" data-text={currentStoryNode.dialogue}>
                          {currentStoryNode.dialogue}
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {currentStoryNode.choices.map((choice, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleStoryChoice(choice)}
                            className="group relative bg-slate-800 hover:bg-slate-700 border border-slate-600 p-6 rounded transition-all hover:-translate-y-1 hover:border-cyan-500 text-left"
                          >
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500 transition-all"></div>
                              <h3 className="text-xl font-bold text-cyan-500 group-hover:text-cyan-300 mb-2">{choice.text}</h3>
                              <p className="text-xs text-slate-400 group-hover:text-slate-300">{choice.description}</p>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const renderBattle = () => {
      if (!player || !enemy) return null;
      return (
        <div className={`flex flex-col h-screen bg-slate-950 overflow-hidden ${screenShake ? 'shake' : ''}`}>
            {damageFlash && <div className="flash-red"></div>}
            
            {/* Top Bar */}
            <div className="h-16 bg-black/80 flex items-center justify-between px-6 border-b border-slate-800 backdrop-blur-md relative z-20">
                <div className="flex items-center gap-6">
                    <div className={`flex items-center font-bold text-xl ${player.currentHp < player.maxHp * 0.3 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
                        <Heart className="mr-2 fill-current"/> {player.currentHp}/{player.maxHp}
                    </div>
                    <div className="flex items-center text-blue-400 font-bold text-xl"><Zap className="mr-2 fill-current"/> {player.currentMp}/{player.maxMp}</div>
                    <div className="flex items-center text-slate-400 font-bold text-xl"><Shield className="mr-2"/> {player.shield}</div>
                </div>
                <div className="flex items-center text-yellow-500 font-mono text-xl">
                    <Coins className="mr-2"/> {player.gold}
                </div>
            </div>

            {/* Battle Field */}
            <div className="flex-1 flex items-center justify-center relative bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-slate-950/90"></div>
                
                {isTaunting && (
                    <div className="absolute top-24 z-50 bg-black text-red-500 p-6 rounded-sm shadow-[0_0_20px_red] max-w-sm border border-red-600 gothic-font text-xl text-center">
                        <p>“{bossTaunt}”</p>
                    </div>
                )}

                {/* Enemy */}
                <div id="enemy-visual" className="relative z-10 flex flex-col items-center mr-32 group">
                    <div className="text-red-500 font-bold text-4xl mb-4 gothic-font flex items-center gap-3 drop-shadow-lg">
                        {enemy.name}
                        <span className="text-lg text-slate-500 font-sans border border-slate-600 px-2 rounded">{enemy.currentHp} HP</span>
                    </div>
                    
                    <div className="relative">
                        <img src={enemy.imgUrl} className="w-64 h-64 rounded-full border-4 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] float grayscale group-hover:grayscale-0 transition-all duration-500" alt="enemy" />
                        
                        {/* Status Bar */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                             {/* Render statuses here if needed */}
                        </div>
                    </div>

                    {/* Enemy Intent */}
                    <div className="mt-8 bg-black/80 px-6 py-3 rounded text-red-400 font-mono text-sm border border-red-900/50 flex flex-col items-center min-w-[180px] shadow-lg">
                        <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">Incoming</span>
                        <div className="font-bold text-white text-lg flex items-center gap-2">
                           <Sword size={18} /> {enemy.intent} 
                        </div>
                        {enemy.nextMoveCard?.val && <div className="text-red-500 font-bold text-xl">{enemy.nextMoveCard.val} DMG</div>}
                    </div>
                </div>

                {/* Player */}
                <div className={`relative z-10 flex flex-col items-center ml-32 ${player.currentHp < player.maxHp * 0.3 ? 'low-hp-warning' : ''}`}>
                     <div className="w-48 h-48 bg-cyan-950/30 rounded-full border-2 border-cyan-500/30 flex items-center justify-center text-8xl shadow-[0_0_50px_rgba(34,211,238,0.1)] overflow-hidden">
                        <img src={player.imgUrl} alt={player.name} className="w-full h-full object-cover opacity-80" />
                     </div>
                     <div className="mt-4 text-cyan-400 font-bold tracking-widest">{player.name}</div>
                </div>
            </div>

            {/* Hand Area */}
            <div className="h-80 bg-gradient-to-t from-black via-slate-900 to-transparent relative flex flex-col justify-end pb-8">
                
                {/* Battle Log */}
                <div className="absolute top-0 left-4 w-72 h-48 bg-black/60 p-3 overflow-y-auto no-scrollbar text-xs font-mono text-slate-400 pointer-events-none rounded border border-white/10">
                    {battleLog.slice(-6).map((log, i) => ( // Only show last 6 lines
                        <div key={i} className="mb-2 border-l-2 border-cyan-900 pl-2">{log}</div>
                    ))}
                    <div ref={logEndRef} />
                </div>

                <button 
                    onClick={endTurn}
                    disabled={turn !== 'PLAYER'}
                    className={`
                        absolute right-10 top-10 px-8 py-4 rounded font-bold shadow-lg tracking-widest uppercase transition-all
                        ${turn === 'PLAYER' 
                            ? 'bg-red-800 hover:bg-red-700 text-white hover:scale-105 border border-red-500' 
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}
                    `}
                >
                    结束回合 (End Turn)
                </button>

                {/* Cards */}
                <div className="flex items-end justify-center gap-2 px-10 h-72 overflow-visible pb-4">
                    {hand.map((card, idx) => (
                        <div key={`${card.id}-${idx}`} className="transition-all hover:-translate-y-8 duration-200" style={{ transform: `rotate(${(idx - hand.length/2) * 3}deg) translateY(${Math.abs(idx - hand.length/2) * 5}px)` }}>
                            <Card 
                                data={card} 
                                playable={player.currentMp >= (card.cost + (player.statuses[StatusType.COST_UP] || 0)) && turn === 'PLAYER'}
                                disabled={turn !== 'PLAYER'}
                                onClick={() => playCard(card, idx)}
                            />
                        </div>
                    ))}
                </div>
                <div className="text-center text-slate-600 text-[10px] uppercase tracking-[0.2em] mt-2">
                    Draw Pile: {drawPile.length} // Discard Pile: {discardPile.length}
                </div>
            </div>
        </div>
      );
  };

  const renderYearEndBonus = () => {
    // Reusing previous logic but simplified for new structure
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="text-center">
                <h1 className="text-6xl font-serif text-red-600 mb-8">GAME OVER</h1>
                <p className="text-2xl mb-8">最终评价: {runStats.bossesKilled >= 4 ? '职场胜佛' : '被优化'}</p>
                <button onClick={() => setScreen(GameScreen.MENU)} className="border border-white px-8 py-4 hover:bg-white hover:text-black transition-colors">NEW GAME</button>
            </div>
        </div>
    )
  }

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-900 selection:text-white">
      {screen === GameScreen.MENU && renderMainMenu()}
      {screen === GameScreen.STORY && renderStory()}
      {screen === GameScreen.BATTLE && renderBattle()}
      {screen === GameScreen.YEAR_END_BONUS && renderYearEndBonus()}
    </div>
  );
}