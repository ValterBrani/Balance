import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Edit2, Trash2 } from 'lucide-react';
import { Card, Amount } from '@/components/ui';
import { C, fmt, MONTHS_SHORT } from '@/utils/theme';

export default function NetWorth({ accounts, entries, month, year, onAddEntry, onUpdateEntry, onDeleteEntry }) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Use last day of selected month for new entries
  const snapshotDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  // Get latest entries for current period
  const periodEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const latestEntry = periodEntries.length > 0 ? periodEntries[0] : null;
  const latestByAccount = {};
  periodEntries.forEach((e) => {
    if (!latestByAccount[e.account_id]) {
      latestByAccount[e.account_id] = e;
    }
  });

  const assets = accounts.filter((a) => a.type === 'asset').sort((a, b) => a.sort_order - b.sort_order);
  const liabilities = accounts.filter((a) => a.type === 'liability').sort((a, b) => a.sort_order - b.sort_order);

  const totalAssets = assets.reduce((sum, a) => sum + (latestByAccount[a.id]?.amount || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (latestByAccount[l.id]?.amount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  // Previous period comparison
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });
  const prevNetWorth = prevEntries.reduce((sum, e) => {
    const acc = accounts.find((a) => a.id === e.account_id);
    return sum + (acc?.type === 'asset' ? e.amount : -e.amount);
  }, 0);

  const variation = prevNetWorth > 0 ? ((netWorth - prevNetWorth) / prevNetWorth * 100) : 0;

  // Evolution chart - last 12 months
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const m = (month - 5 + i + 12) % 12;
    const y = i < (6 - month) ? year - 1 : year;
    const monthEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    const monthNetWorth = monthEntries.reduce((sum, e) => {
      const acc = accounts.find((a) => a.id === e.account_id);
      return sum + (acc?.type === 'asset' ? e.amount : -e.amount);
    }, 0);
    return { name: MONTHS_SHORT[m], 'Avoir net': Math.round(monthNetWorth) };
  });

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <Card style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 6 }}>Total actifs</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: C.inc }}>{fmt(totalAssets)}</div>
        </Card>
        <Card style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 6 }}>Total passifs</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: C.exp }}>{fmt(totalLiabilities)}</div>
        </Card>
      </div>

      <Card style={{ padding: '16px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 6 }}>Avoir net</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: netWorth >= 0 ? C.inc : C.exp }}>{fmt(netWorth)}</div>
          </div>
          {variation !== 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: C.textSec }}>Variation</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: variation > 0 ? C.inc : C.exp }}>
                {variation > 0 ? '+' : ''}{variation.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card style={{ padding: '18px 16px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, color: C.textSec, marginBottom: 14, fontWeight: 500 }}>Évolution 12 mois</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barGap={4} barSize={16}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textSec }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.textSec }} axisLine={false} tickLine={false} width={40} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="Avoir net" fill={C.accent} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: C.text }}>Actifs</h3>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {assets.length === 0 ? (
            <p style={{ color: C.textSec, fontSize: 13, textAlign: 'center', padding: '20px' }}>Aucun actif</p>
          ) : assets.map((acc, i) => {
            const val = latestByAccount[acc.id]?.amount || 0;
            return (
              <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < assets.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: acc.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{acc.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{acc.name}</div>
                  <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>Mise à jour: {latestByAccount[acc.id] ? new Date(latestByAccount[acc.id].date).toLocaleDateString('fr-CA') : 'Jamais'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.inc, textAlign: 'right', minWidth: 80 }}>{fmt(val)}</div>
                  <button onClick={() => setEditingEntry(acc.id)} style={{ background: 'none', border: 'none', color: C.textMut, padding: 4 }}>
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: C.text }}>Passifs</h3>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {liabilities.length === 0 ? (
            <p style={{ color: C.textSec, fontSize: 13, textAlign: 'center', padding: '20px' }}>Aucun passif</p>
          ) : liabilities.map((acc, i) => {
            const val = latestByAccount[acc.id]?.amount || 0;
            return (
              <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < liabilities.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: acc.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{acc.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{acc.name}</div>
                  <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>Mise à jour: {latestByAccount[acc.id] ? new Date(latestByAccount[acc.id].date).toLocaleDateString('fr-CA') : 'Jamais'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.exp, textAlign: 'right', minWidth: 80 }}>{fmt(val)}</div>
                  <button onClick={() => setEditingEntry(acc.id)} style={{ background: 'none', border: 'none', color: C.textMut, padding: 4 }}>
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {editingEntry && <EditModal account={accounts.find((a) => a.id === editingEntry)} latestEntry={latestByAccount[editingEntry]} snapshotDate={snapshotDate} onSave={(amount) => { onUpdateEntry(editingEntry, { ...latestByAccount[editingEntry], amount, date: snapshotDate }); setEditingEntry(null); }} onClose={() => setEditingEntry(null)} />}
    </div>
  );
}

function EditModal({ account, latestEntry, snapshotDate, onSave, onClose }) {
  const [amount, setAmount] = useState(latestEntry?.amount || '');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 30 }}>
      <div style={{ background: C.surface, width: '100%', borderRadius: '16px 16px 0 0', padding: '24px 20px', maxHeight: '80vh', overflow: 'auto' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: C.text }}>Modifier {account.name}</h2>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" style={{ marginBottom: 16 }} placeholder="Montant" />
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontWeight: 500 }}>Annuler</button>
          <button onClick={() => onSave(parseFloat(amount))} style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: 'none', background: C.accent, color: '#000', fontWeight: 600 }}>Sauvegarder</button>
        </div>
      </div>
    </div>
  );
}
