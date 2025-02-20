import React, { useState, useEffect } from 'react';
import { Layout } from '@/layouts/Layout';
import { ApiKeyConfig } from '@/components/ApiKeyConfig';
import { EmojiGenerator } from '@/components/EmojiGenerator';
import { initializeAI } from '@/lib/ai-service';

export default function Home() {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const apiKey = localStorage.getItem('openai_api_key');
    if (apiKey) {
      initializeAI(apiKey);
      setIsConfigured(true);
    }
  }, []);

  const handleConfigured = () => {
    setIsConfigured(true);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {!isConfigured ? (
          <ApiKeyConfig onConfigured={handleConfigured} />
        ) : (
          <EmojiGenerator />
        )}
      </div>
    </Layout>
  );
} 