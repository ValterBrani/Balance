import { useState } from 'react';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { Card } from '@/components/ui';
import { useColors } from '@/utils/ThemeContext';

export default function NetWorthSettings({ accounts, onAddAccount, onDeleteAccount, onReorder }) {
  const C = useColors();
  const [showAdd, setShowAdd] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', icon: '📦', color: '#6b7280', type: 'asset' });
  const [dragging, setDragging] = useState(null);

  const handleAdd = () => {
    if (newAcc.name.trim()) {
      onAddAccount(newAcc);
      setNewAcc({ name: '', icon: '📦', color: '#6b7280', type: 'asset' });
      setShowAdd(false);
    }
  };

  const assets = accounts.filter((a) => a.type === 'asset');
  const liabilities = accounts.filter((a) => a.type === 'liability');

  const handleDragStart = (e, index, type) => {
    setDragging({ index, type });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex, dropType) => {
    e.preventDefault();
    if (!dragging) return;

    const { index: dragIndex, type: dragType } = dragging;
    const sourceList = dragType === 'asset' ? assets : liabilities;
    const targetList = dropType === 'asset' ? assets : liabilities;

    if (dragType === dropType) {
      const newList = [...sourceList];
      const [moved] = newList.splice(dragIndex, 1);
      newList.splice(dropIndex, 0, moved);

      const allReordered = dragType === 'asset'
        ? [...newList, ...liabilities]
        : [...assets, ...newList];
      onReorder(allReordered);
    }
    setDragging(null);
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: C.text }}>Gérer les comptes</h2>

      <div>
        <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: C.textSec }}>Actifs</h3>
        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          {assets.length === 0 ? (
            <p style={{ color: C.textSec, fontSize: 13, textAlign: 'center', padding: '20px' }}>Aucun actif</p>
          ) : assets.map((acc, i) => (
            <div
              key={acc.id}
              draggable
              onDragStart={(e) => handleDragStart(e, i, 'asset')}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i, 'asset')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: i < assets.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'move', opacity: dragging?.index === i && dragging?.type === 'asset' ? 0.5 : 1 }}
            >
              <GripVertical size={16} color={C.textSec} />
              <div style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{acc.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text }}>{acc.name}</div>
              </div>
              {!acc.is_default && (
                <button onClick={() => onDeleteAccount(acc.id)} style={{ background: 'none', border: 'none', color: C.textMut, padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </Card>
      </div>

      <div>
        <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: C.textSec }}>Passifs</h3>
        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          {liabilities.length === 0 ? (
            <p style={{ color: C.textSec, fontSize: 13, textAlign: 'center', padding: '20px' }}>Aucun passif</p>
          ) : liabilities.map((acc, i) => (
            <div
              key={acc.id}
              draggable
              onDragStart={(e) => handleDragStart(e, i, 'liability')}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i, 'liability')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: i < liabilities.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'move', opacity: dragging?.index === i && dragging?.type === 'liability' ? 0.5 : 1 }}
            >
              <GripVertical size={16} color={C.textSec} />
              <div style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{acc.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text }}>{acc.name}</div>
              </div>
              {!acc.is_default && (
                <button onClick={() => onDeleteAccount(acc.id)} style={{ background: 'none', border: 'none', color: C.textMut, padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </Card>
      </div>

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.accent, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Plus size={16} />
          Ajouter un compte
        </button>
      ) : (
        <Card style={{ padding: '16px' }}>
          <input type="text" value={newAcc.name} onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })} placeholder="Nom du compte" style={{ marginBottom: 12 }} />
          <input type="text" value={newAcc.icon} onChange={(e) => setNewAcc({ ...newAcc, icon: e.target.value })} placeholder="Emoji" style={{ marginBottom: 12, minWidth: 0 }} maxLength="2" />
          <select value={newAcc.type} onChange={(e) => setNewAcc({ ...newAcc, type: e.target.value })} style={{ marginBottom: 12 }}>
            <option value="asset">Actif</option>
            <option value="liability">Passif</option>
          </select>
          <input type="color" value={newAcc.color} onChange={(e) => setNewAcc({ ...newAcc, color: e.target.value })} style={{ marginBottom: 12, width: '100%', height: 40 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontWeight: 500 }}>Annuler</button>
            <button onClick={handleAdd} style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: 'none', background: C.accent, color: '#000', fontWeight: 600 }}>Ajouter</button>
          </div>
        </Card>
      )}
    </div>
  );
}
