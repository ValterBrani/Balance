import { useState } from 'react';
import { Check, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui';
import { C, fmt } from '@/utils/theme';

export default function Budgets({ txs, cats, budgets, onUpdateBudget, month, year, viewMode = 'month' }) {
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');

  const mExpenses = viewMode === 'year'
    ? txs.filter((t) => t.type === 'expense' && new Date(t.date).getFullYear() === year)
    : txs.filter((t) => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === month && d.getFullYear() === year;
      });

  const expByCat = {};
  mExpenses.forEach((t) => { expByCat[t.cat_id] = (expByCat[t.cat_id] || 0) + parseFloat(t.amount); });

  const rows = cats.filter((c) => c.type !== 'income').map((c) => ({
    cat: c,
    spent: expByCat[c.id] || 0,
    budget: budgets[c.id] || 0,
  })).sort((a, b) => b.spent - a.spent);

  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);
  const totalSpent = Object.values(expByCat).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <Card style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 6 }}>Total budgete</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: C.accent }}>{fmt(totalBudget)}</div>
        </Card>
        <Card style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 6 }}>Total depense</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: C.exp }}>{fmt(totalSpent)}</div>
        </Card>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {rows.map((r, i) => {
          const pct = r.budget > 0 ? Math.min((r.spent / r.budget) * 100, 100) : 0;
          const over = r.budget > 0 && r.spent > r.budget;
          const barColor = over ? C.exp : pct > 80 ? '#f59e0b' : C.inc;

          return (
            <div key={r.cat.id} style={{ padding: '16px 20px', borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{r.cat.icon}</span>
                <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{r.cat.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, color: over ? C.exp : C.textSec }}>{fmt(r.spent)}</span>
                  <span style={{ fontSize: 12, color: C.textMut }}>/</span>
                  {editing === r.cat.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input type="number" value={editVal} onChange={(e) => setEditVal(e.target.value)} style={{ width: 80, fontSize: 13, padding: '3px 8px' }} />
                      <button onClick={() => { onUpdateBudget(r.cat.id, parseFloat(editVal) || 0); setEditing(null); }} style={{ background: C.accent, border: 'none', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 12 }}><Check size={12} /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditing(r.cat.id); setEditVal(r.budget); }} style={{ background: 'none', border: 'none', color: C.textSec, fontSize: 13, display: 'flex', alignItems: 'center', gap: 3 }}>
                      {r.budget > 0 ? fmt(r.budget) : <span style={{ color: C.textMut }}>Definir</span>}
                      <Edit2 size={10} style={{ marginLeft: 2 }} />
                    </button>
                  )}
                </div>
              </div>

              {r.budget > 0 && (
                <>
                  <div style={{ height: 6, background: C.surface, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width .4s' }} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
