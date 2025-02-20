# AI Emoji Generator

A modern web application that generates custom emojis using AI technology. Built with React, Vite, and powered by OpenAI's DALL-E 3.

## Features

- 🎨 AI-powered emoji generation
- 💳 Subscription-based access with Stripe integration
- 🔐 Secure authentication with Supabase
- 🌙 Dark/Light theme support
- 📱 Responsive design
- 🖼️ Personal emoji gallery
- ⚡ Fast and modern tech stack

## Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Styling**: TailwindCSS, Shadcn/ui
- **Backend**: Supabase, Edge Functions
- **AI**: OpenAI DALL-E 3
- **Payments**: Stripe
- **Authentication**: Supabase Auth

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/EmilyThaHuman/ReedAiEmojii.git
   cd ReedAiEmojii
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your API keys and configuration

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Required environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_PRO_PRICE_ID=your_stripe_price_id
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
