import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../supabase';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      subscription: null,
      apiKey: localStorage.getItem('openai_api_key') || null,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      setOnboardingComplete: (completed) => set({ hasCompletedOnboarding: completed }),
      
      setSubscription: (subscription) => set({ 
        subscription: subscription ? {
          ...subscription,
          // Convert timestamps to Date objects
          currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start) : null,
          currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end) : null,
          createdAt: subscription.created_at ? new Date(subscription.created_at) : new Date(),
          updatedAt: subscription.updated_at ? new Date(subscription.updated_at) : new Date(),
          plan: subscription.plan || 'Free',
          creditsUsed: subscription.credits_used || 0,
          status: subscription.status,
          stripeCustomerId: subscription.stripe_customer_id,
          stripeSubscriptionId: subscription.stripe_subscription_id,
        } : null
      }),
      
      loadSubscription: async () => {
        try {
          const user = get().user;
          if (!user) return;

          const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error loading subscription:', error);
            return;
          }

          // If no subscription found, set to free plan
          if (!subscription) {
            get().setSubscription({
              plan: 'Free',
              credits_used: 0,
              current_period_start: new Date(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              created_at: new Date(),
              updated_at: new Date(),
              status: 'active'
            });
            return;
          }

          get().setSubscription(subscription);
        } catch (error) {
          console.error('Error in loadSubscription:', error);
        }
      },

      setApiKey: (apiKey) => {
        localStorage.setItem('openai_api_key', apiKey);
        set({ apiKey });
      },

      getAvailableCredits: () => {
        const state = get();
        if (!state.subscription) return 0;
        
        const { plan, creditsUsed } = state.subscription;
        
        // Check if subscription is active
        if (state.subscription.status !== 'active') {
          return 0;
        }

        // Check if subscription is expired
        const now = new Date();
        if (state.subscription.currentPeriodEnd && new Date(state.subscription.currentPeriodEnd) < now) {
          return 0;
        }

        switch (plan) {
          case 'Free':
            return Math.max(0, 10 - creditsUsed);
          case 'Pro':
            return Math.max(0, 100 - creditsUsed);
          case 'Enterprise':
            return Infinity;
          default:
            return 0;
        }
      },

      canGenerateEmoji: () => {
        const state = get();
        if (!state.subscription) return false;
        
        // Check if subscription is active
        if (state.subscription.status !== 'active') {
          return false;
        }

        // Check if subscription is expired
        const now = new Date();
        if (state.subscription.currentPeriodEnd && new Date(state.subscription.currentPeriodEnd) < now) {
          return false;
        }
        
        return get().getAvailableCredits() > 0;
      },

      useCredit: async () => {
        const state = get();
        if (!state.subscription || !state.user) return;

        const newCreditsUsed = state.subscription.creditsUsed + 1;

        // Update local state
        set((state) => ({
          subscription: state.subscription ? {
            ...state.subscription,
            creditsUsed: newCreditsUsed,
            updatedAt: new Date()
          } : null
        }));

        // Update in Supabase
        try {
          const { error } = await supabase
            .from('subscriptions')
            .update({ credits_used: newCreditsUsed })
            .eq('user_id', state.user.id);

          if (error) {
            console.error('Error updating credits used:', error);
          }
        } catch (error) {
          console.error('Error in useCredit:', error);
        }
      },

      logout: () => {
        localStorage.removeItem('openai_api_key');
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          subscription: null,
          apiKey: null
        });
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore; 