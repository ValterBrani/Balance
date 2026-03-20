export const MONTHS_FR = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
export const MONTHS_SHORT = ['Jan','Fev','Mar','Avr','Mai','Jun','Jul','Aou','Sep','Oct','Nov','Dec'];

export const fmt = (n) =>
  new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(n);

export const fmtD = (n) =>
  new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export const C = {
  bg: '#07090f',
  surface: '#0d1120',
  card: '#121828',
  border: 'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.13)',
  accent: '#c8962a',
  accentL: '#e6b94a',
  accentBg: 'rgba(200,150,42,0.1)',
  text: '#dde4f5',
  textSec: '#6d7d96',
  textMut: '#2d3a4d',
  inc: '#3ecf8e',
  exp: '#f56565',
};

export const gs = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:${C.bg}; color:${C.text}; font-family:'Plus Jakarta Sans',sans-serif; -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:2px; }
  input,select,textarea { background:${C.surface}; color:${C.text}; border:1px solid ${C.border}; border-radius:8px; padding:10px 14px; font-family:inherit; font-size:14px; outline:none; width:100%; transition:border-color .15s; }
  input:focus,select:focus { border-color:${C.accent}; }
  input::placeholder { color:${C.textSec}; }
  select option { background:${C.card}; }
  button { cursor:pointer; font-family:inherit; }
`;