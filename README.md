# 🌐 getmyna.me

<div align="center">

**Discover creative domain hacks that spell phrases using top-level domains**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.56-green?style=for-the-badge&logo=supabase)](https://supabase.com/)

[Live Demo](https://getmyna.me) • [Features](#-features) • [Quick Start](#-quick-start) • [Contributing](#-contributing)

</div>

---

## 🎯 What is getmyna.me?

**getmyna.me** is an intelligent domain discovery tool that helps you find creative "domain hacks" — clever domain names that spell out phrases using top-level domains (TLDs).

**Examples:**

- `instangram` → `instagr.am` (using .am from Armenia)
- `delicious` → `del.icio.us` (using .us from United States)
- `bitly` → `bit.ly` (using .ly from Libya)
- `google` → `goo.gl` (using .gl from Greenland)
- `youtube` → `youtu.be` (using .be from Belgium)
- `flickr` → `flic.kr` (using .kr from South Korea)
- `reddit` → `redd.it` (using .it from Italy)

Whether you're looking for a memorable personal brand, a catchy business domain, or just want to explore creative naming possibilities, getmyna.me generates thousands of domain suggestions, checks their availability, and provides detailed pricing and WHOIS information.

## ✨ Features

### 📊 **Comprehensive Domain Intelligence**

- **Extensive TLD Database**: Uses 1000+ top-level domains for maximum creativity, kept up to date regularly using [IANA TLD data](https://data.iana.org/TLD/tlds-alpha-by-domain.txt) as the authoritative source
- **Availability Checking**: Real-time domain availability verification
- **WHOIS Data**: Complete domain registration information
- **Pricing Information**: Current market prices from multiple registrars
- **TLD Descriptions**: Learn about each top-level domain's purpose and history

## 🚀 Quick Start

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/luciotudisco/getmyna.me.git
    cd getmyna.me
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**

    ```bash
    cp .env.example .env.local
    ```

    Edit `.env.local` with your API keys (see [Environment Variables](#-environment-variables))

4. **Start the development server**

    ```bash
    npm run dev
    ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Domain Registrar APIs
DYNADOT_API_KEY=your_dynadot_api_key
GANDI_API_KEY=your_gandi_api_key
NAMESILO_API_KEY=your_namesilo_api_key
NAMECOMAPI_KEY=your_namecom_api_key

# Analytics
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_key

# Database
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI & External APIs
OPENAI_API_KEY=your_openai_api_key
RAPID_API_KEY=your_rapid_api_key

# Search (Algolia)
ALGOLIA_API_KEY=your_algolia_api_key

# Search (Algolia - Client-side)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_algolia_search_only_api_key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=dictionary
```

### Getting API Keys

- **Dynadot**: [API Documentation](https://www.dynadot.com/community/help/api)
- **Gandi**: [API Documentation](https://api.gandi.net/docs/)
- **NameSilo**: [API Documentation](https://www.namesilo.com/api-documentation)
- **Name.com**: [API Documentation](https://www.name.com/api-docs)
- **Supabase**: [Project Settings](https://app.supabase.com/project/_/settings/api)
- **OpenAI**: [API Keys](https://platform.openai.com/api-keys)
- **RapidAPI**: [API Hub](https://rapidapi.com/)
- **Algolia**: [Dashboard](https://www.algolia.com/dashboard) - Get your App ID and API Key

## 🛠 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run lint:strict  # Run ESLint with zero warnings
npm run type-check   # Run TypeScript type checking
npm run code-quality # Run both linting and type checking

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode

# Data Management
npm run populate-dictionary <csv-file>  # Populate dictionary from CSV and index in Algolia
```

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/             # API routes
│   ├── search/          # Search page
│   └── about/           # About page
├── components/          # React components
│   ├── ui/              # Reusable UI components
│   └── ...              # Feature components
├── models/              # TypeScript type definitions
├── services/            # Business logic and API calls
└── utils/               # Utility functions
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 🤝 Contributing

We welcome contributions!

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
    ```bash
    git checkout -b feature/amazing-feature
    ```
3. **Make your changes**
4. **Run tests and linting**
    ```bash
    npm run code-quality
    npm test
    ```
5. **Commit your changes**
    ```bash
    git commit -m "Add amazing feature"
    ```
6. **Push to your branch**
    ```bash
    git push origin feature/amazing-feature
    ```
7. **Open a Pull Request**

## 📄 License

This project is licensed under the GPL 3.0 License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

[⭐ Star this repo](https://github.com/luciotudisco/getmyna.me) • [🐛 Report Bug](https://github.com/luciotudisco/getmyna.me/issues) • [💡 Request Feature](https://github.com/luciotudisco/getmyna.me/issues)

</div>
