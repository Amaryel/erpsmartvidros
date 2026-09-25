import React, { useState, useRef } from 'react';
import {
  X,
  Package,
  Check,
  DollarSign,
  Camera,
  Image,
  Trash2,
  Sparkles,
  RefreshCw,
  Upload,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layers,
  Eye
} from 'lucide-react';
import { CatalogItem, ProductType, TechnicalCategory } from '../types';
import { saveCatalogItem } from '../services/storage';
import { getSmartProductImage } from '../services/data/repositories/productsRepository';
import { TechnicalFieldSelect } from './TechnicalFieldSelect';
import { TechnicalProductPreview, detectTechnicalCategory } from './TechnicalProductPreview';

const GLASS_TYPES = ['Temperado', 'Laminado', 'Comum (Float)', 'Insulado', 'Aramado', 'Serigrafado'];
const GLASS_THICKNESSES = ['3mm', '4mm', '5mm', '6mm', '8mm', '10mm', '12mm', '15mm', '19mm'];
const GLASS_COLORS = ['Incolor', 'Fumê', 'Verde', 'Bronze', 'Astral (Azul)', 'Antílope', 'Pontilhado', 'Quadrato', 'Jateado / Fosco', 'Refletivo'];
const HARDWARE_COLORS = ['Preta', 'Branca', 'Fosco / Natural', 'Bronze', 'Champagne', 'Cromada / Inox', 'Dourada / Ouro', 'Cinza'];
const ALUMINUM_LINES = ['Suprema', 'Gold', 'Convencional', 'Elegance', 'Slide', 'Versatik', 'Engenharia', 'Linha 25'];
const OPENING_TYPES = ['De Correr (Slide)', 'Pivotante', 'Fixo', 'Basculante', 'Maxim-ar', 'De Abrir (Giro)', 'Sanfonada (Articulada)'];
const LEAF_COUNTS = ['1 Folha', '2 Folhas (1F+1M)', '4 Folhas (2F+2M)', '3 Folhas (2F+1M)', '3 Folhas Móveis', '6 Folhas (4F+2M)', 'Fixo Inteiro'];
const FINISH_OPTIONS = ['Lapidado Reto', 'Bisotê 25mm', 'Bisotê 15mm', 'Bisotê 10mm', 'Canto Moeda', 'Jateado Total', 'Jateado com Desenho', 'Canto Reto'];

const TECH_CATEGORIES: { id: TechnicalCategory; label: string }[] = [
  { id: 'vidro', label: 'Vidro / Painel' },
  { id: 'box', label: 'Box de Banheiro' },
  { id: 'porta', label: 'Porta' },
  { id: 'janela', label: 'Janela' },
  { id: 'espelho', label: 'Espelho' },
  { id: 'guarda_corpo', label: 'Guarda-Corpo / Sacada' },
  { id: 'outro', label: 'Outro' },
];

interface ProductFormModalProps {
  initialData?: Partial<CatalogItem> | null;
  onClose: () => void;
  onSave: (savedItem: CatalogItem) => void;
  title?: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialData,
  onClose,
  onSave,
  title = 'Cadastrar Novo Produto',
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<ProductType>(initialData?.type || 'dimensao');
  const [unit, setUnit] = useState(initialData?.unit || (type === 'dimensao' ? 'm²' : 'unidade'));
  const [defaultPrice, setDefaultPrice] = useState<number | ''>(
    initialData?.defaultPrice !== undefined ? initialData.defaultPrice : 150
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'ativo' | 'inativo'>(initialData?.status || 'ativo');
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || '');

  // Características Técnicas Editáveis com suporte a vazio e novos tipos
  const [technicalCategory, setTechnicalCategory] = useState<TechnicalCategory>(
    initialData?.technicalCategory || detectTechnicalCategory(initialData?.name || '')
  );
  const [glassType, setGlassType] = useState(initialData?.glassType ?? 'Temperado');
  const [thickness, setThickness] = useState(initialData?.thickness ?? '8mm');
  const [glassColor, setGlassColor] = useState(initialData?.glassColor ?? 'Incolor');
  const [hardwareColor, setHardwareColor] = useState(initialData?.hardwareColor ?? 'Preta');
  const [line, setLine] = useState(initialData?.line ?? 'Suprema');
  const [openingType, setOpeningType] = useState(initialData?.openingType ?? 'De Correr (Slide)');
  const [leafCount, setLeafCount] = useState(initialData?.leafCount ?? '2 Folhas (1F+1M)');
  const [finish, setFinish] = useState(initialData?.finish ?? 'Lapidado Reto');
  
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(
    Boolean(initialData?.glassType || initialData?.thickness || initialData?.hardwareColor || initialData?.line || initialData?.type === 'dimensao')
  );

  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = (newType: ProductType) => {
    setType(newType);
    if (newType === 'dimensao' && (unit === 'unidade' || !unit)) {
      setUnit('m²');
      setShowTechnicalDetails(true);
    } else if (newType === 'simples' && unit === 'm²') {
      setUnit('unidade');
    }
  };

  // Compressão de imagem usando HTML5 Canvas para otimização de armazenamento
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    setIsCompressing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setImageUrl(compressedDataUrl);
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        setError('Erro ao carregar a imagem selecionada.');
        setIsCompressing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setError('Falha na leitura do arquivo de imagem.');
      setIsCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processImageFile(files[0]);
    }
  };

  const handleSuggestImage = () => {
    if (!name.trim()) {
      setError('Digite o nome do produto primeiro para sugerir uma imagem compatível.');
      return;
    }
    const suggested = getSmartProductImage(name, description);
    setImageUrl(suggested);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O Nome do produto é obrigatório.');
      return;
    }

    const finalImageUrl = imageUrl.trim() || getSmartProductImage(name, description);
    const numPrice = typeof defaultPrice === 'number' ? defaultPrice : (defaultPrice ? parseFloat(String(defaultPrice)) : 0);

    const updatedCatalog = saveCatalogItem({
      id: initialData?.id,
      name: name.trim(),
      type,
      category: 'produto',
      unit: unit.trim() || (type === 'dimensao' ? 'm²' : 'unidade'),
      defaultPrice: numPrice >= 0 ? numPrice : 0,
      description: description.trim() || undefined,
      status,
      imageUrl: finalImageUrl,
      
      // Características Técnicas
      technicalCategory,
      glassType: glassType.trim() ? glassType.trim() : undefined,
      thickness: thickness.trim() ? thickness.trim() : undefined,
      glassColor: glassColor.trim() ? glassColor.trim() : undefined,
      hardwareColor: hardwareColor.trim() ? hardwareColor.trim() : undefined,
      aluminumColor: hardwareColor.trim() ? hardwareColor.trim() : undefined,
      line: line.trim() ? line.trim() : undefined,
      openingType: openingType.trim() ? openingType.trim() : undefined,
      leafCount: leafCount.trim() ? leafCount.trim() : undefined,
      finish: finish.trim() ? finish.trim() : undefined,
    });

    const saved = updatedCatalog.find((c) => c.id === initialData?.id || c.name.trim().toLowerCase() === name.trim().toLowerCase()) || updatedCatalog[0];
    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl max-w-2xl w-full border border-slate-200 my-6 space-y-4 animate-in fade-in zoom-in duration-200 text-slate-900 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">
                {initialData?.id ? 'Edite os dados, características técnicas (ou deixe vazio) e foto' : 'Cadastre um novo produto com especificações técnicas e desenhos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 font-semibold shrink-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          
          {/* Seção de Foto do Produto / Câmera */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Image className="w-4 h-4 text-amber-600" />
                <span>Foto Real do Produto</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Foto</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Preview da Foto */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-200/70 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-inner">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview do produto"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400 flex flex-col items-center">
                    <Package className="w-7 h-7 mb-1 opacity-40" />
                    <span className="text-[10px] font-semibold">Sem foto</span>
                  </div>
                )}
                {isCompressing && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-[10px] font-bold">
                    Otimizando...
                  </div>
                )}
              </div>

              {/* Ações de Foto */}
              <div className="flex-1 w-full space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl transition-colors shadow-xs active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tirar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2 px-3 rounded-xl transition-colors shadow-xs active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Galeria</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSuggestImage}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 py-1.5 px-2.5 rounded-lg transition-colors w-full justify-center"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Sugerir Foto Inteligente de Vidraçaria</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tipo de Cálculo: Metro Quadrado vs Unidade */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Tipo de Precificação <span className="text-amber-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('dimensao')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${
                  type === 'dimensao'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-950 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="text-xs">Por Metro Quadrado (m²)</div>
                  <div className="text-[10px] font-normal text-slate-500">Vidros, Box, Portas, Janelas, Espelhos</div>
                </div>
                {type === 'dimensao' && <Check className="w-4 h-4 text-amber-600 shrink-0 ml-1" />}
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('simples')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${
                  type === 'simples'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-950 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="text-xs">Por Unidade / Peça / Serviço</div>
                  <div className="text-[10px] font-normal text-slate-500">Puxadores, Fechaduras, Kits, Mão de obra</div>
                </div>
                {type === 'simples' && <Check className="w-4 h-4 text-amber-600 shrink-0 ml-1" />}
              </button>
            </div>
          </div>

          {/* Nome do Produto */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Nome do Produto / Modelo <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
                setTechnicalCategory(detectTechnicalCategory(e.target.value, technicalCategory));
              }}
              placeholder={type === 'dimensao' ? 'Ex: Box Frontal 8mm Incolor F1' : 'Ex: Espelho Lapidado 60cm'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Unidade de Venda & Preço Padrão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Unidade de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              >
                <option value="m²">m² (Metro Quadrado)</option>
                <option value="unidade">Unidade (un)</option>
                <option value="peça">Peça</option>
                <option value="barra">Barra</option>
                <option value="m">Metro Linear (m)</option>
                <option value="caixa">Caixa</option>
                <option value="kit">Kit</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Preço Base ({type === 'dimensao' ? 'R$/m²' : 'R$/un'})
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  inputMode="decimal"
                  value={defaultPrice !== undefined && defaultPrice !== null ? defaultPrice : ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setDefaultPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO EXPANSÍVEL: Características Técnicas Detalhadas + Desenho Técnico em Tempo Real */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/70">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-3 flex items-center justify-between font-extrabold text-slate-800 hover:bg-slate-100 transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Características Técnicas & Desenho Técnico Arquitetônico</span>
              </span>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showTechnicalDetails && (
              <div className="p-3.5 pt-1 space-y-3.5 border-t border-slate-200 bg-white">
                
                {/* Visualizador do Desenho Técnico em Tempo Real */}
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:w-48 shrink-0">
                    <TechnicalProductPreview
                      name={name || 'Produto'}
                      category={technicalCategory}
                      glassColor={glassColor}
                      hardwareColor={hardwareColor}
                      openingType={openingType}
                      leafCount={leafCount}
                      compact={true}
                      showDimensions={false}
                    />
                  </div>
                  <div className="text-slate-300 text-xs space-y-1">
                    <div className="font-bold text-amber-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Desenho Técnico Gerado Automaticamente</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      O sistema reconhece automaticamente a quantidade de folhas (<strong className="text-white">{leafCount || '2 Folhas'}</strong>), as cores do vidro (<strong className="text-white">{glassColor || 'Incolor'}</strong>) e ferragens (<strong className="text-white">{hardwareColor || 'Vazio'}</strong>) para desenhar com precisão nos orçamentos e PDFs.
                    </p>
                  </div>
                </div>

                {/* Categoria Técnica */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Categoria Técnica do Produto
                  </label>
                  <select
                    value={technicalCategory}
                    onChange={(e) => setTechnicalCategory(e.target.value as TechnicalCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 text-xs"
                  >
                    {TECH_CATEGORIES.map((tc) => (
                      <option key={tc.id} value={tc.id}>{tc.label}</option>
                    ))}
                  </select>
                </div>

                {/* Grid de Características Técnicas com Seleção Inteligente, Opção Vazio e Cadastro de Novo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Cor da Ferragem / Alumínio */}
                  <TechnicalFieldSelect
                    label="Cor da Ferragem / Alumínio"
                    value={hardwareColor}
                    onChange={setHardwareColor}
                    presets={HARDWARE_COLORS}
                    placeholder="Ex: Dourada Rosé, Champanhe..."
                    emptyLabel="🚫 Vazio (Sem ferragem / Não se aplica)"
                  />

                  {/* Número de Folhas */}
                  <TechnicalFieldSelect
                    label="Número de Folhas (Layout)"
                    value={leafCount}
                    onChange={setLeafCount}
                    presets={LEAF_COUNTS}
                    placeholder="Ex: 4 Folhas (2F+2M), 1F..."
                    emptyLabel="🚫 Vazio (Não especificado)"
                  />

                  {/* Tipo de Vidro */}
                  <TechnicalFieldSelect
                    label="Tipo de Vidro"
                    value={glassType}
                    onChange={setGlassType}
                    presets={GLASS_TYPES}
                    placeholder="Ex: Temperado, Laminado..."
                    emptyLabel="🚫 Vazio (Sem vidro / Não se aplica)"
                  />

                  {/* Espessura */}
                  <TechnicalFieldSelect
                    label="Espessura"
                    value={thickness}
                    onChange={setThickness}
                    presets={GLASS_THICKNESSES}
                    placeholder="Ex: 8mm, 10mm, 6+6mm..."
                    emptyLabel="🚫 Vazio (Não especificado)"
                  />

                  {/* Cor do Vidro */}
                  <TechnicalFieldSelect
                    label="Cor do Vidro"
                    value={glassColor}
                    onChange={setGlassColor}
                    presets={GLASS_COLORS}
                    placeholder="Ex: Fumê, Incolor, Astral..."
                    emptyLabel="🚫 Vazio (Não especificado)"
                  />

                  {/* Linha de Perfil */}
                  <TechnicalFieldSelect
                    label="Linha do Perfil / Alumínio"
                    value={line}
                    onChange={setLine}
                    presets={ALUMINUM_LINES}
                    placeholder="Ex: Suprema, Gold, Versatik..."
                    emptyLabel="🚫 Vazio (Sem linha específica)"
                  />

                  {/* Tipo de Abertura */}
                  <TechnicalFieldSelect
                    label="Tipo de Abertura"
                    value={openingType}
                    onChange={setOpeningType}
                    presets={OPENING_TYPES}
                    placeholder="Ex: De Correr, Pivotante, Maxim-ar..."
                    emptyLabel="🚫 Vazio (Não especificado)"
                  />

                  {/* Lapidação / Acabamento */}
                  <TechnicalFieldSelect
                    label="Lapidação / Acabamento"
                    value={finish}
                    onChange={setFinish}
                    presets={FINISH_OPTIONS}
                    placeholder="Ex: Lapidado Reto, Bisotê 25mm..."
                    emptyLabel="🚫 Vazio (Sem acabamento especial)"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Observações / Descrição do Produto
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Especificações adicionais, indicações de instalação..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Status do Produto
            </label>
            <div className="flex items-center gap-4 bg-slate-50 p-2 border border-slate-200 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="radio"
                  name="productStatus"
                  value="ativo"
                  checked={status === 'ativo'}
                  onChange={() => setStatus('ativo')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span className="text-emerald-700 font-bold">Ativo</span> (Visível no catálogo)
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="radio"
                  name="productStatus"
                  value="inativo"
                  checked={status === 'inativo'}
                  onChange={() => setStatus('inativo')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span className="text-slate-500 font-bold">Inativo</span> (Oculto no catálogo)
              </label>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-colors text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black transition-all shadow-md active:scale-95 text-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Produto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
