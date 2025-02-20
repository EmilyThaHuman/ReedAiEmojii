import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GalleryVerticalEnd, Sparkles, Zap, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md dark:bg-gray-900/80 z-50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">AI Emoji Generator</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Generate Custom Emojis with AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Create unique, expressive emojis tailored to your needs using
            advanced AI technology. Perfect for brands, communities, and
            personal use.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Try it Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose AI Emoji Generator?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI-Powered Creation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced AI technology that understands your descriptions and
                generates perfect emojis.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate custom emojis in seconds, not hours. Perfect for when
                you need emoji quickly.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is safe with us. We use industry-standard encryption
                to protect your information.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Create Amazing Emojis?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of users who are already creating unique emojis
              with AI.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Now
                <Sparkles className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GalleryVerticalEnd className="h-5 w-5" />
            <span className="font-medium">AI Emoji Generator</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} AI Emoji Generator. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
