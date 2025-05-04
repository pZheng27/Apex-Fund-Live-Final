// src/lib/coinService.ts
// This file contains functions for interacting with the coin database

import { supabase } from './supabase/client';

// Example coin interface - you would typically import this from a types file
export interface Coin {
  id: string;
  name: string;
  image_url: string;
  acquisition_date: string;
  purchase_price: number;
  current_value: number;
  roi: number;
  description?: string;
  grade?: string;
  mint?: string;
  year?: number;
  is_sold: boolean;
  sold_price?: number;
  sold_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Database Integration Notes:
 * 
 * Using localStorage for persistence. This ensures data persistence
 * between refreshes and deployments on Vercel.
 */

// Initialize mock database from localStorage
const initializeDatabase = (): Coin[] => {
  if (typeof window !== 'undefined') {
    try {
      const storedCoins = localStorage.getItem('apex_coins');
      if (storedCoins) {
        return JSON.parse(storedCoins);
      }
    } catch (error) {
      console.error('Failed to parse stored coins:', error);
      return [];
    }
  }
  return [];
};

// Helper function to ensure image URLs are properly handled
const processImageUrls = (coins: Coin[]): Coin[] => {
  return coins.map(coin => {
    // If the image is a base64 string and too long, generate a fallback
    if (coin.image_url && (coin.image_url.startsWith('data:image') && coin.image_url.length > 500000)) {
      return {
        ...coin,
        image_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${coin.id || coin.name}`
      };
    }
    return coin;
  });
};

// Save database to localStorage
const saveToLocalStorage = (coins: Coin[]) => {
  if (typeof window !== 'undefined') {
    try {
      // Process the images before saving to avoid localStorage issues
      const processedCoins = processImageUrls(coins);
      const serializedData = JSON.stringify(processedCoins);
      
      localStorage.setItem('apex_coins', serializedData);
      
      // Verify the save was successful by reading it back
      const savedData = localStorage.getItem('apex_coins');
      if (!savedData || savedData.length < 10) {
        console.error('Failed to save coins to localStorage - likely exceeded size limit');
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// Mock database for development
let mockDatabase: Coin[] = initializeDatabase();

// Get all coins
export const getAllCoins = async (): Promise<Coin[]> => {
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching coins:', error);
    throw error;
  }

  return data || [];
};

// Add a new coin
export const addCoin = async (coin: Omit<Coin, 'id' | 'created_at' | 'updated_at'>): Promise<Coin> => {
  console.log("addCoin called with data:", coin);
  const { data, error } = await supabase
    .from('coins')
    .insert([coin])
    .select()
    .single();

  if (error) {
    console.error('Error adding coin:', error);
    throw error;
  }

  console.log("addCoin successful, returned data:", data);
  return data;
};

// Update a coin
export const updateCoin = async (coin: Coin): Promise<Coin> => {
  const { data, error } = await supabase
    .from('coins')
    .update(coin)
    .eq('id', coin.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating coin:', error);
    throw error;
  }

  return data;
};

// Delete a coin
export const deleteCoin = async (coinId: string): Promise<void> => {
  const { error } = await supabase
    .from('coins')
    .delete()
    .eq('id', coinId);

  if (error) {
    console.error('Error deleting coin:', error);
    throw error;
  }
};

// Subscribe to real-time updates
export const subscribeToCoinsUpdates = (onUpdate: (coins: Coin[]) => void) => {
  // Initial data fetch
  getAllCoins().then(onUpdate);

  // Set up real-time subscription
  const subscription = supabase
    .channel('coins_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'coins' 
    }, async (payload) => {
      console.log("Received real-time change:", payload);
      // Fetch fresh data after any change
      const updatedCoins = await getAllCoins();
      console.log("Fetched updated coins:", updatedCoins);
      onUpdate(updatedCoins);
    })
    .subscribe();

  return {
    id: subscription,
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    }
  };
};

// Unsubscribe from real-time updates
export const unsubscribeFromCoinsUpdates = (subscription: any) => {
  if (subscription && typeof subscription.unsubscribe === 'function') {
    subscription.unsubscribe();
  }
}; 