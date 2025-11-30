-- Create recurring transactions table
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
    day_of_period INTEGER NOT NULL, -- Day of month (1-31) or day of week (0-6)
    active BOOLEAN DEFAULT true NOT NULL,
    last_generated_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user ON public.recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_active ON public.recurring_transactions(active);

-- Grant permissions
GRANT ALL ON TABLE public.recurring_transactions TO anon;
GRANT ALL ON TABLE public.recurring_transactions TO authenticated;
GRANT ALL ON TABLE public.recurring_transactions TO service_role;

COMMENT ON TABLE public.recurring_transactions IS 'Configuration for recurring transactions';
