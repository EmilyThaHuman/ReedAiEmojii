import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ApiKeyConfig } from './ApiKeyConfig';

export function ApiKeyDialog({ open, onOpenChange, onConfigured }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure OpenAI API Key</DialogTitle>
          <DialogDescription>
            An OpenAI API key is required to generate emojis. Your key is stored locally and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ApiKeyConfig 
            onConfigured={() => {
              onConfigured();
              onOpenChange(false);
            }} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 