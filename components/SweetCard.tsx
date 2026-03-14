
import React from 'react';
import { Plus, Heart } from 'lucide-react';
import { Sweet } from '../types';

interface Props {
  sweet: Sweet;
  onAdd: () => void;
}

const SweetCard: React.FC<Props> = ({ sweet, onAdd }) => {
  return (
    <div className="bg-white rounded-3xl p-4 flex gap-5 shadow-sm border border-rose-50 hover:shadow-xl hover:shadow-rose-900/5 transition-all duration-500 group relative overflow-hidden">
      <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-rose-50 border border-rose-100 relative">
        <img 
          src={sweet.imageUrl} 
          alt={sweet.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
           <Heart size={14} className="text-rose-500 fill-rose-500" />
        </div>
      </div>
      
      <div className="flex flex-col justify-between flex-grow py-1">
        <div>
          <h3 className="font-black text-emerald-900 text-lg leading-tight group-hover:text-rose-600 transition-colors">
            {sweet.name}
          </h3>
          <p className="text-xs text-stone-400 font-medium line-clamp-2 mt-2 leading-relaxed">
            {sweet.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-rose-300 font-bold uppercase tracking-tighter">Valor</span>
            <span className="font-black text-xl text-emerald-800">
              R$ {sweet.price.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={onAdd}
            className="bg-rose-50 text-rose-700 p-3 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all active:scale-90 shadow-sm hover:shadow-emerald-100"
            aria-label="Adicionar à comanda"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
      
      <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-rose-50 rounded-full blur-xl group-hover:bg-emerald-50 transition-colors"></div>
    </div>
  );
};

export default SweetCard;