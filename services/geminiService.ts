import { GoogleGenAI } from "@google/genai";
import { Player } from "../types";

// Fallback insults if API is not available or fails
const FALLBACK_TAUNTS = [
    "这个需求很简单，怎么还没做完？",
    "这就是你的代码？我看像是乱码。",
    "今晚通宵一下，明天上线。",
    "不仅要五彩斑斓的黑，还要流动的白。",
    "我看你这个态度很有问题。",
    "年轻人要多吃苦，不要老想着钱。"
];

export async function generateBossTaunt(player: Player, bossName: string): Promise<string> {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        // Fallback for demo environment without key
        return FALLBACK_TAUNTS[Math.floor(Math.random() * FALLBACK_TAUNTS.length)];
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        const prompt = `
        你正在扮演一个邪恶的“${bossName}”（Roguelike游戏中的Boss）。
        玩家目前的职业是“${player.classType}”。
        玩家剩余生命值：${player.currentHp}/${player.maxHp}。
        玩家剩余护甲：${player.shield}。
        
        请生成一句简短（20字以内）、刻薄、充满职场黑话和压迫感的嘲讽台词。
        风格要求：高高在上，讽刺，不仅攻击玩家的战斗能力，还要攻击玩家的职业尊严。
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Using a fast model for game responsiveness
            contents: prompt,
            config: {
                maxOutputTokens: 50,
                temperature: 1.0, 
            }
        });

        return response.text?.trim() || FALLBACK_TAUNTS[0];

    } catch (error) {
        console.error("Gemini API Taunt Generation failed:", error);
        return FALLBACK_TAUNTS[Math.floor(Math.random() * FALLBACK_TAUNTS.length)];
    }
}
