
import { GoogleGenAI, Type } from "@google/genai";
import type { GameLogEntry, CharacterStats, GeminiResponse, PlayerUpdate } from '../types';

const model = "gemini-3-flash-preview";

const systemInstruction = `
Você é um Assistente de Mestre de Jogo (GM) para um RPG de texto no universo de One Piece. Sua função é colaborar com um GM humano para criar uma história épica para um grupo de jogadores.

**REGRAS DE COLABORAÇÃO:**

1.  **O GM Humano é a Autoridade Máxima:** O GM humano fornecerá diretrizes, comandos e decisões de enredo através de um "Comando do Mestre". Sua principal tarefa é pegar esses comandos e transformá-los em uma narrativa rica e detalhada para os jogadores.
2.  **Narrador do Mundo:** Você é responsável por descrever o mundo, os NPCs, os ambientes e os resultados das ações. Seja criativo e use o vasto conhecimento de One Piece para dar vida à história.
3.  **Gerenciamento de Múltiplos Jogadores:** A entrada conterá o estado de TODOS os jogadores. Suas respostas devem refletir isso, atualizando os status de múltiplos jogadores se necessário (ex: um ataque em área, uma recompensa para o grupo).
4.  **Autonomia Criativa (com Limites):** Se o GM humano não der um comando específico, você deve continuar a história com base na ação do jogador ativo, mantendo o fluxo do jogo. No entanto, sempre priorize a direção do GM humano quando ela for dada.
5.  **Gerenciamento de Inventário:** Os jogadores podem encontrar itens. Adicione-os à lista 'inventory' do jogador correspondente.
6.  **Ativação Visual de Haki:** QUANDO um personagem usar Haki de forma proeminente na narrativa (seja em combate ou para uma ação), você DEVE preencher o campo 'hakiActivation' com o ID do jogador e o tipo de Haki ('Armamento', 'Observação', 'Conquistador'). Isso acionará um efeito visual no jogo. Descreva o Haki na narrativa de forma épica. Ex: "Zoro envolve seus punhos em uma aura escura de Haki do Armamento."
7.  **Formato da Resposta:** Sua resposta DEVE SER SEMPRE um único objeto JSON válido que adere ao esquema fornecido.

**SISTEMAS DE JOGO (Sua responsabilidade de narrar e aplicar):**
*   **Akuma no Mi & Haki:** Siga as regras estabelecidas pelo GM humano. Quando ele decidir que um jogador encontra uma fruta ou desperta Haki, você deve descrever o momento e aplicar as mudanças de status. O uso de habilidades consome 'energia'.
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        narrative: { type: Type.STRING, description: "Sua narração da história para este turno." },
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
            description: "Uma lista de atualizações para um ou mais jogadores."
        },
        choices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Uma lista de 3 ações sugeridas para o jogador ativo."
        },
        gameOver: { type: Type.BOOLEAN, description: "Defina como true se o jogo inteiro chegou a um final definitivo." },
        hakiActivation: {
            type: Type.OBJECT,
            description: "Preencha este campo se um jogador usar Haki de forma proeminente para acionar um efeito visual.",
            properties: {
                playerId: { type: Type.STRING },
                hakiType: { type: Type.STRING, enum: ["Armamento", "Observação", "Conquistador"] }
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
    
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set");
        return {
            narrative: "ERRO CRÍTICO: A chave da API do Mestre de Jogo (Gemini) não foi encontrada. O aplicativo não pode se conectar à IA. O GM humano precisa configurar a variável de ambiente API_KEY no ambiente de deploy para que o jogo possa funcionar.",
            playerUpdates: [],
            choices: [],
            gameOver: false,
        };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const playerStates = players.map(p => `
- ID: ${p.id}
  Nome: ${p.name}
  HP: ${p.hp}/${p.maxHp}
  Recompensa: ${p.bounty}
  Akuma no Mi: ${p.devilFruit}
  Haki: ${p.haki.join(', ') || 'Nenhum'}
  Localização: ${p.location}
  Inventário: [${p.inventory.join(', ')}]
    `).join('');

    const lastPlayerAction = [...history].reverse().find(entry => entry.type === 'player');

    const prompt = `
    **Diretriz do Mestre do Jogo para este turno:** ${gmDirective || "Nenhuma. Continue a história com base na ação do jogador."}

    **Estado de Todos os Jogadores:**
    ${playerStates}

    **Jogador Ativo:** ${activePlayer.name} (ID: ${activePlayer.id})
    **Última Ação do Jogador Ativo:** ${lastPlayerAction?.text || "Nenhuma (início do turno)."}

    **Histórico Recente:**
    ${history.slice(-5).map(entry => `${entry.type === 'gm' ? 'Narrador' : (entry.playerName || 'Mestre')}: ${entry.text}`).join('\n')}

    Com base na diretriz do Mestre, no estado dos jogadores e na última ação do jogador ativo, gere o próximo turno da história. Lembre-se de popular 'hakiActivation' se um Haki for usado visualmente.
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
            narrative: "Uma tempestade repentina lançou o mundo no caos! A conexão com a história foi perdida. Por favor, tente sua ação novamente.",
            playerUpdates: [],
            choices: ["Esperar a tempestade passar", "Verificar o navio por danos", "Olhar o mapa"],
            gameOver: false
        };
    }
};
