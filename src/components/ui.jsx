import { fmtD } from '@/utils/theme';
import { useColors } from '@/utils/ThemeContext';

export const Card = ({ children, style = {}, ...p }) => {
  const C = useColors();
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px', ...style }} {...p}>
      {children}
    </div>
  );
};

export const Tag = ({ cat }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${cat.color}18`, color: cat.color, fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20 }}>
    <span style={{ fontSize: 11 }}>{cat.icon}</span>{cat.name}
  </span>
);

export const Amount = ({ value, type }) => {
  const C = useColors();
  return (
    <span style={{ color: type === 'income' ? C.inc : C.exp, fontWeight: 600, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
      {type === 'income' ? '+' : '-'}{fmtD(value)}
    </span>
  );
};

export const Spinner = () => {
  const C = useColors();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  );
};
