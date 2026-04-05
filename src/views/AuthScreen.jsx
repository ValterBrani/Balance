import { useState } from 'react';
import { Github } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { Card } from '@/components/ui';
import { useColors } from '@/utils/ThemeContext';

export default function AuthScreen() {
  const C = useColors();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !pass) return;
    
    // Validation basique du mot de passe
    if (mode === 'signup' && pass.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    
    setLoading(true);
    setError('');

    const fn = mode === 'login'
      ? supabase.auth.signInWithPassword({ email, password: pass })
      : supabase.auth.signUp({ email, password: pass });

    const { error: err } = await fn;
    if (err) {
      setError(mode === 'login' ? 'Courriel ou mot de passe incorrect.' : 'Impossible de creer le compte. Verifiez votre courriel.');
    } else {
      // Nettoyer le mot de passe après soumission réussie
      setPass('');
    }
    setLoading(false);
  };

  const githubLogin = async () => {
    const redirectUrl = new URL('/Balance/', window.location.origin).toString();
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: redirectUrl },
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 12, color: C.textSec, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Bienvenue sur</div>
          <div style={{ fontSize: 32, fontFamily: "'DM Serif Display',serif", color: C.accentL }}>Balance</div>
          <div style={{ fontSize: 13, color: C.textSec, marginTop: 8 }}>Votre budget, simplement.</div>
        </div>

        <Card>
          <div style={{ display: 'flex', background: C.surface, borderRadius: 10, padding: 3, marginBottom: 22, border: `1px solid ${C.border}` }}>
            {[['login', 'Connexion'], ['signup', 'Creer un compte']].map(([m, l]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all .2s',
                  background: mode === m ? C.accent : 'transparent',
                  color: mode === m ? '#fff' : C.textSec,
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: 'block' }}>Courriel</label>
            <input type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: 'block' }}>Mot de passe</label>
            <input type="password" placeholder="........" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>

          {error && <div style={{ fontSize: 12, color: C.exp, marginBottom: 14, padding: '8px 12px', background: `${C.exp}15`, borderRadius: 8 }}>{error}</div>}

          <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '13px 0', background: C.accent, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 12, color: C.textSec }}>ou</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          <button onClick={githubLogin} style={{ width: '100%', padding: '12px 0', background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Github size={16} /> Continuer avec GitHub
          </button>
        </Card>
      </div>
    </div>
  );
}
