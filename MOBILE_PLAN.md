# Mobile Responsiveness Plan

The goal is to fix mobile experiences strictly referencing default Tailwind mobile sizing (which targets anything under `sm` or `md`) without altering any desktop layouts (`md:` and `lg:`).

### 1. Landing Page (`src/app/page.tsx`)
- **Hero Typography:** Scale `text-5xl` down to `text-[2.5rem]` or `text-4xl` for mobile, preserving `md:text-7xl` and `lg:text-[5.5rem]`.
- **Button Flex:** The `px-14` horizontally pushes out of bounds on phones. Decrease padding for mobile (`px-8 md:px-14`).
- **Layout Margins:** Adjust vertical margins (`py-32` -> `py-16 md:py-32`) to reclaim screen space.

### 2. Navbar & Routing (`src/components/layout/Navbar.tsx`)
- The navigation heavily relies on `hidden md:flex`, meaning mobile users can't see the links or dashboard selection reliably.
- I will create a mobile-only "Burger Menu" or a "Fixed Bottom Navigation Bar" to provide these links for touch screens.

### 3. Session Controls (`src/components/layout/SessionControls.tsx`)
- They overflow the top bar. I will hide them inside a dropdown or the mobile navigation drawer.

### 4. Driver Dashboard & Tables (`src/components/ui/DriverTabs.tsx`)
- **Tabs Wrapping:** Will apply `flex overflow-x-auto snap-x hide-scrollbar whitespace-nowrap` so tabs are swipeable instead of stacking/crashing.
- **Tables Container:** Apply `w-full overflow-x-auto` to all table parents so grids can scroll horizontally.
- **Chart SVG Aspect Ratio:** Provide dynamic aspect ratio or set fixed height and 100% width, adjusting viewBox mathematically if needed.

Are you ready for me to proceed with implementing these fixes?
