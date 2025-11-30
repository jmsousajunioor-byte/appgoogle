-- Migration: Create transaction aggregation structure
-- This migration creates the parent transaction table and installments table
-- to support showing installment purchases as single aggregated items in the UI
-- while maintaining granular installment data in the database.

-- Create parent transaction table
-- This stores the high-level information about a purchase (total amount, installment count, etc.)
CREATE TABLE IF NOT EXISTS public.card_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    installment_count INTEGER NOT NULL DEFAULT 1,
    purchase_date TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create installments table
-- This stores individual installment information (which invoice, amount, due date, etc.)
CREATE TABLE IF NOT EXISTS public.card_transaction_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.card_transactions(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount NUMERIC NOT NULL,
    due_date TEXT NOT NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT valid_installment_number CHECK (installment_number > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_transactions_user ON public.card_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_card ON public.card_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_date ON public.card_transactions(purchase_date);
CREATE INDEX IF NOT EXISTS idx_installments_transaction ON public.card_transaction_installments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_installments_invoice ON public.card_transaction_installments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON public.card_transaction_installments(status);

-- Grant permissions
GRANT ALL ON TABLE public.card_transactions TO anon;
GRANT ALL ON TABLE public.card_transactions TO authenticated;
GRANT ALL ON TABLE public.card_transactions TO service_role;

GRANT ALL ON TABLE public.card_transaction_installments TO anon;
GRANT ALL ON TABLE public.card_transaction_installments TO authenticated;
GRANT ALL ON TABLE public.card_transaction_installments TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.card_transactions IS 'Parent transactions representing the full purchase amount and installment count';
COMMENT ON TABLE public.card_transaction_installments IS 'Individual installments linked to parent transactions and invoices';
COMMENT ON COLUMN public.card_transactions.total_amount IS 'Total purchase amount (sum of all installments)';
COMMENT ON COLUMN public.card_transactions.installment_count IS 'Number of installments (1 for single payment)';
COMMENT ON COLUMN public.card_transaction_installments.installment_number IS 'Installment number (1, 2, 3, ..., N)';
COMMENT ON COLUMN public.card_transaction_installments.status IS 'Status: pending, paid, or cancelled';
