# ✈️ Momentto

A beautiful and interactive travel countdown application built with Next.js. Count down the days, hours, minutes, and seconds until your next adventure!

## 🌟 Features

- **Interactive Countdown Timer**: Real-time countdown display with animated numbers showing years, months, days, hours, minutes, and seconds until your trip
- **Date Selection**: Easy-to-use date picker to select your travel date
- **Multi-language Support**: Switch between Portuguese (Português) and English
- **Theme Customization**: Multiple color themes to personalize your experience
- **Dark/Light Mode**: Automatic theme detection with manual override option
- **Celebration Effects**: Confetti animation when the countdown reaches zero
- **Responsive Design**: Fully responsive interface that works on all devices
- **Smooth Animations**: Elegant motion animations powered by Framer Motion

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Number Animations**: @number-flow/react
- **Icons**: Lucide React
- **Date Handling**: date-fns & react-day-picker
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner

## 📦 Installation

### Prerequisites

- Node.js 18+ installed on your machine
- npm, pnpm, or yarn package manager

### Setup

1. Clone the repository:
```bash
git clone https://github.com/carrijoga/momentto.git
cd momentto
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🎯 Usage

1. **Select Your Travel Date**: Click on the date picker to choose when your trip begins
2. **Watch the Countdown**: The countdown timer automatically updates every second
3. **Change Language**: Click the globe icon to switch between Portuguese and English
4. **Customize Theme**: Click the palette icon to choose your preferred color theme
5. **Celebrate**: When the countdown reaches zero, enjoy the confetti celebration! 🎉

## 🎨 Customization

### Adding New Themes

Themes can be customized by modifying the theme selector component. The application uses CSS variables for theming, making it easy to add new color schemes.

### Changing Languages

The application supports Portuguese and English out of the box. To add more languages, extend the language context in `lib/language-context.tsx`.

## 🔑 Environment Variables

Copy `.env.local.example` (or create `.env.local`) and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server only) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ✅ | VAPID public key for Web Push |
| `VAPID_PRIVATE_KEY` | ✅ | VAPID private key for Web Push (server only) |
| `KV_REST_API_URL` | ✅ | Upstash Redis REST URL |
| `KV_REST_API_TOKEN` | ✅ | Upstash Redis REST token (server only) |
| `NEXT_PUBLIC_GTM_ID` | ⬜ | Google Tag Manager container ID (e.g. `GTM-XXXXXXX`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ⬜ | Google Analytics 4 Measurement ID (e.g. `G-XXXXXXXXXX`) |

> **GA4 setup**: setting `NEXT_PUBLIC_GA_MEASUREMENT_ID` is all that's needed — page views and custom events are tracked automatically.

---

## 👨‍💻 Author

Developed with ❤️ by [carrijoga](https://github.com/carrijoga)
**Ready to count down to your next adventure? Start planning your trip today!** ✈️🌍
