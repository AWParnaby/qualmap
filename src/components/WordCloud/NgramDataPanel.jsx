import { useMapData } from '../../contexts/MapDataContext';
import { theme } from '../../theme';

const NgramDataPanel = () => {
  const { state, actions } = useMapData();
  const { selectedNgram, ngramData } = state;

  if (!selectedNgram || !ngramData) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borders.radius.md,
      boxShadow: theme.shadows.lg,
      maxWidth: '800px',
      width: '90%',
      maxHeight: '80vh',
      zIndex: 1000,
      border: `1px solid ${theme.colors.border}`,
      color: theme.colors.text,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Fixed header with close button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottom: `1px solid ${theme.colors.border}`,
        position: 'sticky',
        top: 0,
        backgroundColor: theme.colors.surface,
        zIndex: 1,
        borderTopLeftRadius: theme.borders.radius.md,
        borderTopRightRadius: theme.borders.radius.md
      }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.typography.sizes.h3,
          color: theme.colors.text
        }}>
          Sources containing "{selectedNgram}"
        </h3>
        <button
          onClick={() => {
            actions.setSelectedNgram(null);
            actions.setNgramData(null);
          }}
          style={{
            border: 'none',
            background: theme.colors.surface,
            cursor: 'pointer',
            padding: theme.spacing.sm,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.md
          }}
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>
      
      {/* Scrollable content area */}
      <div style={{
        padding: theme.spacing.lg,
        overflowY: 'auto'
      }}>
        {ngramData && ngramData.length > 0 ? (
          <div>
            {ngramData.map((item, index) => (
              <div key={index} style={{
                padding: theme.spacing.md,
                borderBottom: `1px solid ${theme.colors.border}`,
                marginBottom: theme.spacing.sm,
                backgroundColor: theme.colors.background,
                borderRadius: theme.borders.radius.sm,
                color: theme.colors.text
              }}>
                <div style={{ marginBottom: theme.spacing.sm }}>
                  <strong>Service: </strong>{item.service_name}
                </div>
                <div style={{ marginBottom: theme.spacing.sm }}>
                  <strong>Postcode: </strong>{item.postcode}
                </div>
                <div style={{
                  whiteSpace: 'pre-wrap'
                }}>
                  <strong>Text: </strong>
                  {item[item.sourceField] || "No text available"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: theme.spacing.md,
            textAlign: 'center',
            color: theme.colors.textSecondary
          }}>
            No matching data found
          </div>
        )}
      </div>
      
      {/* Fixed close button at the bottom for mobile users */}
      <div style={{
        padding: theme.spacing.md,
        borderTop: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justifyContent: 'center',
        position: 'sticky',
        bottom: 0,
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: theme.borders.radius.md,
        borderBottomRightRadius: theme.borders.radius.md
      }}>
        <button
          onClick={() => {
            actions.setSelectedNgram(null);
            actions.setNgramData(null);
          }}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: theme.borders.radius.sm,
            cursor: 'pointer',
            fontWeight: theme.typography.weights.medium
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NgramDataPanel;