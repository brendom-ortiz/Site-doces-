
import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, Send, User, MessageSquare, MapPin, CreditCard, ShoppingBag, Calendar, Clock } from 'lucide-react';
import { CartItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  whatsappNumber: string;
  orderCounter: number;
  incrementOrderCounter: () => void;
  recordSale: (total: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const CartSheet: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  cart, 
  whatsappNumber, 
  orderCounter,
  incrementOrderCounter,
  recordSale,
  updateQuantity, 
  removeFromCart, 
  clearCart,
  showToast
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [deliveryType, setDeliveryType] = useState<'today' | 'pre-order'>('today');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [changeFor, setChangeFor] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const sendToWhatsApp = () => {
    if (!customerName.trim()) {
      showToast('Por favor, informe seu nome.', 'error');
      return;
    }
    if (!customerAddress.trim()) {
      showToast('Por favor, informe o endereço de entrega.', 'error');
      return;
    }
    if (deliveryType === 'pre-order' && !deliveryDate) {
      showToast('Por favor, escolha uma data para a encomenda.', 'error');
      return;
    }

    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const serialStr = orderCounter.toString().padStart(4, '0');

    const header = `*✨ DOCE PALATO - COMANDA #${serialStr} ✨*\n`;
    const customerInfo = `👤 *Cliente:* ${customerName}\n📍 *Endereço:* ${customerAddress}\n`;
    const deliveryInfo = `📅 *Entrega:* ${deliveryType === 'today' ? 'Para hoje' : `Encomenda para ${deliveryDate}`}\n`;
    const paymentInfo = `💳 *Pagamento:* ${paymentMethod}${paymentMethod === 'Dinheiro' && changeFor ? ` (Troco para R$ ${changeFor})` : ''}\n`;
    
    const itemsList = cart.map(item => `• ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})`).join('\n');
    
    const obs = notes.trim() ? `\n📝 *Observações:* ${notes}` : '';
    const footer = `\n\n💰 *TOTAL DO PEDIDO: R$ ${total.toFixed(2)}*`;
    
    const message = `${header}\n${customerInfo}${deliveryInfo}${paymentInfo}${obs}\n*Itens:*\n${itemsList}${footer}`;
    const encoded = encodeURIComponent(message);
    
    const waUrl = cleanNumber 
      ? `https://wa.me/${cleanNumber}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    incrementOrderCounter();
    recordSale(total);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-emerald-900/20 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-[#FFF5F7] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-emerald-900">Sua Comanda</h2>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px] font-black">#{orderCounter.toString().padStart(4, '0')}</span>
            </div>
            <p className="text-xs text-rose-400 font-medium uppercase tracking-wider">Finalize seu pedido doce</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-full text-rose-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-200">
                <ShoppingBag size={40} />
              </div>
              <p className="text-lg font-bold text-rose-800">Sua comanda está vazia</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Itens Selecionados</p>
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center p-3 rounded-2xl bg-white border border-rose-100 shadow-sm">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-rose-50 flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-emerald-950 text-sm leading-tight">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-rose-200 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-emerald-700">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        <div className="flex items-center bg-rose-50 rounded-lg p-0.5 border border-rose-100">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-emerald-700 hover:bg-white rounded transition-colors">
                            <Minus size={10} />
                          </button>
                          <span className="w-6 text-center text-[10px] font-bold text-emerald-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-emerald-700 hover:bg-white rounded transition-colors">
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-rose-100">
                <div>
                  <label className="text-xs font-bold text-emerald-600 uppercase ml-1 flex items-center gap-2 mb-1">
                    <User size={14} /> Seu Nome
                  </label>
                  <input 
                    className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-rose-200 text-emerald-900 transition-all text-sm shadow-sm"
                    placeholder="Como podemos te chamar?"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-emerald-600 uppercase ml-1 flex items-center gap-2 mb-1">
                    <MapPin size={14} /> Endereço de Entrega
                  </label>
                  <textarea 
                    className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-rose-200 text-emerald-900 transition-all text-sm min-h-[80px] shadow-sm"
                    placeholder="Rua, número, bairro e referências..."
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-emerald-600 uppercase ml-1 flex items-center gap-2 mb-1">
                    <Clock size={14} /> Quando deseja receber?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDeliveryType('today')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                        deliveryType === 'today'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                        : 'bg-white border-rose-100 text-rose-300 hover:border-rose-200'
                      }`}
                    >
                      <Clock size={18} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Para Hoje</span>
                    </button>
                    <button
                      onClick={() => setDeliveryType('pre-order')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                        deliveryType === 'pre-order'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                        : 'bg-white border-rose-100 text-rose-300 hover:border-rose-200'
                      }`}
                    >
                      <Calendar size={18} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Encomendar</span>
                    </button>
                  </div>

                  {deliveryType === 'pre-order' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <input 
                        type="date"
                        className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-rose-200 text-emerald-900 transition-all text-sm shadow-sm"
                        value={deliveryDate}
                        onChange={e => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-emerald-600 uppercase ml-1 flex items-center gap-2 mb-1">
                    <CreditCard size={14} /> Forma de Pagamento
                  </label>
                  <select 
                    className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-rose-200 text-emerald-900 transition-all text-sm appearance-none cursor-pointer shadow-sm"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>

                {paymentMethod === 'Dinheiro' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-emerald-600 uppercase ml-1 block mb-1">Troco para quanto?</label>
                    <input 
                      type="number"
                      className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-rose-200 text-emerald-900 transition-all text-sm shadow-sm"
                      placeholder="Ex: 50.00"
                      value={changeFor}
                      onChange={e => setChangeFor(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-emerald-600 uppercase ml-1 flex items-center gap-2 mb-1">
                    <MessageSquare size={14} /> Observações Extras
                  </label>
                  <textarea 
                    className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-rose-200 text-emerald-900 transition-all text-sm min-h-[60px] shadow-sm"
                    placeholder="Ex: Sem açúcar, embalagem para presente..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t bg-white shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-rose-400 font-bold uppercase tracking-tight">Total do Pedido</p>
                <p className="text-3xl font-bold text-emerald-900">R$ {total.toFixed(2)}</p>
              </div>
            </div>
            <button 
              onClick={sendToWhatsApp}
              className="w-full bg-rose-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-rose-700 transition-all shadow-lg active:scale-95"
            >
              <Send size={20} />
              Enviar Pedido via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSheet;