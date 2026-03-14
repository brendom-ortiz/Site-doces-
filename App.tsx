
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Settings, LogOut, ChevronRight, Sparkles, Camera, Heart, Home, LayoutGrid, Star } from 'lucide-react';
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
    title: 'Galeria de Arte',
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
                          src={section.items[0]?.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400'} 
                          alt={section.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-900/20 to-transparent flex flex-col justify-end p-6 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={16} className="text-rose-300" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-200">Categoria {idx + 1}</span>
                          </div>
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
                  <div className="sticky top-20 z-30 -mx-4 px-4 py-4 bg-[#FFF5F7]/80 backdrop-blur-md">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                      <button
                        onClick={() => setActiveCategoryId('home')}
                        className="px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-bold transition-all duration-300 border-2 flex items-center gap-2 bg-white text-emerald-700 border-rose-100 hover:border-emerald-200"
                      >
                        <Home size={16} className="text-emerald-400" />
                        Início
                      </button>
                      {menuSections.map(section => (
                        <button
                          key={section.id}
                          onClick={() => setActiveCategoryId(section.id)}
                          className={`px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-bold transition-all duration-300 border-2 flex items-center gap-2 ${
                            activeCategoryId === section.id
                            ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200 scale-105'
                            : 'bg-white text-emerald-700 border-rose-100 hover:border-emerald-200'
                          }`}
                        >
                          {section.title === 'Eventos & Casamentos' && <Sparkles size={16} className={activeCategoryId === section.id ? 'text-rose-100' : 'text-emerald-400'} />}
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
                          /* Layout de Galeria/Exposição */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {activeSection.items.map(item => (
                              <div key={item.id} className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-rose-50 transition-all duration-500 hover:-translate-y-2">
                                <div className="aspect-[4/5] overflow-hidden">
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-white">
                                   <div className="flex items-center gap-2 mb-2">
                                      <Heart size={18} className="fill-rose-500 text-rose-500" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-200">Inspiração Premium</span>
                                   </div>
                                   <h4 className="text-2xl font-black mb-1">{item.name}</h4>
                                   <p className="text-sm opacity-80 line-clamp-2">{item.description}</p>
                                </div>
                                <div className="p-6 md:hidden">
                                   <h4 className="text-xl font-black text-emerald-900 mb-1">{item.name}</h4>
                                   <p className="text-xs text-stone-500">{item.description}</p>
                                </div>
                              </div>
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-2 shadow-2xl shadow-rose-200/50 flex items-center justify-between">
            <button 
              onClick={() => setActiveCategoryId('home')}
              className={`flex-1 flex flex-col items-center py-2 rounded-3xl transition-all duration-300 ${activeCategoryId === 'home' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-stone-400 hover:text-rose-400'}`}
            >
              <Home size={20} />
              <span className="text-[9px] font-black uppercase mt-1">Início</span>
            </button>
            
            <button 
              onClick={() => {
                if (activeCategoryId === 'home' && menuSections.length > 0) {
                  setActiveCategoryId(menuSections[0].id);
                }
              }}
              className={`flex-1 flex flex-col items-center py-2 rounded-3xl transition-all duration-300 ${activeCategoryId !== 'home' && activeCategoryId !== gallerySection?.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'text-stone-400 hover:text-emerald-400'}`}
            >
              <LayoutGrid size={20} />
              <span className="text-[9px] font-black uppercase mt-1">Menu</span>
            </button>

            {gallerySection && (
              <button 
                onClick={() => setActiveCategoryId(gallerySection.id)}
                className={`flex-1 flex flex-col items-center py-2 rounded-3xl transition-all duration-300 ${activeCategoryId === gallerySection.id ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-stone-400 hover:text-rose-400'}`}
              >
                <Camera size={20} />
                <span className="text-[9px] font-black uppercase mt-1">Galeria</span>
              </button>
            )}

            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex-1 flex flex-col items-center py-2 rounded-3xl text-stone-400 hover:text-rose-400 relative"
            >
              <ShoppingBag size={20} />
              <span className="text-[9px] font-black uppercase mt-1">Sacola</span>
              {cart.length > 0 && (
                <span className="absolute top-1 right-4 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>

            <div className="w-[1px] h-8 bg-stone-100 mx-1"></div>

            <button 
              onClick={() => setIsAdminOpen(true)}
              className="flex-1 flex flex-col items-center py-2 rounded-3xl text-stone-400 hover:text-emerald-400"
            >
              <Settings size={20} />
              <span className="text-[9px] font-black uppercase mt-1">Admin</span>
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
    </div>
  );
};

export default App;
