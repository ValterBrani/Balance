export const DEFAULT_CATS = [
  { name: 'Logement',       icon: '🏠', color: '#60a5fa', type: 'expense' },
  { name: 'Alimentation',   icon: '🛒', color: '#fbbf24', type: 'expense' },
  { name: 'Transport',      icon: '🚗', color: '#a78bfa', type: 'expense' },
  { name: 'Restaurants',    icon: '🍽️', color: '#fb923c', type: 'expense' },
  { name: 'Divertissement', icon: '🎬', color: '#f472b6', type: 'expense' },
  { name: 'Santé',          icon: '💊', color: '#2dd4bf', type: 'expense' },
  { name: 'Vêtements',      icon: '👕', color: '#f87171', type: 'expense' },
  { name: 'Épargne',        icon: '💰', color: '#4ade80', type: 'expense' },
  { name: 'Abonnements',    icon: '📱', color: '#818cf8', type: 'expense' },
  { name: 'Revenus',        icon: '💵', color: '#34d399', type: 'income'  },
  { name: 'Autre',          icon: '📦', color: '#94a3b8', type: 'both'    },
];

export const DEFAULT_NET_WORTH_ACCOUNTS = [
  // Actifs
  { name: 'Compte chèque',    icon: '🏦', color: '#3b82f6', type: 'asset', sort_order: 1 },
  { name: 'Compte épargne',   icon: '💰', color: '#06b6d4', type: 'asset', sort_order: 2 },
  { name: 'CELI',             icon: '🌿', color: '#10b981', type: 'asset', sort_order: 3 },
  { name: 'REER',             icon: '📈', color: '#f59e0b', type: 'asset', sort_order: 4 },
  { name: 'Valeur maison',    icon: '🏠', color: '#8b5cf6', type: 'asset', sort_order: 5 },
  { name: 'Valeur auto',      icon: '🚗', color: '#ec4899', type: 'asset', sort_order: 6 },
  { name: 'Autre actif',      icon: '📦', color: '#6b7280', type: 'asset', sort_order: 7 },
  // Passifs
  { name: 'Carte de crédit 1', icon: '💳', color: '#ef4444', type: 'liability', sort_order: 8 },
  { name: 'Carte de crédit 2', icon: '💳', color: '#f87171', type: 'liability', sort_order: 9 },
  { name: 'Dette maison',      icon: '🏠', color: '#dc2626', type: 'liability', sort_order: 10 },
  { name: 'Dette auto',        icon: '🚗', color: '#b91c1c', type: 'liability', sort_order: 11 },
  { name: 'Dette études',      icon: '🎓', color: '#991b1b', type: 'liability', sort_order: 12 },
  { name: 'Autre dette',       icon: '📦', color: '#7f1d1d', type: 'liability', sort_order: 13 },
];
