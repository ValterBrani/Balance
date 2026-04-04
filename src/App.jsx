import { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, LayoutDashboard, List, Target, Settings, TrendingUp } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { DEFAULT_CATS, DEFAULT_NET_WORTH_ACCOUNTS } from '@/utils/defaults';
import { C, gs, MONTHS_FR } from '@/utils/theme';
import { Spinner } from '@/components/ui';
import AddModal from '@/components/AddModal';
import AuthScreen from '@/views/AuthScreen';
import Dashboard from '@/views/Dashboard';
import Transactions from '@/views/Transactions';
import Budgets from '@/views/Budgets';
import NetWorth from '@/views/NetWorth';
import SettingsView from '@/views/SettingsView';

export default function App() {
  const now = new Date();
  const [session, setSession] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [viewMode, setViewMode] = useState('month');
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [txs, setTxs] = useState([]);
  const [cats, setCats] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [nwAccounts, setNwAccounts] = useState([]);
  const [nwEntries, setNwEntries] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const seedCategories = async (userId) => {
    const toInsert = DEFAULT_CATS.map((c) => ({ ...c, user_id: userId }));
    const { data, error } = await supabase.from('categories').insert(toInsert).select();
    if (error) console.error('Seed error:', error);
    return data || [];
  };

  const seedNetWorthAccounts = async (userId) => {
    const toInsert = DEFAULT_NET_WORTH_ACCOUNTS.map((a) => ({ ...a, user_id: userId, is_default: true }));
    const { data, error } = await supabase.from('net_worth_accounts').insert(toInsert).select();
    if (error) console.error('Seed NW error:', error);
    return data || [];
  };

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);

    let { data: catsData, error: catsError } = await supabase.from('categories').select('*').order('created_at');
    if (catsError) console.error('Categories Error:', catsError);
    
    if (!catsData || catsData.length === 0) {
      catsData = await seedCategories(session.user.id);
    }
    setCats(catsData || []);

    const { data: txsData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    setTxs(txsData || []);

    const { data: budgetsData } = await supabase.from('budgets').select('*');
    const budgetMap = {};
    (budgetsData || []).forEach((b) => { budgetMap[b.cat_id] = parseFloat(b.amount); });
    setBudgets(budgetMap);

    let { data: nwAccsData } = await supabase.from('net_worth_accounts').select('*').order('sort_order');
    if (!nwAccsData || nwAccsData.length === 0) {
      nwAccsData = await seedNetWorthAccounts(session.user.id);
    }
    setNwAccounts(nwAccsData || []);

    const { data: nwEntriesData } = await supabase.from('net_worth_entries').select('*').order('date', { ascending: false });
    setNwEntries(nwEntriesData || []);

    setLoading(false);
  }, [session]);

  useEffect(() => { loadData(); }, [loadData]);

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
    if (data) setTxs((ts) => [data, ...ts]);
  };

  const deleteTransaction = async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTxs((ts) => ts.filter((t) => t.id !== id));
  };

  const updateBudget = async (catId, amount) => {
    await supabase.from('budgets').upsert({
      user_id: session.user.id,
      cat_id: catId,
      amount,
      month: month + 1,
      year,
    }, { onConflict: 'user_id,cat_id,month,year' });
    setBudgets((b) => ({ ...b, [catId]: amount }));
  };

  const addCategory = async (cat) => {
    const { data } = await supabase.from('categories').insert({
      ...cat,
      user_id: session.user.id,
      is_default: false,
    }).select().single();
    if (data) setCats((cs) => [...cs, data]);
  };

  const deleteCategory = async (id) => {
    await supabase.from('categories').delete().eq('id', id);
    setCats((cs) => cs.filter((c) => c.id !== id));
  };

  const updateNwEntry = async (accountId, entry) => {
    const dateStr = entry.date || new Date().toISOString().split('T')[0];

    // Check if entry exists (don't use .single() to avoid 406 error)
    const { data: existing, error: existError } = await supabase.from('net_worth_entries')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('account_id', accountId)
      .eq('date', dateStr);

    let result;
    if (existing && existing.length > 0) {
      // Update existing
      result = await supabase.from('net_worth_entries')
        .update({ amount: entry.amount, note: entry.note })
        .eq('id', existing[0].id)
        .select()
        .single();
    } else {
      // Insert new
      result = await supabase.from('net_worth_entries')
        .insert({
          user_id: session.user.id,
          account_id: accountId,
          amount: entry.amount,
          date: dateStr,
          note: entry.note,
        })
        .select()
        .single();
    }

    if (result.error) console.error('Error updating entry:', result.error);
    if (result.data) {
      setNwEntries((es) => {
        const filtered = es.filter((e) => !(e.account_id === accountId && e.date === dateStr));
        return [result.data, ...filtered];
      });
    }
  };

  const deleteNwEntry = async (id) => {
    await supabase.from('net_worth_entries').delete().eq('id', id);
    setNwEntries((es) => es.filter((e) => e.id !== id));
  };

  const addNwAccount = async (acc) => {
    const { data } = await supabase.from('net_worth_accounts').insert({
      user_id: session.user.id,
      ...acc,
      is_default: false,
      sort_order: Math.max(0, ...nwAccounts.map((a) => a.sort_order)) + 1,
    }).select().single();
    if (data) setNwAccounts((as) => [...as, data]);
  };

  const deleteNwAccount = async (id) => {
    await supabase.from('net_worth_accounts').delete().eq('id', id);
    setNwAccounts((as) => as.filter((a) => a.id !== id));
  };

  const reorderNwAccounts = async (accounts) => {
    const updates = accounts.map((a, i) => ({ ...a, sort_order: i + 1 }));
    const { error } = await supabase.from('net_worth_accounts').upsert(updates);
    if (error) console.error('Error reordering:', error);
    else setNwAccounts(updates);
  };

  const signOut = () => supabase.auth.signOut();
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };
  const prevYear = () => setYear((y) => y - 1);
  const nextYear = () => setYear((y) => y + 1);

  const tabs = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Tableau' },
    { id: 'transactions', icon: <List size={18} />, label: 'Transactions' },
    { id: 'budgets', icon: <Target size={18} />, label: 'Budgets' },
    { id: 'networth', icon: <TrendingUp size={18} />, label: 'Avoir net' },
    { id: 'settings', icon: <Settings size={18} />, label: 'Reglages' },
  ];

  if (session === undefined) return null;
  if (!session) return <><style>{gs}</style><AuthScreen /></>;

  return (
    <>
      <style>{gs}</style>
      <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 80 }}>
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: C.textSec, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Budget</div>
            <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "'DM Serif Display',serif", color: C.accentL }}>Balance</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 4, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 6px' }}>
              {['month', 'year'].map((m) => (
                <button key={m} onClick={() => setViewMode(m)} style={{ padding: '5px 12px', borderRadius: 16, background: viewMode === m ? C.accent : 'transparent', color: viewMode === m ? '#000' : C.textSec, fontSize: 11, fontWeight: 500, border: 'none', transition: 'all .15s' }}>
                  {m === 'month' ? 'Mois' : 'Année'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: '6px 14px' }}>
              <button onClick={viewMode === 'month' ? prevMonth : prevYear} style={{ background: 'none', border: 'none', color: C.textSec, display: 'flex', padding: 2 }}><ChevronLeft size={16} /></button>
              <span style={{ fontSize: 13, fontWeight: 500, minWidth: viewMode === 'month' ? 110 : 40, textAlign: 'center', color: C.text }}>{viewMode === 'month' ? `${MONTHS_FR[month]} ${year}` : year}</span>
              <button onClick={viewMode === 'month' ? nextMonth : nextYear} style={{ background: 'none', border: 'none', color: C.textSec, display: 'flex', padding: 2 }}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px' }}>
          {loading ? <Spinner /> : (
            <>
              {view === 'dashboard' && <Dashboard txs={txs} cats={cats} month={month} year={year} viewMode={viewMode} />}
              {view === 'transactions' && <Transactions txs={txs} cats={cats} onDelete={deleteTransaction} month={month} year={year} />}
              {view === 'budgets' && <Budgets txs={txs} cats={cats} budgets={budgets} onUpdateBudget={updateBudget} month={month} year={year} />}
              {view === 'networth' && <NetWorth accounts={nwAccounts} entries={nwEntries} month={month} year={year} onUpdateEntry={updateNwEntry} onDeleteEntry={deleteNwEntry} />}
              {view === 'settings' && <SettingsView cats={cats} onAddCat={addCategory} onDeleteCat={deleteCategory} nwAccounts={nwAccounts} onAddNwAcc={addNwAccount} onDeleteNwAcc={deleteNwAccount} onReorderNwAcc={reorderNwAccounts} user={session.user} onSignOut={signOut} />}
            </>
          )}
        </div>

        {view !== 'settings' && view !== 'networth' && (
          <button onClick={() => setShowAdd(true)} style={{ position: 'fixed', bottom: 90, right: 20, width: 54, height: 54, borderRadius: 27, background: `linear-gradient(135deg,${C.accent},${C.accentL})`, border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px rgba(200,150,42,0.4)`, zIndex: 20 }}>
            <Plus size={24} />
          </button>
        )}

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', padding: '8px 0 calc(8px + env(safe-area-inset-bottom))', zIndex: 20 }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setView(t.id)} style={{ flex: 1, background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 0', color: view === t.id ? C.accent : C.textSec, transition: 'color .15s' }}>
              {t.icon}
              <span style={{ fontSize: 10, fontWeight: 500 }}>{t.label}</span>
            </button>
          ))}
        </div>

        {showAdd && <AddModal cats={cats} onAdd={addTransaction} onClose={() => setShowAdd(false)} />}
      </div>
    </>
  );
}
