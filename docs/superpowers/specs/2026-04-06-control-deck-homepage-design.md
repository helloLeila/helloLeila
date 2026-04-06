# Control Deck Homepage Design

## Summary

Rebuild the GitHub Pages homepage as a single-stage interactive showcase for `engineering + academic` positioning.

The page should feel light, deliberate, and technical rather than dark or cyberpunk. It should borrow the interaction rhythm of Tongyi Wan's button behavior and stage transitions, while keeping the visual language aligned with a personal portfolio that can be shown publicly.

This redesign replaces the current broken state where `index.html` belongs to an older layout generation and no longer matches `styles.css` and `script.js`.

## Goals

- Restore structural consistency across `index.html`, `styles.css`, and `script.js`
- Make the first viewport interaction-led instead of copy-led
- Present a bilingual identity throughout the page without explicit `EN` / `中文` prefixes
- Emphasize four capability themes instead of isolated technologies
- Keep tag-style skill mapping, but integrate it into the stage experience
- Make button speed, hover, and active transitions feel noticeably smoother and more intentional

## Non-Goals

- Do not recreate Wan's exact visual design
- Do not introduce a black, gray, or heavy neon theme
- Do not build parallel entry channels or split the homepage into engineering vs academic tabs
- Do not turn the page into a metrics dashboard or contribution showcase

## Experience Thesis

The first screen should behave like a control deck:

- one dominant stage
- one row of primary theme controls
- a compact bilingual narrative
- a responsive motion system where the entire stage changes when a theme changes

The experience should feel like selecting a research-and-engineering mode rather than opening a static card.

## Visual Thesis

- light atmospheric gradients
- translucent technical surfaces
- sharp typography
- restrained glass and blur treatment
- soft blue / mint / apricot accents
- subtle depth and field motion

The page should read as `engineering precision + academic clarity`, not marketing gloss.

## Content Structure

### 1. Header

- compact brand block with name and short descriptor
- minimal navigation links for `Work`, `Skills`, `Research`
- no oversized hero navigation or secondary CTA cluster

### 2. Hero Stage

The first viewport contains:

- one bilingual headline
- one compact bilingual support paragraph
- one row of 4 theme buttons
- one active stage panel with layered content
- a small set of floating tags tied to the active theme

The first viewport must fit without feeling empty or forcing the user to scroll before seeing the interactive core.

### 3. Theme Controls

The four stage themes are:

1. `Full-stack Engineering / 全栈工程`
2. `Frontend Systems / 前端系统`
3. `Data Visualization / 数据可视化`
4. `Academic Research / 学术研究`

These are primary navigation controls inside the hero, not separate sections competing for attention.

### 4. Lower Sections

Below the stage:

- a compact skill map in linked tag form
- a short engineering section
- a short academic section
- a compact contact / links section

These sections should support the hero instead of replacing it.

## Interaction Model

### Primary Interaction

When a user clicks a theme button:

- the active button updates immediately
- the stage headline changes
- bilingual supporting copy changes
- background glow and field gradients shift
- floating tags reposition and relabel
- stacked glass cards retitle and reflow
- stage accent colors update
- a short sweep / flash transition runs across the active panel

The stage must feel like one connected system responding to a control input.

### Button Behavior

Button behavior should reference Wan's interaction tempo:

- fast hover response
- slight magnetic pull toward pointer center
- crisp press-down state
- spring-like release
- clear active state with highlight and border energy

Buttons should look technical and premium, not like default pills.

### Motion System

The motion stack should include:

- ambient background drift
- a hero entrance sequence
- theme-switch panel sweep
- floating tag repositioning
- layered card transform updates
- subtle pointer parallax for stage depth

Motion must stay smooth and readable on laptop screens. Decorative motion that does not support hierarchy should be removed.

## Content Rules

### Bilingual Rule

All meaningful user-facing copy on the interactive page should be bilingual, but not labeled as separate language sections.

Use patterns like:

- English line first
- Chinese line second

Avoid prefixes such as:

- `EN:`
- `中文:`

### Theme Copy Rule

Each theme needs:

- one English title
- one Chinese title
- one English summary line
- one Chinese summary line
- three concise supporting points
- three floating tags
- three stack card items

Copy must sound concrete and technical, not motivational.

### Engineering + Academic Balance

The four themes should collectively express both sides:

- engineering delivery, architecture, systems thinking
- academic rigor, research framing, analysis, and method

The page should not feel like two disconnected resumes glued together.

## Technical Design

### HTML

Replace the current broken homepage markup with a fresh structure built around:

- `header`
- `main`
- `section.hero-stage`
- `nav.theme-controls`
- `section.skill-map`
- `section.engineering`
- `section.research`
- `footer`

The stage must expose stable hooks for animation and data-driven updates.

### CSS

Rebuild the stylesheet so it matches the new DOM exactly.

Key CSS responsibilities:

- light background system
- stage layout and responsive behavior
- button hover / active / press styling
- layered panel surfaces
- floating tags and stack card transforms
- motion-safe transitions

Do not try to preserve obsolete selectors from the old layout.

### JavaScript

The script should:

- initialize particle / field background safely
- define the 4 theme data objects
- update stage content on click
- animate button and panel transitions
- animate floating tags and layered cards
- apply pointer-reactive stage depth

Use one coherent source of truth for theme content instead of scattering copy across the DOM.

## Responsive Behavior

### Desktop

- stage uses a two-area composition: content column + active visual panel
- buttons remain in a horizontal control row
- layered cards can overlap with controlled depth

### Tablet / Small Laptop

- maintain the same structure with reduced spacing
- keep buttons horizontal if possible
- collapse visual depth slightly to preserve readability

### Mobile

- stack content vertically
- keep the same theme-switch interaction
- remove non-essential motion intensity
- avoid horizontal overflow entirely

## Error Handling

- If JavaScript fails, the page should still show the default theme in a readable static state
- If fonts fail to load, layout should remain stable with fallback fonts
- If reduced motion is enabled, theme changes should use simpler fades and position updates

## Verification Plan

Implementation is complete only when:

1. `index.html`, `styles.css`, and `script.js` are structurally aligned again
2. the first viewport shows the interactive stage immediately
3. each of the 4 theme buttons visibly changes the whole stage
4. the copy is bilingual and consistent
5. local preview and the generated screenshot reflect the same layout
6. no obvious overflow or broken layout appears at common desktop widths

## Tradeoff Decision

We are choosing `Control Deck` over:

- a poster-only hero, because it would underdeliver on the requested interaction depth
- a dense research console, because it would sacrifice clarity and immediacy

This design intentionally prioritizes a stronger interactive first impression while still leaving room for engineering and academic substance below the fold.
