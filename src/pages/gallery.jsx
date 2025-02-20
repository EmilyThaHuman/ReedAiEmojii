import { useState, useEffect } from 'react';
import { getUserEmojis, deleteEmoji } from '@/lib/supabase';
import useAuthStore from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Download, Trash, ImageIcon } from 'lucide-react';

export default function GalleryPage() {
  const [emojis, setEmojis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadEmojis();
  }, [user]);

  const loadEmojis = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await getUserEmojis(user.id);
      setEmojis(data);
    } catch (err) {
      console.error('Error loading emojis:', err);
      setError('Failed to load emojis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (emoji) => {
    try {
      const response = await fetch(emoji.image_url);
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

  const handleDelete = async (emojiId) => {
    try {
      await deleteEmoji(emojiId);
      setEmojis(emojis.filter(emoji => emoji.id !== emojiId));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete emoji');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Emoji Gallery</h1>
        
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg mb-6">
            {error}
          </div>
        )}

        {emojis.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No emojis yet</h3>
            <p className="text-muted-foreground">
              Generate some emojis to see them in your gallery
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emojis.map((emoji) => (
              <div
                key={emoji.id}
                className="bg-card rounded-lg shadow-md overflow-hidden"
              >
                <div className="aspect-square relative">
                  <img
                    src={emoji.image_url}
                    alt={emoji.description}
                    className="w-full h-full object-contain bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {emoji.description}
                  </p>
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(emoji)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(emoji.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 