import { Card, Transaction, User } from '../../types';

type SupabaseRow<T extends object> = T & Record<string, any>;

const pick = <T>(row: SupabaseRow<T>, key: string) => {
  if (key in row) return row[key];
  const lower = key.toLowerCase();
  if (lower in row) return row[lower];
  return undefined;
};

export const mapCardFromSupabase = (row: SupabaseRow<Card>): Card => ({
  id: row.id,
  nickname: pick(row, 'nickname') ?? '',
  brand: pick(row, 'brand'),
  last4: pick(row, 'last4') ?? '',
  holderName: pick(row, 'holderName') ?? '',
  expiration: pick(row, 'expiration') ?? '',
  limit: Number(pick(row, 'limit') ?? pick(row, 'creditLimit') ?? 0),
  dueDateDay: Number(pick(row, 'dueDateDay') ?? pick(row, 'due_day') ?? 1),
  closingDay: pick(row, 'closingDay') != null ? Number(pick(row, 'closingDay')) : undefined,
  gradient: pick(row, 'gradient') ?? { start: '#4B5563', end: '#1F2937' },
});

export const mapTransactionFromSupabase = (
  row: SupabaseRow<Transaction>,
): Transaction => ({
  id: row.id,
  description: pick(row, 'description') ?? '',
  category: pick(row, 'category'),
  amount: Number(pick(row, 'amount') ?? 0),
  date: pick(row, 'date') ?? new Date().toISOString(),
  type: pick(row, 'type'),
  paymentMethod: pick(row, 'paymentMethod') ?? pick(row, 'payment_method'),
  sourceId: pick(row, 'sourceId') ?? pick(row, 'source_id') ?? '',
  isInstallment: Boolean(pick(row, 'isInstallment')),
  installment: pick(row, 'installment') ?? undefined,
});

export const mapUserFromSupabase = (row: SupabaseRow<User>): User => ({
  name: pick(row, 'name') ?? '',
  email: pick(row, 'email') ?? '',
  avatarUrl: pick(row, 'avatarUrl') ?? pick(row, 'avatar_url') ?? '',
  membership: pick(row, 'membership') ?? 'Free',
});
