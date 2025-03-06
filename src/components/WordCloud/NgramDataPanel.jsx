import { useMapData } from '../../contexts/MapDataContext';
import { theme } from '../../theme';

const NgramDataPanel = () => {
  const { state, actions } = useMapData();
  const { selectedNgram, ngramData } = state;

  // Add debugging logs
  console.log('NgramDataPanel rendering with:', { selectedNgram, ngramData });

  if (!selectedNgram || !ngramData) {
    console.log('NgramDataPanel not showing - missing data');
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borders.radius.md,
      boxShadow: theme.shadows.lg,
      maxWidth: '800px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto',
      zIndex: 1000, // Ensure it appears above other elements
      border: `1px solid ${theme.colors.border}`,
      color: theme.colors.text
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        borderBottom: `1px solid ${theme.colors.border}`,
        paddingBottom: theme.spacing.sm
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
            console.log('Close button clicked');
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
            transition: 'background-color 0.2s',
            ':hover': {
              backgroundColor: theme.colors.backgroundAlt
            }
          }}
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>
      
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
  );
};

export default NgramDataPanel;