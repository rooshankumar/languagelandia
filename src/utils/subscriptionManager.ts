import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Subscription Manager for Supabase Realtime
 * 
 * This utility manages all realtime subscriptions to ensure proper cleanup
 * and reconnection when needed.
 */

interface Subscription {
  key: string;
  channel: any;
  lastRefreshed: number;
}

class SubscriptionManager {
  private subscriptions: Map<string, Subscription> = new Map();
  private lastGlobalRefresh: number = 0;
  private refreshDebounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private globalRefreshInProgress: boolean = false;

  // Store a subscription for later cleanup
  subscribe(key: string, channel: any): void {
    console.log('[SubscriptionManager]', `Subscribing to ${key}`);

    // If there's an existing subscription with this key, unsubscribe first
    if (this.subscriptions.has(key)) {
      this.unsubscribe(key);
    }

    this.subscriptions.set(key, {
      key,
      channel,
      lastRefreshed: Date.now()
    });
  }

  // Remove a specific subscription
  unsubscribe(key: string): void {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      try {
        console.log('[SubscriptionManager]', `Unsubscribing from ${key}`);
        // Check if the subscription has the unsubscribe method
        if (typeof subscription.channel.unsubscribe === 'function') {
          subscription.channel.unsubscribe();
        }
        this.subscriptions.delete(key);
      } catch (error) {
        console.error('[SubscriptionManager]', `Error unsubscribing from ${key}:`, error);
      }
    }
  }

  // Clean up all subscriptions (typically called on logout)
  cleanup(): void {
    console.log('[SubscriptionManager]', `Cleaning up all ${this.subscriptions.size} subscriptions`);

    this.subscriptions.forEach((subscription) => {
      try {
        subscription.channel.unsubscribe();
      } catch (error) {
        console.error('[SubscriptionManager]', `Error during cleanup of ${subscription.key}:`, error);
      }
    });

    this.subscriptions.clear();
    console.log('[SubscriptionManager]', 'Finished cleaning up all subscriptions');
  }

  // Refresh a specific subscription
  refreshSubscription(key: string): void {
    if (this.refreshDebounceTimers.has(key)) {
      clearTimeout(this.refreshDebounceTimers.get(key)!);
    }

    // Debounce refreshes to avoid multiple rapid refreshes
    this.refreshDebounceTimers.set(key, setTimeout(() => {
      const subscription = this.subscriptions.get(key);
      if (subscription) {
        try {
          console.log('[SubscriptionManager]', `Refreshing subscription ${key}`);
          // Unsubscribe and resubscribe to force a fresh connection
          if (subscription.channel && typeof subscription.channel.unsubscribe === 'function') {
            subscription.channel.unsubscribe();
          }

          // We'll let the component re-subscribe on its own when it detects
          // the connection is gone, which is more reliable than trying to
          // recreate the exact same subscription here

          this.subscriptions.delete(key);
        } catch (error) {
          console.error('[SubscriptionManager]', `Error refreshing subscription ${key}:`, error);
        }
      }

      this.refreshDebounceTimers.delete(key);
    }, 300));
  }

  // Refresh all subscriptions with optimized logic
  refreshAll(): void {
    // Prevent multiple simultaneous refreshes
    if (this.globalRefreshInProgress) {
      console.log('[SubscriptionManager]', 'Global refresh already in progress, skipping');
      return;
    }

    // Only refresh if there are subscriptions
    if (this.subscriptions.size === 0) {
      console.log('[SubscriptionManager]', 'No subscriptions to refresh');
      return;
    }

    // Don't refresh too frequently (at most once per 2 minutes for better performance)
    const now = Date.now();
    if (now - this.lastGlobalRefresh < 120000) {
      console.log('[SubscriptionManager]', 'Skipping refresh, last global refresh was too recent');
      return;
    }

    this.globalRefreshInProgress = true;
    this.lastGlobalRefresh = now;

    console.log('[SubscriptionManager]', `Refreshing all ${this.subscriptions.size} subscriptions`);

    // Use a more efficient approach for large numbers of subscriptions
    if (this.subscriptions.size > 10) {
      // Just refresh the most important ones, based on priority
      // For now, let's just refresh a subset (first 5)
      const keys = Array.from(this.subscriptions.keys()).slice(0, 5);

      Promise.all(keys.map(key => {
        return new Promise(resolve => {
          this.refreshSubscription(key);
          resolve(key);
        });
      })).then(() => {
        console.log('[SubscriptionManager]', 'Finished refreshing essential subscriptions');
        this.globalRefreshInProgress = false;
      });
    } else {
      // For smaller numbers, refresh all with small delays
      const keys = Array.from(this.subscriptions.keys());

      // Refresh each subscription with a small delay to spread out the load
      const refreshNext = (index: number) => {
        if (index >= keys.length) {
          console.log('[SubscriptionManager]', 'Finished refreshing all subscriptions');
          this.globalRefreshInProgress = false;
          return;
        }

        this.refreshSubscription(keys[index]);
        setTimeout(() => refreshNext(index + 1), 200); // Increased delay to reduce load
      };

      refreshNext(0);
    }
  }

  // Check health of all subscriptions and refresh if needed
  checkConnectionHealth(): void {
    // Check if Supabase connection is healthy
    if (!supabase) {
      console.error('[SubscriptionManager]', 'Supabase client not available');
      return;
    }

    // Attempt to refresh all subscriptions if connection state changed
    this.refreshAll();
  }

  // Setup visibility change monitoring to refresh subscriptions when tab becomes active
  setupVisibilityMonitoring(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('[SubscriptionManager]', 'Page became visible, checking subscriptions');
          this.checkConnectionHealth();
        }
      });
    }
  }
}

// Create a singleton instance
const subscriptionManager = new SubscriptionManager();

// Set up monitoring on import
subscriptionManager.setupVisibilityMonitoring();

// Handle cleanup when window is closing or refreshing
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Attempt to set user offline before page unload
    try {
      const auth = supabase.auth.getSession();
      auth.then(({ data }) => {
        const userId = data?.session?.user?.id;
        if (userId) {
          // Use navigator.sendBeacon for reliable delivery during page unload
          const formData = new FormData();
          formData.append('is_online', 'false');

          navigator.sendBeacon(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, 
            formData
          );
        }
      });
    } catch (e) {
      console.error('Error during cleanup status update:', e);
    }

    subscriptionManager.cleanup();
  });
}

// Export the singleton instance
export default subscriptionManager;

// Function to check all subscriptions
export const checkAllSubscriptions = () => {
  subscriptionManager.refreshAll();
};