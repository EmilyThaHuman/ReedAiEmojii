import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ApiKeyConfig } from '@/components/ApiKeyConfig';
import useAuthStore from '@/lib/store/auth-store';
import { createPortalSession } from '@/lib/stripe-service';
import { Loader2, CreditCard, Key, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const user = useAuthStore((state) => state.user);
  const subscription = useAuthStore((state) => state.subscription);
  const loadSubscription = useAuthStore((state) => state.loadSubscription);
  const getAvailableCredits = useAuthStore((state) => state.getAvailableCredits);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!subscription?.stripeCustomerId) {
        throw new Error('No subscription found');
      }
      
      await createPortalSession(subscription.stripeCustomerId);
    } catch (err) {
      console.error('Error managing subscription:', err);
      setError('Failed to open subscription management. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Subscription Section */}
        <div className="bg-card rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Subscription</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Current Plan</p>
                <p className="font-medium">
                  {subscription?.plan || 'Free'}
                  {subscription?.status !== 'active' && (
                    <span className="text-destructive ml-2">(Inactive)</span>
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Credits Available</p>
                <p className="font-medium">{getAvailableCredits()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Renewal Date</p>
                <p className="font-medium">
                  {formatDate(subscription?.currentPeriodEnd)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Credits Used</p>
                <p className="font-medium">{subscription?.creditsUsed || 0}</p>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleManageSubscription}
              disabled={isLoading || !subscription?.stripeCustomerId}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Manage Subscription'
              )}
            </Button>

            {!subscription?.stripeCustomerId && (
              <p className="text-sm text-muted-foreground text-center">
                You're currently on the free plan.{' '}
                <a href="/onboarding" className="text-primary hover:underline">
                  Upgrade to Pro
                </a>
              </p>
            )}
          </div>
        </div>

        {/* API Key Section */}
        <div className="bg-card rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-5 w-5" />
            <h2 className="text-xl font-semibold">API Configuration</h2>
          </div>
          <ApiKeyConfig />
        </div>

        {/* Usage Tips */}
        <div className="bg-card rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Usage Tips</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Be specific in your emoji descriptions for better results</li>
            <li>• Use clear, simple language for the best emoji generation</li>
            <li>• Download your emojis to use them in other applications</li>
            <li>• Check your credit usage regularly to avoid running out</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 