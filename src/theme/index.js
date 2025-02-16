// Theme configuration for consistent styling across the application
// Following GOV.UK Design System color palette and spacing guidelines
export const theme = {
  // Color palette
  colors: {
    primary: '#1d70b8',      // GOV.UK Blue
    primaryDark: '#003078',  // Dark Blue for hover states
    primaryLight: '#b1d7ff', // Light Blue for backgrounds
    background: '#ffffff',   // White
    text: '#0b0c0c',        // Black for main text
    textSecondary: '#505a5f',// Dark Grey for secondary text
    border: '#e5e5e5',      // Mid Grey for borders
    surface: '#f8f8f8',     // Light Grey for panels
    success: '#00703c',     // Green for success states
    error: '#d4351c'        // Red for error states
  },

  // Spacing scale
  spacing: {
    xs: '4px',   // Extra small spacing
    sm: '8px',   // Small spacing
    md: '16px',  // Medium spacing
    lg: '24px',  // Large spacing
    xl: '32px'   // Extra large spacing
  },

  // Typography settings
  typography: {
    // System font stack following GOV.UK guidelines
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
    sizes: {
      small: '14px',  // Small text
      body: '16px',   // Body text
      h3: '19px',     // Heading level 3
      h2: '24px',     // Heading level 2
      h1: '32px'      // Heading level 1
    },
    weights: {
      regular: 400,   // Regular text
      medium: 500,    // Medium emphasis
      bold: 700      // Strong emphasis
    }
  },

  // Shadow definitions
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',   // Subtle shadow
    md: '0 2px 4px rgba(0,0,0,0.1)',    // Medium shadow
    lg: '0 4px 6px rgba(0,0,0,0.1)'     // Pronounced shadow
  },

  // Border styles
  borders: {
    radius: {
      sm: '2px',    // Small border radius
      md: '4px',    // Medium border radius
      lg: '8px'     // Large border radius
    },
    width: {
      thin: '1px',    // Thin borders
      medium: '2px',  // Medium borders
      thick: '4px'    // Thick borders
    }
  },

  // Transition presets
  transitions: {
    default: 'all 0.2s ease',           // Default transition
    slow: 'all 0.3s ease-in-out'        // Slower transition
  },

  // Map-specific styles
  map: {
    selected: {
      fillColor: '#1d70b8',    // Selected area fill
      fillOpacity: 0.6,
      weight: 2,
      color: '#003078'         // Selected area border
    },
    unselected: {
      fillColor: '#b1d7ff',    // Unselected area fill
      fillOpacity: 0.3,
      weight: 2,
      color: '#1d70b8'         // Unselected area border
    },
    hover: {
      weight: 3,
      color: '#003078'         // Hover state border
    }
  }
};

// Helper functions for common style patterns
export const styleHelpers = {
  panel: {
    base: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.borders.radius.md,
      boxShadow: theme.shadows.sm
    },
    highlighted: {
      borderLeft: `${theme.borders.width.thick} solid ${theme.colors.primary}`,
      backgroundColor: theme.colors.surface
    }
  },
  button: {
    base: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.typography.sizes.body,
      fontFamily: theme.typography.fontFamily,
      border: 'none',
      borderRadius: theme.borders.radius.md,
      cursor: 'pointer',
      transition: theme.transitions.default
    },
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.background
    },
    secondary: {
      backgroundColor: theme.colors.background,
      border: `${theme.borders.width.medium} solid ${theme.colors.primary}`,
      color: theme.colors.primary
    }
  }
};

// Update the tag cloud colors to ensure better contrast
export const tagCloudOptions = {
  luminosity: 'dark',
  hue: 'multi',
  minSize: 14,
  maxSize: 32,
  fontFamily: theme.typography.fontFamily,
  padding: parseInt(theme.spacing.xs),
  colors: [
    '#1d70b8',  // GOV.UK Blue
    '#003078',  // Dark Blue
    '#0b0c0c',  // Black
    '#144e81',  // Mid Blue
    '#00437b',  // Navy
    '#2e3133',  // Dark Grey
    '#004d40',  // Dark Teal
    '#3b3b3b',  // Charcoal
  ]
};

// Define color palettes for different modes
export const colorPalettes = {
  light: {
    wordCloud: [
      '#1d70b8',  // GOV.UK Blue
      '#003078',  // Dark Blue
      '#0b0c0c',  // Black
      '#144e81',  // Mid Blue
      '#00437b',  // Navy
      '#2e3133',  // Dark Grey
      '#004d40',  // Dark Teal
      '#3b3b3b',  // Charcoal
      '#4c2c92',  // Purple
      '#006435',  // Dark Green
    ]
  },
  dark: {
    wordCloud: [
      '#b1d7ff',  // Light Blue
      '#ffffff',  // White
      '#e5e5e5',  // Light Grey
      '#d5e8f3',  // Pale Blue
      '#e7eaed',  // Pale Grey
      '#85994b',  // Light Green
      '#f499be',  // Light Pink
      '#f47738',  // Orange
    ]
  }
}; 