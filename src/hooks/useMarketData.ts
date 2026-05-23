import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { logger } from '@/lib/logger';

type MarketData = {
  symbol: string;
  interval: string;
  data: any;
};

type TickerData = {
  symbol: string;
  data: any;
};

type ExchangeInfoData = {
  symbol: string;
  data: any;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    logger.error('Market data fetch error:', error);
    throw error;
  }
  return response.json();
};

// Hook para datos de mercado
export function useMarketData(symbol: string, interval: string) {
  const { data, error, isLoading, mutate } = useSWR<MarketData>(
    symbol && interval ? `/api/binance/klines?symbol=${symbol}&interval=${interval}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 5000, // 5 seconds
      onError: (err) => {
        logger.error('Market data error:', err);
      }
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    isValidating: !error && !data
  };
}

// Hook para datos de ticker
export function useTickerData(symbol?: string) {
  const { data, error, isLoading, mutate } = useSWR<TickerData>(
    symbol ? `/api/binance/ticker/24hr?symbol=${symbol}` : '/api/binance/ticker/24hr',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 3000, // 3 seconds
      onError: (err) => {
        logger.error('Ticker data error:', err);
      }
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    isValidating: !error && !data
  };
}

// Hook para datos de exchange info
export function useExchangeInfo(symbol?: string) {
  const { data, error, isLoading } = useSWR<ExchangeInfoData>(
    symbol ? `/api/binance/exchangeInfo?symbol=${symbol}` : '/api/binance/exchangeInfo',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 3600000, // 1 hour
      onError: (err) => {
        logger.error('Exchange info error:', err);
      }
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating: !error && !data
  };
}