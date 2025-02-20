import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Trash } from 'lucide-react';
import useAuthStore from '@/lib/store/auth-store';
import { generateEmoji } from '@/lib/ai-service';
import { ApiKeyDialog } from '@/components/api-key-dialog';
import { saveEmoji } from '@/lib/supabase';

export default function EmojiGenerator() {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedEmojis, setGeneratedEmojis] = useState([]);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const useCredit = useAuthStore((state) => state.useCredit);
  const MAX_CHARS = 200;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const handleGenerate = async () => {
    if (!user) {
      setError('Please log in to generate emojis');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    // Check for API key before proceeding
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await generateEmoji(description);
      if (response.success) {
        // Save to Supabase first
        try {
          const savedEmoji = await saveEmoji(user.id, description, response.imageUrl);
          
          if (savedEmoji) {
            setGeneratedEmojis(prev => [{
              id: savedEmoji.id,
              emoji: savedEmoji.image_url,
              description: savedEmoji.description
            }, ...prev]);
            setDescription('');
            useCredit();
          }
        } catch (err) {
          console.error('Error saving emoji to Supabase:', err);
          setError('Failed to save emoji. Please try again.');
        }
      } else {
        throw new Error(response.error || 'Failed to generate emoji');
      }
    } catch (err) {
      setError('Failed to generate emoji. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (emoji) => {
    try {
      const response = await fetch(emoji.emoji);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emoji-${emoji.description.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download emoji');
    }
  };

  const handleDelete = (id) => {
    setGeneratedEmojis(prev => prev.filter(item => item.id !== id));
  };

  const handleApiKeyConfigured = () => {
    // Automatically trigger generation after API key is configured
    handleGenerate();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Generate Your Emoji</h1>
        
        <div className="bg-card rounded-xl shadow-lg p-6 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Describe your emoji
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setDescription(e.target.value);
                    setError(null);
                  }
                }}
                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                rows="4"
                placeholder="Enter a description of the emoji you want to generate..."
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                {description.length}/{MAX_CHARS}
              </div>
            </div>
            {error && <p className="mt-2 text-destructive text-sm">{error}</p>}
          </div>
        
          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={isLoading || !description.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Emoji'
            )}
          </Button>
        </div>

        {generatedEmojis.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Generated Emojis</h2>
            {generatedEmojis.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative aspect-square w-16 h-16 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={item.emoji} 
                      alt={item.description}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(item)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ApiKeyDialog
          open={showApiKeyDialog}
          onOpenChange={setShowApiKeyDialog}
          onConfigured={handleApiKeyConfigured}
        />
      </div>
    </main>
  );
} 