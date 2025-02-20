import { useMapData } from '../../contexts/MapDataContext';
import WordCloudPanel from './WordCloudPanel';
import { theme, styleHelpers } from '../../theme';

const WordCloudSection = () => {
  const { state } = useMapData();
  const { selectedAreas } = state;

  return (
    <div style={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.colors.background,
      ...styleHelpers.panel.base
    }}>
      <div style={{
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        borderBottom: `${theme.borders.width.thin} solid ${theme.colors.border}`
      }}>
        <h2 style={{
          fontSize: theme.typography.sizes.h2,
          margin: 0,
          color: theme.colors.text,
          fontWeight: theme.typography.weights.medium
        }}>
          Word Cloud Summary
        </h2>
      </div>
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: theme.spacing.md
      }}>
        {selectedAreas.length === 0 ? (
          <div style={{
            ...styleHelpers.panel.highlighted,
            padding: theme.spacing.md,
            maxWidth: '400px',
            textAlign: 'center',
            margin: '0 auto'
          }}>
            <p style={{ 
              margin: 0,
              color: theme.colors.text,
              fontSize: theme.typography.sizes.body
            }}>
              Select postcode areas on the map to see a word cloud summary.
            </p>
          </div>
        ) : (
          <WordCloudPanel />
        )}
      </div>
    </div>
  );
};

export default WordCloudSection; 