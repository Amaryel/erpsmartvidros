import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Check, Package, Info, AlertTriangle, X, Camera, Upload, Sparkles, Image as ImageIcon, Share2, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { CatalogItem, ProductType, CompanyInfo } from '../types';
import { getSmartProductImage } from '../services/data/repositories/productsRepository';

interface CatalogManagerProps {
  catalog: CatalogItem[];
  companyInfo?: CompanyInfo;
  onSaveItem: (item: Omit<CatalogItem, 'id'> & { id?: string }) => void;
  onDeleteItem: (id: string) => void;
  onOpenPublicCatalog?: () => void;
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  catalog,
  companyInfo,
  onSaveItem,
  onDeleteItem,
  onOpenPublicCatalog,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProductType>('dimensao');
  const [defaultPrice, setDefaultPrice] = useState<number>(150);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CatalogItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const publicLink = `${window.location.origin}${window.location.pathname}?catalogo=publico`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleConfirmDelete = () => {
    if (deleteConfirmItem) {
      onDeleteItem(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    }
  };

  const handleStartEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setType(item.type);
    setDefaultPrice(item.defaultPrice);
    setImageUrl(item.imageUrl || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setType('dimensao');
    setDefaultPrice(150);
    setImageUrl('');
  };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
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
          setImageUrl(canvas.toDataURL('image/jpeg', 0.82));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalImage = imageUrl.trim() || getSmartProductImage(name, description);

    onSaveItem({
      id: editingId || undefined,
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      defaultPrice,
      imageUrl: finalImage,
    });

    handleCancelEdit();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Catálogo de Preços & Produtos</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre os produtos com fotos reais e preços padrão de referência para importar rapidamente nos novos orçamentos.
          </p>
        </div>

        {onOpenPublicCatalog && (
          <button
            type="button"
            onClick={onOpenPublicCatalog}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
          >
            <span>✨</span>
            <span>Ver Vitrine do Cliente</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* CARD DE COMPARTILHAMENTO DO CATÁLOGO PÚBLICO */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-zinc-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
              Link Público para Clientes
            </span>
            <h3 className="font-extrabold text-sm text-white">Catálogo Online Sem Necessidade de Login</h3>
          </div>
          <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
            Envie o link do catálogo para seus clientes verem fotos, modelos de boxes, espelhos, portas e solicitarem cotação direta no seu WhatsApp!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs font-bold transition-all border border-zinc-700"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Olá! Conheça nosso Catálogo Digital da *${companyInfo?.name || 'Smart Vidros'}*!\n\n` +
              `Veja nossos modelos de boxes de vidro, espelhos decorativos, portas, janelas e esquadrias de alumínio sob medida no link abaixo:\n` +
              `🔗 ${publicLink}\n\n` +
              `Faça sua cotação direto pelo catálogo ou tire suas dúvidas pelo WhatsApp!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>Enviar no WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Regra do Sistema:</strong> Os preços cadastrados aqui funcionam como sugestão rápida ao criar orçamentos. Alterar um valor no orçamento <u>não modifica</u> este catálogo, e alterar este catálogo <u>não altera</u> orçamentos já salvos.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulário de Adicionar / Editar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-fit space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            <span>{editingId ? 'Editar Item do Catálogo' : 'Novo Item no Catálogo'}</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Foto do Item */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Foto do Produto
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                className="hidden"
              />

              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100">
                  <img src={imageUrl} alt="Produto" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold shadow"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-2 border border-dashed border-amber-300 rounded-xl bg-amber-50 text-amber-900 font-bold flex flex-col items-center gap-1"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Câmera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-700 font-bold flex flex-col items-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Galeria</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => name && setImageUrl(getSmartProductImage(name, description))}
                    className="p-2 border border-dashed border-blue-200 rounded-xl bg-blue-50 text-blue-900 font-bold flex flex-col items-center gap-1"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Sugerir</span>
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tipo do Produto
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setType('dimensao')}
                  className={`py-1.5 rounded-lg font-bold transition-colors ${
                    type === 'dimensao' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Dimensão (m²)
                </button>
                <button
                  type="button"
                  onClick={() => setType('simples')}
                  className={`py-1.5 rounded-lg font-bold transition-colors ${
                    type === 'simples' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Simples (Unidade)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nome do Produto <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Vidro 4mm Incolor"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Descrição (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Vidro comum 4mm lapidado"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Preço Padrão ({type === 'dimensao' ? 'R$/m²' : 'R$/un'})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="pt-2 flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-1/2 py-2 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingId ? 'Salvar Alterações' : 'Adicionar ao Catálogo'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Itens do Catálogo */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Produtos Cadastrados ({catalog.length})
          </h2>

          <div className="space-y-3">
            {catalog.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{item.name}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {item.type === 'dimensao' ? 'Área m²' : 'Unidade'}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500">{item.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Preço Padrão</p>
                    <p className="text-sm font-extrabold font-mono text-amber-600">
                      R$ {item.defaultPrice.toFixed(2)}{' '}
                      <span className="text-[10px] text-slate-400">{item.type === 'dimensao' ? '/m²' : '/un'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                      title="Editar Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmItem(item)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão de Catálogo */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Excluir do Catálogo Base</span>
              </div>
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Tem certeza que deseja remover o item{' '}
              <strong className="text-slate-900 font-bold">"{deleteConfirmItem.name}"</strong> do catálogo?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all active:scale-95"
              >
                Sim, Remover Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
