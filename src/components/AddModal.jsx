import { useState } from 'react';
import { Repeat, X } from 'lucide-react';
import { C } from '@/utils/theme';

export default function AddModal({ cats, onAdd, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const expCats = cats.filter((c) => c.type !== 'income');
  const incCats = cats.filter((c) => c.type !== 'expense');
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    catId: expCats[0]?.id || '',
    desc: '',
    date: today,
    recurring: false,
    recurring_frequency: 'monthly',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ amount: '', desc: '' });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleTypeChange = (t) => {
    const defaultCat = t === 'income' ? incCats[0]?.id : expCats[0]?.id;
    setForm((f) => ({ ...f, type: t, catId: defaultCat || '' }));
  };

  const submit = async () => {
    const amount = parseFloat(form.amount);
    const desc = form.desc.trim();
    if (!form.catId) return;

    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      setErrors((prev) => ({ ...prev, amount: 'Le montant doit etre superieur a 0.' }));
      return;
    }

    if (!desc) {
      setErrors((prev) => ({ ...prev, desc: 'La description est obligatoire.' }));
      return;
    }

    setErrors({ amount: '', desc: '' });
    setLoading(true);
    await onAdd({ ...form, desc, amount });
    setLoading(false);
    onClose();
  };

  const availableCats = form.type === 'income'
    ? cats.filter((c) => c.type === 'income' || c.type === 'both')
    : cats.filter((c) => c.type === 'expense' || c.type === 'both');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: C.card, borderRadius: '20px 20px 0 0', padding: 28, width: '100%', maxWidth: 520, border: `1px solid ${C.border}`, borderBottom: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <span style={{ fontSize: 17, fontWeight: 600 }}>Nouvelle transaction</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textSec, padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', background: C.surface, borderRadius: 10, padding: 3, marginBottom: 18, border: `1px solid ${C.border}` }}>
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 8,
                border: 'none',
                fontWeight: 500,
                fontSize: 13,
                transition: 'all .2s',
                background: form.type === t ? (t === 'income' ? C.inc : C.exp) : 'transparent',
                color: form.type === t ? '#fff' : C.textSec,
              }}
            >
              {t === 'income' ? 'Revenu' : 'Depense'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: 'block' }}>Montant ($)</label>
            <input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => {
                set('amount', e.target.value);
                if (errors.amount && parseFloat(e.target.value) > 0) {
                  setErrors((prev) => ({ ...prev, amount: '' }));
                }
              }}
              style={{ fontSize: 20, fontWeight: 600, borderColor: errors.amount ? C.exp : C.border }}
            />
            {errors.amount && (
              <div style={{ color: C.exp, fontSize: 12, marginTop: 6 }}>{errors.amount}</div>
            )}
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: 'block' }}>Date</label>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: 'block' }}>Description</label>
          <input
            placeholder="ex: IGA - Epicerie"
            value={form.desc}
            onChange={(e) => {
              set('desc', e.target.value);
              if (errors.desc && e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, desc: '' }));
              }
            }}
            style={{ borderColor: errors.desc ? C.exp : C.border }}
          />
          {errors.desc && (
            <div style={{ color: C.exp, fontSize: 12, marginTop: 6 }}>{errors.desc}</div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: 'block' }}>Categorie</label>
          <select value={form.catId} onChange={(e) => set('catId', e.target.value)}>
            {availableCats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: form.recurring ? 12 : 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => set('recurring', !form.recurring)} style={{ width: 38, height: 22, borderRadius: 11, border: 'none', background: form.recurring ? C.accent : C.textMut, position: 'relative', transition: 'background .2s' }}>
              <span style={{ position: 'absolute', top: 2, left: form.recurring ? 18 : 2, width: 18, height: 18, borderRadius: 9, background: '#fff', transition: 'left .2s' }} />
            </button>
            <span style={{ fontSize: 13, color: C.textSec }}>Transaction recurrente</span>
          </div>
          <Repeat size={14} color={form.recurring ? C.accent : C.textMut} />
        </div>

        {form.recurring && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
            {[['monthly', 'Mensuelle'], ['biweekly', 'Aux 2 sem.'], ['weekly', 'Hebdo']].map(([val, label]) => (
              <button key={val} onClick={() => set('recurring_frequency', val)} style={{ flex: 1, padding: '8px 6px', borderRadius: 10, border: `1px solid ${form.recurring_frequency === val ? C.accent : C.border}`, background: form.recurring_frequency === val ? C.accentBg : 'transparent', color: form.recurring_frequency === val ? C.accent : C.textSec, fontSize: 11, fontWeight: 500, transition: 'all .15s' }}>
                {label}
              </button>
            ))}
          </div>
        )}

        <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '13px 0', background: C.accent, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Enregistrement...' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}
