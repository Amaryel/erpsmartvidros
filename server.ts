import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Endpoint de Saúde
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Endpoint do Smart IA - Assistente Virtual Completo com Pesquisa na Internet & Vidraçaria
  app.post('/api/smart-ia', async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({
          error: 'Mensagem não fornecida ou inválida.',
        });
        return;
      }

      const ai = getGemini();
      if (!ai) {
        // Se a chave não estiver configurada no ambiente, o backend responde usando o motor de cálculo e conhecimento local
        res.json({
          reply: getFallbackAnswer(message),
          source: 'local-knowledge',
        });
        return;
      }

      const systemInstruction = `Você é o "Smart IA", uma inteligência artificial completa, versátil, ágil e altamente inteligente (estilo ChatGPT/Gemini com acesso à internet em tempo real via Google Search), integrada ao sistema ERP Smart Vidros.
 
SUAS DIRETRIZES FUNDAMENTAIS:
1. RESPOSTA UNIVERSAL A QUALQUER TÓPICO OU PERGUNTA (SEM RESTRIÇÕES DE ASSUNTO):
   - Você DEVE responder a TODA E QUALQUER pergunta enviada pelo usuário, seja ela:
     * Matemática, física, finanças, cálculos de porcentagem, regras de três, margem de lucro e markup.
     * Pesquisas gerais na web em tempo real (notícias, cotações, artigos, curiosidades, história, geografia, tecnologia).
     * Redação de mensagens, oratórias, e-mails de vendas, termos de acordo, cobranças elegantes e textos para WhatsApp.
     * Dicas de vendas, atendimento ao cliente, gestão de empresas, marketing e produtividade.
     * Conhecimentos de vidraçaria, esquadrias de alumínio (Suprema, Gold, Linha 25), normas ABNT (NBR 14207, NBR 7199, NBR 10821), kits de ferragens e cálculo de m² com folgas.
     * Dúvidas gerais de culinária, saúde, programação, idiomas, viagens, etc.
   - NUNCA diga apenas "sou uma IA de vidraçaria e não posso responder isso". Você é uma IA de propósito geral e especialista. Responda diretamente ao que o usuário pediu com máxima qualidade e precisão.

2. CLAREZA E FORMATO PRONTO PARA COPIAR:
   - Apresente as respostas com excelente estruturação em Markdown (títulos, negrito, listas com marcadores e destaques).
   - Quando o usuário pedir um texto, mensagem de WhatsApp ou contrato, entregue o texto pronto e destacado para que ele possa copiar e usar imediatamente com 1 clique.
   - Seja cordial, direto, objetivo e profissional.`;

      // Montar histórico e chamada ao modelo com ferramentas de pesquisa na internet (googleSearch)
      const contentsPayload: any[] = [];

      if (Array.isArray(history)) {
        for (const h of history.slice(-8)) {
          if (h && (h.text || h.content)) {
            contentsPayload.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: String(h.text || h.content || '') }],
            });
          }
        }
      }

      contentsPayload.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: contentsPayload,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        },
      });

      let replyText = response.text || '';

      // Adicionar fontes consultadas na web se disponíveis
      const chunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks;
      if (chunks && Array.isArray(chunks) && chunks.length > 0) {
        const sources = chunks
          .map((c: any) => c.web)
          .filter((w: any) => w && w.uri && w.title)
          .slice(0, 3);
        if (sources.length > 0) {
          replyText += '\n\n**🌐 Fontes consultadas na Web:**\n' + sources.map((s: any) => `* [${s.title}](${s.uri})`).join('\n');
        }
      }

      if (!replyText.trim()) {
        replyText = getFallbackAnswer(message);
      }

      res.json({ reply: replyText, source: 'gemini-api' });
    } catch (err: any) {
      console.error('[Smart IA] Erro na chamada Gemini API, acionando resolvedor local:', err);
      const userMsg = req.body?.message || '';
      res.json({
        reply: getFallbackAnswer(userMsg),
        source: 'local-fallback',
      });
    }
  });

  // Vite middleware em desenvolvimento ou servir arquivos em produção
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Vidros ERP Server] Rodando com sucesso na porta ${PORT}`);
  });
}

// Resolvedor matemático inteligente e base de contingência local
function trySolveMath(query: string): string | null {
  try {
    const clean = query
      .toLowerCase()
      .replace(/quanto\s+(é|e|da|dá)/g, '')
      .replace(/qual\s+o\s+resultado\s+de/g, '')
      .replace(/resultado\s+de/g, '')
      .replace(/calcule/g, '')
      .replace(/calcular/g, '')
      .replace(/x/g, '*')
      .replace(/,/g, '.')
      .trim();

    // Verificação de porcentagem: "10% de 250" ou "20% * 100"
    const percentMatch = clean.match(/(\d+(?:\.\d+)?)\s*%\s*(?:de|\*)\s*(\d+(?:\.\d+)?)/);
    if (percentMatch) {
      const p = parseFloat(percentMatch[1]);
      const v = parseFloat(percentMatch[2]);
      const res = (p / 100) * v;
      return `🔢 **Resultado:**\n\n**${p}% de ${v} = ${res.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}**`;
    }

    // Verificação de expressão matemática padrão (ex: 10*25, (100+50)/3)
    if (/^[0-9\.\s\+\-\*\/\(\)]+$/.test(clean) && /[0-9]/.test(clean) && /[\+\-\*\/]/.test(clean)) {
      const sanitized = clean.replace(/[^0-9\.\+\-\*\/\(\)\s]/g, '');
      const calcResult = Function(`"use strict"; return (${sanitized})`)();
      if (typeof calcResult === 'number' && !isNaN(calcResult) && isFinite(calcResult)) {
        return `🔢 **Resultado:**\n\n**${query.trim()} = ${calcResult.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}**`;
      }
    }
  } catch (e) {
    // ignora erros de sintaxe matemática
  }
  return null;
}

// Base de conhecimento local e contingência
function getFallbackAnswer(query: string): string {
  const mathAnswer = trySolveMath(query);
  if (mathAnswer) {
    return mathAnswer;
  }

  const q = query.toLowerCase().trim();

  if (q.includes('m2') || q.includes('metro quadrado') || q.includes('calcular') || q.includes('calculo') || q.includes('formula')) {
    return `📐 **Como Calcular Metro Quadrado (m²) de Vidro:**\n\n1. **Fórmula Básica:**\n   *Área (m²) = Largura (m) × Altura (m)*\n\n2. **Exemplo Prático (Janela de 120cm × 100cm):**\n   *1,20m × 1,00m = 1,20 m²*\n\n3. **Cálculo de Preço:**\n   *Preço Total = Área (m²) × Valor do m² + Ferragens + Instalação*\n\n💡 *Dica Smart Vidros:* No menu **Novo Orçamento** do sistema, basta informar a largura e a altura em centímetros ou metros que o sistema calcula automaticamente a área e o valor com as ferragens selecionadas!`;
  }

  if (q.includes('box') || q.includes('banheiro')) {
    return `🚿 **Dúvidas sobre Box de Banheiro (ABNT NBR 14207):**\n\n* **Vidro Padrão:** Vidro Temperado de 8mm (Incolor, Verde, Fumê, Bronze ou Pontilhado).\n* **Altura Padrão:** Normalmente 1,90m de vão.\n* **Tipos de Box no Sistema:**\n  1. **Box Frontal (F1):** 1 folha fixa + 1 folha de correr.\n  2. **Box de Canto (F2):** 2 folhas fixas + 2 portas de correr em 90°.\n  3. **Box Pivotante / Abrir:** 1 porta com dobradiças.\n\nVocê pode lançar o Box direto no módulo **Orçamentos** ou no **PDV** escolhendo o modelo pré-configurado!`;
  }

  if (q.includes('mensagem') || q.includes('whatsapp') || q.includes('cliente')) {
    return `💬 **Modelo de Mensagem Profissional para WhatsApp:**\n\n"Olá, tudo bem? Aqui é da vidraçaria Smart Vidros! Passando para te avisar que o seu orçamento para a instalação dos vidros/esquadrias já está pronto e com condições especiais de pagamento. Posso te enviar os detalhes ou agendamos a data para iniciar a sua obra?" 📋✨\n\n💡 *Você pode personalizar o nome do cliente e a forma de pagamento antes de enviar!*`;
  }

  if (q.includes('contrato') || q.includes('termo') || q.includes('assinar')) {
    return `📄 **Como Gerar e Assinar Contratos no ERP Smart Vidros:**\n\n1. Acesse o menu **Comercial > Contratos** ou abra uma Venda/Orçamento.\n2. Clique em **"Gerar Contrato"**.\n3. O sistema preenche automaticamente os dados do cliente, itens da obra, prazos e forma de pagamento com cláusulas jurídicas completas.\n4. **Assinatura Digital:** Você e seu cliente podem assinar direto na tela do celular, tablet ou com o mouse!\n5. Clique em **"Imprimir / Salvar PDF"** para gerar um documento A4 profissional.`;
  }

  if (q.includes('caixa') || q.includes('fechamento') || q.includes('abrir caixa') || q.includes('audio') || q.includes('voz')) {
    return `💰 **Gestão de Caixa & Lançamentos Financeiros:**\n\n* **Abertura:** No menu **Financeiro > Caixa Diário**, inicie a sessão informando o fundo de troco.\n* **Lançamento por Áudio:** Clique no ícone de microfone e fale: *"Recebi 350 reais em dinheiro do cliente João"* ou *"Gastei 50 reais de combustível"*, e o sistema transcreve e categoriza automaticamente!\n* **Fechamento:** Ao final do dia, clique em **Fechar Caixa** para gerar o balanço consolidado de entradas, saídas e formas de pagamento.`;
  }

  if (q.includes('supabase') || q.includes('nuvem') || q.includes('sincroniz') || q.includes('banco')) {
    return `☁️ **Sincronização com o Supabase:**\n\n* As credenciais do seu Supabase estão fixadas nativamente no sistema.\n* Todas as criações e alterações (orçamentos, clientes, vendas, caixa) são sincronizadas **automaticamente em tempo real na nuvem**.\n* Seus dados ficam salvos de forma segura e acessíveis de qualquer computador, tablet ou celular em qualquer lugar!`;
  }

  return `Olá! Sou o **Smart IA**, seu assistente com inteligência artificial completa integrada ao sistema ERP Smart Vidros. 🤖✨\n\nPosso te ajudar com:\n* 🌐 **Pesquisas e Dúvidas Gerais (Google & Web em tempo real)**\n* 📐 **Fórmulas de Cálculo de Vidros & Esquadrias (m², folgas, têmpera)**\n* 💬 **Redação de Mensagens e E-mails Comerciais**\n* 📋 **Como emitir Orçamentos e Vendas no PDV**\n* ✍️ **Geração de Contratos com Assinatura Digital e Recibos**\n* 💵 **Fechamento de Caixa, Lançamentos por Voz e Contas a Receber**\n\nEm que posso te ajudar hoje?`;
}

startServer().catch((err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});
