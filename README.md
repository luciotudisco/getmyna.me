# getmyna.me

getmyna.me is a Next.js app that helps you discover creative "domain hacks" — domain names that spell a phrase using top level domains (for example: **getmyna.me** → "get my name"). Enter a word or phrase and the app generates candidate domains, checks whether they are available and shows WHOIS and DNS information.

## Features

- Generates domain hack suggestions from any input phrase using an extensive list of TLDs.
- Checks availability and WHOIS data through RapidAPI providers.
- Displays DNS records and TLD descriptions for deeper exploration.
- Built with Next.js 15, TypeScript and Tailwind CSS.

## Local development

### Prerequisites

- Node.js 20+
- npm (or yarn, pnpm, bun)
- A [RapidAPI](https://rapidapi.com/) key with access to the Domainr and WHOIS APIs.

### Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file at the project root and add your RapidAPI key:

```
RAPID_API_KEY=your_key_here
```

3. Start the development server:

```bash
npm run dev
```

Open <http://localhost:3000> and try searching for a term.

4. Run code quality checks:

```bash
npm run lint
npm test
```

## Production build

To create an optimized build and run it locally:

```bash
npm run build
npm start
```

## Deployment

The project can be deployed to [Vercel](https://vercel.com/) or any Node.js hosting provider.

### Deploying on Vercel

1. Push the repository to your Git provider.
2. Import the project into Vercel and set the `RAPID_API_KEY` environment variable in your project settings.
3. Vercel automatically builds and deploys the app.

### Self-hosted Node.js

1. Ensure `RAPID_API_KEY` is defined in the environment.
2. Run `npm run build` followed by `npm start` on your server.
3. Serve the application behind your preferred reverse proxy.

---
