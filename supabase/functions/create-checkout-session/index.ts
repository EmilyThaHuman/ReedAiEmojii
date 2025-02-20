// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Hello from Functions!")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Log the start of the function
    console.log('Starting checkout session creation...');

    // Verify Stripe key is present
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    console.log('Stripe key is configured');

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (error) {
      console.error('Error parsing request body:', error);
      throw new Error('Invalid request body');
    }

    const { priceId, userId } = requestBody;

    // Validate required parameters
    if (!priceId) {
      throw new Error('Missing required parameter: priceId');
    }
    if (!userId) {
      throw new Error('Missing required parameter: userId');
    }

    // Get the origin for success/cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    console.log('Using origin:', origin);

    // Create checkout session
    console.log('Creating checkout session with:', { priceId, userId });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/generate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/onboarding`,
      client_reference_id: userId,
      metadata: {
        userId,
      },
    });

    console.log('Checkout session created successfully:', {
      sessionId: session.id,
      url: session.url,
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in create-checkout-session:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    const errorResponse = {
      error: error.message,
      type: error.type || 'UnknownError',
      code: error.statusCode || 500,
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: error.statusCode || 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-checkout-session' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
