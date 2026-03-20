import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, Tag, Amount } from '@/components/ui';
import { C } from '@/utils/theme';

export default function Transactions({ txs, cats, onDelete, month, year }) {
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  const mTxs = txs.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const filtered = mTxs
    .filter((t) => filter === 'all' || t.type === filter)
    .filter((t) => catFilter === 'all' || t.cat_id === catFilter)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {[['all', 'Tout'], ['expense', 'Depenses'], ['income', 'Revenus']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${filter === v ? C.accent : C.border}`, background: filter === v ? C.accentBg : 'transparent', color: filter === v ? C.accent : C.textSec, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
            {l}
          </button>
        ))}

        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSec, fontSize: 12, maxWidth: 160 }}>
          <option value="all">Toutes categories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <p style={{ color: C.textSec, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Aucune transaction</p>
        ) : filtered.map((t, i) => {
          const cat = cats.find((c) => c.id === t.cat_id) || { icon: '📦', name: 'Autre', color: '#888' };
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', transition: 'background .15s' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${cat.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag cat={cat} />
                  <span style={{ fontSize: 11, color: C.textSec }}>{new Date(t.date).toLocaleDateString('fr-CA')}</span>
                </div>
              </div>
              <Amount value={t.amount} type={t.type} />
              <button onClick={() => onDelete(t.id)} style={{ background: 'none', border: 'none', color: C.textMut, padding: 4, marginLeft: 4 }}>
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
