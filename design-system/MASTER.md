# Termiz Design System

## Brand
- **Name:** Termiz
- **Industry:** Fast food delivery (doner, pita, burgers, hot dogs)
- **Tone:** Warm, energetic, street-food, quick & filling

## Colors (White + Orange — brand lock)
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#FF6B00` | CTA, accents, active states |
| Primary Hover | `#E55F00` | Button hover |
| Primary Light | `#FFF4EB` | Subtle backgrounds |
| Background | `#FFFAF7` | Page (warm cream) |
| Surface | `#FFFFFF` | Cards |
| Foreground | `#1C1410` | Headings, body |
| Muted | `#6B5C52` | Secondary text |
| Border | `#EDE4DB` | Dividers |

## Typography (UI/UX Pro Max)
- **Display:** Manrope — headings, restaurant name (modern geometric sans)
- **Body:** Karla — UI text, forms, descriptions
- **Headings:** `font-display`, semibold/bold, tight letter-spacing
- **Body:** 14–16px, relaxed line-height

## Components
- **Radius:** `rounded-2xl` / `rounded-3xl`
- **Cards:** white, soft shadow, hover lift (Framer Motion)
- **Buttons:** orange gradient shadow, 200ms transitions
- **Menu grid:** 1 → 2 → 3 columns, inspired by 21st.dev food cards
- **Hero:** orange gradient + dot pattern + glass stat pills

## Motion (Framer Motion)
- Stagger menu cards (40ms delay)
- Floating cart: spring animation
- Hero fade-in on load
- `prefers-reduced-motion` respected in globals.css

## Anti-patterns
- No emojis as icons (use Lucide)
- No dark mode
- No generic purple AI gradients
- cursor-pointer on all interactive elements
