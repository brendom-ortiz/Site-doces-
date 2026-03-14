
import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Check, X, Wand2, Upload, LayoutGrid, ListTree, ChevronRight, Phone, Download, Database, RefreshCcw, Camera, History, TrendingUp, Lock } from 'lucide-react';
import { Section, Sweet } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  whatsappNumber: string;
  setWhatsappNumber: (val: string) => void;
  orderCounter: number;
  resetOrderCounter: () => void;
  salesHistory: { id: string; timestamp: string; total: number }[];
  adminCredentials: { username: string; password: string };
  setAdminCredentials: (creds: { username: string; password: string }) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<Props> = ({ 
  sections, 
  setSections, 
  whatsappNumber, 
  setWhatsappNumber, 
  orderCounter,
  resetOrderCounter,
  salesHistory,
  adminCredentials,
  setAdminCredentials,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<string>('config'); 
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [tempSectionTitle, setTempSectionTitle] = useState('');
  const [editingSweet, setEditingSweet] = useState<{ sectionId: string, sweet: Sweet | null }>({ sectionId: '', sweet: null });
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [newAdminUsername, setNewAdminUsername] = useState(adminCredentials.username);
  const [newAdminPassword, setNewAdminPassword] = useState(adminCredentials.password);
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionImageInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    const data = { sections, whatsappNumber, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `doce-palato-backup-${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.sections && json.whatsappNumber) {
          if (confirm('Deseja substituir o cardápio atual?')) {
            setSections(json.sections);
            setWhatsappNumber(json.whatsappNumber);
          }
        }
      } catch (err) { alert('Erro ao ler arquivo'); }
    };
    reader.readAsText(file);
  };

  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    const newId = Date.now().toString();
    setSections([...sections, { id: newId, title: newSectionTitle, items: [], isGallery: false }]);
    setNewSectionTitle('');
    setIsAddingSection(false);
    setActiveTab(newId);
  };

  const toggleGalleryMode = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, isGallery: !s.isGallery } : s));
  };

  const startRenaming = (section: Section) => {
    setEditingSectionId(section.id);
    setTempSectionTitle(section.title);
  };

  const saveSectionName = () => {
    if (!tempSectionTitle.trim() || !editingSectionId) return;
    setSections(prev => prev.map(s => s.id === editingSectionId ? { ...s, title: tempSectionTitle } : s));
    setEditingSectionId(null);
  };

  const deleteSection = (id: string) => {
    if (confirm('Remover esta aba e todos os itens dentro dela?')) {
      setSections(sections.filter(s => s.id !== id));
      setActiveTab('config');
    }
  };

  const saveSweet = () => {
    if (!editingSweet.sweet || !editingSweet.sweet.name) return;
    setSections(prev => prev.map(s => {
      if (s.id === editingSweet.sectionId) {
        const exists = s.items.find(item => item.id === editingSweet.sweet!.id);
        if (exists) return { ...s, items: s.items.map(item => item.id === editingSweet.sweet!.id ? editingSweet.sweet! : item) };
        return { ...s, items: [...s.items, editingSweet.sweet!] };
      }
      return s;
    }));
    setEditingSweet({ sectionId: '', sweet: null });
  };

  const deleteSweet = (sectionId: string, sweetId: string) => {
    if (confirm('Remover este item?')) {
      setSections(prev => prev.map(s => {
        if (s.id === sectionId) {
          return { ...s, items: s.items.filter(item => item.id !== sweetId) };
        }
        return s;
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingSweet.sweet) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingSweet({
          ...editingSweet,
          sweet: { ...editingSweet.sweet!, imageUrl: reader.result as string }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingSectionId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSections(prev => prev.map(s => s.id === uploadingSectionId ? { ...s, imageUrl: reader.result as string } : s));
        setUploadingSectionId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const helpWithDescription = async () => {
    if (!editingSweet.sweet?.name) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Escreva uma descrição curta e irresistível para um doce gourmet chamado "${editingSweet.sweet.name}". Use no máximo 15 palavras.`,
      });
      const desc = response.text || '';
      setEditingSweet(prev => prev.sweet ? ({
        ...prev,
        sweet: { ...prev.sweet, description: desc.trim().replace(/^"|"$/g, '') }
      }) : prev);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const activeSection = sections.find(s => s.id === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-rose-100 pb-4 gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-emerald-900 truncate">Configurações</h2>
          <p className="text-xs text-rose-400 font-bold uppercase tracking-widest truncate">Painel Administrativo</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-full text-rose-300 transition-colors shrink-0">
          <X size={24} />
        </button>
      </div>

      <div className="relative group">
        <div className="flex overflow-x-auto pb-4 gap-2 scroll-smooth px-1 touch-pan-x no-scrollbar">
          <button 
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all border-2 shrink-0 ${
              activeTab === 'config' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-emerald-700 border-emerald-50 hover:border-rose-200'
            }`}
          >
            <ListTree size={16} /> Geral
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all border-2 shrink-0 ${
              activeTab === 'history' ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-white text-rose-700 border-rose-50 hover:border-emerald-200'
            }`}
          >
            <History size={16} /> Histórico
          </button>
          {sections.map(s => (
            <button 
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all border-2 shrink-0 ${
                activeTab === s.id ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-white text-rose-700 border-rose-50 hover:border-emerald-200'
              }`}
            >
              <LayoutGrid size={16} /> {s.title}
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#FFF5F7] to-transparent pointer-events-none" />
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'history' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Hoje', period: 'day' },
                { label: 'Semana', period: 'week' },
                { label: 'Mês', period: 'month' },
                { label: 'Ano', period: 'year' }
              ].map(({ label, period }) => {
                const now = new Date();
                const total = salesHistory.filter(sale => {
                  const saleDate = new Date(sale.timestamp);
                  if (period === 'day') return saleDate.toDateString() === now.toDateString();
                  if (period === 'week') {
                    const diff = now.getTime() - saleDate.getTime();
                    return diff < 7 * 24 * 60 * 60 * 1000;
                  }
                  if (period === 'month') return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
                  if (period === 'year') return saleDate.getFullYear() === now.getFullYear();
                  return false;
                }).reduce((acc, s) => acc + s.total, 0);

                return (
                  <div key={period} className="bg-white p-5 rounded-3xl border border-rose-50 shadow-sm">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-xl font-black text-emerald-900">R$ {total.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white p-6 rounded-[3rem] border border-emerald-50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={20} /></div>
                <h4 className="font-bold text-emerald-900">Últimos Pedidos</h4>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {salesHistory.length === 0 ? (
                  <p className="text-center py-8 text-rose-200 font-bold italic">Nenhum pedido registrado ainda.</p>
                ) : (
                  [...salesHistory].reverse().map(sale => (
                    <div key={sale.id} className="flex justify-between items-center p-3 bg-rose-50/30 rounded-2xl border border-rose-100/50">
                      <div>
                        <p className="text-xs font-bold text-emerald-900">{new Date(sale.timestamp).toLocaleString()}</p>
                        <p className="text-[10px] text-rose-400 font-bold uppercase">ID: {sale.id.slice(-6)}</p>
                      </div>
                      <p className="font-black text-emerald-700">R$ {sale.total.toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'config' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
            
            <div className="bg-white p-6 rounded-[2rem] border border-rose-50 shadow-sm space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                   <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900">WhatsApp de Pedidos</h4>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Destinatário das comandas</p>
                </div>
              </div>
              <input 
                className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-rose-50 text-emerald-900 font-bold"
                placeholder="55 (DDD) 99999-9999"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
              />
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-rose-50 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                    <RefreshCcw size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900">Contador de Comandas</h4>
                    <p className="text-[10px] text-rose-400 font-bold uppercase">Número atual: #{orderCounter.toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => confirm('Zerar a fila de comandas e voltar para #0001?') && resetOrderCounter()}
                  className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-200 transition-colors"
                >
                  Zerar Fila
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-emerald-50 shadow-sm space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                   <Lock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900">Acesso Administrativo</h4>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Mudar login e senha</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-emerald-800 uppercase ml-1 block mb-1">Novo Usuário</label>
                  <input 
                    className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-2 outline-none focus:ring-2 ring-emerald-100 text-emerald-900 font-bold text-sm"
                    value={newAdminUsername}
                    onChange={e => setNewAdminUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-emerald-800 uppercase ml-1 block mb-1">Nova Senha</label>
                  <input 
                    type="password"
                    className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-2 outline-none focus:ring-2 ring-emerald-100 text-emerald-900 text-sm"
                    value={newAdminPassword}
                    onChange={e => setNewAdminPassword(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => {
                    if (confirm('Deseja realmente alterar as credenciais de acesso?')) {
                      setAdminCredentials({ username: newAdminUsername, password: newAdminPassword });
                      setIsSavingCreds(true);
                      setTimeout(() => setIsSavingCreds(false), 2000);
                    }
                  }}
                  className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isSavingCreds ? <Check size={16} /> : <RefreshCcw size={16} />}
                  {isSavingCreds ? 'Credenciais Salvas!' : 'Atualizar Acesso'}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-emerald-50 shadow-sm space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                   <LayoutGrid size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900">Editar Abas do Cardápio</h4>
                  <p className="text-[10px] text-rose-400 font-bold uppercase">Gerenciar Categorias</p>
                </div>
              </div>

              <div className="grid gap-2">
                {sections.map(section => (
                  <div key={section.id} className="flex flex-col p-3 bg-rose-50/30 rounded-xl border border-rose-100/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-rose-100 relative group cursor-pointer shrink-0"
                        onClick={() => {
                          setUploadingSectionId(section.id);
                          sectionImageInputRef.current?.click();
                        }}
                      >
                        {section.imageUrl ? (
                          <img src={section.imageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-rose-200">
                            <Camera size={20} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-emerald-900/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload size={14} />
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          {editingSectionId === section.id ? (
                            <div className="flex gap-2 flex-grow">
                              <input 
                                autoFocus
                                className="bg-white px-3 py-1.5 rounded-lg outline-none text-emerald-900 font-bold border border-emerald-100 w-full"
                                value={tempSectionTitle}
                                onChange={e => setTempSectionTitle(e.target.value)}
                              />
                              <button onClick={saveSectionName} className="text-emerald-600"><Check size={20} /></button>
                              <button onClick={() => setEditingSectionId(null)} className="text-rose-400"><X size={20} /></button>
                            </div>
                          ) : (
                            <span className="font-bold text-emerald-800 truncate">{section.title}</span>
                          )}
                          <div className="flex gap-1">
                            <button onClick={() => startRenaming(section)} className="p-1.5 text-rose-300 hover:text-rose-600"><Edit2 size={16} /></button>
                            <button onClick={() => deleteSection(section.id)} className="p-1.5 text-rose-200 hover:text-rose-600"><Trash2 size={16} /></button>
                          </div>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                           <button 
                            onClick={() => toggleGalleryMode(section.id)}
                            className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1 transition-all ${section.isGallery ? 'bg-emerald-600 text-white' : 'bg-rose-100 text-rose-500'}`}
                           >
                              <Camera size={10} /> {section.isGallery ? 'Modo Exposição Ativo' : 'Mudar para Exposição'}
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <input type="file" ref={sectionImageInputRef} className="hidden" accept="image/*" onChange={handleSectionImageChange} />

                {isAddingSection ? (
                  <div className="flex gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 animate-in zoom-in-95">
                    <input 
                      autoFocus
                      className="flex-grow bg-white px-3 py-2 rounded-lg outline-none text-emerald-900 font-bold border border-emerald-200"
                      placeholder="Nome da Aba..."
                      value={newSectionTitle}
                      onChange={e => setNewSectionTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSection()}
                    />
                    <button onClick={addSection} className="bg-emerald-600 text-white p-2 rounded-lg"><Check size={20} /></button>
                    <button onClick={() => setIsAddingSection(false)} className="bg-rose-100 text-rose-500 p-2 rounded-lg"><X size={20} /></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAddingSection(true)}
                    className="w-full py-4 border-2 border-dashed border-emerald-100 text-emerald-400 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all font-bold text-sm"
                  >
                    <Plus size={18} /> Criar Nova Aba
                  </button>
                )}
              </div>
            </div>

            <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-500 text-white rounded-xl"><Database size={20} /></div>
                <h4 className="font-bold text-rose-900">Backup dos Dados</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={handleExportData} className="bg-white border border-rose-200 text-rose-800 font-bold py-3 rounded-xl hover:bg-rose-100 text-sm flex items-center justify-center gap-2"><Download size={18} /> Exportar</button>
                <button onClick={() => importFileRef.current?.click()} className="bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 text-sm flex items-center justify-center gap-2"><RefreshCcw size={18} /> Importar</button>
                <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={handleImportData} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">{activeSection?.title}</h3>
                  <p className="text-[10px] text-rose-400 font-bold uppercase">
                    {activeSection?.isGallery ? 'Gerenciar itens de Exposição' : 'Gerenciar itens de Venda'}
                  </p>
                </div>
                <button 
                  onClick={() => activeSection && setEditingSweet({ sectionId: activeSection.id, sweet: { id: Date.now().toString(), name: '', description: '', price: 0, imageUrl: 'https://images.unsplash.com/photo-1570476922354-81227cdbb76c?q=80&w=400' } })} 
                  className="bg-rose-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Plus size={16} /> Novo Item
                </button>
             </div>
             
             <div className="grid gap-3">
                {activeSection?.items.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-rose-100 rounded-3xl text-rose-200 font-bold italic">Nenhum item aqui ainda.</div>
                ) : (
                  activeSection?.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-rose-50 shadow-sm hover:border-emerald-200 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-rose-50 border border-rose-100">
                          <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-900">{item.name}</p>
                          {!activeSection?.isGallery && <p className="text-sm font-black text-rose-500">R$ {item.price.toFixed(2)}</p>}
                          {activeSection?.isGallery && <p className="text-[10px] text-emerald-400 font-bold uppercase">Item de Exposição</p>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => activeSection && setEditingSweet({ sectionId: activeSection.id, sweet: item })} className="p-2 text-rose-200 hover:text-emerald-700 transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => activeSection && deleteSweet(activeSection.id, item.id)} className="p-2 text-rose-200 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}
      </div>

      {editingSweet.sweet && (
        <div className="fixed inset-0 z-[60] bg-emerald-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFF5F7] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-8 my-auto border border-white">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-emerald-900">
               <div className="p-2 bg-rose-500 text-white rounded-xl shadow-lg"><Edit2 size={24} /></div>
               {activeSection?.isGallery ? 'Item da Vitrine' : 'Detalhes do Doce'}
            </h3>
            
            <div className="space-y-4">
               <div className="flex flex-col items-center gap-2">
                 <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border-2 border-rose-100 relative group">
                   <img src={editingSweet.sweet.imageUrl} className="w-full h-full object-cover" />
                   <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-emerald-900/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Upload size={20} /></button>
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>

               <div>
                 <label className="text-[10px] font-black text-emerald-800 uppercase ml-1 block mb-1">Título / Nome</label>
                 <input className="w-full bg-white border border-rose-100 rounded-xl px-4 py-3 text-emerald-900 font-bold outline-none focus:ring-2 ring-rose-200" placeholder="Ex: Bolo de Casamento Classic" value={editingSweet.sweet.name} onChange={e => setEditingSweet({...editingSweet, sweet: {...editingSweet.sweet!, name: e.target.value}})} />
               </div>

               <div>
                <label className="text-[10px] font-black text-emerald-800 uppercase ml-1 flex justify-between items-center mb-1">
                  Legenda / Descrição
                  <button onClick={helpWithDescription} disabled={isGenerating} className="text-rose-500 flex items-center gap-1 hover:underline text-[9px]"><Wand2 size={10} /> IA</button>
                </label>
                <textarea className="w-full bg-white border border-rose-100 rounded-xl px-4 py-3 text-emerald-900 text-sm outline-none focus:ring-2 ring-rose-200 min-h-[80px]" placeholder="Breve descrição da obra..." value={editingSweet.sweet.description} onChange={e => setEditingSweet({...editingSweet, sweet: {...editingSweet.sweet!, description: e.target.value}})} />
               </div>

               {!activeSection?.isGallery && (
                 <div>
                   <label className="text-[10px] font-black text-emerald-800 uppercase ml-1 block mb-1">Preço (R$)</label>
                   <input type="number" step="0.01" className="w-full bg-white border border-rose-100 rounded-xl px-4 py-3 text-emerald-900 font-black text-xl outline-none focus:ring-2 ring-rose-200" placeholder="0,00" value={editingSweet.sweet.price || ''} onChange={e => setEditingSweet({...editingSweet, sweet: {...editingSweet.sweet!, price: parseFloat(e.target.value) || 0}})} />
                 </div>
               )}

               <div className="flex gap-4 mt-6">
                 <button onClick={() => setEditingSweet({sectionId: '', sweet: null})} className="flex-1 bg-rose-100 text-rose-600 font-black py-4 rounded-xl uppercase text-xs">Cancelar</button>
                 <button onClick={saveSweet} className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-xl uppercase text-xs shadow-xl shadow-emerald-100">Salvar</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
