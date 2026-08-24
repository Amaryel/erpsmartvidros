import React, { useState, useRef } from 'react';
import { X, Package, Check, DollarSign, Camera, Image, Trash2, Sparkles, RefreshCw, Upload } from 'lucide-react';
import { CatalogItem, ProductType } from '../types';
import { saveCatalogItem } from '../services/storage';
import { getSmartProductImage } from '../services/data/repositories/productsRepository';

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
  const [defaultPrice, setDefaultPrice] = useState<number>(initialData?.defaultPrice ?? 150);
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'ativo' | 'inativo'>(initialData?.status || 'ativo');
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = (newType: ProductType) => {
    setType(newType);
    if (newType === 'dimensao' && (unit === 'unidade' || !unit)) {
      setUnit('m²');
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

    // Se o usuário não definiu imagem, atribui uma imagem inteligente automática
    const finalImageUrl = imageUrl.trim() || getSmartProductImage(name, description);

    const updatedCatalog = saveCatalogItem({
      id: initialData?.id,
      name: name.trim(),
      type,
      category: 'produto',
      unit: unit.trim() || (type === 'dimensao' ? 'm²' : 'unidade'),
      defaultPrice: defaultPrice >= 0 ? defaultPrice : 0,
      description: description.trim() || undefined,
      status,
      imageUrl: finalImageUrl,
    });

    // Encontrar o item salvo
    const saved = updatedCatalog.find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()) || updatedCatalog[0];
    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-full border border-slate-200 my-8 space-y-4 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">
                {initialData?.id ? 'Atualize as informações e fotos do produto' : 'Cadastre um novo produto com fotos e catálogo'}
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
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
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

            {/* Hidden Inputs para Upload e Câmera */}
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

            {/* Preview ou Botões de Ação */}
            {imageUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-video max-h-48 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={name || 'Produto'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-[11px] shadow-lg flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tirar Nova Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-black text-[11px] shadow-lg flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Trocar</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Botão Câmera */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-amber-900 transition-all font-bold group"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-sm">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-black">Tirar Foto</span>
                  <span className="text-[9px] text-amber-700/80">Câmera do celular</span>
                </button>

                {/* Botão Galeria */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-100 text-slate-800 transition-all font-bold group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-black">Galeria / Arquivo</span>
                  <span className="text-[9px] text-slate-500">Escolher foto</span>
                </button>

                {/* Botão Sugestão Automática */}
                <button
                  type="button"
                  onClick={handleSuggestImage}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-900 transition-all font-bold group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-black">Sugerir Foto</span>
                  <span className="text-[9px] text-blue-700/80">Baseada no nome</span>
                </button>
              </div>
            )}

            {isCompressing && (
              <div className="text-center text-amber-700 font-bold text-[11px] flex items-center justify-center gap-1.5 py-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Otimizando e comprimindo imagem da câmera...</span>
              </div>
            )}
          </div>

          {/* Tipo de Cálculo de Preço */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Tipo do Produto <span className="text-amber-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleTypeChange('dimensao')}
                className={`py-2 rounded-lg font-bold transition-all text-center ${
                  type === 'dimensao'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Com Dimensões (m²)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('simples')}
                className={`py-2 rounded-lg font-bold transition-all text-center ${
                  type === 'simples'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Produto Simples (Unid)
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {type === 'dimensao'
                ? 'O valor será calculado dinamicamente com base na altura x largura (mm) informadas na venda.'
                : 'O valor será multiplicado diretamente pela quantidade de unidades solicitadas.'}
            </p>
          </div>

          {/* Nome do Produto */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Nome do Produto <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={type === 'dimensao' ? 'Ex: Vidro 4mm Incolor' : 'Ex: Espelho Lapidado 60cm'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Unidade de Venda & Preço Padrão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Unidade de Venda
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
                Preço Padrão ({type === 'dimensao' ? 'R$/m²' : 'R$/un'})
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Descrição (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Especificações do material, espessura, acabamento..."
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
                <span className="text-slate-500">Inativo</span>
              </label>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
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
