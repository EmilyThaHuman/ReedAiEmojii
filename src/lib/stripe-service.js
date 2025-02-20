import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing Stripe publishable key. Please check your environment variables.');
}

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export async function createCheckoutSession(priceId, userId) {
  try {
    console.log('Creating checkout session with:', { priceId, userId });
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId, userId }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (!data?.sessionId) {
      console.error('Invalid response:', data);
      throw new Error('Invalid response from checkout session creation');
    }

    console.log('Checkout session created:', data);

    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }

    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    });

    if (stripeError) {
      console.error('Stripe redirect error:', stripeError);
      throw stripeError;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Try to parse the error message if it's a string
    let errorMessage = error.message;
    try {
      if (typeof error.message === 'string') {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.error || parsedError.message || error.message;
      }
    } catch (e) {
      // If parsing fails, use the original error message
    }
    
    throw new Error(errorMessage);
  }
}

export async function createPortalSession(customerId) {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { customerId }
    });

    if (error) {
      console.error('Portal session error:', error);
      throw new Error(error.message || 'Failed to create portal session');
    }

    if (!data?.url) {
      throw new Error('No portal URL returned');
    }

    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}

export const STRIPE_PRICES = {
  PRO_MONTHLY: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
  ENTERPRISE_MONTHLY: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
}; 