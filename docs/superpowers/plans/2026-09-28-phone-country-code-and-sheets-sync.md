# Phone Country Code & Google Sheet Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an international country dial code selector to the car reservation modal and custom VIP pack form, and format the phone number as explicit text with the `+` sign and all digits in Google Sheets and the database.

**Architecture:** Create a reusable UI component `PhoneInput.jsx` with curated country dial codes and luxury styling. Use it across `BookingModal.jsx` and `CustomPackClient.jsx`. In the orders API, format `customer_phone` for Google Sheets with a leading apostrophe (`'`) so Google Sheets displays the complete international number without formula errors or digit stripping.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS, PostgreSQL / pg pool, Telegram Bot API, Google Apps Script Webhook.

## Global Constraints
- Preserve existing styling and dark luxury aesthetic (`slate-800/90`, `gold-400`).
- Ensure `dir="ltr"` on the phone number inputs for correct digit typing in both RTL (Arabic) and LTR (French/English).
- Keep 0 external dependencies (use pure React and Tailwind).
- Ensure `npm run typecheck` and `npm run lint` pass without errors.

---

### Task 1: Create Reusable `PhoneInput` Component

**Files:**
- Create: `src/components/PhoneInput.jsx`

**Interfaces:**
- Consumes: React hooks (`useState`, `useEffect`, `useMemo`, `useRef`)
- Produces: `PhoneInput({ value, onChange, defaultCountry, placeholder, required, disabled, className })`
  - Emits `onChange(fullNumber, { country, dialCode, localNumber })`

- [ ] **Step 1: Write `src/components/PhoneInput.jsx`**

```jsx
"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";

export const COUNTRIES = [
    { code: "DZ", name: "Algérie", dialCode: "+213", flag: "🇩🇿" },
    { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
    { code: "TN", name: "Tunisie", dialCode: "+216", flag: "🇹🇳" },
    { code: "MA", name: "Maroc", dialCode: "+212", flag: "🇲🇦" },
    { code: "AE", name: "Émirats Arabes Unis", dialCode: "+971", flag: "🇦🇪" },
    { code: "ES", name: "Espagne", dialCode: "+34", flag: "🇪🇸" },
    { code: "IT", name: "Italie", dialCode: "+39", flag: "🇮🇹" },
    { code: "GB", name: "Royaume-Uni", dialCode: "+44", flag: "🇬🇧" },
    { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
    { code: "US", name: "États-Unis", dialCode: "+1", flag: "🇺🇸" },
    { code: "TR", name: "Turquie", dialCode: "+90", flag: "🇹🇷" },
    { code: "SA", name: "Arabie Saoudite", dialCode: "+966", flag: "🇸🇦" },
    { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
];

export default function PhoneInput({
    value = "",
    onChange,
    defaultCountry = "DZ",
    placeholder = "05 59 30 96 80",
    required = false,
    disabled = false,
    className = "",
    id,
    name = "phoneNumber",
}) {
    const [selectedCountryCode, setSelectedCountryCode] = useState(defaultCountry);
    const [localNumber, setLocalNumber] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedCountry = useMemo(() => {
        return COUNTRIES.find((c) => c.code === selectedCountryCode) || COUNTRIES[0];
    }, [selectedCountryCode]);

    // Parse initial value if provided with dialCode
    useEffect(() => {
        if (!value) {
            setLocalNumber("");
            return;
        }

        // Check if value already starts with any country dial code
        const matched = COUNTRIES.find((c) => value.startsWith(c.dialCode));
        if (matched) {
            setSelectedCountryCode(matched.code);
            const remaining = value.substring(matched.dialCode.length).trim();
            setLocalNumber(remaining);
        } else {
            // Raw local number
            setLocalNumber(value);
        }
    }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNumberChange = (e) => {
        let val = e.target.value;
        // Clean characters: keep numbers and spaces
        val = val.replace(/[^\d\s]/g, "");

        // If user typed leading 0 with dial code selected, strip redundant leading 0
        let cleanLocal = val.trim();
        if (cleanLocal.startsWith("0")) {
            cleanLocal = cleanLocal.substring(1);
        }

        setLocalNumber(val);

        if (onChange) {
            const fullNumber = cleanLocal ? `${selectedCountry.dialCode} ${cleanLocal}` : "";
            onChange(fullNumber, {
                country: selectedCountry,
                dialCode: selectedCountry.dialCode,
                localNumber: cleanLocal,
                rawInput: val,
            });
        }
    };

    const handleSelectCountry = (country) => {
        setSelectedCountryCode(country.code);
        setDropdownOpen(false);

        let cleanLocal = localNumber.trim();
        if (cleanLocal.startsWith("0")) {
            cleanLocal = cleanLocal.substring(1);
        }

        if (onChange) {
            const fullNumber = cleanLocal ? `${country.dialCode} ${cleanLocal}` : "";
            onChange(fullNumber, {
                country,
                dialCode: country.dialCode,
                localNumber: cleanLocal,
                rawInput: localNumber,
            });
        }
    };

    return (
        <div className={`relative flex items-center ${className}`} ref={dropdownRef}>
            {/* Country Selector Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700/80 border border-r-0 border-slate-700 rounded-l-xl text-white text-xs font-semibold focus:outline-none focus:border-gold-400 transition-colors shrink-0"
                title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
            >
                <span className="text-base leading-none">{selectedCountry.flag}</span>
                <span className="text-slate-300 font-mono tracking-tight">{selectedCountry.dialCode}</span>
                <FiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Country Dropdown Menu */}
            {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-60 max-h-64 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1.5 backdrop-blur-xl">
                    {COUNTRIES.map((c) => (
                        <button
                            key={c.code}
                            type="button"
                            onClick={() => handleSelectCountry(c)}
                            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-slate-800 transition-colors ${
                                c.code === selectedCountry.code ? "bg-gold-500/10 text-gold-400 font-bold" : "text-slate-200"
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-base">{c.flag}</span>
                                <span className="truncate">{c.name}</span>
                            </span>
                            <span className="font-mono text-slate-400 text-[11px] ml-2 shrink-0">{c.dialCode}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Local Phone Input */}
            <input
                type="tel"
                id={id}
                name={name}
                value={localNumber}
                onChange={handleNumberChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                dir="ltr"
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-r-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 text-sm font-medium tracking-wide"
            />
        </div>
    );
}
```

- [ ] **Step 2: Verify `PhoneInput` with typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit `PhoneInput` component**

```bash
git add src/components/PhoneInput.jsx
git commit -m "feat(ui): add reusable PhoneInput component with country dial codes"
```

---

### Task 2: Integrate `PhoneInput` in `BookingModal.jsx`

**Files:**
- Modify: `src/components/BookingModal.jsx:1-20, 480-505`

**Interfaces:**
- Consumes: `PhoneInput` from `@/components/PhoneInput`
- Produces: `formData.phoneNumber` holding full international number (e.g. `+213 778612190`), passed to `POST /api/orders` as `customer_phone`.

- [ ] **Step 1: Import `PhoneInput` in `src/components/BookingModal.jsx`**

Add import:
```jsx
import PhoneInput from "@/components/PhoneInput";
```

- [ ] **Step 2: Replace raw phone `<input>` with `<PhoneInput>`**

Find the phone number input block in `src/components/BookingModal.jsx` around line 487-501:
```jsx
<div className="col-span-1 md:col-span-2">
    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
        {dict?.booking?.phone}
    </label>
    <PhoneInput
        value={formData.phoneNumber}
        onChange={(fullNumber) => setFormData((prev) => ({ ...prev, phoneNumber: fullNumber }))}
        placeholder="05 59 30 96 80"
        required
    />
</div>
```

- [ ] **Step 3: Verify validation logic in `BookingModal.jsx`**

Confirm that the validation check `!formData.phoneNumber` enables the submit button when a valid phone number is present.

- [ ] **Step 4: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS (0 errors)

- [ ] **Step 5: Commit `BookingModal.jsx` updates**

```bash
git add src/components/BookingModal.jsx
git commit -m "feat(booking): integrate PhoneInput with country dial code in BookingModal"
```

---

### Task 3: Integrate `PhoneInput` in `CustomPackClient.jsx`

**Files:**
- Modify: `src/app/[lang]/pack-personnalise/CustomPackClient.jsx`

**Interfaces:**
- Consumes: `PhoneInput` from `@/components/PhoneInput`
- Produces: `formData.customerPhone` formatted with country dial code (e.g. `+213 778612190`).

- [ ] **Step 1: Import `PhoneInput` in `CustomPackClient.jsx`**

Add import:
```jsx
import PhoneInput from "@/components/PhoneInput";
```

- [ ] **Step 2: Replace raw phone `<input>` with `<PhoneInput>`**

Locate the phone number input in `src/app/[lang]/pack-personnalise/CustomPackClient.jsx` and replace with:
```jsx
<PhoneInput
    value={formData.customerPhone}
    onChange={(fullNumber) => setFormData((prev) => ({ ...prev, customerPhone: fullNumber }))}
    placeholder="05 59 30 96 80"
    required
/>
```

- [ ] **Step 3: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS (0 errors)

- [ ] **Step 4: Commit `CustomPackClient.jsx` updates**

```bash
git add src/app/[lang]/pack-personnalise/CustomPackClient.jsx
git commit -m "feat(pack): integrate PhoneInput with country code in CustomPackClient"
```

---

### Task 4: Format Phone Number for Google Sheet Synchronization

**Files:**
- Modify: `src/app/api/orders/route.js:245-270`

**Interfaces:**
- Consumes: `customer_phone` from request body
- Produces: `sheetData.record.customer_phone` with prepended `'` for text preservation in Google Sheets.

- [ ] **Step 1: Update Google Sheet payload in `src/app/api/orders/route.js`**

Modify lines 245-270:
```javascript
            // Send to Google Sheet if configured (MUST await on Vercel serverless!)
            if (process.env.GOOGLE_SHEET_SCRIPT_URL) {
                // Prepend with single quote (') to force Google Sheets to treat value as literal text.
                // Google Sheets hides the apostrophe and displays the complete "+213 778612190" without formula errors.
                const sheetPhone = customer_phone
                    ? (customer_phone.startsWith("'") ? customer_phone : `'${customer_phone}`)
                    : '-';

                const sheetData = {
                    record: {
                        id: newBookingId,
                        customer_name,
                        customer_phone: sheetPhone,
                        cars: { name: carName },
                        pickup_date,
                        return_date,
                        total_amount,
                        status: initialStatus,
                        notes,
                    }
                };

                try {
                    await fetch(process.env.GOOGLE_SHEET_SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(sheetData)
                    });
                } catch (err) {
                    console.error('Google Sheet Sync Error:', err);
                }
            }
```

- [ ] **Step 2: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS (0 errors)

- [ ] **Step 3: Commit orders API update**

```bash
git add src/app/api/orders/route.js
git commit -m "fix(sheets): format phone number as literal text for Google Sheets sync"
```

---

### Task 5: End-to-End Verification & Quality Check

**Files:**
- Verify: `src/components/PhoneInput.jsx`
- Verify: `src/components/BookingModal.jsx`
- Verify: `src/app/[lang]/pack-personnalise/CustomPackClient.jsx`
- Verify: `src/app/api/orders/route.js`

- [ ] **Step 1: Run TypeScript compiler check**

Run: `npm run typecheck`
Expected: PASS (0 errors)

- [ ] **Step 2: Run ESLint**

Run: `npm run lint`
Expected: PASS (0 errors, max 1 existing warning in DashboardClient)

- [ ] **Step 3: Build evaluation**

Run: `npm run build`
Expected: Build succeeds with all routes compiled.
