import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Card, Amount } from '@/components/ui';
import { C, MONTHS_SHORT, fmt } from '@/utils/theme';

export default function Dashboard({ txs, cats, month, year, viewMode = 'month' }) {
  // Filter transactions based on view mode
  const filteredTxs = viewMode === 'year'
    ? txs.filter((t) => new Date(t.date).getFullYear() === year)
    : txs.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });

  const income = filteredTxs.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
  const expenses = filteredTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
  const balance = income - expenses;
  const savings = income > 0 ? Math.round((balance / income) * 100) : 0;

  const byCat = {};
  filteredTxs.filter((t) => t.type === 'expense').forEach((t) => { byCat[t.cat_id] = (byCat[t.cat_id] || 0) + parseFloat(t.amount); });

  const pieData = Object.entries(byCat).map(([id, val]) => ({
    name: cats.find((c) => c.id === id)?.name || '?',
    value: Math.round(val),
    color: cats.find((c) => c.id === id)?.color || '#888',
  })).sort((a, b) => b.value - a.value);

  // Different bar chart data for year vs month view
  const barData = viewMode === 'year'
    ? Array.from({ length: 12 }, (_, i) => {
        const monthTxs = txs.filter((t) => {
          const d = new Date(t.date);
          return d.getMonth() === i && d.getFullYear() === year;
        });
        return {
          name: MONTHS_SHORT[i],
          Revenus: Math.round(monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0)),
          Depenses: Math.round(monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)),
        };
      })
    : Array.from({ length: 6 }, (_, i) => {
        const d = new Date(year, month - 5 + i, 1);
        const m = d.getMonth();
        const y = d.getFullYear();
        const mT = txs.filter((t) => {
          const td = new Date(t.date);
          return td.getMonth() === m && td.getFullYear() === y;
        });

        return {
          name: MONTHS_SHORT[m],
          Revenus: Math.round(mT.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0)),
          Depenses: Math.round(mT.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)),
        };
      });

  const recent = [...filteredTxs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const MetCard = ({ label, value, color }) => (
    <div style={{ background: C.surface, borderRadius: 14, padding: '16px 18px', border: `1px solid ${C.border}`, flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 12, color: C.textSec, fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color, letterSpacing: '-0.5px' }}>{value}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <MetCard label={viewMode === 'year' ? 'Total revenus' : 'Revenus'} value={fmt(income)} color={C.inc} />
        <MetCard label={viewMode === 'year' ? 'Total depenses' : 'Depenses'} value={fmt(expenses)} color={C.exp} />
        <MetCard label={viewMode === 'year' ? 'Balance annuelle' : 'Balance'} value={fmt(balance)} color={balance >= 0 ? C.inc : C.exp} />
        <MetCard label={viewMode === 'year' ? 'Taux epargne moyen' : 'Taux epargne'} value={`${savings}%`} color={C.accent} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14, marginBottom: 20 }}>
        <Card style={{ padding: '18px 16px' }}>
          <h3 style={{ fontSize: 13, color: C.textSec, marginBottom: 14, fontWeight: 500 }}>Repartition depenses</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSec, fontSize: 13 }}>Aucune depense {viewMode === 'year' ? 'cette annee' : 'ce mois'}</div>
          )}
        </Card>

        <Card style={{ padding: '18px 16px' }}>
          <h3 style={{ fontSize: 13, color: C.textSec, marginBottom: 14, fontWeight: 500 }}>{viewMode === 'year' ? '12 mois' : 'Tendance 6 mois'}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={4} barSize={viewMode === 'year' ? 16 : 18}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={32} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="Revenus" fill={C.inc} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Depenses" fill={C.exp} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize: 13, color: C.textSec, marginBottom: 14, fontWeight: 500 }}>Transactions recentes</h3>
        {recent.length === 0 ? (
          <p style={{ color: C.textSec, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Aucune transaction {viewMode === 'year' ? 'cette annee' : 'ce mois-ci'}</p>
        ) : recent.map((t) => {
          const cat = cats.find((c) => c.id === t.cat_id) || { icon: '📦', name: 'Autre', color: '#888' };
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 20, width: 34, textAlign: 'center' }}>{cat.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{new Date(t.date).toLocaleDateString('fr-CA')}</div>
              </div>
              <Amount value={t.amount} type={t.type} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}
