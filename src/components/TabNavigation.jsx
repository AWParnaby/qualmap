// Navigation component that switches between the Selected Areas and Word Cloud views
// Follows GOV.UK Design System tab styling guidelines
import { useMapData } from '../contexts/MapDataContext';
import { theme } from '../theme';

const TabNavigation = () => {
  const { state, actions } = useMapData();
  const { activeTab } = state;
  const { setActiveTab } = actions;

  // Define available tabs
  const tabs = [
    { id: 'selections', label: 'Selected Areas' },
    { id: 'wordcloud', label: 'Word Cloud' }
  ];

  return (
    <div style={{
      borderBottom: `1px solid ${theme.colors.border}`,
      marginBottom: theme.spacing.md
    }}>
      <div style={{
        marginBottom: '-1px', // Align tabs with bottom border
        display: 'flex',
        gap: theme.spacing.sm
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              fontSize: theme.typography.sizes.body,
              // GOV.UK font stack
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
              fontWeight: 400,
              color: activeTab === tab.id ? theme.colors.text : theme.colors.textSecondary,
              background: 'none',
              border: 'none',
              // GOV.UK blue underline for active tab
              borderBottom: `2px solid ${activeTab === tab.id ? '#1d70b8' : 'transparent'}`,
              cursor: 'pointer',
              position: 'relative',
              marginBottom: '-2px',
              // GOV.UK specific text rendering
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textAlign: 'center'
            }}
            aria-selected={activeTab === tab.id}
            role="tab"
            aria-controls={`${tab.id}-panel`}
            tabIndex={0}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Add CSS for GOV.UK-style hover and focus states
const style = document.createElement('style');
style.textContent = `
  button[role="tab"]:hover {
    color: #0b0c0c !important;
    border-bottom-color: #1d70b8 !important;
  }
  
  button[role="tab"]:focus {
    outline: 3px solid #ffdd00 !important;
    outline-offset: 0 !important;
    background-color: #ffdd00 !important;
    box-shadow: inset 0 0 0 2px #0b0c0c !important;
  }
`;
document.head.appendChild(style);

export default TabNavigation; 