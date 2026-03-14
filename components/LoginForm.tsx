
import React, { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';

interface Props {
  adminCredentials: { username: string; password: string };
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<Props> = ({ adminCredentials, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === adminCredentials.username && password === adminCredentials.password) {
      onLoginSuccess();
    } else {
      setError('Acesso negado.');
      setPassword('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-3xl shadow-xl shadow-rose-100 animate-in zoom-in-95 duration-300 border border-rose-50">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4 border border-rose-100">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-emerald-900 tracking-tight">Admin</h2>
        <p className="text-rose-400 text-sm font-medium">Gestão do Atelier Gourmet</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-200" size={18} />
          <input 
            type="text"
            className="w-full bg-rose-50/30 border border-rose-100 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-4 ring-rose-50 text-emerald-900 font-bold"
            placeholder="Usuário"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-200" size={18} />
          <input 
            type="password"
            className="w-full bg-rose-50/30 border border-rose-100 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-4 ring-rose-50 text-emerald-900"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 p-3 rounded-xl animate-in shake">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button 
          type="submit"
          className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 uppercase tracking-widest text-sm"
        >
          Acessar Agora
        </button>
      </form>
    </div>
  );
};

export default LoginForm;