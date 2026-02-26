# 🎨 VIKAS – Design Document
**Virtually Intelligent Knowledge Assisted Shopping**  
**Design System Version:** 1.0  
**Design Language:** Claymorphism  
**Last Updated:** February 2026

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design Language – Claymorphism](#2-design-language--claymorphism)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout Grid](#5-spacing--layout-grid)
6. [Elevation & Shadow System](#6-elevation--shadow-system)
7. [Component Library](#7-component-library)
8. [Iconography](#8-iconography)
9. [Motion & Animation](#9-motion--animation)
10. [Illustrations & 3D Assets](#10-illustrations--3d-assets)
11. [Screen-by-Screen Design Specs](#11-screen-by-screen-design-specs)
12. [Dark Mode](#12-dark-mode)
13. [Accessibility](#13-accessibility)
14. [Platform Adaptations](#14-platform-adaptations)
15. [Design Tokens (Code)](#15-design-tokens-code)

---

## 1. Design Philosophy

VIKAS's design is built around one core idea: **shopping should feel delightful, not transactional.**

The interface needs to handle two very different emotional contexts simultaneously:
- A **festive, high-energy environment** (Diwali sales, flash events) where excitement and urgency are real
- A **calm, assistive environment** (AI chat, AR try-on, reservation management) where focus and clarity matter

The design resolves this tension through **Claymorphism** — a style that is inherently joyful and dimensional without being noisy. Clay cards feel tactile and real. Soft shadows make the UI feel approachable. The 3D-ish depth gives hierarchy without aggression.

### Design Pillars

**1. Tactile & Dimensional**  
Every interactive element should feel like it can be picked up. Buttons depress on press. Cards have physical depth. The UI has weight.

**2. Warm & Inclusive**  
The color palette skews warm — coral, amber, soft green. Not the cold blues of fintech. Not the aggressive red of discounts. Warm means inviting.

**3. Intelligent but Human**  
The AI assistant has a personality — not clinical or robotic. The chat bubbles are rounded, the tone is friendly, the suggestions feel like they came from a knowledgeable friend.

**4. Mobile-First, Web-Considered**  
Designed for thumbs first. Then scaled up for desktop — not the other way around.

---

## 2. Design Language – Claymorphism

Claymorphism is defined by four visual properties applied together:

### 2.1 Core Properties

| Property | Implementation |
|---|---|
| **Inflated, rounded forms** | `border-radius: 20–32px` on cards and containers |
| **Multi-layered soft shadows** | 3 shadow layers: outer diffuse, outer sharp, inner highlight |
| **Pastel + saturated fill** | Background fills with slight gradient (top: lighter, bottom: slightly deeper) |
| **Inner highlight edge** | `box-shadow: inset 0 2px 0 rgba(255,255,255,0.6)` — simulates light catching top edge |

### 2.2 The Clay Card Formula

```css
.clay-card {
  background: linear-gradient(145deg, #FFE5D0, #FFD5BC);
  border-radius: 24px;
  box-shadow:
    /* Outer diffuse shadow */
    8px 8px 24px rgba(255, 100, 50, 0.20),
    /* Outer sharp shadow */
    3px 3px 8px rgba(255, 100, 50, 0.15),
    /* Inner top highlight */
    inset 0 2px 0 rgba(255, 255, 255, 0.65),
    /* Inner bottom depth */
    inset 0 -2px 4px rgba(0, 0, 0, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.45);
}
```

### 2.3 Claymorphism vs Other Styles

| Style | Shadows | Transparency | Borders | Mood |
|---|---|---|---|---|
| Flat | None | None | None / thin | Clean, minimal |
| Neumorphism | Light + dark same-color | None | None | Soft, monochromatic |
| Glassmorphism | Diffuse | High (blur) | Light glass border | Cool, ethereal |
| **Claymorphism** | **Multi-layer colored** | **None (opaque)** | **White highlight** | **Warm, tactile, joyful** |

---

## 3. Color System

### 3.1 Brand Palette

```
Primary: Coral Orange
  50:  #FFF3EE
  100: #FFE4D6
  200: #FFCAB0
  300: #FFAA83
  400: #FF8455
  500: #FF6B35   ← Primary brand color
  600: #E8521A
  700: #C43D0D
  800: #9E2F08
  900: #7A2305

Secondary: Warm Amber
  50:  #FFFBEB
  100: #FEF3C7
  200: #FDE68A
  300: #FCD34D
  400: #FBBF24
  500: #F59E0B   ← Secondary accent
  600: #D97706
  700: #B45309

Success: Sage Green
  400: #4ADE80
  500: #22C55E
  600: #16A34A

Warning: Peach
  400: #FB923C
  500: #F97316

Error: Soft Red
  400: #F87171
  500: #EF4444

Neutral (Warm Greys)
  50:  #FAFAF9
  100: #F5F5F4
  200: #E7E5E4
  300: #D6D3D1
  400: #A8A29E
  500: #78716C
  600: #57534E
  700: #44403C
  800: #292524
  900: #1C1917
```

### 3.2 Clay Card Color Families

Each product category or UI section gets its own clay color family:

| Context | Base Color | Shadow Tint | Usage |
|---|---|---|---|
| Primary CTA | `#FF6B35` coral | `rgba(255,107,53,0.25)` | Buttons, highlights |
| Product Cards | `#FFF0E8` warm cream | `rgba(255,150,80,0.18)` | Product listing |
| AI Chat | `#E8F4FF` soft blue | `rgba(100,160,255,0.18)` | Chat bubbles, AI card |
| Reservation | `#E8FFF0` soft green | `rgba(50,200,100,0.18)` | Slot cards, QR screen |
| Admin | `#F0E8FF` soft purple | `rgba(150,100,255,0.18)` | Admin dashboard cards |
| Warning/Alert | `#FFF8E8` warm yellow | `rgba(255,200,50,0.18)` | Low stock, expiry |
| Error | `#FFE8E8` soft red | `rgba(255,100,100,0.18)` | Error states |

### 3.3 Semantic Color Tokens

```
--color-bg-primary:       #FAFAF9   (app background — warm white)
--color-bg-secondary:     #F5F5F4   (subtle section background)
--color-bg-card:          #FFFFFF   (card base before clay gradient)
--color-text-primary:     #1C1917   (headings)
--color-text-secondary:   #57534E   (body, subtitles)
--color-text-muted:       #A8A29E   (hints, placeholders)
--color-border:           rgba(255,255,255,0.45)  (clay card border)
--color-brand:            #FF6B35
--color-brand-light:      #FFF0E8
--color-success:          #22C55E
--color-warning:          #F97316
--color-error:            #EF4444
```

---

## 4. Typography

### 4.1 Type Scale

**Display Font:** `Nunito` (Google Fonts)  
Chosen for its rounded letterforms — perfect for claymorphism. The rounded terminals echo the rounded corners of clay cards.

**Body Font:** `DM Sans`  
Clean, geometric, slightly warm. Pairs well with Nunito without competing.

**Mono Font:** `JetBrains Mono`  
Used for QR codes, reservation IDs, system status — adds a technical contrast.

### 4.2 Type Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display-2xl` | 48px | 800 | 1.1 | Hero headings, splash |
| `display-xl` | 36px | 800 | 1.15 | Page titles |
| `display-lg` | 28px | 700 | 1.2 | Section headers |
| `heading-md` | 22px | 700 | 1.3 | Card titles |
| `heading-sm` | 18px | 600 | 1.35 | Sub-section titles |
| `body-lg` | 16px | 400 | 1.6 | Primary body text |
| `body-md` | 14px | 400 | 1.6 | Secondary body text |
| `body-sm` | 12px | 400 | 1.5 | Captions, helper text |
| `label-lg` | 14px | 600 | 1.2 | Button labels, tags |
| `label-sm` | 11px | 600 | 1.2 | Badges, status labels |
| `mono` | 13px | 500 | 1.4 | IDs, codes, status |

### 4.3 React Native Font Loading

```javascript
// app/_layout.tsx
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
  'Nunito-Bold':      require('../assets/fonts/Nunito-Bold.ttf'),
  'Nunito-SemiBold':  require('../assets/fonts/Nunito-SemiBold.ttf'),
  'DMSans-Regular':   require('../assets/fonts/DMSans-Regular.ttf'),
  'DMSans-Medium':    require('../assets/fonts/DMSans-Medium.ttf'),
  'JetBrainsMono':    require('../assets/fonts/JetBrainsMono-Medium.ttf'),
});
```

---

## 5. Spacing & Layout Grid

### 5.1 Base Unit

Base unit: **4px**. All spacing values are multiples of 4.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Icon padding, micro gaps |
| `space-2` | 8px | Inline element gaps |
| `space-3` | 12px | Component internal padding |
| `space-4` | 16px | Standard padding (cards, inputs) |
| `space-5` | 20px | Section padding |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Section gaps |
| `space-10` | 40px | Large section spacing |
| `space-12` | 48px | Hero spacing |
| `space-16` | 64px | Page-level breathing room |

### 5.2 Mobile Layout Grid

- **Columns:** 4
- **Gutter:** 16px
- **Margin:** 16px (left + right)
- **Content width:** `screenWidth - 32px`

### 5.3 Web Layout Grid

- **Columns:** 12
- **Gutter:** 24px
- **Max content width:** 1280px
- **Breakpoints:**

| Name | Width | Layout |
|---|---|---|
| `sm` | 640px | Single column (mobile web) |
| `md` | 768px | 2-column (tablet) |
| `lg` | 1024px | 3-column + sidebar |
| `xl` | 1280px | Full desktop layout |

---

## 6. Elevation & Shadow System

### 6.1 Clay Shadow Levels

Claymorphism uses **colored shadows** (tinted with the element's own color), not grey shadows.

| Level | CSS Shadow | Usage |
|---|---|---|
| `clay-0` | none | Flat inline elements |
| `clay-1` | `4px 4px 12px rgba(C,0.15), inset 0 1px 0 rgba(255,255,255,0.5)` | Subtle cards, inputs |
| `clay-2` | `6px 6px 18px rgba(C,0.18), 2px 2px 6px rgba(C,0.12), inset 0 2px 0 rgba(255,255,255,0.6)` | Product cards, info panels |
| `clay-3` | `8px 8px 24px rgba(C,0.22), 3px 3px 8px rgba(C,0.15), inset 0 2px 0 rgba(255,255,255,0.65)` | Featured cards, modals |
| `clay-4` | `12px 12px 32px rgba(C,0.28), 4px 4px 10px rgba(C,0.18), inset 0 3px 0 rgba(255,255,255,0.7)` | CTAs, hero elements |

Where `C` = the element's shadow color (derived from its background color, shifted toward orange/coral).

### 6.2 Press State (Button Depression)

On press, clay elements should appear to physically depress:
```
Normal:   translateY(0),  clay-3 shadow
Pressed:  translateY(2px), clay-1 shadow (shallower = pushed in)
```

React Native implementation:
```javascript
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: withSpring(pressed.value ? 2 : 0) }],
  shadowOffset: { width: pressed.value ? 2 : 6, height: pressed.value ? 2 : 6 },
}))
```

---

## 7. Component Library

### 7.1 ClayCard

The atomic unit of the UI.

```
Variants:
  default   — warm cream background, coral shadow
  ai        — soft blue background, blue shadow (AI features)
  success   — soft green background, green shadow (confirmed states)
  warning   — soft yellow background, amber shadow (alerts)
  error     — soft red background, red shadow (errors)
  admin     — soft purple background, purple shadow (admin panels)

Props:
  padding:  sm (12px) | md (16px) | lg (24px)
  radius:   sm (16px) | md (24px) | lg (32px)
  elevated: boolean (clay-3 vs clay-1)
  pressable: boolean (adds press animation)
```

### 7.2 ClayButton

```
Variants:
  primary   — #FF6B35 fill, white text, coral clay shadow
  secondary — white fill, coral border, lighter shadow
  ghost     — transparent, coral text, no shadow
  danger    — soft red fill

Sizes:
  sm: height 36px, padding 12px horizontal, 13px label
  md: height 48px, padding 20px horizontal, 15px label
  lg: height 56px, padding 24px horizontal, 17px label
  full: width 100%

States:
  default → pressed (translateY 2px, shadow shrinks)
  loading → spinner replaces label, same dimensions maintained
  disabled → opacity 0.45, no shadow, no press animation
```

### 7.3 ClayInput

```
Structure:
  Label (Nunito SemiBold 13px, neutral-600)
  Input Container (clay-1, border-radius 16px, height 52px)
  Helper text / Error text (12px, below input)

States:
  default:  neutral-100 bg, neutral-300 border
  focused:  white bg, brand orange border (2px), clay-2 shadow
  error:    error-50 bg, error-400 border, error text below
  disabled: neutral-100 bg, opacity 0.5

Left/Right adornments:
  Supported via leftIcon / rightIcon props
  Password toggle: eye icon right adornment
```

### 7.4 ProductCard

```
Dimensions:
  Grid card (2-col):  width (screenWidth-48)/2, height 240px
  List card:          full width, height 120px
  Featured card:      full width, height 200px

Anatomy:
  Image area:     rounded top (24px), overflow hidden
    - Discount badge: top-left corner, clay warning variant
    - Wishlist icon: top-right corner, circular clay-1
    - AR badge: bottom-left if arEnabled, "🪄 AR" pill
  Content area:   padding 12px
    - Brand: body-sm, muted, uppercase, letter-spacing 0.5px
    - Title: body-md, semibold, 2-line clamp
    - Rating: star icons (filled/empty), review count
    - Price row: price (heading-sm, brand), original (body-sm, strike, muted)
    - Stock badge: "In Store" pill if available near user

Press interaction:
  Clay press animation + scale(0.97)
```

### 7.5 StockBadge

```
In Stock (>5):    green pill, "● In Stock"
Low Stock (1-5):  amber pill, "● Only X left"
Out of Stock:     red pill, "● Out of Stock"
In Store:         blue pill, "📍 Near You"

All badges:
  clay-1 shadow on matching color
  font: label-sm, semibold
  padding: 4px 10px
  border-radius: 20px (fully rounded)
```

### 7.6 SlotButton

```
Available:   white bg, green border, clay-1 green shadow
Selected:    brand-500 bg, white text, clay-3 coral shadow
Full:        neutral-200 bg, strikethrough text, opacity 0.5, no press
Nearly Full: amber bg, "7/10" sub-label in red

Dimensions: 80px × 44px, border-radius 14px
Layout:     2 rows — time (label-lg) + capacity (label-sm, muted)
```

### 7.7 ChatBubble

```
User bubble:
  background:   linear-gradient(135deg, #FF6B35, #FF8A5B)
  text color:   white
  border-radius: 20px 20px 4px 20px
  alignment:    right
  max-width:    75% of container
  shadow:       clay-2 coral

Assistant bubble:
  background:   linear-gradient(135deg, #EEF4FF, #E0EAFF)
  text color:   neutral-800
  border-radius: 4px 20px 20px 20px
  alignment:    left
  max-width:    85% of container
  shadow:       clay-2 blue

  Supports markdown rendering (bold, italic, lists)
  Supports inline ProductCard (rendered within bubble, full width)
```

### 7.8 StatusBadge

```
PENDING:    amber bg, "⏳ Pending"
CONFIRMED:  blue bg, "✓ Confirmed"
COMPLETED:  green bg, "✅ Completed"
EXPIRED:    neutral bg, "⌛ Expired"
CANCELLED:  red bg, "✗ Cancelled"

Style: clay-1, label-sm, pill shape
```

### 7.9 NavigationBar (Mobile Tab Bar)

```
Height:     64px + safe area bottom inset
Background: white, clay-3 shadow (upward — negative Y offset)
Border:     none (shadow replaces)

Tabs:
  Inactive: icon (neutral-400) + label (neutral-400, 10px)
  Active:   icon (brand-500) + label (brand-500, 10px, semibold)
            + clay pill indicator behind active icon (brand-100 bg)
  
Cart badge: absolute positioned, top-right of cart icon
            brand-500 bg, white text, label-sm
            clay-2 coral shadow
```

---

## 8. Iconography

### 8.1 Icon Library

Primary: **Lucide Icons** (`lucide-react-native`)  
Style: 1.5px stroke weight, rounded line caps and joins  
Size default: 24px  
Color: inherits from context (never hardcoded in component)

### 8.2 Icon Sizes

| Context | Size |
|---|---|
| Navigation bar | 24px |
| Button adornment | 18px |
| Inline body text | 16px |
| Badge / pill | 12px |
| Feature illustration (large) | 48px |

### 8.3 Custom VIKAS Icons

Designed specifically for VIKAS (SVG, exported as React Native SVG components):

| Icon | Usage |
|---|---|
| `VikasLogo` | App logo, splash, header |
| `ARSparkle` | AR try-on feature indicator |
| `QRScan` | Reservation/pickup scan |
| `SlotClock` | Slot time indicator |
| `AIBubble` | AI chat FAB, chat header |

---

## 9. Motion & Animation

### 9.1 Animation Principles

**Physics-based, not linear.** All motion uses spring animations (`withSpring` in Reanimated) rather than linear or ease-in-out curves. This makes UI feel alive.

**Directional consistency.** Screens entering from the right slide in from right. Modals enter from bottom. Nothing enters from the left.

**Duration hierarchy:**
- Micro (50–100ms): button press, toggle, badge update
- Standard (200–300ms): navigation, card appearance
- Expressive (400–600ms): page transitions, onboarding
- Slow (800ms+): splash, celebrations (reservation confirmed)

### 9.2 Core Animations

**Clay Press:**
```
Trigger: onPressIn / onPressOut
Effect:  translateY: 0 → 2px (in), shadow: clay-3 → clay-1 (in)
         Reverses on pressOut
Spring:  mass 1, damping 15, stiffness 400
```

**Card Entry (Staggered):**
```
Trigger: List render, screen focus
Effect:  opacity 0→1, translateY 20→0
Stagger: 50ms per card index
Spring:  damping 20, stiffness 300
```

**Success Celebration:**
```
Trigger: Reservation confirmed, order placed
Effect:  Scale 0.8→1.1→1.0 on QR card
         Confetti burst (lottie-react-native)
         Background pulse (brand color wash)
Duration: 800ms
```

**AI Typing Indicator:**
```
Three dots, each animating:
  translateY: 0 → -6 → 0
  Stagger: 150ms per dot
  Loop: continuous while isTyping
  Spring: damping 8, stiffness 200
```

**Page Transitions (Expo Router):**
```
Push: slide in from right (standard navigation)
Modal: slide up from bottom
Tab switch: cross-fade (no slide — prevents confusion)
```

**Skeleton Loading:**
```
Shimmer: linear gradient animating left→right
Colors: neutral-100 → neutral-200 → neutral-100
Duration: 1.2s loop
Radius: matches component shape exactly
```

---

## 10. Illustrations & 3D Assets

### 10.1 Illustration Style

Custom illustrations for empty states, onboarding, and feature callouts.

**Style:** 3D clay/plasticine characters — consistent with claymorphism UI. Round, puffy, soft-lit.  
**Tool:** Generated via Spline 3D, exported as Lottie animations or PNG sprites.  
**Colors:** Drawn from brand palette. Warm coral, amber, sage green.

### 10.2 Empty State Illustrations

| Screen | Illustration | Description |
|---|---|---|
| Empty Cart | Clay shopping bag, sad expression | Round bag with empty interior |
| No Orders | Clay delivery box, sleeping | Box with Zzz |
| No Reservations | Clay calendar, questioning | Calendar with question mark |
| 404 | Clay robot lost | Round robot with swirly eyes |
| No Search Results | Clay magnifying glass, shrug | Magnifier with arms raised |
| AR Not Supported | Clay phone with X | Phone with clay face |

### 10.3 Onboarding Illustrations

- Slide 1: Clay robot assistant with speech bubbles
- Slide 2: Clay QR code with floating checkmark
- Slide 3: Clay face with glasses floating toward it

### 10.4 AR 3D Product Assets

- Format: `.glb` (Binary GLTF 2.0)
- Compression: Draco mesh compression (60-90% size reduction)
- Texture resolution: 512×512 (mobile optimized)
- Poly count target: < 10,000 triangles per model
- Delivery: Cloudflare R2 + CDN, served via signed URLs

---

## 11. Screen-by-Screen Design Specs

### 11.1 Splash Screen

```
Background: radial gradient, brand-500 center → brand-700 edges
Logo: white SVG, centered, scale-in animation (0.6→1.0)
Tagline: white, Nunito Bold 16px, fade-in at 500ms
Loading indicator: white dots, bottom 60px from safe area
```

### 11.2 Onboarding

```
Background: warm gradient per slide
  Slide 1: #FFF3EE → #FFE4D6 (coral)
  Slide 2: #F0FFF4 → #DCFCE7 (green)
  Slide 3: #EFF6FF → #DBEAFE (blue)

Illustration: centered, 280px height, spring bounce on slide in
Headline: display-xl, Nunito ExtraBold, neutral-900
Body: body-lg, DM Sans, neutral-600
Dot indicators: 8px circles, active = 24px wide pill (brand-500)
Skip: label-lg, neutral-500, top-right
CTA button: clay-4 primary, full width, bottom 48px
```

### 11.3 Home Screen

```
Header:
  Background: transparent (scrolls over content)
  Logo: VIKAS wordmark, brand-500, Nunito ExtraBold
  Icons: notification bell + avatar, clay-1 circular buttons

Event Banner:
  Clay card, brand gradient fill (#FF6B35 → #FF8A5B)
  White text, Nunito Bold
  Countdown: monospace, large, white
  Corner decoration: subtle confetti pattern SVG

Active Reservation Card:
  Clay success variant (soft green)
  Product thumbnail (left, 56×56, rounded 12px)
  Store + time info
  "View QR" — ghost button, brand color

AI Recommendations:
  Section header: heading-sm + "🤖 For You" pill badge
  Horizontal FlatList, card width 160px, gap 12px

Categories:
  Circular clay buttons, 64px, icon + label below
  Horizontal scroll, no scroll indicator

FAB (AI Chat):
  60px circle, brand-500, clay-4 shadow
  AI sparkle icon, white
  Position: bottom-right, 20px from edge + safe area
  Subtle bounce animation on mount
```

### 11.4 Product Listing

```
Search bar:
  Clay-1, height 52px, radius 16px
  Left: search icon (neutral-400)
  Typing: border becomes brand-500, clay-2

Category pills:
  Active: brand-500 bg, white text, clay-2 coral shadow
  Inactive: white bg, neutral-300 border, clay-1

Filter / Sort bar:
  Horizontal row, filter button (left) + sort button (right)
  Active filters show count badge on filter button

Product Grid (2-col mobile):
  Gap: 12px
  Card: clay-2 warm cream, radius 20px
  Image: 160px height, top of card, radius 20px 20px 0 0
  Content padding: 12px

Discount badge:
  Clay warning, top-left of image, radius 8px 0 8px 0
  "−28%" in amber text

Skeleton state:
  Shimmer on image area (grey gradient)
  3 lines shimmer for text
  Matches card dimensions exactly
```

### 11.5 Product Detail

```
Hero image:
  Full width, height = 45% of screen
  No border radius (edge to edge)
  Gradient scrim bottom (transparent → bg-primary)
  Image counter pill (top-right): "2/4" in clay-1

Sticky header (appears on scroll):
  Clay-1 white bg, product name truncated
  Back button, share icon

Content area:
  Padding: 20px horizontal
  Brand pill: label-sm, neutral-500, brand light bg
  Title: heading-md, Nunito Bold
  Rating: star row + "(2,341 reviews)" link

Price block:
  Sale price: display-lg, brand-500, Nunito ExtraBold
  Original: body-md, neutral-400, line-through
  Discount: amber clay badge "28% OFF"

Stock badge: (live — WebSocket)
  Clay success/warning/error based on level
  Animated pulse dot before text

Store picker:
  Clay-1 card, dropdown chevron
  Shows: store name, distance, stock count

CTA section:
  "Add to Cart" — secondary button (white, brand border)
  "Buy Now" — primary button (brand fill)
  Side by side, gap 12px

"Reserve for Pickup":
  Full-width clay-3 brand button
  "📅 Reserve for Pickup" with calendar icon

AI Ask section:
  Clay AI variant card (soft blue)
  Robot icon + "Ask AI about this product"
  Quick suggestion chips below
```

### 11.6 AI Chat

```
Header:
  "AI Assistant" title + Groq badge (small pill: "Powered by Groq")
  Close button (X)

Messages area:
  Background: neutral-50 (very light warm grey)
  Padding: 16px

User bubbles:
  Clay brand gradient, white text
  Border radius: 20px 20px 4px 20px
  Max width: 75%
  Right-aligned with avatar

Assistant bubbles:
  Clay blue variant, neutral-800 text
  Border radius: 4px 20px 20px 20px
  Max width: 85%
  Left-aligned with AI avatar (small robot icon)

Inline product cards within bubbles:
  Clay-2 warm cream, full bubble width
  Compact: 72px image left, info right
  "Add to Cart" micro-button (32px height)

Typing indicator:
  Same style as assistant bubble, 60px width
  Three bouncing dots, brand color

Input bar:
  Clay-2 white, sticky bottom
  Text input: clay-1, radius 24px, multiline
  Send button: circular clay brand, 40px
```

### 11.7 Slot Selection

```
Product + Store summary:
  Clay-1 card at top, product thumbnail + store name
  Compact 80px height

Date selector:
  Horizontal strip, 7 days visible
  Each day: 48px × 64px clay button
  Today indicator: "Today" label above
  Selected: clay-3 brand fill
  Past dates: opacity 0.35

Slot grid:
  Grouped by Morning / Afternoon / Evening
  Section headers: label-lg, neutral-500
  3 slots per row, 80px × 48px each
  Available: clay-1 white, green border
  Selected: clay-3 brand fill, white text
  Full: clay-0, neutral-200, strikethrough
  
Selected slot summary (sticky above CTA):
  Clay success variant
  "📅 Feb 18 · 1:30 PM – 2:00 PM"
  Animated slide-up when slot selected

CTA button:
  Disabled (no slot selected): opacity 0.4
  Enabled: clay-4 primary, full width
```

### 11.8 Reservation Confirmation

```
Background:
  Full-screen success gradient (#F0FFF4 → #DCFCE7)
  Subtle confetti Lottie on entry

Header animation:
  ✅ checkmark circle bounces in (scale spring)
  "Reservation Confirmed!" Nunito ExtraBold display-xl
  Fade-in with 200ms delay

QR Card:
  Clay-3 white card, radius 28px, padding 24px
  QR code: 200×200px, centered
  Border: 8px white border around QR
  Reservation details below QR:
    Date/Time: heading-sm, Nunito Bold
    Store: body-md, neutral-600
    ID: mono font, neutral-400

Action buttons:
  "Download QR" — secondary clay button
  "Share" — secondary clay button
  Side by side

Expiry warning:
  Clay warning card (amber), bottom of screen
  "⏰ Valid until 2:15 PM · 45 minutes remaining"
  Countdown updates every second

Cancel:
  Ghost button, neutral-500, very bottom
```

### 11.9 Admin Dashboard

```
Layout (web):
  Left sidebar: 240px, clay-1 white, brand logo top
  Main content: flex-1, neutral-50 bg, padding 32px

KPI Cards (4-column row):
  Each: clay-3, 200px min, padding 20px
  Large number: display-xl, Nunito ExtraBold
  Label: body-sm, neutral-500
  Trend arrow: up=green, down=red, icon + percentage

Slot fill bars:
  Clay-2 white card
  Each slot: label + progress bar
  Progress bar: clay-1 track, clay-3 brand fill
  Border-radius: 8px (fully rounded)

Next Pickups table:
  Clay-1 white card
  Table header: neutral-100 bg, label-sm semibold
  Rows: hover = neutral-50 bg
  "Scan QR" button: clay-2 green, compact (32px height)
```

---

## 12. Dark Mode

VIKAS supports a warm dark mode — not the cold dark grey of typical dark modes.

```
Dark mode philosophy:
  Background: #1C1917 (warm near-black, not pure black)
  Cards: #292524 (warm dark brown-grey)
  Text primary: #FAFAF9
  Text secondary: #A8A29E
  Brand color: same #FF6B35 (pops on dark)

Clay cards in dark mode:
  Background gradient: dark brown, lighter on top
  Shadow: same colored shadows, increased opacity slightly
  Inner highlight: still present (critical — defines clay in dark)
  Border: rgba(255,255,255,0.12)

Implementation:
  NativeWind dark: prefix classes
  useColorScheme() hook
  All colors via design tokens (css variables / StyleSheet constants)
```

---

## 13. Accessibility

### 13.1 Color Contrast

All text meets WCAG 2.1 AA minimum (4.5:1 normal, 3:1 large):

| Element | Foreground | Background | Ratio |
|---|---|---|---|
| Body text | #1C1917 | #FAFAF9 | 16.7:1 ✅ |
| Secondary text | #57534E | #FAFAF9 | 7.2:1 ✅ |
| Brand button | #FFFFFF | #FF6B35 | 3.5:1 ✅ (large text) |
| Muted text | #A8A29E | #FAFAF9 | 2.9:1 ⚠️ (hints only) |

### 13.2 Touch Targets

Minimum touch target: **44×44pt** on all interactive elements.  
Components below this size use invisible tap areas (`hitSlop`).

### 13.3 Screen Reader

All interactive components include:
- `accessibilityLabel` — descriptive label
- `accessibilityRole` — button, link, image, etc.
- `accessibilityHint` — what happens on press (optional, for complex actions)
- `accessibilityState` — selected, disabled, checked

### 13.4 Reduced Motion

```javascript
import { AccessibilityInfo } from 'react-native';

const isReducedMotion = await AccessibilityInfo.isReduceMotionEnabled();
// If true: replace spring animations with instant state changes
// Skeleton shimmers stop, confetti disabled, transitions snap
```

---

## 14. Platform Adaptations

### 14.1 Mobile (iOS / Android)

- Bottom tab navigation
- Bottom sheets for filters and modals
- Native haptic feedback on key actions
- Status bar: transparent over hero images, white elsewhere
- Safe area insets respected on all screens
- Swipe gestures (back, cart dismiss, reservation cancel)
- Dynamic text size: respects OS accessibility text size setting

### 14.2 Web (react-native-web)

- Left sidebar navigation (sticky, 240px)
- Hover states on all interactive elements (cursor: pointer)
- URL-based routing for shareable deep links
- Keyboard navigation (Tab, Enter, Escape)
- `max-width: 1280px` content constraint, centered
- Product grid: 3–4 columns vs 2 on mobile
- Admin dashboard: full table layout vs card list on mobile
- Responsive breakpoints via NativeWind `md:`, `lg:` prefixes

---

## 15. Design Tokens (Code)

### 15.1 NativeWind Config (tailwind.config.js)

```javascript
module.exports = {
  content: ['./app/**/*.tsx', './components/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FFF3EE',
          100: '#FFE4D6',
          200: '#FFCAB0',
          300: '#FFAA83',
          400: '#FF8455',
          500: '#FF6B35',
          600: '#E8521A',
          700: '#C43D0D',
        },
        clay: {
          cream: '#FFF0E8',
          blue:  '#EEF4FF',
          green: '#EDFFF5',
          purple:'#F3EEFF',
          amber: '#FFFBEB',
        }
      },
      fontFamily: {
        display:  ['Nunito-ExtraBold'],
        heading:  ['Nunito-Bold'],
        subhead:  ['Nunito-SemiBold'],
        body:     ['DMSans-Regular'],
        medium:   ['DMSans-Medium'],
        mono:     ['JetBrainsMono'],
      },
      borderRadius: {
        'clay-sm': '16px',
        'clay-md': '24px',
        'clay-lg': '32px',
        'clay-xl': '40px',
      },
      boxShadow: {
        'clay-1': '4px 4px 12px rgba(255,107,53,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
        'clay-2': '6px 6px 18px rgba(255,107,53,0.18), inset 0 2px 0 rgba(255,255,255,0.6)',
        'clay-3': '8px 8px 24px rgba(255,107,53,0.22), inset 0 2px 0 rgba(255,255,255,0.65)',
        'clay-4': '12px 12px 32px rgba(255,107,53,0.28), inset 0 3px 0 rgba(255,255,255,0.7)',
      }
    }
  }
}
```

### 15.2 StyleSheet Constants (React Native)

```typescript
// constants/design.ts

export const Colors = {
  brand: {
    50:  '#FFF3EE',
    500: '#FF6B35',
    600: '#E8521A',
  },
  neutral: {
    50:  '#FAFAF9',
    100: '#F5F5F4',
    400: '#A8A29E',
    600: '#57534E',
    900: '#1C1917',
  },
  clay: {
    cream:  '#FFF0E8',
    blue:   '#EEF4FF',
    green:  '#EDFFF5',
    purple: '#F3EEFF',
    amber:  '#FFFBEB',
  },
  success: '#22C55E',
  warning: '#F97316',
  error:   '#EF4444',
} as const;

export const Shadows = {
  clay1: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  clay2: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  clay3: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  clay4: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 12, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 16,
  },
} as const;

export const Spacing = {
  1: 4,  2: 8,  3: 12, 4: 16,
  5: 20, 6: 24, 8: 32, 10: 40,
  12: 48, 16: 64,
} as const;

export const Radius = {
  sm: 16, md: 24, lg: 32, xl: 40,
  full: 9999,
} as const;

export const Typography = {
  displayXl:  { fontFamily: 'Nunito-ExtraBold', fontSize: 36, lineHeight: 42 },
  displayLg:  { fontFamily: 'Nunito-Bold',      fontSize: 28, lineHeight: 34 },
  headingMd:  { fontFamily: 'Nunito-Bold',      fontSize: 22, lineHeight: 28 },
  headingSm:  { fontFamily: 'Nunito-SemiBold',  fontSize: 18, lineHeight: 24 },
  bodyLg:     { fontFamily: 'DMSans-Regular',   fontSize: 16, lineHeight: 26 },
  bodyMd:     { fontFamily: 'DMSans-Regular',   fontSize: 14, lineHeight: 22 },
  bodySm:     { fontFamily: 'DMSans-Regular',   fontSize: 12, lineHeight: 18 },
  labelLg:    { fontFamily: 'DMSans-Medium',    fontSize: 14, lineHeight: 18 },
  labelSm:    { fontFamily: 'DMSans-Medium',    fontSize: 11, lineHeight: 14 },
  mono:       { fontFamily: 'JetBrainsMono',    fontSize: 13, lineHeight: 20 },
} as const;
```

---

*Document Owner: VIKAS Design Team*  
*Tools: Figma (design source), Spline (3D assets), Lottie (animations)*  
*Design Review: Required before any new screen ships*
