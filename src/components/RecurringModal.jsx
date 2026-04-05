import { useState } from 'react';
import { RefreshCw, X, Check, Ban } from 'lucide-react';
import { fmt } from '@/utils/theme';
import { useColors } from '@/utils/ThemeContext';

const FREQ_LABELS = { monthly: 'Mensuelle', biweekly: 'Aux 2 semaines', weekly: 'Hebdomadaire' };

export default function RecurringModal({ missing, cats, onApply, onIgnore, onStopRecurring }) {
  const C = useColors();
  const [applying, setApplying] = useState(false);
  const [selected, setSelected] = useState(() => new Set(missing.map((_, i) => i)));

  const toggle = (i) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((s) => s.size === missing.length ? new Set() : new Set(missing.map((_, i) => i)));
  };

  const handleApply = async () => {
    const items = missing.filter((_, i) => selected.has(i));
    if (items.length === 0) return;
    setApplying(true);
    await onApply(items);
    setApplying(false);
  };

  if (!missing || missing.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: C.card, borderRadius: '20px 20px 0 0', padding: 28, width: '100%', maxWidth: 520, border: `1px solid ${C.border}`, borderBottom: 'none', maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RefreshCw size={20} color={C.accent} />
            <span style={{ fontSize: 17, fontWeight: 600 }}>Transactions recurrentes</span>
          </div>
          <button onClick={onIgnore} style={{ background: 'none', border: 'none', color: C.textSec, padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: C.textSec, margin: 0 }}>Ces transactions n'ont pas encore ete appliquees</p>
          <button onClick={toggleAll} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 11, fontWeight: 500, padding: '2px 0', whiteSpace: 'nowrap' }}>
            {selected.size === missing.length ? 'Tout deselectionner' : 'Tout selectionner'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 20 }}>
          {missing.map((tx, i) => {
            const cat = cats.find((c) => c.id === tx.cat_id) || { icon: '📦', name: 'Autre', color: '#888' };
            const isSelected = selected.has(i);
            return (
              <div key={i} onClick={() => toggle(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < missing.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer', opacity: isSelected ? 1 : 0.45, transition: 'opacity .15s' }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? C.accent : C.textMut}`, background: isSelected ? C.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                  {isSelected && <Check size={14} color="#000" strokeWidth={3} />}
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${cat.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: C.textSec }}>{new Date(tx.date).toLocaleDateString('fr-CA')}</span>
                    <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 10, background: C.accentBg, color: C.accent }}>{FREQ_LABELS[tx.recurring_frequency] || 'Mensuelle'}</span>
                  </div>
                </div>
                <span style={{ color: tx.type === 'income' ? C.inc : C.exp, fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onStopRecurring(tx); setSelected((s) => { const next = new Set(s); next.delete(i); return next; }); }} title="Arreter la recurrence" style={{ background: 'none', border: 'none', color: C.textMut, padding: 4, flexShrink: 0, transition: 'color .15s' }} onMouseEnter={(e) => e.currentTarget.style.color = C.exp} onMouseLeave={(e) => e.currentTarget.style.color = C.textMut}>
                  <Ban size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onIgnore} style={{ flex: 1, padding: '13px 0', background: 'transparent', color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontWeight: 500 }}>
            Ignorer
          </button>
          <button onClick={handleApply} disabled={applying || selected.size === 0} style={{ flex: 1, padding: '13px 0', background: C.accent, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, opacity: applying || selected.size === 0 ? 0.5 : 1 }}>
            {applying ? 'Application...' : `Appliquer (${selected.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
