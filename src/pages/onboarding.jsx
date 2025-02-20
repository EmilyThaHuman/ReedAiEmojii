import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GalleryVerticalEnd, ArrowRight, Check, Sparkles, Loader2 } from 'lucide-react';
import useAuthStore from '@/lib/store/auth-store';
import { ApiKeyConfig } from '@/components/ApiKeyConfig';
import { createCheckoutSession } from '@/lib/stripe-service';
import { saveSubscription } from '@/lib/supabase';
import { STRIPE_PRICES } from '@/lib/stripe-service';

const PLANS = {
  FREE: {
    name: 'Free',
    description: 'Perfect for trying out',
    credits: 10,
    price: 'Free forever',
    features: [
      '10 emoji generations per month',
      'Basic customization',
      'Standard quality images',
    ]
  },
  PRO: {
    name: 'Pro',
    description: 'For regular users',
    credits: 100,
    price: '$0.99/month',
    priceId: STRIPE_PRICES.PRO_MONTHLY,
    features: [
      '100 emoji generations per month',
      'Advanced customization',
      'High quality images',
      'Priority support',
    ]
  },
  ENTERPRISE: {
    name: 'Enterprise',
    description: 'For teams and businesses',
    credits: 'Unlimited',
    price: 'Contact us',
    features: [
      'Unlimited emoji generations',
      'Custom branding',
      'Dedicated support',
      'API access',
    ]
  }
};

const STEPS = [
  {
    title: 'Welcome to AI Emoji Generator',
    description: 'Let\'s get you set up with your account in just a few quick steps.',
  },
  {
    title: 'Choose Your Plan',
    description: 'Select the plan that best fits your needs.',
  },
  {
    title: 'Configure OpenAI API',
    description: 'Set up your OpenAI API key to start generating emojis.',
  },
  {
    title: 'Customize Your Experience',
    description: 'Tell us how you plan to use AI Emoji Generator.',
    options: [
      'Personal Use',
      'Business/Brand',
      'Community/Discord Server',
      'Other',
    ],
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedUseCase, setSelectedUseCase] = useState(null);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setOnboardingComplete = useAuthStore((state) => state.setOnboardingComplete);
  const setSubscription = useAuthStore((state) => state.setSubscription);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      // If on plan selection step and selected paid plan, handle payment
      if (currentStep === 1 && selectedPlan?.priceId) {
        try {
          setIsProcessing(true);
          setError(null);
          
          if (!user) {
            throw new Error('User not found');
          }

          console.log('Creating checkout session with:', {
            priceId: selectedPlan.priceId,
            userId: user.id,
            selectedPlan
          });

          await createCheckoutSession(selectedPlan.priceId, user.id);
          // Don't increment step here as user will be redirected to Stripe
          return;
        } catch (err) {
          console.error('Payment error:', err);
          const errorMessage = err.message || 'Failed to process payment. Please try again.';
          setError(errorMessage.includes('StripeError') 
            ? 'There was an issue with the payment setup. Please try again or contact support.' 
            : errorMessage);
          setIsProcessing(false);
          return;
        }
      }
      
      setCurrentStep(currentStep + 1);
    
      // Complete onboarding
      setOnboardingComplete(true);
      
      // Set initial subscription for free plan
      if (selectedPlan?.name === 'Free') {
        try {
          setIsProcessing(true);
          
          const subscriptionData = {
            plan: 'Free',
            creditsUsed: 0,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: 'active'
          };

          // Save to Supabase
          await saveSubscription(user.id, subscriptionData);
          
          // Update local state
          setSubscription(subscriptionData);
          
          navigate('/generate');
        } catch (err) {
          console.error('Error saving free subscription:', err);
          setError('Failed to set up your free subscription. Please try again.');
          setIsProcessing(false);
          return;
        } finally {
          setIsProcessing(false);
        }
      }
    }
  };

  const handleApiKeyConfigured = () => {
    setIsApiKeyConfigured(true);
  };

  const renderPlanCard = (plan) => (
    <div
      key={plan.name}
      className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
        selectedPlan?.name === plan.name
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={() => setSelectedPlan(plan)}
      role="button"
      tabIndex={0}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <p className="text-muted-foreground">{plan.description}</p>
        </div>
        {selectedPlan?.name === plan.name && (
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <span className="text-2xl font-bold">{plan.price}</span>
        {plan.name !== 'Enterprise' && (
          <span className="text-muted-foreground ml-1">/ month</span>
        )}
      </div>
      
      <div className="space-y-2">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepContent = () => {
    const step = STEPS[currentStep];

    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <GalleryVerticalEnd className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
            <p className="text-muted-foreground mb-8">{step.description}</p>
          </div>
        );
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
            <p className="text-muted-foreground mb-8">{step.description}</p>
            <div className="grid gap-6 md:grid-cols-3">
              {Object.values(PLANS).map(renderPlanCard)}
            </div>
            {error && (
              <p className="mt-4 text-sm text-destructive">{error}</p>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
            <p className="text-muted-foreground mb-8">{step.description}</p>
            <ApiKeyConfig onConfigured={handleApiKeyConfigured} />
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
            <p className="text-muted-foreground mb-8">{step.description}</p>
            <div className="grid grid-cols-2 gap-4">
              {step.options.map((option) => (
                <button
                  key={option}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedUseCase === option
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedUseCase(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="bg-card rounded-xl shadow-lg p-8 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-end">
            <Button
              onClick={handleNext}
              className="gap-2"
              disabled={
                isProcessing ||
                (currentStep === 1 && !selectedPlan) ||
                (currentStep === 2 && !isApiKeyConfigured) ||
                (currentStep === 3 && !selectedUseCase)
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : currentStep === STEPS.length - 1 ? (
                'Complete'
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 