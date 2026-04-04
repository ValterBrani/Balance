import { useState } from 'react';
import { X, LogOut } from 'lucide-react';
import { Card } from '@/components/ui';
import { C } from '@/utils/theme';
import NetWorthSettings from './NetWorthSettings';

export default function SettingsView({ cats, onAddCat, onDeleteCat, nwAccounts, onAddNwAcc, onDeleteNwAcc, onReorderNwAcc, user, onSignOut }) {
  const [newCat, setNewCat] = useState({ name: '', icon: '🏷️', color: '#888888' });

  const addCat = async () => {
    if (!newCat.name.trim()) return;
    await onAddCat({ ...newCat, type: 'expense' });
    setNewCat({ name: '', icon: '🏷️', color: '#888888' });
  };

  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: C.textSec, marginBottom: 2 }}>Connecte en tant que</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.email || user?.user_metadata?.user_name || 'Utilisateur'}</div>
          </div>
          <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', color: C.exp, border: `1px solid ${C.exp}33`, borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
            <LogOut size={14} /> Deconnexion
          </button>
        </div>
      </Card>

      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Categories</h3>
        <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {cats.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${c.color}15`, border: `1px solid ${c.color}30`, borderRadius: 20, padding: '5px 10px' }}>
              <span style={{ fontSize: 13 }}>{c.icon}</span>
              <span style={{ fontSize: 12, color: c.color, fontWeight: 500 }}>{c.name}</span>
              {!c.is_default && (
                <button onClick={() => onDeleteCat(c.id)} style={{ background: 'none', border: 'none', color: c.color, padding: 0, marginLeft: 2, opacity: 0.6 }}><X size={10} /></button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Icone" value={newCat.icon} onChange={(e) => setNewCat((n) => ({ ...n, icon: e.target.value }))} style={{ width: 60 }} />
          <input placeholder="Nom de categorie" value={newCat.name} onChange={(e) => setNewCat((n) => ({ ...n, name: e.target.value }))} style={{ flex: 1, minWidth: 120 }} />
          <input type="color" value={newCat.color} onChange={(e) => setNewCat((n) => ({ ...n, color: e.target.value }))} style={{ width: 44, padding: '4px', cursor: 'pointer' }} />
          <button onClick={addCat} style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500 }}>
            Ajouter
          </button>
        </div>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <NetWorthSettings accounts={nwAccounts} onAddAccount={onAddNwAcc} onDeleteAccount={onDeleteNwAcc} onReorder={onReorderNwAcc} />
      </Card>
    </div>
  );
}
