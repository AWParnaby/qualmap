// Panel that displays and manages the list of selected postcode areas
// Provides functionality to remove individual selections or clear all
import { useMapData } from '../../contexts/MapDataContext';
import { theme, styleHelpers } from '../../theme';

const SelectionPanel = () => {
  const { state, actions } = useMapData();
  const { selectedAreas } = state;
  const { toggleAreaSelection, clearSelections } = actions;

  return (
    <div style={{ ...styleHelpers.panel.base }}>
      {/* Header showing selection count */}
      <div style={{
        ...styleHelpers.panel.base,
        backgroundColor: theme.colors.primary,
        color: theme.colors.background,
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        marginBottom: selectedAreas.length > 0 ? theme.spacing.md : 0,
        boxShadow: theme.shadows.md
      }}>
        <p style={{ 
          fontSize: theme.typography.sizes.body, 
          margin: 0,
          fontWeight: theme.typography.weights.regular 
        }}>
          {selectedAreas.length === 0 
            ? 'No areas selected'
            : `${selectedAreas.length} area${selectedAreas.length !== 1 ? 's' : ''} selected`
          }
        </p>
      </div>

      {/* List of selected areas */}
      {selectedAreas.length > 0 && (
        <>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm,
            padding: theme.spacing.md
          }}>
            {selectedAreas.map(area => (
              <div 
                key={area}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borders.radius.sm,
                  border: `${theme.borders.width.thin} solid ${theme.colors.border}`
                }}
              >
                <span style={{
                  fontSize: theme.typography.sizes.body,
                  color: theme.colors.text
                }}>
                  {area}
                </span>
                {/* Remove button for individual selection */}
                <button
                  onClick={() => toggleAreaSelection(area)}
                  aria-label={`Remove ${area}`}
                  style={{
                    padding: theme.spacing.xs,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.colors.error,
                    fontSize: theme.typography.sizes.body,
                    display: 'flex',
                    alignItems: 'center',
                    transition: theme.transitions.default
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Clear all selections button */}
          <div style={{
            padding: theme.spacing.md,
            borderTop: `${theme.borders.width.thin} solid ${theme.colors.border}`
          }}>
            <button
              onClick={clearSelections}
              style={{
                width: '100%',
                padding: theme.spacing.sm,
                backgroundColor: theme.colors.error,
                color: theme.colors.background,
                border: 'none',
                borderRadius: theme.borders.radius.sm,
                cursor: 'pointer',
                fontSize: theme.typography.sizes.body,
                fontWeight: theme.typography.weights.medium,
                transition: theme.transitions.default
              }}
            >
              Clear All Selections
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SelectionPanel; 