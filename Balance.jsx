import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Plus, ChevronLeft, ChevronRight, X, Repeat, Trash2, LayoutDashboard, List, Target, Settings, Upload, Check, Edit2, RefreshCw, LogOut, Github } from "lucide-react";
import { supabase } from "./lib/supabase";
import { DEFAULT_CATS } from "./lib/defaults";

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MONTHS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const fmt  = (n) => new Intl.NumberFormat('fr-CA', { style:'currency', currency:'CAD', maximumFractionDigits:0 }).format(n);
const fmtD = (n) => new Intl.NumberFormat('fr-CA', { style:'currency', currency:'CAD', minimumFractionDigits:2, maximumFractionDigits:2 }).format(n);

const C = {
  bg:'#07090f', surface:'#0d1120', card:'#121828',
  border:'rgba(255,255,255,0.07)', borderMid:'rgba(255,255,255,0.13)',
  accent:'#c8962a', accentL:'#e6b94a', accentBg:'rgba(200,150,42,0.1)',
  text:'#dde4f5', textSec:'#6d7d96', textMut:'#2d3a4d',
  inc:'#3ecf8e', exp:'#f56565',
};

const gs = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:${C.bg}; color:${C.text}; font-family:'Plus Jakarta Sans',sans-serif; -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:2px; }
  input,select,textarea { background:${C.surface}; color:${C.text}; border:1px solid ${C.border}; border-radius:8px; padding:10px 14px; font-family:inherit; font-size:14px; outline:none; width:100%; transition:border-color .15s; }
  input:focus,select:focus { border-color:${C.accent}; }
  input::placeholder { color:${C.textSec}; }
  select option { background:${C.card}; }
  button { cursor:pointer; font-family:inherit; }
`;

// ── UI helpers ─────────────────────────────────────────────────────
const Card = ({ children, style={}, ...p }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'20px 22px', ...style }} {...p}>
    {children}
  </div>
);

const Tag = ({ cat }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:`${cat.color}18`, color:cat.color, fontSize:11, fontWeight:500, padding:'3px 8px', borderRadius:20 }}>
    <span style={{fontSize:11}}>{cat.icon}</span>{cat.name}
  </span>
);

const Amount = ({ value, type }) => (
  <span style={{ color:type==='income'?C.inc:C.exp, fontWeight:600, fontSize:15, fontVariantNumeric:'tabular-nums' }}>
    {type==='income' ? '+' : '−'}{fmtD(value)}
  </span>
);

const Spinner = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
    <div style={{ width:32, height:32, border:`3px solid ${C.border}`, borderTopColor:C.accent, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
  </div>
);

// ── Auth Screen ────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode]     = useState('login');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !pass) return;
    setLoading(true); setError('');
    const fn = mode === 'login'
      ? supabase.auth.signInWithPassword({ email, password:pass })
      : supabase.auth.signUp({ email, password:pass });
    const { error:err } = await fn;
    if (err) setError(err.message);
    setLoading(false);
  };

  const githubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/Balance/` }
    });
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ fontSize:12, color:C.textSec, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Bienvenue sur</div>
          <div style={{ fontSize:32, fontFamily:"'DM Serif Display',serif", color:C.accentL }}>Balance</div>
          <div style={{ fontSize:13, color:C.textSec, marginTop:8 }}>Votre budget, simplement.</div>
        </div>

        <Card>
          {/* Toggle login/signup */}
          <div style={{ display:'flex', background:C.surface, borderRadius:10, padding:3, marginBottom:22, border:`1px solid ${C.border}` }}>
            {[['login','Connexion'],['signup','Créer un compte']].map(([m,l]) => (
              <button key={m} onClick={()=>{ setMode(m); setError(''); }} style={{ flex:1, padding:'9px 0', borderRadius:8, border:'none', fontSize:13, fontWeight:500, transition:'all .2s',
                background:mode===m ? C.accent : 'transparent', color:mode===m ? '#fff' : C.textSec }}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, color:C.textSec, marginBottom:5, display:'block' }}>Courriel</label>
            <input type="email" placeholder="vous@exemple.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, color:C.textSec, marginBottom:5, display:'block' }}>Mot de passe</label>
            <input type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>

          {error && <div style={{ fontSize:12, color:C.exp, marginBottom:14, padding:'8px 12px', background:`${C.exp}15`, borderRadius:8 }}>{error}</div>}

          <button onClick={submit} disabled={loading} style={{ width:'100%', padding:'13px 0', background:C.accent, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:600, opacity:loading?0.7:1 }}>
            {loading ? '...' : mode==='login' ? 'Se connecter' : "S'inscrire"}
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'18px 0' }}>
            <div style={{ flex:1, height:1, background:C.border }}/>
            <span style={{ fontSize:12, color:C.textSec }}>ou</span>
            <div style={{ flex:1, height:1, background:C.border }}/>
          </div>

          <button onClick={githubLogin} style={{ width:'100%', padding:'12px 0', background:C.surface, color:C.text, border:`1px solid ${C.border}`, borderRadius:12, fontSize:14, fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <Github size={16}/> Continuer avec GitHub
          </button>
        </Card>
      </div>
    </div>
  );
}

// ── AddTransaction Modal ───────────────────────────────────────────
function AddModal({ cats, onAdd, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const expCats = cats.filter(c=>c.type!=='income');
  const incCats = cats.filter(c=>c.type!=='expense');
  const [form, setForm] = useState({ type:'expense', amount:'', catId: expCats[0]?.id||'', desc:'', date:today, recurring:false });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (t) => {
    const defaultCat = t==='income' ? incCats[0]?.id : expCats[0]?.id;
    setForm(f=>({...f, type:t, catId:defaultCat||''}));
  };

  const submit = async () => {
    if (!form.amount || !form.desc || !form.catId) return;
    setLoading(true);
    await onAdd({ ...form, amount:parseFloat(form.amount) });
    setLoading(false);
    onClose();
  };

  const availableCats = form.type==='income'
    ? cats.filter(c=>c.type==='income'||c.type==='both')
    : cats.filter(c=>c.type==='expense'||c.type==='both');

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:100, backdropFilter:'blur(4px)' }}>
      <div style={{ background:C.card, borderRadius:'20px 20px 0 0', padding:28, width:'100%', maxWidth:520, border:`1px solid ${C.border}`, borderBottom:'none' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <span style={{ fontSize:17, fontWeight:600 }}>Nouvelle transaction</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.textSec, padding:4 }}><X size={20}/></button>
        </div>
        <div style={{ display:'flex', background:C.surface, borderRadius:10, padding:3, marginBottom:18, border:`1px solid ${C.border}` }}>
          {['expense','income'].map(t=>(
            <button key={t} onClick={()=>handleTypeChange(t)} style={{ flex:1, padding:'9px 0', borderRadius:8, border:'none', fontWeight:500, fontSize:13, transition:'all .2s',
              background:form.type===t?(t==='income'?C.inc:C.exp):'transparent', color:form.type===t?'#fff':C.textSec }}>
              {t==='income' ? '💵 Revenu' : '💳 Dépense'}
            </button>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div>
            <label style={{ fontSize:12, color:C.textSec, marginBottom:5, display:'block' }}>Montant ($)</label>
            <input type="number" placeholder="0.00" value={form.amount} onChange={e=>set('amount',e.target.value)} style={{ fontSize:20, fontWeight:600 }}/>
          </div>
          <div>
            <label style={{ fontSize:12, color:C.textSec, marginBottom:5, display:'block' }}>Date</label>
            <input type="date" value={form.date} onChange={e=>set('date',e.target.value)}/>
          </div>
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, color:C.textSec, marginBottom:5, display:'block' }}>Description</label>
          <input placeholder="ex: IGA — Épicerie" value={form.desc} onChange={e=>set('desc',e.target.value)}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, color:C.textSec, marginBottom:5, display:'block' }}>Catégorie</label>
          <select value={form.catId} onChange={e=>set('catId',e.target.value)}>
            {availableCats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={()=>set('recurring',!form.recurring)} style={{ width:38, height:22, borderRadius:11, border:'none', background:form.recurring?C.accent:C.textMut, position:'relative', transition:'background .2s' }}>
              <span style={{ position:'absolute', top:2, left:form.recurring?18:2, width:18, height:18, borderRadius:9, background:'#fff', transition:'left .2s' }}/>
            </button>
            <span style={{ fontSize:13, color:C.textSec }}>Transaction récurrente</span>
          </div>
          <Repeat size={14} color={form.recurring?C.accent:C.textMut}/>
        </div>
        <button onClick={submit} disabled={loading} style={{ width:'100%', padding:'13px 0', background:C.accent, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:600, opacity:loading?0.7:1 }}>
          {loading ? 'Enregistrement...' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────
function Dashboard({ txs, cats, budgets, month, year }) {
  const mTxs = txs.filter(t=>{ const d=new Date(t.date); return d.getMonth()===month&&d.getFullYear()===year; });
  const income   = mTxs.filter(t=>t.type==='income').reduce((s,t)=>s+parseFloat(t.amount),0);
  const expenses = mTxs.filter(t=>t.type==='expense').reduce((s,t)=>s+parseFloat(t.amount),0);
  const balance  = income - expenses;
  const savings  = income > 0 ? Math.round((balance/income)*100) : 0;

  const byCat = {};
  mTxs.filter(t=>t.type==='expense').forEach(t=>{ byCat[t.cat_id]=(byCat[t.cat_id]||0)+parseFloat(t.amount); });
  const pieData = Object.entries(byCat).map(([id,val])=>({
    name: cats.find(c=>c.id===id)?.name||'?', value:Math.round(val), color:cats.find(c=>c.id===id)?.color||'#888'
  })).sort((a,b)=>b.value-a.value);

  const barData = Array.from({length:6},(_,i)=>{
    const d = new Date(year, month-5+i, 1);
    const m=d.getMonth(), y=d.getFullYear();
    const mT = txs.filter(t=>{ const td=new Date(t.date); return td.getMonth()===m&&td.getFullYear()===y; });
    return { name:MONTHS_SHORT[m], Revenus:Math.round(mT.filter(t=>t.type==='income').reduce((s,t)=>s+parseFloat(t.amount),0)), Dépenses:Math.round(mT.filter(t=>t.type==='expense').reduce((s,t)=>s+parseFloat(t.amount),0)) };
  });

  const recent = [...mTxs].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);

  const MetCard = ({ label, value, color, icon }) => (
    <div style={{ background:C.surface, borderRadius:14, padding:'16px 18px', border:`1px solid ${C.border}`, flex:1, minWidth:130 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <span style={{ fontSize:12, color:C.textSec, fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:18 }}>{icon}</span>
      </div>
      <div style={{ fontSize:22, fontWeight:600, color, letterSpacing:'-0.5px' }}>{value}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <MetCard label="Revenus"      value={fmt(income)}   color={C.inc}                     icon="💵"/>
        <MetCard label="Dépenses"     value={fmt(expenses)} color={C.exp}                     icon="💳"/>
        <MetCard label="Balance"      value={fmt(balance)}  color={balance>=0?C.inc:C.exp}    icon="⚖️"/>
        <MetCard label="Taux épargne" value={`${savings}%`} color={C.accent}                  icon="📈"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:14, marginBottom:20 }}>
        <Card style={{ padding:'18px 16px' }}>
          <h3 style={{ fontSize:13, color:C.textSec, marginBottom:14, fontWeight:500 }}>Répartition dépenses</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2} dataKey="value">
                    {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12 }}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:8 }}>
                {pieData.slice(0,5).map(e=>(
                  <div key={e.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:e.color, display:'inline-block' }}/>
                      <span style={{ color:C.textSec }}>{e.name}</span>
                    </div>
                    <span style={{ fontWeight:500 }}>{fmt(e.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center', color:C.textSec, fontSize:13 }}>Aucune dépense ce mois</div>
          )}
        </Card>

        <Card style={{ padding:'18px 16px' }}>
          <h3 style={{ fontSize:13, color:C.textSec, marginBottom:14, fontWeight:500 }}>Tendance 6 mois</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={4} barSize={18}>
              <XAxis dataKey="name" tick={{ fontSize:11, fill:C.textSec }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:C.textSec }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} width={32}/>
              <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12 }} cursor={{ fill:'rgba(255,255,255,0.03)' }}/>
              <Bar dataKey="Revenus"  fill={C.inc} radius={[3,3,0,0]}/>
              <Bar dataKey="Dépenses" fill={C.exp} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:16, marginTop:4 }}>
            {[['Revenus',C.inc],['Dépenses',C.exp]].map(([n,c])=>(
              <span key={n} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:C.textSec }}>
                <span style={{ width:10, height:10, borderRadius:2, background:c }}/>
                {n}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize:13, color:C.textSec, marginBottom:14, fontWeight:500 }}>Transactions récentes</h3>
        {recent.length === 0 ? (
          <p style={{ color:C.textSec, fontSize:13, textAlign:'center', padding:'20px 0' }}>Aucune transaction ce mois-ci</p>
        ) : recent.map(t=>{
          const cat = cats.find(c=>c.id===t.cat_id)||cats[cats.length-1]||{icon:'📦',name:'Autre',color:'#888'};
          return (
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:20, width:34, textAlign:'center' }}>{cat.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.description}</div>
                <div style={{ fontSize:11, color:C.textSec, marginTop:2 }}>
                  {new Date(t.date).toLocaleDateString('fr-CA')}
                  {t.recurring && <span style={{ marginLeft:6, color:C.accent }}>↻ récurrent</span>}
                </div>
              </div>
              <Amount value={t.amount} type={t.type}/>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ── Transactions ───────────────────────────────────────────────────
function Transactions({ txs, cats, onDelete, month, year }) {
  const [filter, setFilter]       = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  const mTxs = txs.filter(t=>{ const d=new Date(t.date); return d.getMonth()===month&&d.getFullYear()===year; });
  const filtered = mTxs
    .filter(t=>filter==='all'||t.type===filter)
    .filter(t=>catFilter==='all'||t.cat_id===catFilter)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:14, overflowX:'auto', paddingBottom:4 }}>
        {[['all','Tout'],['expense','Dépenses'],['income','Revenus']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{ padding:'7px 14px', borderRadius:20, border:`1px solid ${filter===v?C.accent:C.border}`, background:filter===v?C.accentBg:'transparent', color:filter===v?C.accent:C.textSec, fontSize:12, fontWeight:500, whiteSpace:'nowrap' }}>
            {l}
          </button>
        ))}
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{ padding:'7px 14px', borderRadius:20, border:`1px solid ${C.border}`, background:'transparent', color:C.textSec, fontSize:12, maxWidth:160 }}>
          <option value="all">Toutes catégories</option>
          {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <Card style={{ padding:0, overflow:'hidden' }}>
        {filtered.length===0 ? (
          <p style={{ color:C.textSec, fontSize:13, textAlign:'center', padding:'32px 0' }}>Aucune transaction</p>
        ) : filtered.map((t,i)=>{
          const cat = cats.find(c=>c.id===t.cat_id)||{icon:'📦',name:'Autre',color:'#888'};
          return (
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:i<filtered.length-1?`1px solid ${C.border}`:'none', transition:'background .15s' }}
              onMouseEnter={e=>e.currentTarget.style.background=C.surface}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${cat.color}1a`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{cat.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.description}</span>
                  {t.recurring && <span style={{ fontSize:10, color:C.accent, border:`1px solid ${C.accent}33`, borderRadius:4, padding:'1px 5px' }}>↻</span>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Tag cat={cat}/>
                  <span style={{ fontSize:11, color:C.textSec }}>{new Date(t.date).toLocaleDateString('fr-CA')}</span>
                </div>
              </div>
              <Amount value={t.amount} type={t.type}/>
              <button onClick={()=>onDelete(t.id)} style={{ background:'none', border:'none', color:C.textMut, padding:4, marginLeft:4 }}
                onMouseEnter={e=>e.currentTarget.style.color=C.exp}
                onMouseLeave={e=>e.currentTarget.style.color=C.textMut}>
                <Trash2 size={14}/>
              </button>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ── Budgets ────────────────────────────────────────────────────────
function Budgets({ txs, cats, budgets, onUpdateBudget, month, year }) {
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');

  const mExpenses = txs.filter(t=>{ const d=new Date(t.date); return t.type==='expense'&&d.getMonth()===month&&d.getFullYear()===year; });
  const expByCat = {};
  mExpenses.forEach(t=>{ expByCat[t.cat_id]=(expByCat[t.cat_id]||0)+parseFloat(t.amount); });

  const rows = cats.filter(c=>c.type!=='income').map(c=>({
    cat:c, spent:expByCat[c.id]||0, budget:budgets[c.id]||0
  })).sort((a,b)=>b.spent-a.spent);

  const totalBudget  = Object.values(budgets).reduce((a,b)=>a+b,0);
  const totalSpent   = Object.values(expByCat).reduce((a,b)=>a+b,0);

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <Card style={{ padding:'14px 16px' }}>
          <div style={{ fontSize:12, color:C.textSec, marginBottom:6 }}>Total budgeté</div>
          <div style={{ fontSize:20, fontWeight:600, color:C.accent }}>{fmt(totalBudget)}</div>
        </Card>
        <Card style={{ padding:'14px 16px' }}>
          <div style={{ fontSize:12, color:C.textSec, marginBottom:6 }}>Total dépensé</div>
          <div style={{ fontSize:20, fontWeight:600, color:C.exp }}>{fmt(totalSpent)}</div>
        </Card>
      </div>

      <Card style={{ padding:0, overflow:'hidden' }}>
        {rows.map((r,i)=>{
          const pct      = r.budget > 0 ? Math.min((r.spent/r.budget)*100,100) : 0;
          const over     = r.budget > 0 && r.spent > r.budget;
          const barColor = over ? C.exp : pct > 80 ? '#f59e0b' : C.inc;
          return (
            <div key={r.cat.id} style={{ padding:'16px 20px', borderBottom:i<rows.length-1?`1px solid ${C.border}`:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <span style={{ fontSize:20 }}>{r.cat.icon}</span>
                <span style={{ flex:1, fontWeight:500, fontSize:14 }}>{r.cat.name}</span>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:13, color:over?C.exp:C.textSec }}>{fmt(r.spent)}</span>
                  <span style={{ fontSize:12, color:C.textMut }}>/</span>
                  {editing===r.cat.id ? (
                    <div style={{ display:'flex', gap:4 }}>
                      <input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)} style={{ width:80, fontSize:13, padding:'3px 8px' }}/>
                      <button onClick={()=>{ onUpdateBudget(r.cat.id, parseFloat(editVal)||0); setEditing(null); }} style={{ background:C.accent, border:'none', color:'#fff', padding:'3px 8px', borderRadius:6, fontSize:12 }}><Check size={12}/></button>
                    </div>
                  ) : (
                    <button onClick={()=>{ setEditing(r.cat.id); setEditVal(r.budget); }} style={{ background:'none', border:'none', color:C.textSec, fontSize:13, display:'flex', alignItems:'center', gap:3 }}>
                      {r.budget>0 ? fmt(r.budget) : <span style={{ color:C.textMut }}>Définir</span>}
                      <Edit2 size={10} style={{ marginLeft:2 }}/>
                    </button>
                  )}
                </div>
              </div>
              {r.budget > 0 && (
                <>
                  <div style={{ height:6, background:C.surface, borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:barColor, borderRadius:3, transition:'width .4s' }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                    <span style={{ fontSize:11, color:over?C.exp:'rgba(255,255,255,0.3)' }}>
                      {over ? `Dépassé de ${fmt(r.spent-r.budget)}` : `${Math.round(pct)}% utilisé`}
                    </span>
                    {!over && <span style={{ fontSize:11, color:C.inc }}>Reste {fmt(r.budget-r.spent)}</span>}
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

// ── Settings ───────────────────────────────────────────────────────
function SettingsView({ cats, onAddCat, onDeleteCat, user, onSignOut }) {
  const [newCat, setNewCat] = useState({ name:'', icon:'🏷️', color:'#888888' });

  const addCat = async () => {
    if (!newCat.name.trim()) return;
    await onAddCat({ ...newCat, type:'expense' });
    setNewCat({ name:'', icon:'🏷️', color:'#888888' });
  };

  return (
    <div>
      {/* User info */}
      <Card style={{ marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:13, color:C.textSec, marginBottom:2 }}>Connecté en tant que</div>
            <div style={{ fontSize:14, fontWeight:500 }}>{user?.email || user?.user_metadata?.user_name || 'Utilisateur'}</div>
          </div>
          <button onClick={onSignOut} style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', color:C.exp, border:`1px solid ${C.exp}33`, borderRadius:8, padding:'8px 14px', fontSize:13 }}>
            <LogOut size={14}/> Déconnexion
          </button>
        </div>
      </Card>

      {/* Categories */}
      <Card>
        <h3 style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Catégories</h3>
        <div style={{ marginBottom:14, display:'flex', flexWrap:'wrap', gap:8 }}>
          {cats.map(c=>(
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:5, background:`${c.color}15`, border:`1px solid ${c.color}30`, borderRadius:20, padding:'5px 10px' }}>
              <span style={{ fontSize:13 }}>{c.icon}</span>
              <span style={{ fontSize:12, color:c.color, fontWeight:500 }}>{c.name}</span>
              {!c.is_default && (
                <button onClick={()=>onDeleteCat(c.id)} style={{ background:'none', border:'none', color:c.color, padding:0, marginLeft:2, opacity:0.6 }}><X size={10}/></button>
              )}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input placeholder="Icône" value={newCat.icon} onChange={e=>setNewCat(n=>({...n,icon:e.target.value}))} style={{ width:60 }}/>
          <input placeholder="Nom de catégorie" value={newCat.name} onChange={e=>setNewCat(n=>({...n,name:e.target.value}))} style={{ flex:1, minWidth:120 }}/>
          <input type="color" value={newCat.color} onChange={e=>setNewCat(n=>({...n,color:e.target.value}))} style={{ width:44, padding:'4px', cursor:'pointer' }}/>
          <button onClick={addCat} style={{ background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:500 }}>
            Ajouter
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────
export default function App() {
  const now = new Date();
  const [session, setSession]   = useState(undefined);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState('dashboard');
  const [month, setMonth]       = useState(now.getMonth());
  const [year, setYear]         = useState(now.getFullYear());
  const [txs, setTxs]           = useState([]);
  const [cats, setCats]         = useState([]);
  const [budgets, setBudgets]   = useState({});
  const [showAdd, setShowAdd]   = useState(false);

  // ── Auth listener ──────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data:{ session } }) => setSession(session));
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // ── Seed default categories for new user ───────────────────────
  const seedCategories = async (userId) => {
    const toInsert = DEFAULT_CATS.map(c=>({ ...c, user_id:userId, is_default:true }));
    const { data } = await supabase.from('categories').insert(toInsert).select();
    return data || [];
  };

  // ── Load all data ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);

    // Categories
    let { data:catsData } = await supabase.from('categories').select('*').order('created_at');
    if (!catsData || catsData.length === 0) {
      catsData = await seedCategories(session.user.id);
    }
    setCats(catsData || []);

    // Transactions
    const { data:txsData } = await supabase.from('transactions').select('*').order('date', { ascending:false });
    setTxs(txsData || []);

    // Budgets → transform to { cat_id: amount }
    const { data:budgetsData } = await supabase.from('budgets').select('*');
    const budgetMap = {};
    (budgetsData || []).forEach(b=>{ budgetMap[b.cat_id] = parseFloat(b.amount); });
    setBudgets(budgetMap);

    setLoading(false);
  }, [session]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── CRUD ───────────────────────────────────────────────────────
  const addTransaction = async (form) => {
    const { data } = await supabase.from('transactions').insert({
      user_id: session.user.id,
      amount: form.amount,
      type: form.type,
      cat_id: form.catId,
      description: form.desc,
      date: form.date,
      recurring: form.recurring,
    }).select().single();
    if (data) setTxs(ts=>[data,...ts]);
  };

  const deleteTransaction = async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTxs(ts=>ts.filter(t=>t.id!==id));
  };

  const updateBudget = async (catId, amount) => {
    await supabase.from('budgets').upsert({
      user_id: session.user.id,
      cat_id: catId,
      amount,
      month: month + 1,
      year,
    }, { onConflict: 'user_id,cat_id,month,year' });
    setBudgets(b=>({...b,[catId]:amount}));
  };

  const addCategory = async (cat) => {
    const { data } = await supabase.from('categories').insert({
      user_id: session.user.id, ...cat, is_default:false
    }).select().single();
    if (data) setCats(cs=>[...cs,data]);
  };

  const deleteCategory = async (id) => {
    await supabase.from('categories').delete().eq('id', id);
    setCats(cs=>cs.filter(c=>c.id!==id));
  };

  const signOut = () => supabase.auth.signOut();

  const prevMonth = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  const tabs = [
    { id:'dashboard',    icon:<LayoutDashboard size={18}/>, label:'Tableau'      },
    { id:'transactions', icon:<List size={18}/>,            label:'Transactions' },
    { id:'budgets',      icon:<Target size={18}/>,          label:'Budgets'      },
    { id:'settings',     icon:<Settings size={18}/>,        label:'Réglages'     },
  ];

  // ── Render ─────────────────────────────────────────────────────
  if (session === undefined) return null;
  if (!session) return <><style>{gs}</style><AuthScreen/></>;

  return (
    <>
      <style>{gs}</style>
      <div style={{ minHeight:'100vh', background:C.bg, paddingBottom:80 }}>
        {/* Header */}
        <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
          <div>
            <div style={{ fontSize:11, color:C.textSec, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:2 }}>Budget</div>
            <div style={{ fontSize:17, fontWeight:600, fontFamily:"'DM Serif Display',serif", color:C.accentL }}>Balance</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:C.card, border:`1px solid ${C.border}`, borderRadius:24, padding:'6px 14px' }}>
            <button onClick={prevMonth} style={{ background:'none', border:'none', color:C.textSec, display:'flex', padding:2 }}><ChevronLeft size={16}/></button>
            <span style={{ fontSize:13, fontWeight:500, minWidth:110, textAlign:'center', color:C.text }}>{MONTHS_FR[month]} {year}</span>
            <button onClick={nextMonth} style={{ background:'none', border:'none', color:C.textSec, display:'flex', padding:2 }}><ChevronRight size={16}/></button>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth:700, margin:'0 auto', padding:'20px 16px' }}>
          {loading ? <Spinner/> : (
            <>
              {view==='dashboard'    && <Dashboard txs={txs} cats={cats} budgets={budgets} month={month} year={year}/>}
              {view==='transactions' && <Transactions txs={txs} cats={cats} onDelete={deleteTransaction} month={month} year={year}/>}
              {view==='budgets'      && <Budgets txs={txs} cats={cats} budgets={budgets} onUpdateBudget={updateBudget} month={month} year={year}/>}
              {view==='settings'     && <SettingsView cats={cats} onAddCat={addCategory} onDeleteCat={deleteCategory} user={session.user} onSignOut={signOut}/>}
            </>
          )}
        </div>

        {/* FAB */}
        {view !== 'settings' && (
          <button onClick={()=>setShowAdd(true)} style={{ position:'fixed', bottom:90, right:20, width:54, height:54, borderRadius:27, background:`linear-gradient(135deg,${C.accent},${C.accentL})`, border:'none', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 20px rgba(200,150,42,0.4)`, zIndex:20 }}>
            <Plus size={24}/>
          </button>
        )}

        {/* Bottom nav */}
        <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.surface, borderTop:`1px solid ${C.border}`, display:'flex', padding:'8px 0 calc(8px + env(safe-area-inset-bottom))', zIndex:20 }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setView(t.id)} style={{ flex:1, background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'4px 0', color:view===t.id?C.accent:C.textSec, transition:'color .15s' }}>
              {t.icon}
              <span style={{ fontSize:10, fontWeight:500 }}>{t.label}</span>
            </button>
          ))}
        </div>

        {showAdd && <AddModal cats={cats} onAdd={addTransaction} onClose={()=>setShowAdd(false)}/>}
      </div>
    </>
  );
}
