// Container component for the map that handles layout and styling
import PostcodeMap from './PostcodeMap';
import { theme } from '../../theme';

const MapSection = () => {
  return (
    <div style={{ 
      flex: 1,
      height: '100%',
      backgroundColor: theme.colors.surface 
    }}>
      <PostcodeMap />
    </div>
  );
};

export default MapSection; 