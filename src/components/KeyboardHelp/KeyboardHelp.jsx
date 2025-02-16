import { useEffect } from 'react';
import { useMapData } from '../../contexts/MapDataContext';
import { theme, styleHelpers } from '../../theme';

const KeyboardHelp = () => {
  const { state } = useMapData();
  const { showKeyboardHelp, focusedArea } = state;

  return (
    <div 
      role="region" 
      aria-label="Keyboard controls"
      style={{
        position: 'absolute',
        bottom: theme.spacing.md,
        left: theme.spacing.md,
        zIndex: 1000,
        ...styleHelpers.panel.base,
        ...styleHelpers.panel.highlighted,
        transition: theme.transitions.slow,
        maxHeight: showKeyboardHelp ? '300px' : '40px',
        overflow: 'hidden',
        width: '280px'
      }}
    >
      <h2 style={{ 
        fontSize: showKeyboardHelp ? theme.typography.sizes.h3 : theme.typography.sizes.body, 
        marginTop: 0,
        marginBottom: showKeyboardHelp ? theme.spacing.sm : 0,
        color: theme.colors.text,
        transition: theme.transitions.slow,
        fontWeight: theme.typography.weights.medium
      }}>
        {showKeyboardHelp ? 'Keyboard Controls' : 'Press Ctrl + / to show keyboard shortcuts'}
      </h2>
      <div style={{
        opacity: showKeyboardHelp ? 1 : 0,
        transition: theme.transitions.slow,
        transitionDelay: showKeyboardHelp ? '0.2s' : '0s'
      }}>
        <ul style={{ 
          listStyle: 'none', 
          margin: 0, 
          padding: 0,
          color: theme.colors.text
        }}>
          <li style={{ marginBottom: theme.spacing.sm }}>
            Use <kbd style={kbdStyle}>W</kbd> <kbd style={kbdStyle}>A</kbd> <kbd style={kbdStyle}>S</kbd> <kbd style={kbdStyle}>D</kbd> to navigate between postcode areas
          </li>
          <li style={{ marginBottom: theme.spacing.sm }}>
            Press <kbd style={kbdStyle}>Space</kbd> or <kbd style={kbdStyle}>Enter</kbd> to toggle an area's selection
          </li>
          <li style={{ marginBottom: theme.spacing.sm }}>
            Press <kbd style={kbdStyle}>Escape</kbd> to clear all selections
          </li>
          <li style={{ marginBottom: theme.spacing.sm }}>
            Press <kbd style={kbdStyle}>Ctrl</kbd> + <kbd style={kbdStyle}>/</kbd> to show/hide this panel
          </li>
          <li style={{ 
            marginTop: theme.spacing.md, 
            paddingTop: theme.spacing.md, 
            borderTop: `${theme.borders.width.thin} solid ${theme.colors.border}` 
          }}>
            Current focus: <span style={{ fontWeight: theme.typography.weights.medium }}>{focusedArea || 'None'}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

const kbdStyle = {
  backgroundColor: theme.colors.surface,
  border: `${theme.borders.width.thin} solid ${theme.colors.border}`,
  borderRadius: theme.borders.radius.sm,
  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
  fontSize: theme.typography.sizes.small,
  fontFamily: 'monospace',
  color: theme.colors.text,
  boxShadow: theme.shadows.sm,
  margin: `0 ${theme.spacing.xs}`
};

export default KeyboardHelp; 