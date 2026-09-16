# Design Document: SEO Sitemap, CI/CD, and TypeScript Migration

**Date:** 2026-09-16  
**Status:** Approved by User  
**Target Codebase:** [luxury](file:///c:/Users/mehar/Desktop/PROJET/luxury) (Next.js 16.1.6, React 19, Prisma 6, Supabase, Tailwind CSS, i18n routing `[lang]`)

---

## 1. Executive Summary

This project encompasses three interconnected technical upgrades to elevate the codebase to modern production standards:
1. **TypeScript Setup & Tooling Modernization**: Introduce TypeScript configuration with progressive hybrid compatibility (`allowJs: true`), modern ESLint 9 flat configuration (`eslint.config.mjs`), and shared core domain types (`src/types/`).
2. **SEO Optimization (Sitemap & Robots)**: Native Next.js 16 dynamic sitemap (`src/app/sitemap.ts`) with multilingual hreflang alternates (`ar`, `fr`, `en`) and database-driven dynamic category routes, plus strict search crawler rules (`src/app/robots.ts`) securing administrative endpoints.
3. **CI/CD Automation (GitHub Actions)**: Establish a robust continuous integration pipeline (`.github/workflows/ci.yml`) validating dependency integrity, Prisma client generation, ESLint formatting, TypeScript typecheck (`tsc --noEmit`), and production compilation (`next build`).

---

## 2. Pillar 1: TypeScript & Tooling Modernization

### 2.1 Dependencies
Install the required development packages:
- `typescript`
- `@types/node`
- `@types/react`
- `@types/react-dom`

### 2.2 Configuration (`tsconfig.json`)
The `tsconfig.json` enables strict typing for new `.ts` and `.tsx` files while allowing seamless coexistence with existing `.js` and `.jsx` files:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### 2.3 ESLint 9 Flat Config Migration (`eslint.config.mjs`)
Remove obsolete `.eslintrc.json` and replace it with `eslint.config.mjs`:
```javascript
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**"],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
```

### 2.4 Updated `package.json` Scripts
Update `package.json` scripts:
- `"lint": "eslint ."` (replaces broken Next 16 `next lint`)
- `"typecheck": "tsc --noEmit"`

### 2.5 Core Domain Type Definitions (`src/types/`)
- `src/types/car.ts`: Define `Car`, `CarTransmission`, `CarFuelType`, `CarStatus`.
- `src/types/category.ts`: Define `Category`.
- `src/types/booking.ts`: Define `Booking`, `BookingStatus`, `PaymentStatus`.
- `src/types/i18n.ts`: Define `Locale = 'ar' | 'fr' | 'en'`, `Dictionary`.

---

## 3. Pillar 2: SEO Sitemap & Robots (`sitemap.ts` & `robots.ts`)

### 3.1 Dynamic Multilingual Sitemap (`src/app/sitemap.ts`)
Next.js App Router serves this route as `/sitemap.xml`.

- **Base URL Resolution**: `process.env.NEXT_PUBLIC_SITE_URL || 'https://luxurylocationdz.com'`
- **Languages**: `ar` (default), `fr`, `en`
- **Static Routes**:
  1. Home (`/` -> `https://luxurylocationdz.com/ar`, `fr`, `en`) - Priority `1.0`, ChangeFreq `daily`
  2. Cars Catalog (`/cars` -> `/[lang]/cars`) - Priority `0.9`, ChangeFreq `daily`
  3. Custom Pack (`/pack-personnalise` -> `/[lang]/pack-personnalise`) - Priority `0.8`, ChangeFreq `weekly`
  4. Design Concept (`/design` -> `/[lang]/design`) - Priority `0.7`, ChangeFreq `weekly`
- **Dynamic Category Routes**:
  - Fetch active categories from Prisma (`prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } })`).
  - Output `/ar/design/${category.slug}`, `/fr/design/${category.slug}`, `/en/design/${category.slug}` with cross-language alternates.
- **Fail-Safe Resilience**:
  - Encapsulate database fetching in a `try/catch`. If database access fails at build time, the sitemap safely returns all static routes without failing the build.

### 3.2 Crawler Rules (`src/app/robots.ts`)
Next.js App Router serves this route as `/robots.txt`.

- **Rules**:
  - `userAgent: '*'`
  - `allow: '/'`
  - `disallow: ['/*/admin/', '/api/', '/_next/', '/admin/']`
  - `sitemap: 'https://luxurylocationdz.com/sitemap.xml'`
  - `host: 'https://luxurylocationdz.com'`

---

## 4. Pillar 3: CI/CD Pipeline (`.github/workflows/ci.yml`)

### 4.1 Trigger Conditions
- Push on `main` and `master`.
- Pull requests targeting `main` and `master`.
- Manual execution via `workflow_dispatch`.

### 4.2 Workflow Steps
1. **Checkout Repository**: `actions/checkout@v4`
2. **Setup Node.js**: `actions/setup-node@v4` with Node `20.x` and npm caching (`cache: 'npm'`).
3. **Install Dependencies**: `npm ci`
4. **Generate Prisma Client**: `npx prisma generate`
5. **Lint Code**: `npm run lint`
6. **Type Check**: `npm run typecheck`
7. **Production Build**: `npm run build` with dummy fallback environment variables:
   - `DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/postgres"`
   - `DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/postgres"`

---

## 5. Verification Plan

1. **Tooling & TypeScript Validation**:
   - Run `npm run typecheck` locally -> Must exit with code 0.
   - Run `npm run lint` locally -> Must exit with code 0.
2. **Sitemap & Robots Verification**:
   - Run `npm run build`.
   - Verify that `/sitemap.xml` and `/robots.txt` are generated as valid Next.js route handlers.
3. **CI/CD Workflow Syntax Verification**:
   - Validate YAML syntax and structure of `.github/workflows/ci.yml`.
