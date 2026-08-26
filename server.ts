import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Endpoint de Saúde
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Endpoint do Smart IA - Assistente Virtual Especialista em Vidraçaria
  app.post('/api/smart-ia', async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({
          error: 'Mensagem não fornecida ou inválida.',
        });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Se a chave não estiver configurada no ambiente, o backend retorna resposta inteligente do motor local
        res.json({
          reply: getFallbackAnswer(message),
          source: 'local-knowledge',
        });
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `Você é o "Smart IA", uma inteligência artificial completa, versátil e poderosa (semelhante ao ChatGPT), integrada ao sistema ERP Smart Vidros.

SUAS CAPACIDADES:
1. PESQUISA & CONHECIMENTO UNIVERSAL (ESTILO CHATGPT):
   - Você pode responder a QUALQUER pergunta sobre QUALQUER assunto: ciência, negócios, marketing, redação de mensagens e e-mails para clientes, cálculos matemáticos, tecnologia, dúvidas do dia a dia, receitas, finanças, dicas comerciais, oratória, etc.
   - Seja conversacional, fluente, inteligente, amigável e extremamente prestativo.

2. ESPECIALISTA MÁXIMO EM VIDRAÇARIAS & ESQUADRIAS:
   - Se o usuário perguntar sobre vidros, cálculo de m², box de banheiro (NBR 14207), vidros temperados/laminados (NBR 7199), esquadrias de alumínio (Linha Suprema/Gold/25), kits de ferragens, folgas de têmpera e orçamentos, forneça respostas com precisão cirúrgica e exemplos práticos.

3. GUIA COMPLETO DO ERP SMART VIDROS:
   - Auxiliar no uso de todos os módulos: Orçamentos, PDV, Contratos com assinatura na tela, Recibos em PDF A4, Fechamento de Caixa, Lançamento por voz e Sincronização em nuvem via Supabase.

ESTILO DE RESPOSTA (BATE-PAPO FLUIDO):
- Responda como em um bate-papo moderno: claro, organizado, objetivo e fácil de ler no celular e no computador.
- Use markdown rico quando apropriado (negrito, listas com marcadores, fórmulas e blocos destacados).
- Adapte-se ao tom do usuário: se ele mandar uma mensagem curta ou informal, responda de forma natural e direta. Se pedir um cálculo ou plano detalhado, estruture passo a passo.`;

      // Montar contexto e chamada
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          ...(Array.isArray(history)
            ? history.slice(-6).map((h: any) => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.text || h.content || '' }],
              }))
            : []),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'Desculpe, não consegui processar sua dúvida no momento. Pode tentar novamente?';
      res.json({ reply: replyText, source: 'gemini-api' });
    } catch (err: any) {
      console.error('[Smart IA] Erro ao chamar Gemini API, usando base local:', err);
      // Fallback gracioso para nunca deixar o usuário sem resposta
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

// Base de conhecimento local especializada para contingência offline
function getFallbackAnswer(query: string): string {
  const q = query.toLowerCase().trim();

  if (q.includes('m2') || q.includes('metro quadrado') || q.includes('calcular') || q.includes('calculo') || q.includes('formula')) {
    return `📐 **Como Calcular Metro Quadrado (m²) de Vidro:**\n\n1. **Fórmula Básica:**\n   *Área (m²) = Largura (m) × Altura (m)*\n\n2. **Exemplo Prático (Janela de 120cm × 100cm):**\n   *1,20m × 1,00m = 1,20 m²*\n\n3. **Cálculo de Preço:**\n   *Preço Total = Área (m²) × Valor do m² + Ferragens + Instalação*\n\n💡 *Dica Smart Vidros:* No menu **Novo Orçamento** do sistema, basta informar a largura e a altura em centímetros ou metros que o sistema calcula automaticamente a área e o valor com as ferragens selecionadas!`;
  }

  if (q.includes('box') || q.includes('banheiro')) {
    return `🚿 **Dúvidas sobre Box de Banheiro (ABNT NBR 14207):**\n\n* **Vidro Padrão:** Vidro Temperado de 8mm (Incolor, Verde, Fumê, Bronze ou Pontilhado).\n* **Altura Padrão:** Normalmente 1,90m de vão.\n* **Tipos de Box no Sistema:**\n  1. **Box Frontal (F1):** 1 folha fixa + 1 folha de correr.\n  2. **Box de Canto (F2):** 2 folhas fixas + 2 portas de correr em 90°.\n  3. **Box Pivotante / Abrir:** 1 porta com dobradiças.\n\nVocê pode lançar o Box direto no módulo **Orçamentos** ou no **PDV** escolhendo o modelo pré-configurado!`;
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

  return `Olá! Sou o **Smart IA**, seu assistente especializado do ERP Smart Vidros. 🤖✨\n\nPosso te ajudar com:\n* 📐 **Fórmulas de Cálculo de Vidros & Esquadrias (m², folgas, têmpera)**\n* 📋 **Como emitir Orçamentos e Vendas no PDV**\n* ✍️ **Geração de Contratos com Assinatura Digital e Recibos**\n* 💵 **Fechamento de Caixa, Lançamentos por Voz e Contas a Receber**\n* 👥 **Cadastro de Clientes e Vitrine Pública**\n\nComo posso te ajudar hoje?`;
}

startServer().catch((err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});
