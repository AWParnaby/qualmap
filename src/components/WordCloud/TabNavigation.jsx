import { useMapData } from '../../contexts/MapDataContext';
import { theme } from '../../theme';

const TabNavigation = () => {
  const { state, actions } = useMapData();
  const { activeTab } = state;
  const { setActiveTab } = actions;

  const tabStyle = (isActive) => ({
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: isActive ? theme.colors.primary : theme.colors.background,
    color: isActive ? theme.colors.background : theme.colors.text,
    border: `${theme.borders.width.thin} solid ${isActive ? theme.colors.primary : theme.colors.border}`,
    borderRadius: theme.borders.radius.sm,
    cursor: 'pointer',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.regular,
    transition: theme.transitions.default,
    ':hover': {
      backgroundColor: isActive ? theme.colors.primaryDark : theme.colors.surface
    }
  });

  return (
    <div 
      role="tablist"
      style={{ 
        display: 'flex',
        gap: theme.spacing.sm
      }}
    >
      <button
        role="tab"
        aria-selected={activeTab === 'services'}
        onClick={() => setActiveTab('services')}
        style={tabStyle(activeTab === 'services')}
      >
        Service Descriptions
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'feedback'}
        onClick={() => setActiveTab('feedback')}
        style={tabStyle(activeTab === 'feedback')}
      >
        Feedback
      </button>
    </div>
  );
};

export default TabNavigation; 