# Experience Generator

A modern React application built with LaunchDarkly feature flags, Tailwind CSS, and shadcn/ui components - fully compatible with v0.dev.

## Features

### 🧪 **Experiment Generation**

- **Custom Feature Experiments**: Generate realistic A/B test data for LaunchDarkly feature flags
- **Multiple Metrics**: Configure multiple metrics with individual true/false values per metric
- **Probability Control**: Set custom probability percentages for metric tracking (true/false variations)
- **Flexible Configuration**: Support for both custom metric values and randomized defaults
- **Real-time Progress**: Live progress tracking with current run count and experiment status

### ⚙️ **Configuration Options**

- **LaunchDarkly Integration**: Input your client-side ID directly in the UI
- **Dynamic Metrics**: Add/remove metric rows with individual value configuration
- **Experiment Types**: Support for Bayesian and Frequentist experiment simulations
- **Persistent Settings**: All configurations saved to localStorage for convenience
- **User Context Tracking**: Display current and updated LaunchDarkly user context

### 🎯 **Internal Tool Features**

- **Staging Environment Only**: Designed for internal use in staging environments
- **Feature Experimentation Focus**: Currently supports feature experiments (not funnel experiments)
- **Context Visualization**: Real-time display of LaunchDarkly user context changes
- **Flag Management**: View all active LaunchDarkly flags in your environment

### 🛠️ **Technical Stack**

- ⚛️ React 18 with modern hooks and TypeScript
- 🚩 LaunchDarkly SDK for feature flags and experiment data generation
- 🎨 Tailwind CSS for responsive styling
- 🧩 shadcn/ui components (v0.dev compatible)
- 📱 Fully responsive design with semantic HTML
- ♿ Accessibility-focused with proper ARIA support

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up LaunchDarkly:
   - Copy `env.example` to `.env`
   - Replace the placeholder with your LaunchDarkly client-side ID
3. Start the development server:

```bash
npm start
```

The app will open in your browser at `http://localhost:3000`.

## LaunchDarkly Configuration

To use LaunchDarkly feature flags:

1. Sign up for a LaunchDarkly account at [launchdarkly.com](https://launchdarkly.com)
2. Get your client-side ID from your LaunchDarkly dashboard
3. Create a `.env` file and add your client-side ID:
   ```
   REACT_APP_LD_CLIENT_ID=your-actual-client-side-id
   ```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## shadcn/ui & v0.dev Integration

This project is fully configured for shadcn/ui and v0.dev:

- ✅ All required dependencies installed
- ✅ Tailwind CSS configured with shadcn/ui theme
- ✅ TypeScript support enabled
- ✅ Component aliases configured (`@/components`, `@/lib`)
- ✅ Essential components included (Button, Card, Badge)
- ✅ CSS variables and design tokens ready

### Using v0.dev

1. Go to [v0.dev](https://v0.dev)
2. Generate your component
3. Copy the generated code
4. Paste directly into your project - it will work out of the box!

### Adding More Components

To add more shadcn/ui components, you can either:

- Use v0.dev to generate them
- Manually copy from the [shadcn/ui documentation](https://ui.shadcn.com)

## Project Structure

```
exp-generator/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/ui/   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   ├── lib/
│   │   └── utils.ts     # Utility functions
│   ├── App.tsx          # Main app component with LaunchDarkly
│   ├── index.tsx        # React entry point
│   ├── index.css        # Tailwind CSS + shadcn/ui styles
│   └── reportWebVitals.ts
├── components.json      # shadcn/ui configuration
├── tsconfig.json        # TypeScript configuration
├── package.json
├── tailwind.config.js   # Tailwind + shadcn/ui configuration
└── postcss.config.js    # PostCSS configuration
```

## Customization

- Modify `src/App.tsx` to add your own components and features
- Update `tailwind.config.js` to customize your design system
- Add feature flags in your LaunchDarkly dashboard and use them in your React components
- Use v0.dev to generate new components and add them to your project

## Learn More

- [React Documentation](https://reactjs.org/)
- [LaunchDarkly React SDK](https://docs.launchdarkly.com/sdk/client-side/react)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [v0.dev - AI Component Generator](https://v0.dev)
