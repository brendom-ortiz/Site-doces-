
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Settings, LogOut, ChevronRight, Sparkles, Camera, Heart, Home, LayoutGrid, Star, Phone, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Section, Sweet, CartItem } from './types';
import BrigadeiroLogo from './components/BrigadeiroLogo';
import SweetCard from './components/SweetCard';
import AdminPanel from './components/AdminPanel';
import CartSheet from './components/CartSheet';
import LoginForm from './components/LoginForm';

const INITIAL_DATA: Section[] = [
  {
    id: '1',
    title: 'Brigadeiros Premium',
    items: [
      { id: 'b1', name: 'Brigadeiro Gourmet', description: 'O clássico feito com chocolate Callebaut 54%.', price: 6.5, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400' },
      { id: 'b2', name: 'Ninho com Nutella', description: 'Massa cremosa de leite ninho com coração de avelã.', price: 7.5, imageUrl: 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    id: '2',
    title: 'Bolos & Fatias',
    items: [
      { id: 'f1', name: 'Fatia Supreme Pistache', description: 'Camadas generosas de mousse e brigadeiro de pistache.', price: 22.0, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    id: '3',
    title: 'Eventos & Casamentos',
    items: [
      { id: 'e1', name: 'Cento de Doces Finos', description: 'Seleção especial com 100 unidades para grandes celebrações.', price: 450.0, imageUrl: 'https://images.unsplash.com/photo-1519340333755-5072134d2251?auto=format&fit=crop&q=80&w=400' },
      { id: 'e2', name: 'Torre de Brigadeiros', description: 'Estrutura elegante com 120 brigadeiros decorados.', price: 580.0, imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    id: 'gallery_unique',
    title: 'Vitrine',
    isGallery: true,
    items: [
      { id: 'g1', name: 'Bolo de Casamento Floral', description: 'Design exclusivo com flores comestíveis.', price: 0, imageUrl: 'https://images.unsplash.com/photo-1535254973040-607b474cb8c2?auto=format&fit=crop&q=80&w=800' },
      { id: 'g2', name: 'Mesa de Doces Rústica', description: 'Composição para eventos ao ar livre.', price: 0, imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800' },
      { id: 'g3', name: 'Detalhes em Ouro', description: 'Finalização artesanal com folhas de ouro 24k.', price: 0, imageUrl: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800' }
    ]
  }
];

const App: React.FC = () => {
  const [sections, setSections] = useState<Section[]>(() => {
    const saved = localStorage.getItem('doce-palato-sections');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  
  const [orderCounter, setOrderCounter] = useState<number>(() => {
    const saved = localStorage.getItem('doce-palato-order-counter');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [salesHistory, setSalesHistory] = useState<{ id: string; timestamp: string; total: number }[]>(() => {
    const saved = localStorage.getItem('doce-palato-sales-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => {
    return localStorage.getItem('doce-palato-whatsapp') || '';
  });

  const [adminCredentials, setAdminCredentials] = useState(() => {
    const saved = localStorage.getItem('doce-palato-admin-creds');
    return saved ? JSON.parse(saved) : { username: 'docepalato', password: '2314' };
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('home');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<Sweet | null>(null);

  useEffect(() => {
    // No longer auto-setting to first section, default is 'home'
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('doce-palato-sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('doce-palato-whatsapp', whatsappNumber);
  }, [whatsappNumber]);

  useEffect(() => {
    localStorage.setItem('doce-palato-order-counter', orderCounter.toString());
  }, [orderCounter]);

  useEffect(() => {
    localStorage.setItem('doce-palato-sales-history', JSON.stringify(salesHistory));
  }, [salesHistory]);

  useEffect(() => {
    localStorage.setItem('doce-palato-admin-creds', JSON.stringify(adminCredentials));
  }, [adminCredentials]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategoryId]);

  const incrementOrderCounter = () => {
    setOrderCounter(prev => prev + 1);
  };

  const resetOrderCounter = () => {
    setOrderCounter(1);
  };

  const recordSale = (total: number) => {
    const newSale = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      total
    };
    setSalesHistory(prev => [...prev, newSale]);
  };

  const activeSection = useMemo(() => 
    sections.find(s => s.id === activeCategoryId), 
    [sections, activeCategoryId]
  );

  const menuSections = useMemo(() => 
    sections.filter(s => !s.isGallery),
    [sections]
  );

  const gallerySection = useMemo(() => 
    sections.find(s => s.isGallery),
    [sections]
  );

  const addToCart = (sweet: Sweet) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === sweet.id);
      if (existing) {
        return prev.map(item => item.id === sweet.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...sweet, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const handleToggleAdmin = () => {
    setIsAdminOpen(!isAdminOpen);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdminOpen(false);
  };

  return (
    <div className="min-h-screen pb-32 selection:bg-rose-200 selection:text-rose-900 bg-[#FFF5F7]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-rose-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsAdminOpen(false)}>
          <BrigadeiroLogo size={42} />
          <div>
            <h1 className="font-logo text-xl text-emerald-800 leading-none">Doce Palato</h1>
            <p className="text-[10px] text-rose-400 font-bold uppercase tracking-tighter">Sempre uma experiência inesquecível</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isLoggedIn && isAdminOpen && (
             <button 
              onClick={handleLogout}
              className="p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-400"
              title="Sair"
           >
             <LogOut size={22} />
           </button>
          )}
          <button 
            onClick={handleToggleAdmin}
            className={`p-2 rounded-full transition-all ${isAdminOpen ? 'bg-emerald-600 text-white shadow-inner' : 'hover:bg-rose-50 text-rose-700'}`}
            title="Gerenciar Cardápio"
          >
            <Settings size={22} />
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-rose-50 rounded-full transition-all text-rose-800"
          >
            <ShoppingBag size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-32 space-y-12">
        {isAdminOpen ? (
          isLoggedIn ? (
            <AdminPanel 
              sections={sections} 
              setSections={setSections} 
              whatsappNumber={whatsappNumber}
              setWhatsappNumber={setWhatsappNumber}
              orderCounter={orderCounter}
              resetOrderCounter={resetOrderCounter}
              salesHistory={salesHistory}
              adminCredentials={adminCredentials}
              setAdminCredentials={setAdminCredentials}
              onClose={() => setIsAdminOpen(false)} 
            />
          ) : (
            <LoginForm 
              adminCredentials={adminCredentials}
              onLoginSuccess={() => setIsLoggedIn(true)} 
            />
          )
        ) : (
          <AnimatePresence mode="wait">
            {activeCategoryId === 'home' ? (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Banner/Hero */}
                <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-rose-500 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-200 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative border-4 border-white/20">
                  <div className="relative z-10 flex-1 text-center md:text-left">
                    <div className="mb-4 inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-[11px] font-bold uppercase tracking-widest text-white">
                      Alta Confeitaria • Premium
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">Um amor em cada <span className="text-rose-200 font-logo font-normal lowercase">mordida</span></h2>
                    <p className="opacity-90 text-base max-w-sm mb-8 font-medium">Doces artesanais feitos com o coração e ingredientes selecionados para seu paladar.</p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                        💖 Feito com Amor
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                        👩‍🍳 Artesanal
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 transform hover:scale-110 duration-700 transition-all drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                    <BrigadeiroLogo size={160} />
                  </div>
                  <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-400/20 rounded-full blur-[100px]"></div>
                </div>

                {/* Categorias Visuais */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-emerald-900 tracking-tight">Nossas Delícias</h3>
                    <p className="text-xs text-rose-400 font-bold uppercase tracking-widest">Explore o Menu</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {menuSections.map((section, idx) => (
                      <motion.button
                        key={section.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveCategoryId(section.id)}
                        className="group relative h-48 rounded-[2.5rem] overflow-hidden shadow-xl border border-rose-50"
                      >
                        <img 
                          src={section.imageUrl || section.items[0]?.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400'} 
                          alt={section.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-900/20 to-transparent flex flex-col justify-end p-6 text-left">
                          <h4 className="text-xl font-black text-white">{section.title}</h4>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Destaque */}
                <div className="bg-rose-50 rounded-[3rem] p-8 border border-rose-100 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg text-rose-500 shrink-0">
                    <Star size={40} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-emerald-900 mb-2">Qualidade Incomparável</h4>
                    <p className="text-sm text-stone-600 font-medium">Utilizamos apenas os melhores chocolates e ingredientes frescos para garantir que cada doce seja uma experiência única.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="category"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                {/* Categorias (Tabs) - Only show for non-gallery sections */}
                {activeSection && !activeSection.isGallery && (
                  <div className="sticky top-20 z-30 -mx-4 px-4 py-4 bg-[#FFF5F7]/90 backdrop-blur-lg border-b border-rose-50">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                      {menuSections.map(section => (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveCategoryId(section.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`px-6 py-2.5 rounded-full whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all duration-500 border-2 ${
                            activeCategoryId === section.id
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-200 scale-105'
                            : 'bg-white text-emerald-800 border-emerald-50 hover:border-rose-200'
                          }`}
                        >
                          {section.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Produtos ou Galeria */}
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                  {activeSection ? (
                    <div className="space-y-8">
                       <div className="flex items-center gap-4">
                        <h3 className="text-3xl font-black text-emerald-900 tracking-tight">{activeSection.title}</h3>
                        <div className="flex-grow h-[2px] bg-gradient-to-r from-emerald-100 to-transparent"></div>
                      </div>
                      
                      {activeSection.items.length > 0 ? (
                        activeSection.isGallery ? (
                          /* Layout de Vitrine/Exposição Interativo */
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeSection.items.map((item, idx) => (
                              <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setSelectedGalleryItem(item)}
                                className="group relative aspect-square rounded-[2.5rem] overflow-hidden shadow-xl border border-rose-50 cursor-zoom-in"
                              >
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                                   <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                     <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-rose-500 rounded-lg text-white">
                                          <Camera size={14} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-200">Inspiração</span>
                                     </div>
                                     <h4 className="text-xl font-black text-white mb-1">{item.name}</h4>
                                     <p className="text-xs text-white/70 line-clamp-2 font-medium">{item.description}</p>
                                   </div>
                                </div>
                                
                                {/* Badge de Zoom no Hover */}
                                <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <Plus size={20} />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          /* Layout de Venda padrão */
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {activeSection.items.map(item => (
                              <SweetCard 
                                key={item.id} 
                                sweet={item} 
                                onAdd={() => addToCart(item)} 
                              />
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-rose-100">
                          <p className="text-rose-300 font-bold mb-1">Nenhum item nesta aba.</p>
                          <p className="text-xs text-rose-200 uppercase tracking-widest">Em breve novas delícias!</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-rose-300 font-bold">Selecione uma categoria.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Bottom Navigation (Mobile/Interactive) */}
      {!isAdminOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
          <div className="bg-emerald-950/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-1.5 shadow-2xl shadow-emerald-950/20 flex items-center justify-between">
            <button 
              onClick={() => {
                setActiveCategoryId('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center py-3 rounded-[2rem] transition-all duration-500 ${activeCategoryId === 'home' ? 'bg-white text-emerald-900 shadow-xl scale-105' : 'text-white/40 hover:text-white/80'}`}
            >
              <Home size={18} />
              <span className="text-[8px] font-black uppercase tracking-widest mt-1.5">Início</span>
            </button>
            
            <button 
              onClick={() => {
                if (menuSections.length > 0) {
                  setActiveCategoryId(menuSections[0].id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`flex-1 flex flex-col items-center py-3 rounded-[2rem] transition-all duration-500 ${activeCategoryId !== 'home' && activeCategoryId !== gallerySection?.id ? 'bg-rose-500 text-white shadow-xl scale-105' : 'text-white/40 hover:text-white/80'}`}
            >
              <Sparkles size={18} />
              <span className="text-[8px] font-black uppercase tracking-widest mt-1.5">Menu</span>
            </button>

            {gallerySection && (
              <button 
                onClick={() => {
                  setActiveCategoryId(gallerySection.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 flex flex-col items-center py-3 rounded-[2rem] transition-all duration-500 ${activeCategoryId === gallerySection.id ? 'bg-emerald-500 text-white shadow-xl scale-105' : 'text-white/40 hover:text-white/80'}`}
              >
                <Camera size={18} />
                <span className="text-[8px] font-black uppercase tracking-widest mt-1.5">Vitrine</span>
              </button>
            )}

            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex-1 flex flex-col items-center py-3 rounded-[2rem] text-white/40 hover:text-white/80 relative transition-all duration-300"
            >
              <ShoppingBag size={18} />
              <span className="text-[8px] font-black uppercase tracking-widest mt-1.5">Sacola</span>
              {cart.length > 0 && (
                <span className="absolute top-2 right-4 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-emerald-950">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>

          </div>
        </div>
      )}

      <CartSheet 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        whatsappNumber={whatsappNumber}
        orderCounter={orderCounter}
        incrementOrderCounter={incrementOrderCounter}
        recordSale={recordSale}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
      />
      
      {!isAdminOpen && (
        <footer className="mt-20 py-12 px-4 text-center border-t border-rose-100 bg-white/50">
          <BrigadeiroLogo size={40} />
          <p className="text-emerald-800 text-[11px] font-bold uppercase tracking-[0.3em] mt-4 mb-2">
            Doce Palato • Gourmet
          </p>
          <p className="text-rose-300 text-[10px] font-medium italic">Sempre uma experiência inesquecível.</p>
        </footer>
      )}
      <AnimatePresence>
        {selectedGalleryItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-emerald-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedGalleryItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedGalleryItem(null)}
                className="absolute top-6 right-6 z-10 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all"
              >
                <X size={24} />
              </button>

              <div className="w-full md:w-3/5 aspect-square md:aspect-auto h-full bg-stone-100">
                <img 
                  src={selectedGalleryItem.imageUrl} 
                  alt={selectedGalleryItem.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Vitrine de Inspiração</p>
                    <h3 className="text-3xl font-black text-emerald-900 leading-tight">{selectedGalleryItem.name}</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-stone-600 leading-relaxed font-medium">
                    {selectedGalleryItem.description || "Uma criação exclusiva Doce Palato, feita com os melhores ingredientes para tornar seu momento inesquecível."}
                  </p>

                  <div className="pt-8 border-t border-rose-50">
                    <button 
                      onClick={() => {
                        const text = `Olá! Vi este doce na vitrine e amei: ${selectedGalleryItem.name}. Gostaria de saber mais informações!`;
                        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 group"
                    >
                      <Phone size={20} />
                      SOLICITAR ORÇAMENTO
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-center mt-4 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                      * Item exclusivo sob encomenda
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
