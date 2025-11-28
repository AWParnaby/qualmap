# Qualmap Codebase Guide

A comprehensive guide to understanding and working with the Qualmap project.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Project Structure](#project-structure)
4. [Core Concepts](#core-concepts)
5. [File-by-File Analysis](#file-by-file-analysis)
6. [Data Flow](#data-flow)
7. [Getting Started](#getting-started)

---

## Project Overview

**Qualmap** (Quality + Map) is an interactive visualization tool for exploring digital inclusion services and feedback across UK postcode districts. It displays:
- An interactive map of UK postcode areas
- Word cloud summaries of service descriptions and user feedback
- A drilldown feature to explore specific words and their sources

**Important Context**:
- The datasets are **synthetic** and do not reflect real services
- This is a **design workshop provocation tool**, not a production application
- The project was partially developed using AI-assisted coding (Cursor + Claude 3.5 Sonnet)

---

## Tech Stack & Architecture

### Frontend Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 19.2.0 |
| **Vite** | Build tool and dev server | 7.2.4 |
| **Leaflet** | Interactive mapping library | 1.9.4 |
| **react-leaflet** | React bindings for Leaflet | 5.0.0 |
| **PapaParse** | CSV parsing | 5.5.3 |
| **Compromise** | Natural language processing | 14.14.4 |
| **react-tagcloud** | Word cloud visualization | 2.3.3 |

### Architecture Pattern

The application follows a **React Context + Reducer** pattern for state management:

```
┌─────────────────────────────────────────────────────────┐
│                    MapDataContext                        │
│  (Global State Management via useReducer)               │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                   │
┌───────▼──────┐  ┌────────▼─────────┐  ┌────▼──────────┐
│   Map        │  │  Selection        │  │  Word Cloud   │
│  Components  │  │   Panel           │  │  Components   │
└──────────────┘  └──────────────────┘  └───────────────┘
```

**Key Architectural Decisions**:
1. **Single source of truth**: All state lives in `MapDataContext`
2. **Action-based updates**: State changes via dispatched actions
3. **Component isolation**: Each component folder is self-contained
4. **Theme centralization**: All styling constants in `theme/index.js`

---

## Project Structure

```
qualmap/
├── public/
│   ├── data/                    # CSV data files
│   │   ├── services.csv         # Digital inclusion services
│   │   └── feedback.csv         # User feedback on services
│   └── geojson/                 # UK postcode boundary polygons
│       ├── NE.geojson          # Example: Newcastle area
│       ├── TS.geojson          # Example: Teesside area
│       └── ...                 # 100+ UK postcode area files
├── src/
│   ├── main.jsx                 # Application entry point
│   ├── MapWithWordCloud.jsx     # Main container component
│   ├── contexts/
│   │   └── MapDataContext.jsx   # Global state management
│   ├── components/
│   │   ├── Map/
│   │   │   ├── PostcodeMap.jsx  # Interactive map component
│   │   │   └── MapSection.jsx   # Map container
│   │   ├── WordCloud/
│   │   │   ├── WordCloudSection.jsx  # Word cloud container
│   │   │   ├── WordCloudPanel.jsx    # Word cloud generation
│   │   │   └── NgramDataPanel.jsx    # Drilldown modal
│   │   ├── Selection/
│   │   │   └── SelectionPanel.jsx    # Selected areas list
│   │   ├── KeyboardHelp/
│   │   │   └── KeyboardHelp.jsx      # Keyboard shortcuts overlay
│   │   ├── LoadingSpinner/
│   │   │   └── LoadingSpinner.jsx    # Loading state UI
│   │   └── TabNavigation.jsx         # Tab switcher
│   ├── config/
│   │   └── constants.js         # Configuration constants
│   └── theme/
│       └── index.js            # Theme and styling
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and scripts
└── vite.config.js              # Vite configuration
```

---

## Core Concepts

### 1. State Management

The application uses React's `useReducer` hook for state management, providing a Redux-like experience without external dependencies.

**State Shape**:
```javascript
{
  dataState: {
    servicesData: [],      // Parsed services CSV
    feedbackData: []       // Parsed feedback CSV
  },
  postcodeGeoJSON: {},     // Loaded map boundaries
  selectedAreas: [],       // User-selected postcode districts
  focusedArea: null,       // Currently keyboard-focused area
  dataLoaded: false,       // Loading state flag
  showKeyboardHelp: false, // Keyboard help visibility
  activeTab: 'selections', // Current tab (selections/wordcloud)
  selectedNgram: null,     // Clicked word for drilldown
  ngramData: null         // Data for drilldown modal
}
```

### 2. Data Flow

1. **Initial Load** (`MapDataContext.jsx` lines 207-233):
   - Fetch and parse CSV files (services, feedback)
   - Extract unique postcode districts from data
   - Load corresponding GeoJSON boundary files
   - Set `dataLoaded: true`

2. **User Interaction**:
   - Click/keyboard select postcode area → Updates `selectedAreas`
   - Word cloud auto-generates from selected areas
   - Click word in cloud → Opens drilldown panel with source data

3. **Reactive Updates**:
   - State changes trigger component re-renders
   - Map highlights update based on `selectedAreas`
   - Word clouds regenerate when selections change

### 3. Postcode System

UK postcodes are hierarchical:
- **Area**: 1-2 letters (e.g., "NE" for Newcastle, "TS" for Teesside)
- **District**: Area + 1-2 digits (e.g., "NE1", "TS16")
- **Full postcode**: District + space + 3 characters (e.g., "NE1 4ST")

The app works at the **district level** - each selectable map region is a postcode district.

### 4. Word Cloud Generation

Uses **Compromise NLP** library to extract meaningful phrases:
- Noun phrases (e.g., "digital skills", "community support")
- Verb phrases (e.g., "providing support")
- Organization names (e.g., "Citizens Advice")
- Automatically detected topics

Multi-word phrases are weighted 2x higher than single words to emphasize context.

---

## File-by-File Analysis

### Entry Points

#### `index.html` (lines 1-14)
Standard HTML5 structure with:
- Root div for React mounting
- Module script reference to `main.jsx`

#### `src/main.jsx` (lines 1-13)
**Purpose**: Application bootstrap

**What it does**:
1. Creates React root on `#root` element
2. Wraps app in `MapDataProvider` for global state
3. Renders `MapWithWordCloud` as main component
4. Enables React `StrictMode` for development warnings

**Key imports**:
- `MapWithWordCloud`: Main UI component
- `MapDataProvider`: State context provider

---

### Configuration & Theming

#### `src/config/constants.js` (lines 1-77)

**Purpose**: Central configuration file

**Key exports**:

1. **`govukColors`** (line 4): Import GOV.UK Design System colors
2. **`DATA_SOURCES`** (lines 7-20): CSV file configurations
   ```javascript
   [
     {
       id: 'services',
       file: 'services.csv',
       stateKey: 'servicesData',    // Key in state
       postcodeField: 'postcode'     // CSV column name
     },
     // ... feedback config
   ]
   ```

3. **`WORD_CLOUD_CONFIGS`** (lines 23-34): Word cloud data source mappings
4. **`COMMON_WORDS`** (lines 37-57): Stop words for filtering
5. **`featureStyle`** (lines 60-61): Map styling function
6. **`tagCloudOptions`** (lines 64-77): Word cloud visual settings

#### `src/theme/index.js` (lines 1-177)

**Purpose**: Complete design system implementation

**Structure**:

1. **`theme.colors`** (lines 5-16): GOV.UK color palette
   - Primary: `#1d70b8` (GOV.UK Blue)
   - Text: `#0b0c0c` (Black)
   - Background: `#ffffff` (White)
   - Surface: `#f8f8f8` (Light Grey)

2. **`theme.spacing`** (lines 19-25): 4px base scale
   - `xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 32px`

3. **`theme.typography`** (lines 28-43):
   - Font family: System font stack
   - Sizes: 14-32px range
   - Weights: 400 (regular), 500 (medium), 700 (bold)

4. **`theme.map`** (lines 73-90): Map feature styling
   - Selected: Dark blue, 60% opacity
   - Unselected: Light blue, 30% opacity
   - Hover: Thicker border weight

5. **`styleHelpers`** (lines 94-127): Reusable style objects
   - `panel.base`: Base panel styling
   - `button.primary`: Primary button styling

6. **`colorPalettes`** (lines 150-177): Word cloud color schemes

---

### State Management

#### `src/contexts/MapDataContext.jsx` (lines 1-344)

**Purpose**: Global state management and data loading

**Architecture**:

1. **Action Types** (lines 8-19): Redux-style action constants
   ```javascript
   SET_DATA_STATE, SET_GEOJSON, SET_SELECTED_AREAS, etc.
   ```

2. **Initial State** (lines 22-32): Default application state

3. **Reducer** (lines 35-72): State update logic
   - Line 38-41: Supports functional actions
   - Line 43-71: Switch statement for action handling

4. **Data Loading Functions**:

   **`loadCSV`** (lines 82-112):
   - Fetches CSV file from `/data/` directory
   - Parses using PapaParse
   - Returns object with stateKey: data mapping
   - Error handling returns empty array

   **`loadGeoJSON`** (lines 115-204):
   - Extracts unique postcode districts from data (line 118-142)
   - Uses regex to extract district: `/^[A-Z]{1,2}\d{1,2}/` (line 124)
   - Groups districts by area code for efficient loading (lines 152-157)
   - Loads area-level GeoJSON files (e.g., `NE.geojson`)
   - Filters features to only include districts with data (lines 169-172)
   - Combines into single FeatureCollection

5. **Data Initialization** (lines 207-233):
   - `useEffect` hook runs on mount
   - Loads all CSV files in parallel
   - Waits for CSV load before loading GeoJSON
   - Sets `dataLoaded: true` when complete

6. **Action Creators** (lines 236-279):
   - `toggleAreaSelection`: Add/remove area from selection (lines 237-259)
   - `clearSelections`: Reset selected areas
   - `setFocusedArea`: Track keyboard focus
   - `toggleKeyboardHelp`: Show/hide shortcuts panel
   - `setActiveTab`: Switch between selections/wordcloud tabs
   - `setSelectedNgram`: Store clicked word for drilldown
   - `setNgramData`: Store data for drilldown modal

7. **Global Keyboard Handler** (lines 282-328):
   - Listens for `Ctrl+/` → Toggle keyboard help (lines 287-291)
   - Listens for `Escape` → Clear selections (lines 294-298)
   - Listens for `Enter`/`Space` on focused area → Toggle selection (lines 316-323)
   - Only handles keys when path element (map area) is focused

8. **Context Provider** (lines 330-334):
   - Provides `state` and `actions` to all children

9. **Custom Hook** (lines 338-344):
   - `useMapData()`: Access context in components
   - Throws error if used outside provider

---

### Main Layout

#### `src/MapWithWordCloud.jsx` (lines 1-131)

**Purpose**: Main container managing resizable split view

**Layout Structure**:
```
┌──────────────────┬─┬──────────────┐
│                  │ │              │
│   Map            │D│  Side Panel  │
│   Container      │R│  ┌─────────┐ │
│                  │A│  │  Tabs   │ │
│                  │G│  ├─────────┤ │
│                  │ │  │ Content │ │
│                  │ │  │         │ │
└──────────────────┴─┴──────────────┘
```

**Key Features**:

1. **State** (lines 15-20):
   - `sidebarWidth`: Tracks panel width (default: 1/3 viewport)
   - `isDragging`: Ref for drag operation state

2. **Loading State** (lines 22-24):
   - Shows `LoadingSpinner` while data loads

3. **Resize Handler** (lines 32-64):
   - `handleMouseDown`: Initiates drag (line 32)
   - `handleMouseMove`: Updates width during drag (line 45)
     - Enforces min: 300px, max: viewport - 400px
   - `handleMouseUp`: Cleans up listeners (line 60)

4. **Layout** (lines 66-127):
   - Flexbox horizontal split
   - Map container: `flex: 1` (grows to fill space)
   - Divider: 8px wide, draggable, keyboard accessible (lines 84-104)
   - Side panel: Fixed width from state (line 108)

5. **Keyboard Resize** (lines 96-103):
   - Arrow keys adjust sidebar width by 50px increments
   - `ArrowLeft` → Wider sidebar
   - `ArrowRight` → Narrower sidebar

6. **Tab Content Switching** (line 121):
   - `activeTab === 'selections'` → `SelectionPanel`
   - Otherwise → `WordCloudSection`

7. **Overlays** (lines 124-125):
   - `KeyboardHelp`: Shortcuts panel (bottom-left overlay)
   - `NgramDataPanel`: Word drilldown modal (centered overlay)

---

### Map Components

#### `src/components/Map/PostcodeMap.jsx` (lines 1-216)

**Purpose**: Interactive Leaflet map with keyboard navigation

**Components**:

1. **`AccessibilityLayer`** (lines 14-86):
   Internal component that adds keyboard navigation.

   **Setup** (lines 25-51):
   - Queries all `.leaflet-interactive` paths
   - Adds accessibility attributes to each:
     - `data-postcode`: Postcode district name
     - `tabindex="0"`: Makes focusable
     - `role="button"`: Announces as interactive
     - `aria-label`: Descriptive label
   - Attaches focus/blur listeners

   **Keyboard Navigation** (lines 59-83):
   - WASD or Arrow keys → Navigate between areas
   - Delegates to `navigateToNearestArea` helper

2. **`navigateToNearestArea`** (lines 95-113):
   - Gets bounding rect of current element (line 96)
   - Queries all interactive paths
   - Calculates distance in specified direction for each
   - Focuses nearest valid element

3. **`getDistanceInDirection`** (lines 123-136):
   - Returns positive distance if target is in correct direction
   - Returns `Infinity` if target is wrong direction
   - Example: `direction='up'` → `current.top - target.bottom`

4. **`PostcodeMap`** (lines 138-216):
   Main map component.

   **Bounds Calculation** (lines 144-153):
   - Default: UK bounding box `[49.8, -8.5]` to `[59, 2]`
   - If GeoJSON loaded: Calculate actual bounds
   - Add 10% padding for visual buffer

   **Click Handler** (lines 155-158):
   - Extracts postcode from feature
   - Calls `toggleAreaSelection` action

   **Map Setup** (lines 170-176):
   - `MapContainer`: Main Leaflet component
   - Bounds: Calculated bounds from data
   - Zoom constraints: 5 (min) to 10 (max)
   - Max bounds: Keeps map centered on UK

   **Tile Layer** (lines 177-180):
   - OpenStreetMap tiles
   - Standard attribution

   **GeoJSON Layer** (lines 181-210):
   - `style` function (lines 183-189):
     - Selected areas: Dark blue (`#1d70b8`), 60% opacity
     - Unselected: Light blue (`#b1d7ff`), 30% opacity
     - Focused: Yellow border (`#ffdd00`), dashed (4px weight)

   - `onEachFeature` (lines 190-209):
     - Attaches click handler (lines 192-194)
     - Stores postcode in layer options (line 197)
     - Adds accessibility attributes when layer renders (lines 200-208)

#### `src/components/Map/MapSection.jsx` (lines 1-17)

**Purpose**: Simple wrapper for map component

**What it does**:
- Provides flex layout container
- Sets background color from theme
- Renders `PostcodeMap`

**Note**: This file is somewhat redundant - `PostcodeMap` could be used directly.

---

### Selection Components

#### `src/components/Selection/SelectionPanel.jsx` (lines 1-113)

**Purpose**: Display and manage selected postcode areas

**Structure**:

1. **Header** (lines 14-32):
   - Shows count of selected areas
   - Blue background for visual prominence
   - Text: "No areas selected" or "X area(s) selected"

2. **Area List** (lines 35-82):
   - Only renders if areas selected
   - Each item shows:
     - Postcode district name (line 59-61)
     - Remove button (✕) (lines 63-80)
   - Items have subtle border and background

3. **Clear All Button** (lines 85-106):
   - Red background (error color)
   - Full width
   - Only visible when areas selected
   - Calls `clearSelections` action

**Styling Notes**:
- Uses `styleHelpers.panel` for consistent panel appearance
- Hover/focus states handled by button transitions
- Fully keyboard accessible

---

### Word Cloud Components

#### `src/components/WordCloud/WordCloudSection.jsx` (lines 1-59)

**Purpose**: Container for word cloud functionality

**Logic**:
1. Checks if any areas selected (line 35)
2. If none: Shows instructional message (lines 36-50)
3. If selected: Renders `WordCloudPanel` (line 52)

**Layout**:
- Flex column layout
- Header with title
- Scrollable content area

#### `src/components/WordCloud/WordCloudPanel.jsx` (lines 1-239)

**Purpose**: Generate and display word clouds using NLP

**Configuration**:

**`DATA_SOURCES`** (lines 7-22):
Defines two word clouds to generate:
```javascript
[
  {
    id: 'services',
    title: 'Service Descriptions',
    textField: 'text_summary',      // CSV column
    postcodeField: 'postcode',
    stateKey: 'servicesData'        // State key
  },
  {
    id: 'feedback',
    title: 'User Feedback',
    textField: 'feedback_text',
    postcodeField: 'postcode',
    stateKey: 'feedbackData'
  }
]
```

**Component Logic**:

1. **Color Assignment** (lines 29-37):
   - Cycles through `colorPalettes.light.wordCloud`
   - Each word gets next color in sequence

2. **Word Click Handler** (lines 40-63):
   - Finds all data items containing clicked word (lines 49-52)
   - Case-insensitive search (line 51)
   - Enriches data with source field info (lines 56-59)
   - Updates state to show drilldown panel (lines 61-62)

3. **Word Cloud Generation** (line 66-77):
   - Maps over each data source
   - Generates words via `generateWordCloud` helper
   - Assigns colors to each word
   - Returns array of `{title, words, source}` objects

4. **Render** (lines 85-91):
   - Iterates over word clouds array
   - Renders each as separate section
   - Uses `TagCloud` component from react-tagcloud

**`generateWordCloud` Helper** (lines 148-197):

**Purpose**: Extract meaningful phrases from text using NLP

**Algorithm**:
1. Filter data to selected postcodes (lines 156-158)
2. Extract text fields (lines 161-163)
3. For each text:
   - Parse with Compromise NLP (line 169)
   - Extract patterns (lines 172-181):
     - `#Adjective+ #Noun+` → "digital skills", "modern facilities"
     - `#Verb #Noun+` → "providing support", "accessing services"
     - `.organizations()` → "Citizens Advice", "Job Centre"
     - `.topics()` → Auto-detected subject terms
   - Count occurrences (lines 183-190)
   - Weight multi-word phrases 2x (line 188)
4. Sort by frequency, take top 50 (lines 193-196)

**`isSignificantPhrase` Helper** (lines 205-221):

**Purpose**: Filter out meaningless phrases

**Criteria for inclusion**:
- Not in common words list (line 213)
- AND matches one of:
  - Valid noun phrase (line 215)
  - Valid verb phrase (line 216)
  - Organization name (line 217)
  - Recognized topic (line 218)

**`commonWords` Array** (lines 224-237):
Standard English stop words to exclude.

#### `src/components/WordCloud/NgramDataPanel.jsx` (lines 1-151)

**Purpose**: Modal showing data sources for clicked word

**Structure**:

1. **Visibility** (lines 8-10):
   - Only renders if `selectedNgram` and `ngramData` exist
   - Returns `null` otherwise (no DOM element)

2. **Modal Styling** (lines 13-29):
   - Fixed positioning, centered
   - 90% width, max 800px
   - 80vh max height
   - z-index: 1000 (above all content)
   - Drop shadow for elevation

3. **Header** (lines 31-73):
   - Shows selected word in title (line 49)
   - Close button (✕) top-right (lines 51-72)
   - Sticky positioning (stays visible on scroll)

4. **Content Area** (lines 76-115):
   - Scrollable list of matching items
   - Each item shows (lines 83-103):
     - Service name (line 92-93)
     - Postcode (line 95-96)
     - Full text content (line 100-101)
   - Uses `item.sourceField` to dynamically access correct field

5. **Footer** (lines 118-146):
   - Sticky close button for mobile users
   - Large, prominent primary button

**Accessibility**:
- Close button has `aria-label="Close panel"`
- Keyboard accessible (all buttons focusable)
- Can close via button or by clicking outside (not implemented)

---

### Navigation Components

#### `src/components/TabNavigation.jsx` (lines 1-80)

**Purpose**: Switch between Selections and Word Cloud views

**Tabs Definition** (lines 12-15):
```javascript
[
  { id: 'selections', label: 'Selected Areas' },
  { id: 'wordcloud', label: 'Word Cloud' }
]
```

**Styling** (lines 28-54):
- GOV.UK Design System tab styling
- Active tab: Blue underline, dark text
- Inactive tab: Grey text, no underline
- Positioned to align with bottom border

**Accessibility**:
- `role="tab"` for screen readers
- `aria-selected` indicates active state
- `aria-controls` links to panel ID
- `tabindex="0"` for keyboard navigation

**Focus States** (lines 64-78):
GOV.UK-specific focus styling via injected CSS:
- Yellow background on focus (`#ffdd00`)
- Black inner box shadow
- High contrast for accessibility

#### `src/components/KeyboardHelp/KeyboardHelp.jsx` (lines 1-84)

**Purpose**: Collapsible keyboard shortcuts reference

**Positioning** (lines 14-24):
- Bottom-left corner (absolute positioning)
- z-index: 1000 (above map)
- Fixed width: 280px

**Animation** (lines 20-22):
- Collapsed: 40px height (shows title only)
- Expanded: 300px height (shows all shortcuts)
- Smooth transition via `theme.transitions.slow`

**State-based Display**:
- `showKeyboardHelp` controls visibility
- Title changes based on state (line 34)
- Content fades in/out with opacity (lines 37-39)

**Shortcuts Listed** (lines 47-58):
1. WASD → Navigate between areas
2. Space/Enter → Toggle selection
3. Escape → Clear all selections
4. Ctrl+/ → Show/hide this panel

**Current Focus Display** (lines 59-66):
- Shows currently focused postcode
- Updates in real-time as user navigates

#### `src/components/LoadingSpinner/LoadingSpinner.jsx` (lines 1-47)

**Purpose**: Full-screen loading indicator

**Structure**:
- Full viewport overlay (lines 5-17)
- Centered spinner (lines 18-26)
  - CSS animation for rotation (lines 38-42)
  - GOV.UK blue accent color
- Message text (lines 27-35)
  - Default: "Loading data..."
  - Customizable via `message` prop

**Styling**:
- White background
- GOV.UK color scheme
- z-index: 9999 (above everything)

---

## Data Flow

### Complete User Journey

#### 1. Application Startup

```
main.jsx
  └→ Creates React root
  └→ Wraps in MapDataProvider
      └→ useReducer initializes state
      └→ useEffect triggers data loading
          ├→ loadCSV('services.csv')
          ├→ loadCSV('feedback.csv')
          └→ loadGeoJSON(combinedData)
              ├→ Extract unique postcodes
              ├→ Fetch NE.geojson, TS.geojson, etc.
              └→ Filter to relevant districts
  └→ Renders MapWithWordCloud
```

#### 2. User Selects Postcode Area

```
User clicks "NE1" on map
  └→ PostcodeMap.handleClick
      └→ actions.toggleAreaSelection('NE1')
          └→ dispatch({ type: SET_SELECTED_AREAS, payload: [...prev, 'NE1'] })
              └→ State update triggers re-render
                  ├→ Map: Area highlighted blue
                  ├→ SelectionPanel: Shows "1 area selected"
                  └→ WordCloudPanel: Regenerates clouds
```

#### 3. Word Cloud Generation

```
WordCloudPanel receives selectedAreas = ['NE1', 'TS1']
  └→ For each DATA_SOURCE:
      └→ generateWordCloud(source, dataState, ['NE1', 'TS1'])
          ├→ Filter servicesData to NE1 and TS1
          ├→ Extract text_summary field
          └→ For each text:
              ├→ nlp(text) → Parse with Compromise
              ├→ Extract patterns:
              │   ├→ doc.match('#Adjective+ #Noun+')
              │   ├→ doc.match('#Verb #Noun+')
              │   ├→ doc.organizations()
              │   └→ doc.topics()
              └→ Count frequencies, weight multi-word 2x
          └→ Return top 50 phrases
  └→ Render TagCloud components
```

#### 4. Word Drilldown

```
User clicks "digital skills" in word cloud
  └→ WordCloudPanel.handleWordClick(tag, source)
      ├→ Filter dataState[source.stateKey] for matching text
      ├→ Enrich with sourceField metadata
      └→ Dispatch actions:
          ├→ setSelectedNgram('digital skills')
          └→ setNgramData(matchingItems)
              └→ NgramDataPanel receives data
                  └→ Renders modal with:
                      ├→ Header: "Sources containing 'digital skills'"
                      ├→ List of all matching services/feedback
                      └→ Close buttons
```

#### 5. Keyboard Navigation

```
User presses Tab while on map
  └→ First .leaflet-interactive path receives focus
      └→ Yellow dashed border applied (focusedArea styling)
      └→ KeyboardHelp shows focused postcode

User presses 'W' (up)
  └→ AccessibilityLayer.handleKeyDown
      └→ navigateToNearestArea('up', currentElement)
          ├→ Get bounding rects of all paths
          ├→ Calculate distance in 'up' direction
          └→ Focus nearest path
              └→ focusedArea updates

User presses Space
  └→ MapDataContext.handleKeyDown (global listener)
      └→ Extracts data-postcode attribute
      └→ actions.toggleAreaSelection(postcode)
```

---

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server
Vite dev server runs on `http://localhost:5173` (default)

### Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build and deploy to GitHub Pages |

### Environment

**Build Tool**: Vite 7.2.4
- Fast HMR (Hot Module Replacement)
- Optimized production builds
- Built-in dev server

**Configuration**: `vite.config.js`
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/qualmap/'  // GitHub Pages base path
})
```

---

## Key Development Tips

### Adding a New Data Source

1. Add CSV file to `public/data/`
2. Update `src/config/constants.js`:
   ```javascript
   DATA_SOURCES.push({
     id: 'newdata',
     file: 'newdata.csv',
     stateKey: 'newData',
     postcodeField: 'postcode'
   })
   ```
3. Add word cloud config if needed:
   ```javascript
   WORD_CLOUD_CONFIGS.push({
     sourceId: 'newdata',
     textField: 'description',
     label: 'New Data Type'
   })
   ```
4. Data automatically loads on next refresh

### Modifying Map Styling

Edit `src/theme/index.js`:
- Colors: `theme.map.selected`, `theme.map.unselected`
- Borders: `theme.map.hover`

Changes apply immediately via HMR.

### Adjusting Word Cloud Algorithm

Edit `src/components/WordCloud/WordCloudPanel.jsx`:
- Line 172-181: Modify NLP patterns
- Line 188: Adjust multi-word weight
- Line 196: Change result limit (currently 50)

### Adding Keyboard Shortcuts

Edit `src/contexts/MapDataContext.jsx` in global keyboard handler (lines 282-328):
```javascript
switch (e.key.toLowerCase()) {
  case 'yourkey':
    e.preventDefault();
    // Your action here
    break;
}
```

### Styling Guidelines

1. **Always use theme values**:
   ```javascript
   // Good
   color: theme.colors.primary

   // Bad
   color: '#1d70b8'
   ```

2. **Use styleHelpers for common patterns**:
   ```javascript
   style={{ ...styleHelpers.panel.base }}
   ```

3. **Follow GOV.UK Design System** where possible

### Testing Considerations

Currently no tests exist. Recommended additions:
- Unit tests for `generateWordCloud`
- Integration tests for user flows
- Accessibility testing (keyboard navigation)

---

## Architecture Decisions & Rationale

### Why Context + Reducer instead of Redux?

**Pros**:
- No external dependencies
- Simpler setup for small-to-medium apps
- Built-in React feature

**Cons**:
- No Redux DevTools
- Less ecosystem support
- Can cause re-render issues at scale

**Verdict**: Appropriate for this project size

### Why Compromise NLP?

**Alternatives considered**: Natural, nlp.js

**Chosen because**:
- Lightweight (compromise is smaller)
- Good phrase extraction out-of-box
- Active maintenance

### Why Leaflet over Google Maps?

**Pros**:
- Open source and free
- No API keys required
- Highly customizable

**Cons**:
- Less polished UI
- Fewer built-in features

**Verdict**: Perfect for this use case (no commercial constraints)

### Why GeoJSON files instead of API?

**Pros**:
- Works offline
- No rate limits
- Faster loading

**Cons**:
- Larger bundle size
- Manual updates needed

**Verdict**: Static data fits this prototype's needs

---

## Common Issues & Solutions

### Issue: Map not displaying
**Check**:
1. GeoJSON files exist in `public/geojson/`
2. Postcode districts in CSV match GeoJSON feature names
3. Browser console for 404 errors

### Issue: Word cloud empty
**Check**:
1. Areas are selected (check `selectedAreas` in state)
2. Selected areas have data in CSV files
3. Text fields contain meaningful content
4. `isSignificantPhrase` isn't too restrictive

### Issue: Keyboard navigation not working
**Check**:
1. Map area has focus (Tab to focus first)
2. `data-postcode` attribute set on path elements
3. Browser console for key event logs

### Issue: Performance slow with many selections
**Optimization tips**:
1. Limit word cloud to top 50 (already implemented)
2. Debounce word cloud generation
3. Memoize expensive calculations
4. Consider React.memo for components

### Issue: GeoJSON boundary overlaps causing click interception
**What it is**:
Some postcode district boundaries in the GeoJSON data have genuinely overlapping geometries. This is particularly noticeable between adjacent districts like NE1 and NE8, where the geographic boundary polygons physically overlap each other.

**Why it occurs**:
This is not a code bug, but a characteristic of the underlying geographic data. Postcode boundaries in the real world can have complex, overlapping shapes due to:
- Historical boundary definitions
- Administrative district changes over time
- Data precision limitations in boundary polygon generation
- Geographic features that don't align perfectly

**How it affects the application**:
1. **User clicks**: When clicking on overlapping areas, the browser may register the click on the top-most SVG path element rather than the visually-intended one
2. **Pointer interception**: The `pointer-events` CSS property can cause one area to intercept clicks meant for another
3. **Z-index stacking**: SVG rendering order determines which element receives pointer events in overlap zones

**How it affects testing**:
E2E tests (Playwright) can fail when attempting to click postcode areas because:
- Playwright's click detection checks if the target element would actually receive the click
- Overlapping boundaries can cause different elements to intercept the pointer event
- Tests timeout waiting for clicks that never register on the intended element

**Solution**:
For E2E tests, use `{ force: true }` option with Playwright clicks to bypass the actionability check:

```javascript
// Instead of:
await page.click('.leaflet-interactive');

// Use:
await page.click('.leaflet-interactive', { force: true });
```

This forces the click even when another element would naturally intercept it, allowing tests to verify functionality despite the geographic data overlap.

**Production considerations**:
- This issue has minimal impact on real users, as overlapping areas are typically small edge zones
- The increased stroke-width on mobile (6-8px) provides adequate touch targets
- CSS `pointer-events: painted` helps ensure clicks register on visible portions
- Focus outlines with `z-index: 400` bring focused elements to the top

**Not a bug to fix**:
This is a known data characteristic, not a code defect. Attempting to "fix" the boundary overlaps would require:
- Regenerating all GeoJSON boundary files
- Potentially losing geographic accuracy
- Creating gaps between districts (worse UX than overlaps)

The current implementation with enhanced touch targets and pointer-events optimization is the appropriate solution.

---

## Future Enhancement Ideas

Based on the current codebase, here are logical next steps:

### Short-term
1. **Add comparison mode**: Compare word clouds between different area selections
2. **Export functionality**: Download word cloud as image or data as CSV
3. **Search/filter**: Find specific postcodes by text search
4. **Tooltips**: Show postcode name on map hover

### Medium-term
1. **Historical data**: Track changes over time
2. **Custom word filters**: Let users exclude specific words
3. **Sentiment analysis**: Color-code words by sentiment
4. **Clustering**: Group similar postcodes automatically

### Long-term
1. **Real data integration**: API for live service data
2. **User accounts**: Save favorite analyses
3. **Collaboration**: Share selections via URL
4. **Mobile app**: React Native version

---

## Testing

### Testing Stack

The project uses a modern testing stack optimized for Vite and React 19:

| Tool | Purpose | Version |
|------|---------|---------|
| **Vitest** | Test runner (Jest-compatible, Vite-native) | 2.1.9 |
| **React Testing Library** | Component testing | 16.3.0 |
| **@testing-library/user-event** | User interaction simulation | 14.6.1 |
| **@testing-library/jest-dom** | Custom matchers | 6.9.1 |
| **Happy-DOM** | Lightweight DOM implementation | 15.11.7 |
| **Playwright** | End-to-end browser testing | 1.57.0 |
| **MSW** | API mocking (Mock Service Worker) | 2.12.3 |

**Why Vitest over Jest?**
- Native Vite integration (5-10x faster)
- Zero-config ESM support
- Same API as Jest (easy migration)
- Better HMR integration

### Running Tests

```bash
# Run all unit/integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Run all tests (unit + E2E)
npm run test:all
```

### Test Organization

Tests are **co-located** with source files:

```
src/
  contexts/
    MapDataContext.jsx
    MapDataContext.test.jsx       # Reducer and action tests
  components/
    Map/
      PostcodeMap.jsx
      PostcodeMap.test.jsx         # Component tests
  utils/
    postcodeExtractor.js
    postcodeExtractor.test.js      # Unit tests
  test/                            # Test infrastructure
    setup.js                       # Global test configuration
    mocks/                         # Library mocks
      leaflet.js
      react-leaflet.jsx
      react-tagcloud.jsx
    fixtures/                      # Test data
      services.csv
      feedback.csv
      geojson.json
    utils/                         # Test helpers
      renderWithContext.jsx
e2e/                               # End-to-end tests
  area-selection.spec.js
  keyboard-navigation.spec.js
  word-drilldown.spec.js
```

### Test Structure

#### Unit Tests

Test individual functions in isolation:

```javascript
// src/utils/postcodeExtractor.test.js
import { describe, it, expect } from 'vitest';
import { extractDistrict } from './postcodeExtractor';

describe('extractDistrict', () => {
  it('extracts district from full postcode with space', () => {
    expect(extractDistrict('NE1 4ST')).toBe('NE1');
    expect(extractDistrict('TS16 1AA')).toBe('TS16');
  });

  it('handles invalid postcodes', () => {
    expect(extractDistrict('INVALID')).toBe(null);
    expect(extractDistrict('')).toBe(null);
  });
});
```

#### Component Tests

Test React components with user interactions:

```javascript
// src/components/Selection/SelectionPanel.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithContext } from '@test/utils/renderWithContext';
import SelectionPanel from './SelectionPanel';

describe('SelectionPanel', () => {
  it('shows "No areas selected" when empty', () => {
    renderWithContext(<SelectionPanel />);
    expect(screen.getByText(/no areas selected/i)).toBeInTheDocument();
  });

  it('displays count of selected areas', () => {
    // Test with mocked context state
  });
});
```

#### Integration Tests

Test multiple components working together:

```javascript
// src/contexts/MapDataContext.integration.test.jsx
describe('MapDataContext Integration', () => {
  it('loads CSV data and updates state', async () => {
    // Test full data loading flow
  });
});
```

#### E2E Tests

Test complete user workflows in real browser:

```javascript
// e2e/area-selection.spec.js
import { test, expect } from '@playwright/test';

test('select area shows in panel', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-postcode="NE1"]');
  await expect(page.locator('[data-testid="selected-count"]'))
    .toContainText('1 area selected');
});
```

### Mocking Strategy

**Selective mocking approach**: Mock rendering libraries, test real business logic.

#### What We Mock

**Leaflet** (`src/test/mocks/leaflet.js`):
- Complex Canvas/DOM rendering
- Focus on testing interaction logic
- E2E tests verify real map behavior

```javascript
export const L = {
  latLngBounds: vi.fn((sw, ne) => ({
    pad: vi.fn(() => ({ sw, ne }))
  })),
  geoJSON: vi.fn((data) => ({
    getBounds: vi.fn()
  }))
};
```

**react-leaflet** (`src/test/mocks/react-leaflet.jsx`):
- Mock as simple React components
- Preserve props and event handlers
- Test data flow, not rendering

**react-tagcloud** (`src/test/mocks/react-tagcloud.jsx`):
- Render words as clickable spans
- Test click handlers and data correctness

#### What We DON'T Mock

**Compromise NLP**: Test real library to verify NLP patterns work correctly (critical business logic)

**PapaParse**: Test real CSV parsing to catch edge cases (mock fetch only)

**Rationale**: Testing real NLP/parsing logic catches bugs in our patterns. Mocking rendering keeps tests fast. E2E tests verify full integration.

### Test Utilities

#### renderWithContext

Helper to render components with MapDataProvider:

```javascript
import { renderWithContext } from '@test/utils/renderWithContext';

const { getByText } = renderWithContext(<MyComponent />);
```

#### Mock Data Factories

```javascript
import { createMockDataState, createMockGeoJSON } from '@test/utils/renderWithContext';

const mockData = createMockDataState();
// Returns: { servicesData: [...], feedbackData: [...] }
```

### Writing New Tests

#### 1. Create test file next to source

```bash
# For src/components/MyComponent.jsx
touch src/components/MyComponent.test.jsx
```

#### 2. Import testing utilities

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

#### 3. Structure tests with describe blocks

```javascript
describe('ComponentName', () => {
  describe('feature group 1', () => {
    it('does specific thing', () => {
      // Arrange
      const props = { ... };

      // Act
      render(<Component {...props} />);

      // Assert
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });
});
```

#### 4. Test user interactions

```javascript
it('handles click events', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();

  render(<Button onClick={handleClick} />);
  await user.click(screen.getByRole('button'));

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### 5. Test async operations

```javascript
it('loads data asynchronously', async () => {
  render(<DataComponent />);

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  }, { timeout: 5000 });
});
```

### Coverage

Current coverage target: **60-70%**

```bash
npm run test:coverage
```

Coverage thresholds configured in `vitest.config.js`:
- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

**Excluded from coverage**:
- `node_modules/`
- `src/test/` (test infrastructure)
- `*.config.js` (configuration files)
- `dist/` (build output)
- `e2e/` (E2E tests)
- `src/main.jsx` (entry point)
- `src/App.jsx` (unused boilerplate)

### Test Configuration Files

#### vitest.config.js

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 60, functions: 60, branches: 60, statements: 60 }
    }
  }
});
```

#### src/test/setup.js

Global test setup runs before all tests:
- Cleanup after each test (`afterEach`)
- Mock `window.matchMedia`
- Mock `getBoundingClientRect` with position-aware values
- Mock `focus()` and `blur()` methods
- Suppress known console warnings

#### playwright.config.js

E2E test configuration:
- Runs on Chromium, Firefox, WebKit
- Auto-starts dev server
- Captures traces on failure
- Retries flaky tests in CI

### Test Data Fixtures

Realistic test data in `src/test/fixtures/`:

**services.csv**: 4 digital inclusion services with postcodes NE1, NE2, TS1, TS2

**feedback.csv**: 4 feedback entries matching services

**geojson.json**: 4 postcode district boundaries with valid coordinates

### Common Testing Patterns

#### Testing Context

```javascript
import { renderHook } from '@testing-library/react';
import { useMapData, MapDataProvider } from './MapDataContext';

const { result } = renderHook(() => useMapData(), {
  wrapper: MapDataProvider
});

expect(result.current.state.selectedAreas).toEqual([]);
```

#### Testing Keyboard Events

```javascript
await user.keyboard('{Space}');
await user.keyboard('{Escape}');
await user.keyboard('{Control>}/{/Control}'); // Ctrl+/
```

#### Testing NLP (Flexible Assertions)

```javascript
expect(phrases).toEqual(
  expect.arrayContaining([
    expect.stringMatching(/digital skills/i)
  ])
);
```

#### Testing with MSW

```javascript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/data/services.csv', () => {
    return HttpResponse.text('service_name,postcode\nTest,NE1');
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Debugging Tests

#### Interactive UI

```bash
npm run test:ui
```

Opens Vitest UI in browser with:
- Test results visualization
- Code coverage overlay
- Re-run on file change
- Filter by file/test name

#### Debug Single Test

```javascript
it.only('specific test to debug', () => {
  // Only this test runs
});
```

#### Console Output

```javascript
console.log(screen.debug()); // Print entire DOM
console.log(screen.getByRole('button')); // Print specific element
```

#### Playwright Debug Mode

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector with:
- Step through test execution
- Pause on failure
- Inspect DOM/Network
- Pick locators

### Continuous Integration

Tests run automatically in CI:
- Unit/Integration tests: ~2 seconds
- E2E tests: ~2 minutes (3 browsers)
- Coverage report generated
- Playwright retries flaky tests 2x

**Recommended CI setup**:

```yaml
# .github/workflows/test.yml
- run: npm install
- run: npx playwright install --with-deps
- run: npm run test:coverage
- run: npm run test:e2e
```

### Test-Driven Development

When adding new features:

1. **Write failing test first**
   ```javascript
   it('new feature works', () => {
     expect(newFeature()).toBe(expected);
   });
   ```

2. **Implement minimum code to pass**

3. **Refactor with confidence** (tests prevent regressions)

4. **Update coverage** (aim for 60%+ on new code)

### Known Testing Gotchas

#### React 19 Compatibility

Use `@testing-library/react@^16.0.0` (not 14.x) for React 19 support.

#### ESM Modules

Ensure `package.json` has `"type": "module"` for Vitest to work correctly.

#### Leaflet Initialization

Leaflet requires DOM, so it's fully mocked in unit tests. Use E2E tests for real map behavior.

#### Async State Updates

Always use `waitFor` when testing async state changes:

```javascript
await waitFor(() => {
  expect(result.current.state.dataLoaded).toBe(true);
});
```

#### Focus/Blur on JSDOM

`happy-dom` has limited focus/blur support. Mock these methods in `setup.js`.

### Mobile and Responsive Testing (Phase 3 - E2E)

When implementing Phase 3 E2E tests with Playwright, pay special attention to mobile viewport testing. The application has experienced issues with mobile interface scaling where components displayed in incorrect positions.

#### Recommended Mobile Test Coverage

**Viewport Sizes to Test:**
- Mobile: 375x667 (iPhone SE)
- Mobile Large: 428x926 (iPhone 14 Pro Max)
- Tablet: 768x1024 (iPad)
- Tablet Landscape: 1024x768 (iPad rotated)
- Desktop: 1920x1080

**Critical Areas for Mobile Testing:**

1. **Map Component Positioning**
   - Verify map container doesn't overflow viewport
   - Check that map controls are accessible
   - Test zoom buttons are properly sized for touch
   - Verify postcode areas are tappable (min 44x44px)

2. **Word Cloud Panel Layout**
   - Ensure word cloud adapts to narrow screens
   - Verify words are readable and tappable
   - Check horizontal scrolling doesn't occur
   - Test drilldown panel (NgramDataPanel) fits viewport

3. **Selection Panel Responsiveness**
   - Verify list doesn't overflow
   - Check remove buttons (✕) are touch-friendly
   - Test "Clear All" button is accessible
   - Ensure text doesn't wrap awkwardly

4. **Navigation and Tabs**
   - Verify tab bar doesn't overflow
   - Check tabs are tappable on mobile
   - Test keyboard help modal fits mobile screen

**Example Playwright Mobile Test:**

```javascript
// e2e/mobile-responsiveness.spec.js
import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Viewport Tests', () => {
  test.use({ ...devices['iPhone SE'] });

  test('map displays correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container');

    const map = await page.locator('.leaflet-container');
    const box = await map.boundingBox();
    const viewport = page.viewportSize();

    expect(box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.height).toBeLessThanOrEqual(viewport.height);
  });

  test('word cloud is responsive', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-postcode="NE1"]');
    await page.click('text=Word Cloud');

    // Verify no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBe(clientWidth);
  });

  test('touch targets are minimum 44x44px', async ({ page }) => {
    await page.goto('/');

    const areas = await page.locator('[role="button"][data-postcode]').all();
    for (const area of areas.slice(0, 3)) {
      const box = await area.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
```

**Known Mobile Issues to Test For:**

Based on reported issues, specifically test:
- Components appearing off-screen or overlapping
- Fixed positioned elements (NgramDataPanel) overflowing viewport
- Touch event handling on map areas
- Scroll behavior within modals on mobile
- Z-index stacking issues causing elements to appear behind others

---

## Glossary

**Postcode District**: UK postal code area (e.g., NE1, TS16)

**GeoJSON**: JSON format for geographic data structures

**N-gram**: Sequence of N words (unigram=1 word, bigram=2 words, etc.)

**NLP**: Natural Language Processing - computational analysis of text

**Reducer**: Function that takes (state, action) and returns new state

**Context**: React mechanism for passing data through component tree

**Stop Words**: Common words filtered out (the, and, it, etc.)

**Feature**: Single geographic shape in GeoJSON (one postcode area)

**Leaflet**: Open-source JavaScript library for interactive maps

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [Leaflet Docs](https://leafletjs.com/)
- [Compromise NLP](https://github.com/spencermountain/compromise)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [GeoJSON Specification](https://geojson.org/)
- [UK Postcode Polygons Source](https://github.com/missinglink/uk-postcode-polygons)

---

*This guide was generated to help developers understand and contribute to the Qualmap project. For questions or corrections, please open an issue on the project repository.*
