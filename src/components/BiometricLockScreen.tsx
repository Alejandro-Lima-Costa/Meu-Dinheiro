import React, { useState } from 'react';
import { Shield, Fingerprint, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface BiometricLockScreenProps {
  onUnlock: () => void;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [isVerifyingBio, setIsVerifyingBio] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        // Any 4 digits unlock for convenience or default '1234'
        setTimeout(() => {
          onUnlock();
        }, 200);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const triggerBiometrics = () => {
    setIsVerifyingBio(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsVerifyingBio(false);
      onUnlock();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 text-white p-6 max-w-md mx-auto">
      {/* Top Branding */}
      <div className="pt-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Meu Dinheiro Protegido</h1>
        <p className="text-xs text-slate-400 mt-1">
          Autenticação de Segurança Biométrica
        </p>
      </div>

      {/* Middle: PIN Dots or Biometric Button */}
      <div className="w-full flex flex-col items-center">
        {/* PIN Dots */}
        <div className="flex gap-4 mb-6">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                pin.length > idx
                  ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-sm shadow-emerald-500/50'
                  : 'border-slate-600 bg-slate-900'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 flex items-center gap-1 mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMsg}
          </p>
        )}

        {/* Biometric trigger button */}
        <button
          onClick={triggerBiometrics}
          disabled={isVerifyingBio}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-emerald-400 text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Fingerprint className={`w-5 h-5 ${isVerifyingBio ? 'animate-pulse text-emerald-300' : ''}`} />
          {isVerifyingBio ? 'Escaneando biometria...' : 'Desbloquear com Biometria / FaceID'}
        </button>
      </div>

      {/* Number Pad for PIN */}
      <div className="w-full max-w-xs pb-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handlePinInput(num)}
              className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-xl font-semibold text-white transition-all flex items-center justify-center cursor-pointer"
            >
              {num}
            </button>
          ))}
          <div className="flex items-center justify-center">
            <button
              onClick={triggerBiometrics}
              aria-label="Ativar Touch ID ou Face ID"
              className="h-14 w-full rounded-2xl text-emerald-400 hover:bg-slate-800/60 flex items-center justify-center transition-all"
            >
              <Fingerprint className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={() => handlePinInput('0')}
            className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-xl font-semibold text-white transition-all flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer"
          >
            Apagar
          </button>
        </div>
      </div>
    </div>
  );
};
