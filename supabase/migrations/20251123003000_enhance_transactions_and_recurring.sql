-- Migration: enhance transaction aggregation and recurring support without destructive changes
-- Adds type/recurrence linkage to card transactions, improves invoice compatibility columns,
-- and extends recurring transactions with status/termination fields.

-- card_transactions: tipo da transação e vínculo com recorrência
ALTER TABLE public.card_transactions
    ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'SINGLE',
    ADD COLUMN IF NOT EXISTS recurring_transaction_id UUID REFERENCES public.recurring_transactions(id) ON DELETE SET NULL;

-- card_transaction_installments: nenhum dado existente é removido; mantido para compatibilidade

-- invoices: criar colunas compatíveis com o código e popular a partir das existentes
ALTER TABLE public.invoices
    ADD COLUMN IF NOT EXISTS card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS due_date TEXT,
    ADD COLUMN IF NOT EXISTS payment_date TEXT,
    ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;

-- Backfill colunas recém criadas com dados legados, mantendo os valores existentes
UPDATE public.invoices
SET
    card_id = COALESCE(card_id, cardid),
    due_date = COALESCE(due_date, duedate),
    payment_date = COALESCE(payment_date, paymentdate),
    total_amount = COALESCE(total_amount, totalamount, 0),
    paid_amount = COALESCE(paid_amount, paidamount, 0)
WHERE true;

-- recurring_transactions: campos de status e término da recorrência
ALTER TABLE public.recurring_transactions
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
    ADD COLUMN IF NOT EXISTS termination_type TEXT DEFAULT 'never' CHECK (termination_type IN ('never','on_date','after_occurrences')),
    ADD COLUMN IF NOT EXISTS termination_date TEXT,
    ADD COLUMN IF NOT EXISTS max_occurrences INTEGER,
    ADD COLUMN IF NOT EXISTS occurrences_generated INTEGER DEFAULT 0;

-- Garantir permissões
GRANT ALL ON TABLE public.invoices TO anon;
GRANT ALL ON TABLE public.invoices TO authenticated;
GRANT ALL ON TABLE public.invoices TO service_role;
