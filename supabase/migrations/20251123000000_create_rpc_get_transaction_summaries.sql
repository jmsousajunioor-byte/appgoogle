-- Migration: Create get_transaction_summaries RPC
-- This function is required to fetch aggregated transaction summaries efficiently

CREATE OR REPLACE FUNCTION public.get_transaction_summaries(user_id_param UUID)
RETURNS TABLE (
    id UUID,
    description TEXT,
    total_amount NUMERIC,
    installment_count INTEGER,
    purchase_date TEXT,
    category TEXT,
    card_id UUID,
    card_brand TEXT,
    card_last4 TEXT,
    type TEXT,
    recurring_transaction_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ct.id,
        ct.description,
        ct.total_amount,
        ct.installment_count,
        ct.purchase_date,
        ct.category,
        ct.card_id,
        c.brand AS card_brand,
        c.last4 AS card_last4,
        ct.type,
        ct.recurring_transaction_id
    FROM 
        public.card_transactions ct
    JOIN 
        public.cards c ON ct.card_id = c.id
    WHERE 
        ct.user_id = user_id_param
    ORDER BY 
        ct.purchase_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_transaction_summaries(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_transaction_summaries(UUID) TO service_role;
