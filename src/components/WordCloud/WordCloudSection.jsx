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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.md,
        overflow: 'auto'
      }}>
        {selectedAreas.length === 0 ? (
          <div style={{
            ...styleHelpers.panel.highlighted,
            padding: theme.spacing.md,
            maxWidth: '400px',
            textAlign: 'center'
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
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <WordCloudPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default WordCloudSection; 