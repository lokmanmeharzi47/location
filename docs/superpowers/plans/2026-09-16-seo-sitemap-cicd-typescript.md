# SEO Sitemap, CI/CD, and TypeScript Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish TypeScript configuration with core domain types, fix linting for Next.js 16/ESLint 9, implement a dynamic multilingual SEO sitemap and robots.txt, and configure a complete GitHub Actions CI/CD pipeline.

**Architecture:** A progressive hybrid TypeScript foundation (`allowJs: true`, `tsconfig.json`) alongside modern ESLint 9 flat configuration (`eslint.config.mjs`) provides typecheck and linting safety without breaking existing JavaScript code. Next.js 16 native route handlers `src/app/sitemap.ts` and `src/app/robots.ts` deliver dynamic, resilient, database-backed sitemaps with hreflang alternates. A multi-stage GitHub Actions workflow `.github/workflows/ci.yml` enforces code quality, type checks, and build integrity on every PR and push.

**Tech Stack:** Next.js 16.1.6, React 19, TypeScript 5, ESLint 9, Prisma 6, PostgreSQL, GitHub Actions.

## Global Constraints

- Preserve all existing `.js` and `.jsx` components and pages without breaking runtime functionality.
- Do not introduce breaking schema changes in Prisma or database models.
- Base site URL must default to `https://luxurylocation.dz` with support for `process.env.NEXT_PUBLIC_SITE_URL`.
- Supported locales for sitemap: `ar` (default), `fr`, `en`.
- CI/CD workflow must run in `ubuntu-latest` with Node.js `20.x`.
- Every task must end with a commit.

---

### Task 1: TypeScript Tooling & ESLint 9 Flat Config Migration

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Delete: `.eslintrc.json`

**Interfaces:**
- Consumes: Existing Next.js 16 configuration in `next.config.js` and `package.json`.
- Produces: Executable `npm run typecheck` and `npm run lint` commands.

- [ ] **Step 1: Install TypeScript devDependencies**

Run in terminal:
```bash
npm install -D typescript @types/node @types/react @types/react-dom @eslint/eslintrc
```

- [ ] **Step 2: Create `tsconfig.json`**

Create `tsconfig.json`:
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

- [ ] **Step 3: Replace `.eslintrc.json` with `eslint.config.mjs`**

Create `eslint.config.mjs`:
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
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "src/generated/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
```

Remove `.eslintrc.json` and remove obsolete `jsconfig.json` (superseded by `tsconfig.json`).

- [ ] **Step 4: Update `package.json` scripts**

In `package.json`:
- Change `"lint": "next lint"` to `"lint": "eslint ."`
- Add `"typecheck": "tsc --noEmit"`

- [ ] **Step 5: Verify lint and typecheck**

Run:
```bash
npm run lint
npm run typecheck
```
Expected: Both exit with code 0 without errors.

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json eslint.config.mjs
git rm -f .eslintrc.json jsconfig.json
git commit -m "chore: setup TypeScript and migrate to ESLint 9 flat config"
```

---

### Task 2: Core Domain Type Definitions

**Files:**
- Create: `src/types/car.ts`
- Create: `src/types/category.ts`
- Create: `src/types/booking.ts`
- Create: `src/types/i18n.ts`
- Create: `src/types/index.ts`

**Interfaces:**
- Consumes: Prisma schema fields and i18n locale definitions.
- Produces: Exported TypeScript interfaces for use across components, sitemap, and API routes.

- [ ] **Step 1: Create `src/types/car.ts`**

```typescript
export type CarTransmission = 'Automatique' | 'Manuelle' | string;
export type CarFuelType = 'Essence' | 'Diesel' | 'Hybride' | 'Electrique' | string;
export type CarStatus = 'disponible' | 'loue' | 'maintenance' | string;

export interface Car {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  categoryId?: number | null;
  pricePerDay: number | string;
  pricePerWeek?: number | string | null;
  pricePerMonth?: number | string | null;
  fuelType?: CarFuelType | null;
  transmission?: CarTransmission | null;
  seats?: number | null;
  doors?: number | null;
  luggage?: number | null;
  airConditioning?: boolean | null;
  status?: CarStatus | null;
  licensePlate?: string | null;
  mileage?: number | null;
  imagePath?: string | null;
  images?: string | null;
  description?: string | null;
  features?: string | null;
  displayOrder?: number | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
```

- [ ] **Step 2: Create `src/types/category.ts`**

```typescript
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imagePath?: string | null;
  href?: string | null;
  displayOrder?: number | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
```

- [ ] **Step 3: Create `src/types/booking.ts`**

```typescript
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | string;
export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | string;

export interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  customerCity?: string | null;
  licenseNumber?: string | null;
  carId: number;
  pickupDate: Date;
  returnDate: Date;
  pickupLocation?: string | null;
  returnLocation?: string | null;
  dailyRate: number | string;
  totalDays: number;
  subtotal: number | string;
  extrasAmount?: number | string | null;
  discountAmount?: number | string | null;
  totalAmount: number | string;
  status?: BookingStatus | null;
  paymentStatus?: PaymentStatus | null;
  notes?: string | null;
  extras?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
```

- [ ] **Step 4: Create `src/types/i18n.ts`**

```typescript
export type Locale = 'ar' | 'fr' | 'en';

export interface I18nConfig {
  defaultLocale: Locale;
  locales: Locale[];
}

export type Dictionary = Record<string, any>;
```

- [ ] **Step 5: Create `src/types/index.ts`**

```typescript
export * from './car';
export * from './category';
export * from './booking';
export * from './i18n';
```

- [ ] **Step 6: Verify Typecheck**

Run: `npm run typecheck`  
Expected: Code 0, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/types
git commit -m "feat: add core TypeScript definitions for cars, categories, bookings, and i18n"
```

---

### Task 3: SEO Dynamic Multilingual Sitemap & Robots

**Files:**
- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: Next.js `MetadataRoute.Sitemap`, `MetadataRoute.Robots`, Prisma `prisma.category.findMany()`, `i18n.locales`.
- Produces: Standard Next.js `/sitemap.xml` and `/robots.txt` endpoints.

- [ ] **Step 1: Create `src/app/robots.ts`**

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxurylocation.dz';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/*/admin/',
        '/*/admin',
        '/admin/',
        '/admin',
        '/api/',
        '/_next/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
```

- [ ] **Step 2: Create `src/app/sitemap.ts`**

```typescript
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { i18n } from '@/i18n-config';

export const revalidate = 86400; // Revalidate daily (in seconds)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxurylocation.dz';
  const locales = i18n.locales as ('ar' | 'fr' | 'en')[];
  const now = new Date();

  // Static routes to index
  const staticPaths = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/cars', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/pack-personnalise', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/design', priority: 0.7, changeFrequency: 'weekly' as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // 1. Generate entries for static routes with multilingual alternates
  for (const item of staticPaths) {
    for (const lang of locales) {
      const url = `${baseUrl}/${lang}${item.path}`;
      const languages: Record<string, string> = {};

      for (const altLang of locales) {
        languages[altLang] = `${baseUrl}/${altLang}${item.path}`;
      }

      entries.push({
        url,
        lastModified: now,
        changeFrequency: item.changeFrequency,
        priority: item.priority,
        alternates: {
          languages,
        },
      });
    }
  }

  // 2. Dynamically fetch active categories from database
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    for (const category of categories) {
      if (!category.slug) continue;

      for (const lang of locales) {
        const url = `${baseUrl}/${lang}/design/${encodeURIComponent(category.slug)}`;
        const languages: Record<string, string> = {};

        for (const altLang of locales) {
          languages[altLang] = `${baseUrl}/${altLang}/design/${encodeURIComponent(category.slug)}`;
        }

        entries.push({
          url,
          lastModified: category.updatedAt || now,
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages,
          },
        });
      }
    }
  } catch (error) {
    console.error('[Sitemap] Failed to query dynamic categories, using static routes only:', error);
  }

  return entries;
}
```

- [ ] **Step 3: Verify Typecheck & Build**

Run:
```bash
npm run typecheck
npm run build
```
Expected: Build generates `/sitemap.xml` and `/robots.txt` route entries successfully without errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/robots.ts src/app/sitemap.ts
git commit -m "feat(seo): add dynamic multilingual sitemap and robots.txt"
```

---

### Task 4: CI/CD Pipeline (`.github/workflows/ci.yml`)

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: GitHub Actions runner environment, npm dependencies, Prisma schema, project scripts.
- Produces: Automated pass/fail status checks for PRs and pushes.

- [ ] **Step 1: Create directory `.github/workflows`**

Create directory `.github/workflows`.

- [ ] **Step 2: Create `.github/workflows/ci.yml`**

```yaml
name: CI Quality & Build Pipeline

on:
  push:
    branches:
      - main
      - master
  pull_request:
    branches:
      - main
      - master
  workflow_dispatch:

jobs:
  validate:
    name: Lint, Typecheck & Build
    runs-on: ubuntu-latest

    env:
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"
      DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"
      NEXT_PUBLIC_SITE_URL: "https://luxurylocation.dz"

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript Typecheck
        run: npm run typecheck

      - name: Build Next.js Application
        run: npm run build
```

- [ ] **Step 3: Validate YAML and Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions continuous integration pipeline"
```

---

### Task 5: Full Suite Verification & Final Check

**Files:**
- Verification only

- [ ] **Step 1: Run linter**
Run: `npm run lint`  
Expected: 0 errors.

- [ ] **Step 2: Run typecheck**
Run: `npm run typecheck`  
Expected: 0 errors.

- [ ] **Step 3: Run production build**
Run: `npm run build`  
Expected: Compiled successfully, routes `/sitemap.xml` and `/robots.txt` present.

- [ ] **Step 4: Check git status**
Ensure working directory is clean and all commits are documented.
