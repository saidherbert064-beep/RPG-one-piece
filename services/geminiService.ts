
import { GoogleGenAI, Type } from "@google/genai";
import type { GameLogEntry, CharacterStats, GeminiResponse, PlayerUpdate } from '../types';

const model = "gemini-3-flash-preview";

const systemInstruction = `
VocÃª Ã© um Assistente de Mestre de Jogo (GM) para um RPG de texto no universo de One Piece. Sua funÃ§Ã£o Ã© colaborar com um GM humano para criar uma histÃ³ria Ã©pica para um grupo de jogadores.

**REGRAS DE COLABORAÃÃO:**

1.  **O GM Humano Ã© a Autoridade MÃ¡xima:** O GM humano fornecerÃ¡ diretrizes, comandos e decisÃµes de enredo atravÃ©s de um "Comando do Mestre". Sua principal tarefa Ã© pegar esses comandos e transformÃ¡-los em uma narrativa rica e detalhada para os jogadores.
2.  **Narrador do Mundo:** VocÃª Ã© responsÃ¡vel por descrever o mundo, os NPCs, os ambientes e os resultados das aÃ§Ãµes. Seja criativo e use o vasto conhecimento de One Piece para dar vida Ã  histÃ³ria.
3.  **Gerenciamento de MÃºltiplos Jogadores:** A entrada conterÃ¡ o estado de TODOS os jogadores. Suas respostas devem refletir isso, atualizando os status de mÃºltiplos jogadores se necessÃ¡rio (ex: um ataque em Ã¡rea, uma recompensa para o grupo).
4.  **Autonomia Criativa (com Limites):** Se o GM humano nÃ£o der um comando especÃ­fico, vocÃª deve continuar a histÃ³ria com base na aÃ§Ã£o do jogador ativo, mantendo o fluxo do jogo. No entanto, sempre priorize a direÃ§Ã£o do GM humano quando ela for dada.
5.  **Gerenciamento de InventÃ¡rio:** Os jogadores podem encontrar itens. Adicione-os Ã  lista 'inventory' do jogador correspondente.
6.  **AtivaÃ§Ã£o Visual de Haki:** QUANDO um personagem usar Haki de forma proeminente na narrativa (seja em combate ou para uma aÃ§Ã£o), vocÃª DEVE preencher o campo 'hakiActivation' com o ID do jogador e o tipo de Haki ('Armamento', 'ObservaÃ§Ã£o', 'Conquistador'). Isso acionarÃ¡ um efeito visual no jogo. Descreva o Haki na narrativa de forma Ã©pica. Ex: "Zoro envolve seus punhos em uma aura escura de Haki do Armamento."
7.  **Formato da Resposta:** Sua resposta DEVE SER SEMPRE um Ãºnico objeto JSON vÃ¡lido que adere ao esquema fornecido.

**SISTEMAS DE JOGO (Sua responsabilidade de narrar e aplicar):**
*   **Akuma no Mi & Haki:** Siga as regras estabelecidas pelo GM humano. Quando ele decidir que um jogador encontra uma fruta ou desperta Haki, vocÃª deve descrever o momento e aplicar as mudanÃ§as de status. O uso de habilidades consome 'energia'.
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        narrative: { type: Type.STRING, description: "Sua narraÃ§Ã£o da histÃ³ria para este turno." },
        playerUpdates: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    playerId: { type: Type.STRING },
                    stats: {
                        type: Type.OBJECT,
                        properties: {
                            hp: { type: Type.NUMBER },
                            bounty: { type: Type.NUMBER },
                            energy: { type: Type.NUMBER },
                            devilFruit: { type: Type.STRING },
                            haki: { type: Type.ARRAY, items: { type: Type.STRING } },
                            location: { type: Type.STRING },
                            inventory: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            },
            description: "Uma lista de atualizaÃ§Ãµes para um ou mais jogadores."
        },
        choices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Uma lista de 3 aÃ§Ãµes sugeridas para o jogador ativo."
        },
        gameOver: { type: Type.BOOLEAN, description: "Defina como true se o jogo inteiro chegou a um final definitivo." },
        hakiActivation: {
            type: Type.OBJECT,
            description: "Preencha este campo se um jogador usar Haki de forma proeminente para acionar um efeito visual.",
            properties: {
                playerId: { type: Type.STRING },
                hakiType: { type: Type.STRING, enum: ["Armamento", "ObservaÃ§Ã£o", "Conquistador"] }
            }
        }
    },
    required: ["narrative", "playerUpdates", "choices", "gameOver"]
};

export const getNextTurn = async (
    gmDirective: string,
    players: CharacterStats[],
    activePlayer: CharacterStats,
    history: GameLogEntry[]
): Promise<GeminiResponse> => {
    
    if (!process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT') {
        console.error("API_KEY environment variable not set");
        return {
            narrative: "ERRO CRÃTICO: A chave da API do Mestre de Jogo (Gemini) nÃ£o foi encontrada. O aplicativo nÃ£o pode se conectar Ã  IA. O GM humano precisa configurar a variÃ¡vel de ambiente API_KEY no ambiente de deploy para que o jogo possa funcionar.",
            playerUpdates: [],
            choices: [],
            gameOver: false,
        };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

    const playerStates = players.map(p => `
- ID: ${p.id}
  Nome: ${p.name}
  HP: ${p.hp}/${p.maxHp}
  Recompensa: ${p.bounty}
  Akuma no Mi: ${p.devilFruit}
  Haki: ${p.haki.join(', ') || 'Nenhum'}
  LocalizaÃ§Ã£o: ${p.location}
  InventÃ¡rio: [${p.inventory.join(', ')}]
    `).join('');

    const lastPlayerAction = [...history].reverse().find(entry => entry.type === 'player');

    const prompt = `
    **Diretriz do Mestre do Jogo para este turno:** ${gmDirective || "Nenhuma. Continue a histÃ³ria com base na aÃ§Ã£o do jogador."}

    **Estado de Todos os Jogadores:**
    ${playerStates}

    **Jogador Ativo:** ${activePlayer.name} (ID: ${activePlayer.id})
    **Ãltima AÃ§Ã£o do Jogador Ativo:** ${lastPlayerAction?.text || "Nenhuma (inÃ­cio do turno)."}

    **HistÃ³rico Recente:**
    ${history.slice(-5).map(entry => `${entry.type === 'gm' ? 'Narrador' : (entry.playerName || 'Mestre')}: ${entry.text}`).join('\n')}

    Com base na diretriz do Mestre, no estado dos jogadores e na Ãºltima aÃ§Ã£o do jogador ativo, gere o prÃ³ximo turno da histÃ³ria. Lembre-se de popular 'hakiActivation' se um Haki for usado visualmente.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
                topP: 0.9,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse: GeminiResponse = JSON.parse(jsonText);
        return parsedResponse;

    } catch (error) {
        console.error("Error generating content from Gemini:", error);
        return {
            narrative: "Uma tempestade repentina lanÃ§ou o mundo no caos! A conexÃ£o com a histÃ³ria foi perdida. Por favor, tente sua aÃ§Ã£o novamente.",
            playerUpdates: [],
            choices: ["Esperar a tempestade passar", "Verificar o navio por danos", "Olhar o mapa"],
            gameOver: false
        };
    }
};
