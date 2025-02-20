import { useState } from 'react';
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { SignUpForm } from '@/components/signup-form';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            AI Emoji Generator
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {isLogin ? (
              <LoginForm onToggleForm={toggleForm} />
            ) : (
              <SignUpForm onToggleForm={toggleForm} />
            )}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2070&auto=format&fit=crop"
          alt="Colorful abstract gradient"
          className="absolute inset-0 h-full w-full object-cover opacity-90 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />
        <div className="absolute bottom-8 left-8 max-w-md text-white">
          <h2 className="mb-2 text-2xl font-bold">AI Emoji Generator</h2>
          <p className="text-muted-foreground">Create unique and personalized emojis using the power of artificial intelligence</p>
        </div>
      </div>
    </div>
  );
} 