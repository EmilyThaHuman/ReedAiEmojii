import React, { useState } from 'react';
import { validateApiKey, initializeAI } from '@/lib/ai-service';
import { updateUserApiKey } from '@/lib/supabase';
import useAuthStore from '@/lib/store/auth-store';
import { Button } from './ui/button';

export function ApiKeyConfig({ onConfigured }) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const user = useAuthStore((state) => state.user);
  const setApiKeyStore = useAuthStore((state) => state.setApiKey);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsValidating(true);
    setError('');

    try {
      const isValid = await validateApiKey(apiKey);
      if (isValid) {
        // Initialize AI service
        initializeAI(apiKey);
        
        // Save to Zustand store
        setApiKeyStore(apiKey);
        
        // If user is authenticated, save to Supabase
        if (user) {
          await updateUserApiKey(user.id, apiKey);
        }
        
        onConfigured();
      } else {
        setError('Invalid API key. Please check and try again.');
      }
    } catch (err) {
      setError('Error validating API key. Please try again.');
      console.error('API key validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="apiKey"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            OpenAI API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="sk-..."
            required
            disabled={isValidating}
          />
        </div>
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={isValidating || !apiKey.trim()}
        >
          {isValidating ? 'Validating...' : 'Save API Key'}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Your API key is stored locally and never sent to our servers.
        Get your API key from the{' '}
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          OpenAI dashboard
        </a>
        .
      </p>
    </div>
  );
} 