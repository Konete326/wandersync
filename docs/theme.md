# WanderSync Design & Theme System (Dark Black Edition)

This document establishes the universal design tokens, color palette, component styles, and theme rules applied across both the **User Panel** and **Admin Panel** of WanderSync.

---

## 1. Core Color Palette (Dark Black Modern Minimal)

| Token | Hex Value | OKLCH / CSS Var | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `#09090b` | `var(--background)` | Main canvas background across all pages |
| **Card / Surface** | `#121215` | `var(--card)` | Content cards, data widgets, sidebars |
| **Card Elevate** | `#18181b` | `var(--secondary)` | Hover states, elevated panels |
| **Border / Divider**| `#272730` | `var(--border)` | Subtle 1px borders, card dividers, table lines |
| **Input Background**| `#18181b` | `var(--input)` | Form fields, search bars, textareas |
| **Foreground (Text)**| `#fafafa` | `var(--foreground)` | Primary headings, active labels, body text |
| **Muted Text** | `#a1a1aa` | `var(--muted-foreground)` | Secondary descriptions, timestamps, subtitles |
| **Subtle Text** | `#71717a` | — | Placeholders, disabled text, footnotes |
| **Accent Glow** | `#06b6d4` | `oklch(0.7 0.15 210)` | Brand cyan micro-accents, active badges, highlights |
| **Success** | `#10b981` | `oklch(0.65 0.18 150)` | Success states, budget positive indicators |
| **Destructive / Error**| `#ef4444` | `var(--destructive)` | Delete actions, error banners, negative deltas |

---

## 2. Typography Scale

- **Headings Font:** `Outfit, sans-serif` (`var(--font-heading)`)
- **Body & UI Font:** `Plus Jakarta Sans, sans-serif` (`var(--font-sans)`)
- **Monospace / Numbers:** `ui-monospace, Consolas, monospace`

| Level | Size (Desktop) | Size (Mobile) | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | 56px - 64px | 32px - 36px | 800 (ExtraBold) | 1.1 |
| **H1 (Page Header)**| 32px - 36px | 24px - 28px | 700 (Bold) | 1.2 |
| **H2 (Section Header)**| 22px - 24px | 18px - 20px | 600 (SemiBold) | 1.25 |
| **H3 (Card Header)**| 16px - 18px | 15px - 16px | 600 (SemiBold) | 1.3 |
| **Body Standard** | 14px - 15px | 13px - 14px | 400 - 500 | 1.5 |
| **Small / Metadata**| 12px - 13px | 11px - 12px | 500 (Medium) | 1.4 |
| **Badge / Tag** | 11px - 12px | 10px - 11px | 600 (SemiBold) | 1.0 |

---

## 3. Button Standards

### 3.1 Primary Button
- **Background:** `#fafafa` (Solid White / Off-White)
- **Text:** `#09090b` (Deep Black)
- **Hover:** `#e4e4e7` with subtle scale transition
- **Shadow:** `0 1px 3px rgba(0,0,0,0.3)`
- **Border Radius:** `10px` (`rounded-xl`)
- **Usage:** Main call-to-actions ("Create Trip", "Save Changes", "Sign In").

### 3.2 Secondary / Glass Button
- **Background:** `#18181b` with `backdrop-filter: blur(12px)`
- **Border:** `1px solid #272730`
- **Text:** `#fafafa`
- **Hover:** Background `#272730`, border `#3f3f46`
- **Border Radius:** `10px` (`rounded-xl`)
- **Usage:** Secondary actions ("Cancel", "Filter", "Download PDF").

### 3.3 Accent Brand Button
- **Background:** `linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)`
- **Text:** `#ffffff`
- **Hover:** `linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)`
- **Shadow:** `0 8px 20px -4px rgba(6, 182, 212, 0.3)`
- **Usage:** Key AI Generation triggers ("Generate Itinerary").

### 3.4 Destructive Button
- **Background:** `rgba(239, 68, 68, 0.15)`
- **Border:** `1px solid rgba(239, 68, 68, 0.3)`
- **Text:** `#f87171`
- **Hover:** `rgba(239, 68, 68, 0.25)`, text `#ffffff`
- **Usage:** "Delete Trip", "Remove Expense", "Revoke Token".

---

## 4. Component & Layout Rules

1. **Dark Black Theme Consistency:**
   - No light background sections anywhere in the project.
   - All panels, modals, dropdowns, and sidebars must inherit the dark black token hierarchy.
2. **Mobile First & Touch Targets:**
   - Minimum button/icon touch target size: `44px x 44px` on mobile screens.
   - Form inputs stacked vertically on mobile (`< 640px`) and responsive grids on tablet/desktop.
3. **No Native Dialogs:**
   - All notifications, alerts, and deletion confirmations must use the theme-aware `CustomModal` or `Toast` provider.
4. **Performance & Lazy Loading:**
   - All route views must be code-split using `React.lazy` and wrapped in `Suspense` with an instant skeleton loader.
5. **No AI Generated Look:**
   - Restrained, purposeful animations without cluttered purple/pink gradients.
   - Clean high-contrast typography and precise alignment.
