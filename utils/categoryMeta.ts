import { Category } from '../types';

type CategoryMeta = {
  icon: string;
  bgClass: string;
  textClass: string;
};

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  [Category.Food]: {
    icon: '🍽️',
    bgClass: 'bg-orange-100 text-orange-600',
    textClass: 'text-orange-600',
  },
  [Category.Housing]: {
    icon: '🏠',
    bgClass: 'bg-rose-100 text-rose-600',
    textClass: 'text-rose-600',
  },
  [Category.Transport]: {
    icon: '🚗',
    bgClass: 'bg-sky-100 text-sky-600',
    textClass: 'text-sky-600',
  },
  [Category.Health]: {
    icon: '🩺',
    bgClass: 'bg-emerald-100 text-emerald-600',
    textClass: 'text-emerald-600',
  },
  [Category.Leisure]: {
    icon: '🎉',
    bgClass: 'bg-purple-100 text-purple-600',
    textClass: 'text-purple-600',
  },
  [Category.Subscriptions]: {
    icon: '📺',
    bgClass: 'bg-indigo-100 text-indigo-600',
    textClass: 'text-indigo-600',
  },
  [Category.Shopping]: {
    icon: '🛍️',
    bgClass: 'bg-pink-100 text-pink-600',
    textClass: 'text-pink-600',
  },
  [Category.Salary]: {
    icon: '💼',
    bgClass: 'bg-teal-100 text-teal-600',
    textClass: 'text-teal-600',
  },
  [Category.Freelance]: {
    icon: '💡',
    bgClass: 'bg-amber-100 text-amber-600',
    textClass: 'text-amber-600',
  },
  [Category.Investment]: {
    icon: '📈',
    bgClass: 'bg-lime-100 text-lime-600',
    textClass: 'text-lime-600',
  },
  [Category.Other]: {
    icon: '✨',
    bgClass: 'bg-neutral-100 text-neutral-600',
    textClass: 'text-neutral-600',
  },
};

export const getCategoryMeta = (category?: Category): CategoryMeta => {
  if (category && CATEGORY_META[category]) {
    return CATEGORY_META[category];
  }
  return {
    icon: '🧾',
    bgClass: 'bg-neutral-100 text-neutral-500',
    textClass: 'text-neutral-500',
  };
};
