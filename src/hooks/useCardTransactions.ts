/**
 * Custom hook for managing aggregated card transactions
 * This hook provides methods to fetch and manage transaction summaries and details
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  TransactionSummary,
  TransactionDetails,
  NewCardTransaction,
  Card,
} from '../../types';
import {
  getTransactionSummaries,
  getTransactionDetails,
  createCardTransaction,
} from '../services/cardTransactionsService';

export interface UseCardTransactions {
  summaries: TransactionSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getDetails: (transactionId: string) => Promise<TransactionDetails | null>;
  createTransaction: (
    cardId: string,
    transaction: NewCardTransaction,
    card: Card
  ) => Promise<boolean>;
}

export function useCardTransactions(userId: string | undefined): UseCardTransactions {
  const [summaries, setSummaries] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setSummaries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getTransactionSummaries(userId);
      setSummaries(data);
    } catch (err) {
      console.error('Error loading transaction summaries:', err);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getDetails = useCallback(async (transactionId: string): Promise<TransactionDetails | null> => {
    try {
      const details = await getTransactionDetails(transactionId);
      return details;
    } catch (err) {
      console.error('Error loading transaction details:', err);
      return null;
    }
  }, []);

  const createTransaction = useCallback(
    async (
      cardId: string,
      transaction: NewCardTransaction,
      card: Card
    ): Promise<boolean> => {
      if (!userId) return false;

      try {
        const result = await createCardTransaction(userId, cardId, transaction, card);
        if (result) {
          // Refresh the list after successful creation
          await refresh();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error creating transaction:', err);
        return false;
      }
    },
    [userId, refresh]
  );

  // Load summaries on mount and when userId changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    summaries,
    loading,
    error,
    refresh,
    getDetails,
    createTransaction,
  };
}
