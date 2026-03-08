import React, { useState } from 'react';
import { User as UserIcon, Lock, LogIn, AlertCircle, ShieldCheck, Pill, UserPlus, ArrowLeft } from 'lucide-react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User
} from '../firebase';

interface LoginModalProps {
  onLoginSuccess: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatEmail = (m: string) => `${m.toLowerCase().trim()}@sistema.com`;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!matricula || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formatEmail(matricula),
          password
        );
        // Save matricula in profile
        await updateProfile(userCredential.user, {
          displayName: matricula.toUpperCase()
        });
        onLoginSuccess(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formatEmail(matricula),
          password
        );
        onLoginSuccess(userCredential.user);
      }
    } catch (error) {
      const err = error as { code?: string };
      console.error("Auth error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Esta matrícula já está cadastrada.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Credenciais inválidas. Verifique matrícula e senha.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao autenticar. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f0202] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2c0a0a] via-[#0f0202] to-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative w-full max-w-md p-1 animate-in slide-in-from-top-10 fade-in duration-700">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/30 to-transparent rounded-3xl blur-sm"></div>

        <div className="relative bg-[#150505]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="pt-10 pb-6 flex flex-col items-center justify-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] mb-4 border border-white/20">
              <Pill className="text-[#2c0a0a] -rotate-45 fill-[#2c0a0a]/10" size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">PEX</h1>
            <p className="text-orange-500/80 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">
              {mode === 'login' ? 'Acesso Restrito' : 'Novo Membro'}
            </p>
          </div>

          <div className="px-8 pb-10">
            <form onSubmit={handleAuth} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 text-red-200 text-xs font-medium animate-in slide-in-from-left-2">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Matrícula</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-[#0a0202] border border-white/10 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 sm:text-sm transition-all uppercase"
                    placeholder="DIGITE SUA MATRÍCULA"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-[#0a0202] border border-white/10 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Confirmar Senha</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-[#0a0202] border border-white/10 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 sm:text-sm transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-[#2c0a0a] bg-gradient-to-r from-amber-400 to-orange-600 hover:from-amber-300 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-[0.98] ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#2c0a0a] border-t-transparent rounded-full animate-spin"></div>
                ) : mode === 'login' ? (
                  <>
                    <LogIn size={18} strokeWidth={2.5} />
                    ACESSAR SISTEMA
                  </>
                ) : (
                  <>
                    <UserPlus size={18} strokeWidth={2.5} />
                    CADASTRAR MEMBRO
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex justify-center">
              {mode === 'login' ? (
                <button
                  onClick={() => setMode('register')}
                  className="text-[10px] font-bold text-orange-500 hover:text-orange-400 flex items-center gap-2 transition-colors uppercase tracking-widest"
                >
                  <UserPlus size={14} />
                  Criar Conta de Membro
                </button>
              ) : (
                <button
                  onClick={() => setMode('login')}
                  className="text-[10px] font-bold text-gray-400 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest"
                >
                  <ArrowLeft size={14} />
                  Voltar para o Login
                </button>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-gray-500">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-mono tracking-wider">MÓDULO DE SEGURANÇA FIREBASE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;