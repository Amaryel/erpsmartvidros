import React from 'react';
import { QuoteItem, TechnicalCategory } from '../types';

export interface TechnicalModelDefinition {
  id: string;
  label: string;
  category: TechnicalCategory;
  description: string;
  defaultOpening?: string;
  defaultLeaves?: string;
}

export const TECHNICAL_MODELS: TechnicalModelDefinition[] = [
  // --- BOX DE BANHEIRO ---
  {
    id: 'box_frontal_2f',
    label: 'Box Frontal 2 Folhas (1F + 1M)',
    category: 'box',
    description: 'Box de correr padrão com 1 folha fixa e 1 folha móvel',
    defaultOpening: 'De Correr (Slide)',
    defaultLeaves: '2 Folhas (1F+1M)',
  },
  {
    id: 'box_canto_l',
    label: 'Box de Canto em L (4 Folhas)',
    category: 'box',
    description: 'Box angular em L com 2 folhas fixas e 2 móveis de canto',
    defaultOpening: 'De Canto / Correr',
    defaultLeaves: '4 Folhas (2F+2M)',
  },
  {
    id: 'box_elegance',
    label: 'Box Elegance (Roldanas Aparentes Inox)',
    category: 'box',
    description: 'Box com tubo redondo e roldanas de alta tecnologia expostas',
    defaultOpening: 'De Correr Roldana Aparente',
    defaultLeaves: '2 Folhas (1F+1M)',
  },
  {
    id: 'box_frontal_3f',
    label: 'Box Frontal 3 Folhas (Versatik / 2F+1M)',
    category: 'box',
    description: 'Box frontal com maior vão de passagem para banheiros compactos',
    defaultOpening: 'De Correr (Versatik)',
    defaultLeaves: '3 Folhas (2F+1M)',
  },
  {
    id: 'box_frontal_4f',
    label: 'Box Frontal 4 Folhas (2F + 2M Central)',
    category: 'box',
    description: 'Box amplo com 2 fixos nas pontas e abertura no centro',
    defaultOpening: 'De Correr Central',
    defaultLeaves: '4 Folhas (2F+2M)',
  },
  {
    id: 'box_abrir',
    label: 'Box de Abrir / Giro (1 Folha)',
    category: 'box',
    description: 'Box com dobradiças ou pivôs de abrir para banheiros pequenos',
    defaultOpening: 'De Abrir (Giro)',
    defaultLeaves: '1 Folha',
  },
  {
    id: 'box_fixo_walkin',
    label: 'Box Fixo / Walk-In (Painel Reto)',
    category: 'box',
    description: 'Painel de vidro temperado fixo sem porta com braço estabilizador',
    defaultOpening: 'Fixo',
    defaultLeaves: '1 Folha Fixo',
  },
  {
    id: 'box_sanfonado',
    label: 'Box Sanfonado / Articulado (Camarão)',
    category: 'box',
    description: 'Folhas articuladas que dobram sobre si para 90% de vão livre',
    defaultOpening: 'Articulada / Camarão',
    defaultLeaves: '2 Folhas Articuladas',
  },

  // --- PORTAS DE VIDRO & ALUMÍNIO ---
  {
    id: 'porta_correr_2f',
    label: 'Porta de Correr 2 Folhas (1F + 1M)',
    category: 'porta',
    description: 'Porta de correr com 1 folha fixa e 1 móvel',
    defaultOpening: 'De Correr',
    defaultLeaves: '2 Folhas (1F+1M)',
  },
  {
    id: 'porta_correr_4f',
    label: 'Porta de Correr 4 Folhas (2F + 2M Central)',
    category: 'porta',
    description: 'Porta com 2 folhas fixas laterais e 2 móveis com abertura central',
    defaultOpening: 'De Correr Central',
    defaultLeaves: '4 Folhas (2F+2M)',
  },
  {
    id: 'porta_correr_3f',
    label: 'Porta 3 Folhas (Versatik / 3 Móveis)',
    category: 'porta',
    description: 'Porta de correr telescópica com trilho triplo e recolhimento lateral',
    defaultOpening: 'De Correr (Versatik)',
    defaultLeaves: '3 Folhas Móveis',
  },
  {
    id: 'porta_correr_6f',
    label: 'Porta de Correr 6 Folhas (4F + 2M)',
    category: 'porta',
    description: 'Porta ampla para grandes vãos com 6 painéis',
    defaultOpening: 'De Correr Central',
    defaultLeaves: '6 Folhas (4F+2M)',
  },
  {
    id: 'porta_pivotante',
    label: 'Porta Pivotante com Puxador Inox',
    category: 'porta',
    description: 'Porta nobre de entrada giratória em eixo vertical',
    defaultOpening: 'Pivotante',
    defaultLeaves: '1 Folha Pivotante',
  },
  {
    id: 'porta_abrir',
    label: 'Porta de Abrir / Giro Tradicional',
    category: 'porta',
    description: 'Porta com dobradiças laterais, fechadura e maçaneta',
    defaultOpening: 'De Abrir (Giro)',
    defaultLeaves: '1 Folha',
  },
  {
    id: 'porta_camarao',
    label: 'Porta Articulada / Camarão (Bi-fold)',
    category: 'porta',
    description: 'Porta com folhas dobráveis articuladas para integração de ambientes',
    defaultOpening: 'Articulada / Camarão',
    defaultLeaves: '3 Folhas Articuladas',
  },
  {
    id: 'porta_automatica',
    label: 'Porta Deslizante Automática (Sensor)',
    category: 'porta',
    description: 'Porta comercial com cabeçote motorizado e sensor de presença',
    defaultOpening: 'Automática com Sensor',
    defaultLeaves: '2 Folhas (1F+1M)',
  },

  // --- JANELAS ---
  {
    id: 'janela_correr_2f',
    label: 'Janela de Correr 2 Folhas (1F + 1M)',
    category: 'janela',
    description: 'Janela tradicional com 1 folha fixa e 1 de correr',
    defaultOpening: 'De Correr',
    defaultLeaves: '2 Folhas (1F+1M)',
  },
  {
    id: 'janela_correr_4f',
    label: 'Janela de Correr 4 Folhas (2F + 2M)',
    category: 'janela',
    description: 'Janela com 2 fixos e 2 móveis com fecho central',
    defaultOpening: 'De Correr Central',
    defaultLeaves: '4 Folhas (2F+2M)',
  },
  {
    id: 'janela_maxim_ar',
    label: 'Janela Maxim-Ar (Projetante)',
    category: 'janela',
    description: 'Janela projetante com braços articulados de fricção e fecho inferior',
    defaultOpening: 'Maxim-Ar',
    defaultLeaves: '1 Folha',
  },
  {
    id: 'janela_basculante',
    label: 'Janela Basculante com Alavanca',
    category: 'janela',
    description: 'Janela com palhetas móveis acionadas por alavanca de comando',
    defaultOpening: 'Basculante',
    defaultLeaves: '1 Folha Basculante',
  },
  {
    id: 'janela_guilhotina',
    label: 'Janela Guilhotina (Correr Vertical)',
    category: 'janela',
    description: 'Janela com deslizamento vertical com contrapesos ou molas',
    defaultOpening: 'Guilhotina Vertical',
    defaultLeaves: '2 Folhas Verticais',
  },
  {
    id: 'janela_pivotante',
    label: 'Janela Pivotante',
    category: 'janela',
    description: 'Janela giratória com eixo vertical ou horizontal',
    defaultOpening: 'Pivotante',
    defaultLeaves: '1 Folha Pivotante',
  },
  {
    id: 'janela_fixa',
    label: 'Janela Fixa / Bandeira / Peitoril',
    category: 'janela',
    description: 'Quadro de alumínio fixo para iluminação natural e visual',
    defaultOpening: 'Fixo',
    defaultLeaves: '1 Folha Fixo',
  },

  // --- ESPELHOS ---
  {
    id: 'espelho_bisote',
    label: 'Espelho Bisotê (Chanfrado 25mm)',
    category: 'espelho',
    description: 'Espelho com lapidação chanfrada angular facetada de alto padrão',
    defaultOpening: 'Fixo na Parede',
    defaultLeaves: '1 Peça Bisotê',
  },
  {
    id: 'espelho_lapidado',
    label: 'Espelho Lapidado Reto',
    category: 'espelho',
    description: 'Espelho cristal com bordas retas lapidadas e polidas',
    defaultOpening: 'Fixo na Parede',
    defaultLeaves: '1 Peça Lapidada',
  },
  {
    id: 'espelho_redondo_led',
    label: 'Espelho Redondo / Oval com LED',
    category: 'espelho',
    description: 'Espelho circular com iluminação em fita de LED indireta e touch',
    defaultOpening: 'Fixo com LED',
    defaultLeaves: '1 Peça Redonda',
  },
  {
    id: 'espelho_camarim',
    label: 'Espelho Camarim / Iluminado',
    category: 'espelho',
    description: 'Espelho com moldura iluminada e lâmpadas frontais',
    defaultOpening: 'Fixo',
    defaultLeaves: '1 Peça Camarim',
  },

  // --- GUARDA-CORPOS & SACADAS ---
  {
    id: 'guarda_corpo_torres',
    label: 'Guarda-Corpo com Torres / Spigots Inox',
    category: 'guarda_corpo',
    description: 'Fixação de vidro laminado/temperado com torres no piso',
    defaultOpening: 'Fixo Estrutural',
    defaultLeaves: 'Vidro Laminado/Temperado',
  },
  {
    id: 'guarda_corpo_colunas',
    label: 'Guarda-Corpo com Colunas / Pontaletes',
    category: 'guarda_corpo',
    description: 'Guarda-corpo com montantes verticais e corrimão tubular',
    defaultOpening: 'Fixo Estrutural',
    defaultLeaves: 'Colunas + Vidros',
  },
  {
    id: 'guarda_corpo_infinity',
    label: 'Guarda-Corpo Perfil Infinity (Embutido)',
    category: 'guarda_corpo',
    description: 'Sistema minimalista sem colunas com perfil engastado no piso',
    defaultOpening: 'Fixo Embutido',
    defaultLeaves: 'Perfil Base Infinity',
  },
  {
    id: 'sacada_reiki',
    label: 'Envidraçamento de Sacada (Sistema Reiki)',
    category: 'guarda_corpo',
    description: 'Cortina de vidro panorâmica retrátil com recolhimento total',
    defaultOpening: 'Articulada / Retrátil (Reiki)',
    defaultLeaves: 'Multi-Folhas Retráteis',
  },

  // --- COBERTURAS & CLARABOIAS ---
  {
    id: 'cobertura_pergolado',
    label: 'Cobertura / Pergolado de Vidro com Caixilhos',
    category: 'cobertura',
    description: 'Teto de vidro estruturado em vigas de alumínio com caimento e calha',
    defaultOpening: 'Fixo de Cobertura',
    defaultLeaves: 'Painéis Modulares',
  },
  {
    id: 'claraboia',
    label: 'Claraboia / Domo de Vidro',
    category: 'cobertura',
    description: 'Abertura zenital em telhado para entrada direta de luz',
    defaultOpening: 'Zenital Fixo',
    defaultLeaves: '1 Painel Inclinado',
  },

  // --- DIVISÓRIAS & FACHADAS ---
  {
    id: 'divisoria_escritorio',
    label: 'Divisória de Vidro com Perfis',
    category: 'divisoria',
    description: 'Parede divisória modular piso-teto com montantes de alumínio',
    defaultOpening: 'Divisória com Perfis',
    defaultLeaves: 'Módulos Fixos',
  },
  {
    id: 'fachada_pele_vidro',
    label: 'Fachada Pele de Vidro / Glazing / Spider',
    category: 'fachada',
    description: 'Fachada cortina estrutural com fixação oculta ou aranhas de inox',
    defaultOpening: 'Fachada Estrutural',
    defaultLeaves: 'Grid Modular',
  },

  // --- FECHAMENTO DE PIA & BALCÕES ---
  {
    id: 'fechamento_pia',
    label: 'Fechamento de Pia / Balcão (Correr 2F)',
    category: 'fechamento_pia',
    description: 'Fechamento de armário de pia/churrasqueira com vidros de correr',
    defaultOpening: 'De Correr',
    defaultLeaves: '2 Folhas (1F+1M)',
  },

  // --- TAMPOS DE MESA & PRATELEIRAS ---
  {
    id: 'tampo_mesa_retangular',
    label: 'Tampo de Mesa Retangular / Quadrado',
    category: 'tampo',
    description: 'Tampo de vidro temperado espesso com cantos polidos e lapidados',
    defaultOpening: 'Tampo de Apoio',
    defaultLeaves: '1 Peça Monolítica',
  },
  {
    id: 'tampo_mesa_redondo',
    label: 'Tampo de Mesa Redondo / Oval',
    category: 'tampo',
    description: 'Tampo de vidro circular com lapidação fina em bisotê ou redondo',
    defaultOpening: 'Tampo de Apoio',
    defaultLeaves: '1 Peça Redonda',
  },
  {
    id: 'prateleira_suportes',
    label: 'Prateleira de Vidro com Suportes Pelicano',
    category: 'prateleira',
    description: 'Prateleira de vidro temperado fixada por fendas ou suportes pelicano',
    defaultOpening: 'Prateleira Fixa',
    defaultLeaves: '1 Peça com Suportes',
  },
  {
    id: 'painel_fixo',
    label: 'Painel de Vidro Fixo / Peça Avulsa',
    category: 'vidro',
    description: 'Peça de vidro avulsa instalada com perfis U ou botões franceses',
    defaultOpening: 'Fixo',
    defaultLeaves: '1 Folha Fixo',
  },
];

// Detector universal e inteligente de modelo técnico baseado no texto e atributos
export function detectTechnicalModelAndCategory(
  name: string = '',
  description: string = '',
  openingTypeStr: string = '',
  leafCountStr: string = '',
  finishStr: string = '',
  explicitCategory?: TechnicalCategory,
  explicitModel?: string
): { model: TechnicalModelDefinition; category: TechnicalCategory } {
  // 1. Se o modelo explícito foi fornecido
  if (explicitModel) {
    const found = TECHNICAL_MODELS.find((m) => m.id === explicitModel);
    if (found) {
      return { model: found, category: explicitCategory && explicitCategory !== 'outro' ? explicitCategory : found.category };
    }
  }

  const combined = `${name} ${description} ${openingTypeStr} ${leafCountStr} ${finishStr}`.toLowerCase();

  // 2. Coberturas, Claraboias & Pergolados
  if (combined.includes('cobertura') || combined.includes('pergolado') || combined.includes('telhado') || combined.includes('teto de vidro')) {
    const m = TECHNICAL_MODELS.find((x) => x.id === 'cobertura_pergolado')!;
    return { model: m, category: 'cobertura' };
  }
  if (combined.includes('claraboia') || combined.includes('clara boia') || combined.includes('domo') || combined.includes('zenital')) {
    const m = TECHNICAL_MODELS.find((x) => x.id === 'claraboia')!;
    return { model: m, category: 'cobertura' };
  }

  // 3. Envidraçamento de Sacada / Cortina de Vidro / Reiki
  if (combined.includes('reiki') || combined.includes('cortina de vidro') || combined.includes('envidracamento') || combined.includes('envidraçamento') || combined.includes('sacada retratil') || combined.includes('sacada retrátil')) {
    const m = TECHNICAL_MODELS.find((x) => x.id === 'sacada_reiki')!;
    return { model: m, category: 'guarda_corpo' };
  }

  // 4. Guarda-Corpos & Corrimões
  if (combined.includes('guarda') || combined.includes('corrim') || combined.includes('sacada') || combined.includes('peitoril')) {
    if (combined.includes('infinity') || combined.includes('embutido') || combined.includes('engastado') || combined.includes('perfil u')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'guarda_corpo_infinity')!;
      return { model: m, category: 'guarda_corpo' };
    }
    if (combined.includes('coluna') || combined.includes('pontalete') || combined.includes('montante') || combined.includes('tubular')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'guarda_corpo_colunas')!;
      return { model: m, category: 'guarda_corpo' };
    }
    const m = TECHNICAL_MODELS.find((x) => x.id === 'guarda_corpo_torres')!;
    return { model: m, category: 'guarda_corpo' };
  }

  // 5. Fachada Pele de Vidro / Glazing / Spider
  if (combined.includes('pele de vidro') || combined.includes('glazing') || combined.includes('spider') || combined.includes('fachada') || combined.includes('structural')) {
    const m = TECHNICAL_MODELS.find((x) => x.id === 'fachada_pele_vidro')!;
    return { model: m, category: 'fachada' };
  }

  // 6. Divisórias de Vidro
  if (combined.includes('divisoria') || combined.includes('divisória') || combined.includes('biombo') || combined.includes('parede de vidro') || combined.includes('escritorio') || combined.includes('escritório')) {
    const m = TECHNICAL_MODELS.find((x) => x.id === 'divisoria_escritorio')!;
    return { model: m, category: 'divisoria' };
  }

  // 7. Fechamento de Pia / Balcão
  if (combined.includes('fechamento') || combined.includes('pia') || combined.includes('balcao') || combined.includes('balcão') || combined.includes('armario de vidro') || combined.includes('armário de vidro')) {
    const m = TECHNICAL_MODELS.find((x) => x.id === 'fechamento_pia')!;
    return { model: m, category: 'fechamento_pia' };
  }

  // 8. Tampos de Mesa
  if (combined.includes('tampo') || combined.includes('mesa')) {
    if (combined.includes('redond') || combined.includes('oval') || combined.includes('circular')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'tampo_mesa_redondo')!;
      return { model: m, category: 'tampo' };
    }
    const m = TECHNICAL_MODELS.find((x) => x.id === 'tampo_mesa_retangular')!;
    return { model: m, category: 'tampo' };
  }

  // 9. Prateleiras & Nichos
  if (combined.includes('prateleira') || combined.includes('nicho') || combined.includes('pelicano') || combined.includes('porta shampoo') || combined.includes('suporte')) {
    const m = TECHNICAL_MODELS.find((x) => x.id === 'prateleira_suportes')!;
    return { model: m, category: 'prateleira' };
  }

  // 10. Espelhos
  if (combined.includes('espelho') || explicitCategory === 'espelho') {
    if (combined.includes('led') || combined.includes('redond') || combined.includes('oval') || combined.includes('iluminad')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'espelho_redondo_led')!;
      return { model: m, category: 'espelho' };
    }
    if (combined.includes('camarim') || combined.includes('lampada') || combined.includes('lâmpada')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'espelho_camarim')!;
      return { model: m, category: 'espelho' };
    }
    if (combined.includes('bisote') || combined.includes('bisotê') || combined.includes('chanfrad') || finishStr.toLowerCase().includes('bisot')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'espelho_bisote')!;
      return { model: m, category: 'espelho' };
    }
    const m = TECHNICAL_MODELS.find((x) => x.id === 'espelho_lapidado')!;
    return { model: m, category: 'espelho' };
  }

  // 11. Box de Banheiro
  if (combined.includes('box') || combined.includes('banheiro') || combined.includes('chuveiro') || explicitCategory === 'box') {
    if (combined.includes('canto') || combined.includes('box l') || combined.includes('em l') || combined.includes('angular')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'box_canto_l')!;
      return { model: m, category: 'box' };
    }
    if (combined.includes('elegance') || combined.includes('roldana aparente') || combined.includes('tubo inox') || combined.includes('roldana')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'box_elegance')!;
      return { model: m, category: 'box' };
    }
    if (combined.includes('abrir') || combined.includes('giro') || combined.includes('pivotante')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'box_abrir')!;
      return { model: m, category: 'box' };
    }
    if (combined.includes('fixo') || combined.includes('walk in') || combined.includes('walk-in') || combined.includes('reto') || combined.includes('1 folha fixo')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'box_fixo_walkin')!;
      return { model: m, category: 'box' };
    }
    if (combined.includes('sanfonad') || combined.includes('camarao') || combined.includes('camarão') || combined.includes('articulad')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'box_sanfonado')!;
      return { model: m, category: 'box' };
    }
    if (combined.includes('3f') || combined.includes('3 folha') || combined.includes('versatik') || combined.includes('tres folha') || combined.includes('três folha')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'box_frontal_3f')!;
      return { model: m, category: 'box' };
    }
    if (combined.includes('4f') || combined.includes('4 folha') || combined.includes('quatro folha') || combined.includes('2f+2m')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'box_frontal_4f')!;
      return { model: m, category: 'box' };
    }
    const m = TECHNICAL_MODELS.find((x) => x.id === 'box_frontal_2f')!;
    return { model: m, category: 'box' };
  }

  // 12. Janelas
  if (combined.includes('janela') || combined.includes('maxim') || combined.includes('bascul') || combined.includes('guilhotina') || explicitCategory === 'janela') {
    if (combined.includes('maxim') || combined.includes('max-ar') || combined.includes('projetante') || combined.includes('maxin')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'janela_maxim_ar')!;
      return { model: m, category: 'janela' };
    }
    if (combined.includes('bascul') || combined.includes('bascula') || combined.includes('báscula')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'janela_basculante')!;
      return { model: m, category: 'janela' };
    }
    if (combined.includes('guilhotina') || combined.includes('vertical')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'janela_guilhotina')!;
      return { model: m, category: 'janela' };
    }
    if (combined.includes('pivotante') || combined.includes('pivô')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'janela_pivotante')!;
      return { model: m, category: 'janela' };
    }
    if (combined.includes('fix') || combined.includes('bandeira') || combined.includes('peitoril')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'janela_fixa')!;
      return { model: m, category: 'janela' };
    }
    if (combined.includes('4f') || combined.includes('4 folha') || combined.includes('quatro folha') || combined.includes('2f+2m')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'janela_correr_4f')!;
      return { model: m, category: 'janela' };
    }
    const m = TECHNICAL_MODELS.find((x) => x.id === 'janela_correr_2f')!;
    return { model: m, category: 'janela' };
  }

  // 13. Portas
  if (combined.includes('porta') || combined.includes('portao') || combined.includes('portão') || combined.includes('passagem') || explicitCategory === 'porta') {
    if (combined.includes('pivotante') || combined.includes('pivo') || combined.includes('pivô')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'porta_pivotante')!;
      return { model: m, category: 'porta' };
    }
    if (combined.includes('camarao') || combined.includes('camarão') || combined.includes('articulad') || combined.includes('sanfonad') || combined.includes('bi-fold')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'porta_camarao')!;
      return { model: m, category: 'porta' };
    }
    if (combined.includes('automatica') || combined.includes('automática') || combined.includes('sensor') || combined.includes('eletronica')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'porta_automatica')!;
      return { model: m, category: 'porta' };
    }
    if (combined.includes('abrir') || combined.includes('giro')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'porta_abrir')!;
      return { model: m, category: 'porta' };
    }
    if (combined.includes('6f') || combined.includes('6 folha') || combined.includes('seis folha') || combined.includes('4f+2m')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'porta_correr_6f')!;
      return { model: m, category: 'porta' };
    }
    if (combined.includes('4f') || combined.includes('4 folha') || combined.includes('quatro folha') || combined.includes('2f+2m')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'porta_correr_4f')!;
      return { model: m, category: 'porta' };
    }
    if (combined.includes('3f') || combined.includes('3 folha') || combined.includes('versatik') || combined.includes('tres folha') || combined.includes('três folha')) {
      const m = TECHNICAL_MODELS.find((x) => x.id === 'porta_correr_3f')!;
      return { model: m, category: 'porta' };
    }
    const m = TECHNICAL_MODELS.find((x) => x.id === 'porta_correr_2f')!;
    return { model: m, category: 'porta' };
  }

  // 14. Se nada foi detectado, verificar se é vidro avulso ou fixo
  if (combined.includes('vidro') || combined.includes('painel') || combined.includes('chapa') || combined.includes('temperado')) {
    const m = TECHNICAL_MODELS.find((x) => x.id === 'painel_fixo')!;
    return { model: m, category: 'vidro' };
  }

  // Padrão Geral Confiável: Porta de Correr 2 Folhas
  const defaultModel = TECHNICAL_MODELS.find((x) => x.id === 'porta_correr_2f')!;
  return { model: defaultModel, category: explicitCategory && explicitCategory !== 'outro' ? explicitCategory : 'porta' };
}

export function detectTechnicalCategory(name: string = '', explicitCategory?: TechnicalCategory): TechnicalCategory {
  if (explicitCategory && explicitCategory !== 'outro') return explicitCategory;
  const { category } = detectTechnicalModelAndCategory(name, '', '', '', '', explicitCategory);
  return category;
}

export function parseLeafConfiguration(leafCountStr: string = '', name: string = '', openingTypeStr: string = '') {
  const { model } = detectTechnicalModelAndCategory(name, '', openingTypeStr, leafCountStr, '');
  return {
    count: model.id.includes('6f') ? 6 : model.id.includes('4f') ? 4 : model.id.includes('3f') ? 3 : model.id.includes('1f') || model.id.includes('abrir') || model.id.includes('pivotante') || model.id.includes('fixo') ? 1 : 2,
    type: model.id,
    label: model.label,
  };
}

interface TechnicalProductPreviewProps {
  item?: Partial<QuoteItem>;
  widthMm?: number;
  heightMm?: number;
  name?: string;
  category?: TechnicalCategory;
  technicalModel?: string;
  glassColor?: string;
  hardwareColor?: string;
  openingType?: string;
  leafCount?: string;
  finish?: string;
  compact?: boolean;
  showDimensions?: boolean;
  className?: string;
}

export const TechnicalProductPreview: React.FC<TechnicalProductPreviewProps> = ({
  item,
  widthMm: propWidth,
  heightMm: propHeight,
  name: propName,
  category: propCategory,
  technicalModel: propTechnicalModel,
  glassColor: propGlassColor,
  hardwareColor: propHardwareColor,
  openingType: propOpeningType,
  leafCount: propLeafCount,
  finish: propFinish,
  compact = false,
  showDimensions = false,
  className = '',
}) => {
  const width = propWidth ?? item?.widthMm ?? 1500;
  const height = propHeight ?? item?.lengthMm ?? 2100;
  const name = propName ?? item?.name ?? 'Produto';
  const description = item?.description ?? '';
  const glassColor = propGlassColor ?? item?.glassColor ?? 'Incolor';
  const hardwareColor = propHardwareColor ?? item?.hardwareColor ?? 'Preto';
  const openingType = propOpeningType ?? item?.openingType ?? 'De Correr';
  const leafCount = propLeafCount ?? item?.leafCount ?? '2 Folhas';
  const finish = propFinish ?? item?.finish ?? '';
  const explicitCategory = propCategory ?? item?.technicalCategory;
  const explicitModel = propTechnicalModel ?? item?.technicalModel;

  const { model, category } = detectTechnicalModelAndCategory(
    name,
    description,
    openingType,
    leafCount,
    finish,
    explicitCategory,
    explicitModel
  );

  // Paleta de Vidros Realistas e de Alto Contraste Arquitetônico
  const getGlassStyle = () => {
    const gc = (glassColor || '').toLowerCase();
    if (gc.includes('fumê') || gc.includes('fume') || gc.includes('cinza') || gc.includes('grafite')) {
      return { fill: '#334155', fillOpacity: '0.72', stroke: '#94a3b8', label: 'Fumê' };
    }
    if (gc.includes('verde')) {
      return { fill: '#065f46', fillOpacity: '0.68', stroke: '#34d399', label: 'Verde' };
    }
    if (gc.includes('bronze') || gc.includes('marrom') || gc.includes('champagne')) {
      return { fill: '#78350f', fillOpacity: '0.68', stroke: '#fbbf24', label: 'Bronze' };
    }
    if (gc.includes('astral') || gc.includes('azul') || gc.includes('reflecta') || gc.includes('refletivo')) {
      return { fill: '#0369a1', fillOpacity: '0.68', stroke: '#38bdf8', label: 'Azul / Refletivo' };
    }
    if (gc.includes('jateado') || gc.includes('leitoso') || gc.includes('acidato') || gc.includes('fosco') || gc.includes('pontilhado') || gc.includes('quadrato')) {
      return { fill: '#e2e8f0', fillOpacity: '0.88', stroke: '#ffffff', label: 'Jateado' };
    }
    // Incolor límpido azulado arquitetônico
    return { fill: '#0284c7', fillOpacity: '0.38', stroke: '#38bdf8', label: 'Incolor' };
  };

  // Cores dos Perfis de Alumínio e Ferragens com Alto Contraste e Definição
  const getHardwareStyle = () => {
    const hc = (hardwareColor || '').toLowerCase();
    if (hc === '' || hc === 'vazio' || hc === 'nenhum') {
      return { stroke: '#94a3b8', fill: '#334155', accent: '#38bdf8', isNone: true };
    }
    if (hc.includes('branco')) {
      return { stroke: '#ffffff', fill: '#f8fafc', accent: '#38bdf8', isNone: false };
    }
    if (hc.includes('fosco') || hc.includes('natural') || hc.includes('anodizado')) {
      return { stroke: '#f8fafc', fill: '#94a3b8', accent: '#38bdf8', isNone: false };
    }
    if (hc.includes('bronze') || hc.includes('marrom')) {
      return { stroke: '#fbbf24', fill: '#78350f', accent: '#fde047', isNone: false };
    }
    if (hc.includes('ouro') || hc.includes('dourad') || hc.includes('gold')) {
      return { stroke: '#fde047', fill: '#d97706', accent: '#fef08a', isNone: false };
    }
    if (hc.includes('cromad') || hc.includes('inox') || hc.includes('prata')) {
      return { stroke: '#ffffff', fill: '#64748b', accent: '#38bdf8', isNone: false };
    }
    if (hc.includes('champagne')) {
      return { stroke: '#fde68a', fill: '#a88b64', accent: '#fef3c7', isNone: false };
    }
    // Preto Fosco de Alta Definição (perfil grafite com bordas claras e roldanas douradas)
    return { stroke: '#94a3b8', fill: '#1e293b', accent: '#fbbf24', isNone: false };
  };

  const glassStyle = getGlassStyle();
  const hwStyle = getHardwareStyle();

  // Dimensões do viewBox
  const svgW = compact ? 220 : 280;
  const svgH = compact ? 160 : 200;

  // Área útil do desenho técnico
  const padLeft = showDimensions ? 38 : 16;
  const padRight = showDimensions ? 38 : 16;
  const padTop = showDimensions ? 32 : 14;
  const padBottom = 22;

  const drawAreaW = svgW - padLeft - padRight;
  const drawAreaH = svgH - padTop - padBottom;

  // Proporção restrita para clareza
  const rawRatio = width > 0 && height > 0 ? width / height : 1.2;
  const clampedRatio = Math.max(0.45, Math.min(2.3, rawRatio));

  let boxW = drawAreaW;
  let boxH = boxW / clampedRatio;

  if (boxH > drawAreaH) {
    boxH = drawAreaH;
    boxW = boxH * clampedRatio;
  }

  const boxX = padLeft + (drawAreaW - boxW) / 2;
  const boxY = padTop + (drawAreaH - boxH) / 2;

  const midX = boxX + boxW / 2;
  const midY = boxY + boxH / 2;

  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center bg-slate-900 text-slate-100 rounded-xl border border-slate-700/80 p-1 sm:p-1.5 select-none notranslate overflow-hidden max-w-full shadow-sm ${className}`}
      translate="no"
    >
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={svgW}
        height={svgH}
        style={{ width: '100%', height: 'auto', display: 'block', maxWidth: '100%' }}
        className="w-full h-auto max-h-48 font-sans"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fundo Blueprint Técnico com Borda */}
        <rect width={svgW} height={svgH} fill="#090f1d" stroke="#1e293b" strokeWidth="1" rx="8" />

        {/* Grade técnica arquitetônica de fundo */}
        <g stroke="#16223d" strokeWidth="0.5" strokeDasharray="3,3">
          <line x1="0" y1={svgH * 0.25} x2={svgW} y2={svgH * 0.25} />
          <line x1="0" y1={svgH * 0.5} x2={svgW} y2={svgH * 0.5} />
          <line x1="0" y1={svgH * 0.75} x2={svgW} y2={svgH * 0.75} />
          <line x1={svgW * 0.25} y1="0" x2={svgW * 0.25} y2={svgH} />
          <line x1={svgW * 0.5} y1="0" x2={svgW * 0.5} y2={svgH} />
          <line x1={svgW * 0.75} y1="0" x2={svgW * 0.75} y2={svgH} />
        </g>

        <defs>
          {/* Marcadores de seta CAD */}
          <marker
            id={`cad-arrow-${uniqueId}`}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M 0 2 L 8 5 L 0 8 z" fill="#fbbf24" />
          </marker>

          <marker
            id={`cad-arrow-left-${uniqueId}`}
            viewBox="0 0 10 10"
            refX="2"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 5 L 8 2 L 8 8 z" fill="#fbbf24" />
          </marker>

          {/* Gradiente de reflexo e brilho do vidro */}
          <linearGradient id={`glassGloss-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.22" />
          </linearGradient>

          {/* Gradiente de espelho LED */}
          <radialGradient id={`ledGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.0" />
            <stop offset="90%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.8" />
          </radialGradient>
        </defs>

        {/* ================= COTAS DIMENSIONAIS SE ATIVADO ================= */}
        {showDimensions && (
          <g>
            <line x1={boxX} y1={boxY - 4} x2={boxX} y2={boxY - 18} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
            <line x1={boxX + boxW} y1={boxY - 4} x2={boxX + boxW} y2={boxY - 18} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
            <line
              x1={boxX}
              y1={boxY - 12}
              x2={boxX + boxW}
              y2={boxY - 12}
              stroke="#f59e0b"
              strokeWidth="1.2"
              markerStart={`url(#cad-arrow-left-${uniqueId})`}
              markerEnd={`url(#cad-arrow-${uniqueId})`}
            />
            <rect
              x={midX - 32}
              y={boxY - 22}
              width="64"
              height="14"
              rx="3"
              fill="#090d16"
              stroke="#334155"
              strokeWidth="0.5"
            />
            <text
              x={midX}
              y={boxY - 12}
              fill="#fbbf24"
              fontSize="9.5"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="monospace"
            >
              {width} mm
            </text>

            <line x1={boxX + boxW + 4} y1={boxY} x2={boxX + boxW + 18} y2={boxY} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
            <line x1={boxX + boxW + 4} y1={boxY + boxH} x2={boxX + boxW + 18} y2={boxY + boxH} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
            <line
              x1={boxX + boxW + 12}
              y1={boxY}
              x2={boxX + boxW + 12}
              y2={boxY + boxH}
              stroke="#f59e0b"
              strokeWidth="1.2"
              markerStart={`url(#cad-arrow-left-${uniqueId})`}
              markerEnd={`url(#cad-arrow-${uniqueId})`}
            />
            <g transform={`translate(${boxX + boxW + 12}, ${midY}) rotate(90)`}>
              <rect
                x="-30"
                y="-7"
                width="60"
                height="14"
                rx="3"
                fill="#090d16"
                stroke="#334155"
                strokeWidth="0.5"
              />
              <text
                x="0"
                y="0"
                fill="#fbbf24"
                fontSize="9.5"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="monospace"
              >
                {height} mm
              </text>
            </g>
          </g>
        )}

        {/* ================= MODELOS ARQUITETÔNICOS VETORIAIS ================= */}

        {/* 1. BOX DE CANTO EM L (ISOMÉTRICO 90°) */}
        {model.id === 'box_canto_l' && (
          <g>
            {/* Lado Esquerdo (Face Frontal Esquerda) */}
            <polygon
              points={`${boxX},${boxY + 12} ${midX},${boxY} ${midX},${boxY + boxH - 10} ${boxX},${boxY + boxH}`}
              fill={glassStyle.fill}
              stroke={glassStyle.stroke}
              strokeWidth="1.5"
            />
            <polygon
              points={`${boxX},${boxY + 12} ${midX},${boxY} ${midX},${boxY + boxH - 10} ${boxX},${boxY + boxH}`}
              fill={`url(#glassGloss-${uniqueId})`}
            />
            {/* Divisão da folha fixa e móvel esquerda */}
            <line
              x1={boxX + (midX - boxX) * 0.5}
              y1={boxY + 6}
              x2={boxX + (midX - boxX) * 0.5}
              y2={boxY + boxH - 5}
              stroke={hwStyle.stroke}
              strokeWidth="1.5"
            />

            {/* Lado Direito (Face Frontal Direita) */}
            <polygon
              points={`${midX},${boxY} ${boxX + boxW},${boxY + 12} ${boxX + boxW},${boxY + boxH} ${midX},${boxY + boxH - 10}`}
              fill={glassStyle.fill}
              stroke={glassStyle.stroke}
              strokeWidth="1.5"
            />
            <polygon
              points={`${midX},${boxY} ${boxX + boxW},${boxY + 12} ${boxX + boxW},${boxY + boxH} ${midX},${boxY + boxH - 10}`}
              fill={`url(#glassGloss-${uniqueId})`}
            />
            {/* Divisão da folha fixa e móvel direita */}
            <line
              x1={midX + (boxX + boxW - midX) * 0.5}
              y1={boxY + 6}
              x2={midX + (boxX + boxW - midX) * 0.5}
              y2={boxY + boxH - 5}
              stroke={hwStyle.stroke}
              strokeWidth="1.5"
            />

            {/* Trilho Superior Angular */}
            <polyline
              points={`${boxX - 2},${boxY + 12} ${midX},${boxY - 2} ${boxX + boxW + 2},${boxY + 12}`}
              fill="none"
              stroke={hwStyle.stroke}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Junção Magnética de Canto (90°) no Centro */}
            <line x1={midX} y1={boxY} x2={midX} y2={boxY + boxH - 10} stroke={hwStyle.accent} strokeWidth="2.5" />
            <circle cx={midX} cy={midY - 5} r="3" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />

            <text x={midX} y={boxY + 16} fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">
              BOX EM L (CANTO 90°)
            </text>
          </g>
        )}

        {/* 2. BOX ELEGANCE (ROLDANAS APARENTES EM TUBO INOX) */}
        {model.id === 'box_elegance' && (
          <g>
            {/* Tubo Redondo Inox no Topo */}
            <rect x={boxX - 3} y={boxY - 3} width={boxW + 6} height="5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" rx="2" />
            
            {/* Roldanas Aparentes Grandes */}
            <circle cx={boxX + boxW * 0.16} cy={boxY - 1} r="4.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="1.2" />
            <circle cx={boxX + boxW * 0.16} cy={boxY - 1} r="1.8" fill="#0f172a" />
            <circle cx={boxX + boxW * 0.36} cy={boxY - 1} r="4.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="1.2" />
            <circle cx={boxX + boxW * 0.36} cy={boxY - 1} r="1.8" fill="#0f172a" />

            {/* Suportes de Parede e Fixação */}
            <rect x={boxX - 3} y={boxY - 6} width="4" height="10" fill="#64748b" stroke="#0f172a" strokeWidth="0.5" />
            <rect x={boxX + boxW - 1} y={boxY - 6} width="4" height="10" fill="#64748b" stroke="#0f172a" strokeWidth="0.5" />

            {/* Folha 1 (Móvel - Esquerda) */}
            <rect x={boxX + 1} y={boxY + 3} width={boxW / 2 - 2} height={boxH - 5} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
            <rect x={boxX + 1} y={boxY + 3} width={boxW / 2 - 2} height={boxH - 5} fill={`url(#glassGloss-${uniqueId})`} rx="1" />
            {/* Puxador Tubular Elegance */}
            <rect x={boxX + boxW * 0.36} y={midY - 16} width="3" height="32" rx="1" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />

            {/* Folha 2 (Fixa - Direita) */}
            <rect x={midX + 2} y={boxY + 3} width={boxW / 2 - 3} height={boxH - 5} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
            <rect x={midX + 2} y={boxY + 3} width={boxW / 2 - 3} height={boxH - 5} fill={`url(#glassGloss-${uniqueId})`} rx="1" />

            {/* Guia Inferior Inox */}
            <rect x={midX - 3} y={boxY + boxH - 3} width="6" height="4" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />

            {/* Seta de Deslizamento */}
            <path
              d={`M ${boxX + boxW * 0.3} ${boxY + boxH * 0.82} L ${boxX + boxW * 0.1} ${boxY + boxH * 0.82}`}
              stroke="#fbbf24"
              strokeWidth="1.3"
              markerEnd={`url(#cad-arrow-${uniqueId})`}
            />

            <text x={midX} y={boxY + 14} fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">
              BOX ELEGANCE (ROLDANA APARENTE)
            </text>
          </g>
        )}

        {/* 3. BOX FIXO / WALK-IN / PAINEL RETO */}
        {model.id === 'box_fixo_walkin' && (
          <g>
            {/* Perfil U na Parede (Esquerda) */}
            <rect x={boxX} y={boxY} width="5" height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" />

            {/* Painel Único de Vidro */}
            <rect x={boxX + 5} y={boxY + 4} width={boxW - 10} height={boxH - 6} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="2" rx="1" />
            <rect x={boxX + 5} y={boxY + 4} width={boxW - 10} height={boxH - 6} fill={`url(#glassGloss-${uniqueId})`} rx="1" />

            {/* Braço Estabilizador de Inox no Topo (45° ou 90°) */}
            <line x1={boxX} y1={boxY - 4} x2={boxX + boxW * 0.75} y2={boxY + 4} stroke={hwStyle.accent} strokeWidth="2" />
            <circle cx={boxX + boxW * 0.75} cy={boxY + 4} r="2.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.6" />

            {/* Fixador / Presilha de Piso */}
            <rect x={boxX + boxW * 0.5 - 4} y={boxY + boxH - 3} width="8" height="4" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.6" />

            <text x={midX} y={midY} fill="#94a3b8" fontSize="7.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
              BOX FIXO / WALK-IN
            </text>
          </g>
        )}

        {/* 4. BOX DE ABRIR (GIRO) */}
        {model.id === 'box_abrir' && (
          <g>
            {/* Dobradiças Pivotantes no Lado Esquerdo */}
            <rect x={boxX - 2} y={boxY + boxH * 0.2} width="5" height="12" rx="1" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
            <rect x={boxX - 2} y={boxY + boxH * 0.75} width="5" height="12" rx="1" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />

            {/* Folha de Vidro de Abrir */}
            <rect x={boxX + 3} y={boxY + 2} width={boxW - 6} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.8" rx="1" />
            <rect x={boxX + 3} y={boxY + 2} width={boxW - 6} height={boxH - 4} fill={`url(#glassGloss-${uniqueId})`} rx="1" />

            {/* Puxador Tipo Ponto / Concha */}
            <circle cx={boxX + boxW - 10} cy={midY} r="3.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="1" />

            {/* Arco Tracejado de Abertura */}
            <path
              d={`M ${boxX + boxW - 10} ${boxY + boxH - 4} A ${boxW * 0.8} ${boxW * 0.8} 0 0 1 ${boxX + 10} ${boxY + boxH - 4}`}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.2"
              strokeDasharray="3,3"
            />

            <text x={midX} y={boxY + 14} fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">
              BOX DE ABRIR (GIRO)
            </text>
          </g>
        )}

        {/* 5. BOX SANFONADO / ARTICULADO (CAMARÃO) */}
        {(model.id === 'box_sanfonado' || model.id === 'porta_camarao') && (
          <g>
            {/* Trilho Superior */}
            <rect x={boxX - 2} y={boxY - 4} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            <rect x={boxX - 2} y={boxY + boxH - 2} width={boxW + 4} height="5" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />

            {/* Painéis Articulados */}
            {(() => {
              const panelW = boxW / 3;
              return (
                <>
                  {[0, 1, 2].map((i) => {
                    const px = boxX + i * panelW;
                    return (
                      <React.Fragment key={i}>
                        <rect x={px + 1} y={boxY + 2} width={panelW - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
                        <rect x={px + 1} y={boxY + 2} width={panelW - 2} height={boxH - 4} fill={`url(#glassGloss-${uniqueId})`} rx="1" />
                        {/* Dobradiças Centrais */}
                        {i > 0 && (
                          <>
                            <rect x={px - 2} y={boxY + boxH * 0.3} width="4" height="8" rx="1" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />
                            <rect x={px - 2} y={boxY + boxH * 0.7} width="4" height="8" rx="1" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {/* Símbolo de Articulação / Dobra */}
                  <path
                    d={`M ${boxX + boxW * 0.8} ${boxY + boxH * 0.82} L ${boxX + boxW * 0.2} ${boxY + boxH * 0.82}`}
                    stroke="#fbbf24"
                    strokeWidth="1.3"
                    markerEnd={`url(#cad-arrow-${uniqueId})`}
                  />
                </>
              );
            })()}

            <text x={midX} y={boxY + 14} fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">
              {model.id === 'box_sanfonado' ? 'BOX ARTICULADO (CAMARÃO)' : 'PORTA ARTICULADA (CAMARÃO)'}
            </text>
          </g>
        )}

        {/* 6. PORTA PIVOTANTE */}
        {model.id === 'porta_pivotante' && (
          <g>
            {/* Marco da Porta */}
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="2" rx="2" />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={`url(#glassGloss-${uniqueId})`} rx="2" />

            {/* Eixo Pivotante (Deslocado 18%) */}
            <line x1={boxX + boxW * 0.18} y1={boxY} x2={boxX + boxW * 0.18} y2={boxY + boxH} stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx={boxX + boxW * 0.18} cy={boxY + 3} r="3" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
            <circle cx={boxX + boxW * 0.18} cy={boxY + boxH - 3} r="3" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />

            {/* Puxador Tubular Nobre de Inox 100cm */}
            <rect x={boxX + boxW * 0.82} y={midY - 25} width="4" height="50" rx="2" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
            <circle cx={boxX + boxW * 0.82 + 2} cy={midY - 20} r="1.5" fill="#ffffff" />
            <circle cx={boxX + boxW * 0.82 + 2} cy={midY + 20} r="1.5" fill="#ffffff" />

            {/* Arco de Abertura Pivotante */}
            <path
              d={`M ${boxX + boxW * 0.82} ${boxY + boxH - 8} A 20 20 0 0 1 ${boxX + boxW * 0.65} ${boxY + boxH - 4}`}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.2"
              strokeDasharray="2,2"
            />

            <text x={midX} y={boxY + 14} fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">
              PORTA PIVOTANTE
            </text>
          </g>
        )}

        {/* 7. PORTA DE ABRIR (GIRO) */}
        {model.id === 'porta_abrir' && (
          <g>
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="2" rx="2" />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={`url(#glassGloss-${uniqueId})`} rx="2" />

            {/* 3 Dobradiças Laterais */}
            <rect x={boxX - 2} y={boxY + boxH * 0.15} width="5" height="12" rx="1" fill={hwStyle.accent} />
            <rect x={boxX - 2} y={boxY + boxH * 0.5 - 6} width="5" height="12" rx="1" fill={hwStyle.accent} />
            <rect x={boxX - 2} y={boxY + boxH * 0.85 - 12} width="5" height="12" rx="1" fill={hwStyle.accent} />

            {/* Fechadura e Maçaneta */}
            <rect x={boxX + boxW - 8} y={midY - 5} width="6" height="10" rx="1" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />
            <line x1={boxX + boxW - 12} y1={midY} x2={boxX + boxW - 5} y2={midY} stroke={hwStyle.accent} strokeWidth="2" strokeLinecap="round" />

            <text x={midX} y={boxY + 14} fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">
              PORTA DE ABRIR (GIRO)
            </text>
          </g>
        )}

        {/* 8. PORTA AUTOMÁTICA (SENSOR) */}
        {model.id === 'porta_automatica' && (
          <g>
            {/* Cabeçote Motorizado no Topo */}
            <rect x={boxX - 4} y={boxY - 8} width={boxW + 8} height="10" fill="#1e293b" stroke={hwStyle.accent} strokeWidth="1.2" rx="2" />
            <circle cx={midX} cy={boxY - 3} r="3" fill="#22c55e" stroke="#0f172a" strokeWidth="0.6" />
            <text x={midX} y={boxY - 2} fill="#ffffff" fontSize="4.5" fontWeight="bold" textAnchor="middle">SENSOR</text>

            {/* Folhas de Vidro */}
            <rect x={boxX + 2} y={boxY + 2} width={boxW / 2 - 3} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
            <rect x={midX + 1} y={boxY + 2} width={boxW / 2 - 3} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />

            {/* Setas de Abertura Automática Bilaterais */}
            <path d={`M ${midX - 6} ${boxY + boxH * 0.5} L ${boxX + 10} ${boxY + boxH * 0.5}`} stroke="#fbbf24" strokeWidth="1.3" markerEnd={`url(#cad-arrow-${uniqueId})`} />
            <path d={`M ${midX + 6} ${boxY + boxH * 0.5} L ${boxX + boxW - 10} ${boxY + boxH * 0.5}`} stroke="#fbbf24" strokeWidth="1.3" markerEnd={`url(#cad-arrow-${uniqueId})`} />

            <text x={midX} y={boxY + 16} fill="#22c55e" fontSize="7" fontWeight="bold" textAnchor="middle">
              PORTA AUTOMÁTICA (RADAR)
            </text>
          </g>
        )}

        {/* 9. JANELA MAXIM-AR */}
        {model.id === 'janela_maxim_ar' && (
          <g>
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="2.5" rx="2" />
            <rect x={boxX + 4} y={boxY + 4} width={boxW - 8} height={boxH - 8} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
            <rect x={boxX + 4} y={boxY + 4} width={boxW - 8} height={boxH - 8} fill={`url(#glassGloss-${uniqueId})`} />

            {/* Linhas Diagonais Tracejadas Indicativas de Maxim-Ar */}
            <polyline
              points={`${boxX + 4},${boxY + 4} ${midX},${boxY + boxH - 6} ${boxX + boxW - 4},${boxY + 4}`}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.2"
              strokeDasharray="4,3"
            />

            {/* Fecho Central Inferior */}
            <rect x={midX - 4} y={boxY + boxH - 10} width="8" height="4" rx="1" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />

            <text x={midX} y={boxY + 14} fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">
              JANELA MAXIM-AR
            </text>
          </g>
        )}

        {/* 10. JANELA BASCULANTE */}
        {model.id === 'janela_basculante' && (
          <g>
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="2.5" rx="2" />
            {/* Palhetas de Vidro Horizontais */}
            {[0, 1, 2, 3].map((i) => {
              const ph = (boxH - 8) / 4;
              const py = boxY + 4 + i * ph;
              return (
                <React.Fragment key={i}>
                  <rect x={boxX + 4} y={py + 1} width={boxW - 8} height={ph - 2} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1" rx="0.5" />
                  <circle cx={boxX + 7} cy={py + ph / 2} r="1.5" fill={hwStyle.accent} />
                </React.Fragment>
              );
            })}
            {/* Alavanca de Comando na Lateral */}
            <line x1={boxX + 7} y1={boxY + 6} x2={boxX + 7} y2={boxY + boxH - 6} stroke={hwStyle.accent} strokeWidth="1.5" />
            <circle cx={boxX + 7} cy={boxY + boxH - 10} r="2.5" fill={hwStyle.accent} />

            <text x={midX} y={boxY + 14} fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">
              JANELA BASCULANTE
            </text>
          </g>
        )}

        {/* 11. JANELA GUILHOTINA (CORRER VERTICAL) */}
        {model.id === 'janela_guilhotina' && (
          <g>
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="2.5" rx="2" />
            {/* Folha Superior Fixa */}
            <rect x={boxX + 3} y={boxY + 3} width={boxW - 6} height={boxH / 2 - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.2" rx="1" />
            {/* Folha Inferior Móvel */}
            <rect x={boxX + 3} y={midY + 1} width={boxW - 6} height={boxH / 2 - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.6" rx="1" />
            {/* Travessa Central */}
            <line x1={boxX + 1} y1={midY} x2={boxX + boxW - 1} y2={midY} stroke={hwStyle.stroke} strokeWidth="3" />
            {/* Seta Vertical para Cima */}
            <path d={`M ${midX} ${boxY + boxH - 10} L ${midX} ${midY + 10}`} stroke="#fbbf24" strokeWidth="1.3" markerEnd={`url(#cad-arrow-${uniqueId})`} />

            <text x={midX} y={boxY + 14} fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">
              JANELA GUILHOTINA
            </text>
          </g>
        )}

        {/* 12. ESPELHO BISOTÊ */}
        {model.id === 'espelho_bisote' && (
          <g>
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="rgba(241, 245, 249, 0.9)" stroke={hwStyle.stroke} strokeWidth="2" rx="2" />
            {/* Chanfro Bisotê Realista 25mm */}
            <polygon points={`${boxX},${boxY} ${boxX + boxW},${boxY} ${boxX + boxW - 8},${boxY + 8} ${boxX + 8},${boxY + 8}`} fill="rgba(255, 255, 255, 0.6)" />
            <polygon points={`${boxX + boxW},${boxY} ${boxX + boxW},${boxY + boxH} ${boxX + boxW - 8},${boxY + boxH - 8} ${boxX + boxW - 8},${boxY + 8}`} fill="rgba(203, 213, 225, 0.6)" />
            <polygon points={`${boxX},${boxY + boxH} ${boxX + boxW},${boxY + boxH} ${boxX + boxW - 8},${boxY + boxH - 8} ${boxX + 8},${boxY + boxH - 8}`} fill="rgba(148, 163, 184, 0.6)" />
            <polygon points={`${boxX},${boxY} ${boxX},${boxY + boxH} ${boxX + 8},${boxY + boxH - 8} ${boxX + 8},${boxY + 8}`} fill="rgba(226, 232, 240, 0.6)" />
            <rect x={boxX + 8} y={boxY + 8} width={boxW - 16} height={boxH - 16} fill="rgba(248, 250, 252, 0.95)" stroke="#cbd5e1" strokeWidth="0.5" />
            <line x1={boxX + 12} y1={boxY + 12} x2={boxX + boxW - 12} y2={boxY + boxH - 12} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.8" />
            
            <text x={midX} y={midY} fill="#64748b" fontSize="7.5" fontWeight="bold" textAnchor="middle" letterSpacing="1">
              ESPELHO BISOTÊ 25mm
            </text>
          </g>
        )}

        {/* 13. ESPELHO REDONDO / LED */}
        {model.id === 'espelho_redondo_led' && (
          <g>
            {/* Halo de Brilho do LED */}
            <circle cx={midX} cy={midY} r={Math.min(boxW, boxH) * 0.48} fill={`url(#ledGlow-${uniqueId})`} />
            {/* Círculo do Espelho */}
            <circle cx={midX} cy={midY} r={Math.min(boxW, boxH) * 0.44} fill="#f8fafc" stroke="#38bdf8" strokeWidth="2" />
            {/* Brilho Diagonal no Vidro */}
            <line x1={midX - 20} y1={midY - 20} x2={midX + 20} y2={midY + 20} stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
            {/* Botão Touch Sensível */}
            <circle cx={midX} cy={midY + Math.min(boxW, boxH) * 0.3} r="3" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />

            <text x={midX} y={midY - 4} fill="#0284c7" fontSize="7" fontWeight="bold" textAnchor="middle">
              ESPELHO REDONDO LED
            </text>
          </g>
        )}

        {/* 14. ESPELHO LAPIDADO / CAMARIM */}
        {(model.id === 'espelho_lapidado' || model.id === 'espelho_camarim') && (
          <g>
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" rx="2" />
            <line x1={boxX + 10} y1={boxY + 10} x2={boxX + boxW - 10} y2={boxY + boxH - 10} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.8" />
            <text x={midX} y={midY} fill="#64748b" fontSize="7.5" fontWeight="bold" textAnchor="middle">
              {model.id === 'espelho_camarim' ? 'ESPELHO CAMARIM' : 'ESPELHO CRISTAL LAPIDADO'}
            </text>
          </g>
        )}

        {/* 15. GUARDA-CORPO / SACADA / REIKI */}
        {(model.category === 'guarda_corpo' || model.id.includes('guarda_corpo') || model.id === 'sacada_reiki') && (
          <g>
            <rect x={boxX} y={boxY + 6} width={boxW} height={boxH - 16} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="3" />
            <rect x={boxX} y={boxY + 6} width={boxW} height={boxH - 16} fill={`url(#glassGloss-${uniqueId})`} rx="3" />

            {/* Corrimão Tubular / Perfil Superior */}
            <rect x={boxX - 2} y={boxY} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1.5" />

            {/* Torres Inox Spigots */}
            {model.id === 'guarda_corpo_torres' || model.id === 'guarda_corpo_colunas' ? (
              <>
                <rect x={boxX + boxW * 0.18 - 3} y={boxY + boxH - 12} width="6" height="12" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" rx="1" />
                <rect x={boxX + boxW * 0.82 - 3} y={boxY + boxH - 12} width="6" height="12" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" rx="1" />
                {boxW > 80 && (
                  <rect x={midX - 3} y={boxY + boxH - 12} width="6" height="12" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" rx="1" />
                )}
              </>
            ) : (
              // Perfil Embutido Infinity no Piso
              <rect x={boxX - 2} y={boxY + boxH - 8} width={boxW + 4} height="8" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            )}

            <text x={midX} y={midY} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
              {model.label.toUpperCase()}
            </text>
          </g>
        )}

        {/* 16. COBERTURA / PERGOLADO / CLARABOIA */}
        {(model.category === 'cobertura' || model.id === 'cobertura_pergolado' || model.id === 'claraboia') && (
          <g>
            {/* Estrutura de Vigas / Caixilhos em Perspectiva Inclinada */}
            <polygon
              points={`${boxX},${boxY + 10} ${boxX + boxW},${boxY} ${boxX + boxW},${boxY + boxH - 6} ${boxX},${boxY + boxH}`}
              fill={glassStyle.fill}
              stroke={glassStyle.stroke}
              strokeWidth="1.8"
            />
            {/* Vigas Estruturais Verticais */}
            {[0.25, 0.5, 0.75].map((factor, i) => (
              <line
                key={i}
                x1={boxX + boxW * factor}
                y1={boxY + 10 - factor * 10}
                x2={boxX + boxW * factor}
                y2={boxY + boxH - factor * 6}
                stroke={hwStyle.stroke}
                strokeWidth="2.5"
              />
            ))}
            {/* Calha Frontal */}
            <rect x={boxX - 2} y={boxY + boxH - 2} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />

            {/* Seta de Caimento de Água */}
            <path d={`M ${midX} ${boxY + 15} L ${midX} ${boxY + boxH - 12}`} stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3,3" markerEnd={`url(#cad-arrow-${uniqueId})`} />

            <text x={midX} y={midY} fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">
              COBERTURA / PERGOLADO
            </text>
          </g>
        )}

        {/* 17. DIVISÓRIA DE ESCRITÓRIO OU FACHADA PELE DE VIDRO */}
        {(model.category === 'divisoria' || model.category === 'fachada' || model.id === 'divisoria_escritorio' || model.id === 'fachada_pele_vidro') && (
          <g>
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="2" rx="1" />
            {/* Grid de Modulação / Pele de Vidro */}
            <line x1={boxX + boxW / 3} y1={boxY} x2={boxX + boxW / 3} y2={boxY + boxH} stroke={hwStyle.stroke} strokeWidth="2" />
            <line x1={boxX + (boxW * 2) / 3} y1={boxY} x2={boxX + (boxW * 2) / 3} y2={boxY + boxH} stroke={hwStyle.stroke} strokeWidth="2" />
            <line x1={boxX} y1={midY} x2={boxX + boxW} y2={midY} stroke={hwStyle.stroke} strokeWidth="2" />

            {/* Aranhas / Spiders nos cruzamentos (se fachada) */}
            {model.id === 'fachada_pele_vidro' && (
              <>
                <circle cx={boxX + boxW / 3} cy={midY} r="3" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.6" />
                <circle cx={boxX + (boxW * 2) / 3} cy={midY} r="3" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.6" />
              </>
            )}

            <text x={midX} y={boxY + 14} fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">
              {model.id === 'fachada_pele_vidro' ? 'FACHADA PELE DE VIDRO' : 'DIVISÓRIA DE VIDRO'}
            </text>
          </g>
        )}

        {/* 18. FECHAMENTO DE PIA / BALCÃO */}
        {model.id === 'fechamento_pia' && (
          <g>
            <rect x={boxX - 2} y={boxY - 3} width={boxW + 4} height="5" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            <rect x={boxX - 2} y={boxY + boxH - 2} width={boxW + 4} height="5" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />

            {/* Folhas de Vidro Baixas com Puxador Concha */}
            <rect x={boxX + 1} y={boxY + 2} width={boxW / 2 - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.2" rx="1" />
            <circle cx={boxX + boxW * 0.35} cy={midY} r="2.5" fill={hwStyle.accent} />

            <rect x={midX + 1} y={boxY + 2} width={boxW / 2 - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.2" rx="1" />
            <circle cx={boxX + boxW * 0.65} cy={midY} r="2.5" fill={hwStyle.accent} />

            <text x={midX} y={boxY + 12} fill="#fbbf24" fontSize="6.5" fontWeight="bold" textAnchor="middle">
              FECHAMENTO DE PIA
            </text>
          </g>
        )}

        {/* 19. TAMPOS DE MESA & PRATELEIRAS */}
        {(model.category === 'tampo' || model.category === 'prateleira' || model.id === 'tampo_mesa_retangular' || model.id === 'tampo_mesa_redondo' || model.id === 'prateleira_suportes') && (
          <g>
            {model.id === 'tampo_mesa_redondo' ? (
              <>
                <ellipse cx={midX} cy={midY} rx={boxW * 0.45} ry={boxH * 0.35} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="2.5" />
                <ellipse cx={midX} cy={midY} rx={boxW * 0.45} ry={boxH * 0.35} fill={`url(#glassGloss-${uniqueId})`} />
              </>
            ) : model.id === 'prateleira_suportes' ? (
              <>
                <rect x={boxX} y={midY - 4} width={boxW} height="8" fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
                {/* Suportes Pelicano */}
                <rect x={boxX + boxW * 0.2 - 3} y={midY - 7} width="6" height="14" rx="1.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
                <rect x={boxX + boxW * 0.8 - 3} y={midY - 7} width="6" height="14" rx="1.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
              </>
            ) : (
              // Tampo Retangular com Chanfro Lapidado
              <>
                <rect x={boxX} y={boxY + 10} width={boxW} height={boxH - 20} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="3" rx="4" />
                <rect x={boxX} y={boxY + 10} width={boxW} height={boxH - 20} fill={`url(#glassGloss-${uniqueId})`} rx="4" />
                <circle cx={boxX + 8} cy={boxY + 18} r="2" fill="#ffffff" />
                <circle cx={boxX + boxW - 8} cy={boxY + 18} r="2" fill="#ffffff" />
                <circle cx={boxX + 8} cy={boxY + boxH - 18} r="2" fill="#ffffff" />
                <circle cx={boxX + boxW - 8} cy={boxY + boxH - 18} r="2" fill="#ffffff" />
              </>
            )}

            <text x={midX} y={midY + (model.id === 'prateleira_suportes' ? 16 : 0)} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
              {model.label.toUpperCase()}
            </text>
          </g>
        )}

        {/* 20. PAINEL FIXO / VIDRO AVULSO */}
        {model.id === 'painel_fixo' && (
          <g>
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.8" rx="1" />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={`url(#glassGloss-${uniqueId})`} />
            <rect x={boxX} y={boxY} width={boxW} height="4" fill={hwStyle.fill} />
            <rect x={boxX} y={boxY + boxH - 4} width={boxW} height="4" fill={hwStyle.fill} />
            <text x={midX} y={midY} fill="#94a3b8" fontSize="7.5" fontWeight="bold" textAnchor="middle">
              PAINEL FIXO DE VIDRO
            </text>
          </g>
        )}

        {/* 21. 6 FOLHAS (PORTA / JANELA) */}
        {model.id === 'porta_correr_6f' && (
          <g>
            <rect x={boxX - 2} y={boxY - 4} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            <rect x={boxX - 2} y={boxY + boxH - 2} width={boxW + 4} height="5" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            {(() => {
              const leafW = boxW / 6;
              const leafTypes = ['F', 'F', 'M', 'M', 'F', 'F'];
              return (
                <>
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const lx = boxX + i * leafW;
                    const isM = leafTypes[i] === 'M';
                    return (
                      <React.Fragment key={i}>
                        <rect x={lx + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth={isM ? '1.5' : '1.2'} rx="1" />
                        {i > 0 && <line x1={lx} y1={boxY} x2={lx} y2={boxY + boxH} stroke={hwStyle.stroke} strokeWidth={i === 3 ? '2.8' : '1.8'} />}
                        <g>
                          <rect x={lx + leafW / 2 - 7} y={boxY + 5} width="14" height="9" rx="2" fill={isM ? '#0284c7' : '#334155'} fillOpacity="0.9" />
                          <text x={lx + leafW / 2} y={boxY + 11} fill="#ffffff" fontSize="5.5" fontWeight="bold" textAnchor="middle">{leafTypes[i]}</text>
                        </g>
                      </React.Fragment>
                    );
                  })}
                  <rect x={midX - 2.5} y={midY - 12} width="5" height="24" rx="1.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
                  <path d={`M ${midX - 5} ${boxY + boxH * 0.82} L ${boxX + leafW * 2 + 3} ${boxY + boxH * 0.82}`} stroke="#fbbf24" strokeWidth="1.3" markerEnd={`url(#cad-arrow-${uniqueId})`} />
                  <path d={`M ${midX + 5} ${boxY + boxH * 0.82} L ${boxX + leafW * 4 - 3} ${boxY + boxH * 0.82}`} stroke="#fbbf24" strokeWidth="1.3" markerEnd={`url(#cad-arrow-${uniqueId})`} />
                </>
              );
            })()}
          </g>
        )}

        {/* 22. 4 FOLHAS (PORTA / JANELA / BOX CENTRAL) */}
        {(model.id === 'porta_correr_4f' || model.id === 'janela_correr_4f' || model.id === 'box_frontal_4f') && (
          <g>
            <rect x={boxX - 2} y={boxY - 4} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            <rect x={boxX - 2} y={boxY + boxH - 2} width={boxW + 4} height="5" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            {(() => {
              const leafW = boxW / 4;
              return (
                <>
                  {[0, 1, 2, 3].map((i) => {
                    const lx = boxX + i * leafW;
                    const isM = i === 1 || i === 2;
                    return (
                      <React.Fragment key={i}>
                        <rect x={lx + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth={isM ? '1.5' : '1.2'} rx="1" />
                        <rect x={lx + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={`url(#glassGloss-${uniqueId})`} rx="1" />
                        {i > 0 && <line x1={lx} y1={boxY} x2={lx} y2={boxY + boxH} stroke={hwStyle.stroke} strokeWidth={i === 2 ? '2.8' : '2'} />}
                        <g>
                          <rect x={lx + leafW / 2 - 9} y={boxY + 5} width="18" height="10" rx="2" fill={isM ? '#0284c7' : '#334155'} fillOpacity="0.9" />
                          <text x={lx + leafW / 2} y={boxY + 12} fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">{isM ? 'MÓVEL' : 'FIXO'}</text>
                        </g>
                      </React.Fragment>
                    );
                  })}
                  <rect x={midX - 2.5} y={midY - 14} width="5" height="28" rx="1.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
                  <path d={`M ${midX - 6} ${boxY + boxH * 0.82} L ${boxX + leafW + 4} ${boxY + boxH * 0.82}`} stroke="#fbbf24" strokeWidth="1.3" markerEnd={`url(#cad-arrow-${uniqueId})`} />
                  <path d={`M ${midX + 6} ${boxY + boxH * 0.82} L ${boxX + leafW * 3 - 4} ${boxY + boxH * 0.82}`} stroke="#fbbf24" strokeWidth="1.3" markerEnd={`url(#cad-arrow-${uniqueId})`} />
                </>
              );
            })()}
          </g>
        )}

        {/* 23. 3 FOLHAS (PORTA / JANELA / VERSATIK) */}
        {(model.id === 'porta_correr_3f' || model.id === 'box_frontal_3f') && (
          <g>
            <rect x={boxX - 2} y={boxY - 4} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            <rect x={boxX - 2} y={boxY + boxH - 2} width={boxW + 4} height="5" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            {(() => {
              const leafW = boxW / 3;
              return (
                <>
                  {[0, 1, 2].map((i) => {
                    const lx = boxX + i * leafW;
                    const isM = i === 1 || i === 2;
                    return (
                      <React.Fragment key={i}>
                        <rect x={lx + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.4" rx="1" />
                        <rect x={lx + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={`url(#glassGloss-${uniqueId})`} rx="1" />
                        {i > 0 && <line x1={lx} y1={boxY} x2={lx} y2={boxY + boxH} stroke={hwStyle.stroke} strokeWidth="2.2" />}
                      </React.Fragment>
                    );
                  })}
                  <path d={`M ${boxX + leafW * 1.65} ${boxY + boxH * 0.82} L ${boxX + leafW * 0.35} ${boxY + boxH * 0.82}`} stroke="#fbbf24" strokeWidth="1.3" markerEnd={`url(#cad-arrow-${uniqueId})`} />
                </>
              );
            })()}
          </g>
        )}

        {/* 24. 2 FOLHAS PADRÃO (PORTA / JANELA / BOX FRONTAL 1F+1M) */}
        {(model.id === 'porta_correr_2f' || model.id === 'janela_correr_2f' || model.id === 'box_frontal_2f' || (!model.id.includes('6f') && !model.id.includes('4f') && !model.id.includes('3f') && !model.id.includes('fixo') && !model.id.includes('abrir') && !model.id.includes('pivotante') && !model.id.includes('espelho') && !model.id.includes('guarda_corpo') && !model.id.includes('cobertura') && !model.id.includes('tampo') && !model.id.includes('prateleira') && !model.id.includes('fechamento') && !model.id.includes('divisoria') && !model.id.includes('fachada'))) && (
          <g>
            <rect x={boxX - 2} y={boxY - 4} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            <rect x={boxX - 2} y={boxY + boxH - 2} width={boxW + 4} height="5" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            <rect x={boxX - 2} y={boxY} width="4" height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" />
            <rect x={boxX + boxW - 2} y={boxY} width="4" height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" />

            {/* Folha 1 (Móvel - Esquerda) */}
            <rect x={boxX + 1} y={boxY + 2} width={boxW / 2 - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
            <rect x={boxX + 1} y={boxY + 2} width={boxW / 2 - 2} height={boxH - 4} fill={`url(#glassGloss-${uniqueId})`} rx="1" />

            {/* Folha 2 (Fixa - Direita) */}
            <rect x={midX + 2} y={boxY + 2} width={boxW / 2 - 3} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
            <rect x={midX + 2} y={boxY + 2} width={boxW / 2 - 3} height={boxH - 4} fill={`url(#glassGloss-${uniqueId})`} rx="1" />

            {/* Montante / Perfil Central de Divisão */}
            <rect x={midX - 2.5} y={boxY} width="5" height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1.2" rx="0.5" />
            <line x1={midX} y1={boxY} x2={midX} y2={boxY + boxH} stroke={hwStyle.accent} strokeWidth="1.5" />

            {/* Puxador / Roldana */}
            {category === 'box' ? (
              <circle cx={boxX + boxW * 0.38} cy={midY} r="3.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="1" />
            ) : (
              <g>
                <rect x={boxX + boxW * 0.38} y={midY - 14} width="3.5" height="28" rx="1.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
                <circle cx={boxX + boxW * 0.38 + 1.75} cy={midY - 10} r="1" fill="#ffffff" />
                <circle cx={boxX + boxW * 0.38 + 1.75} cy={midY + 10} r="1" fill="#ffffff" />
              </g>
            )}

            {/* Seta de Deslizamento */}
            <path d={`M ${boxX + boxW * 0.32} ${boxY + boxH * 0.82} L ${boxX + boxW * 0.12} ${boxY + boxH * 0.82}`} stroke="#fbbf24" strokeWidth="1.3" markerEnd={`url(#cad-arrow-${uniqueId})`} />

            {/* Badges de Identificação */}
            <g>
              <rect x={boxX + boxW * 0.25 - 20} y={boxY + 6} width="40" height="12" rx="2" fill="#0369a1" fillOpacity="0.85" />
              <text x={boxX + boxW * 0.25} y={boxY + 13.5} fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">MÓVEL (M)</text>
            </g>
            <g>
              <rect x={boxX + boxW * 0.75 - 18} y={boxY + 6} width="36" height="12" rx="2" fill="#334155" fillOpacity="0.85" />
              <text x={boxX + boxW * 0.75} y={boxY + 13.5} fill="#e2e8f0" fontSize="6.5" fontWeight="bold" textAnchor="middle">FIXO (F)</text>
            </g>
          </g>
        )}

        {/* ================= RODAPÉ: INFORMAÇÃO TÉCNICA E NOME ================= */}
        <text
          x={svgW / 2}
          y={svgH - 6}
          fill="#94a3b8"
          fontSize="7.5"
          fontWeight="bold"
          textAnchor="middle"
          className="uppercase tracking-wider"
        >
          {name.length > 30 ? name.substring(0, 30) + '...' : name}
          {!compact && ` • ${model.label}`}
        </text>
      </svg>
    </div>
  );
};
