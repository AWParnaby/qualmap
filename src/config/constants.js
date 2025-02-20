import { theme } from '../theme';

// GOV.UK Design System color palette with lighter emphasis
export const govukColors = theme.colors;

// Data source configurations
export const DATA_SOURCES = [
  {
    id: 'services',
    file: 'services.csv',
    stateKey: 'servicesData',
    postcodeField: 'postcode',
  },
  {
    id: 'feedback',
    file: 'feedback.csv',
    stateKey: 'feedbackData',
    postcodeField: 'postcode',
  }
];

// Word cloud configurations
export const WORD_CLOUD_CONFIGS = [
  {
    sourceId: 'services',
    textField: 'text_summary',
    label: 'Service Descriptions'
  },
  {
    sourceId: 'feedback',
    textField: 'feedback_text',
    label: 'Feedback Text'
  }
];

// Common words to exclude from word clouds
export const COMMON_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
  'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
  'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
  'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
  'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
  'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us',
  'service', 'services',
  'digital', 'online',
  'help', 'helped', 'helping',
  'need', 'needs', 'needed',
  'use', 'used', 'using',
  'provide', 'provides', 'provided',
  'support', 'supports', 'supported',
];

// Map feature styling with lighter colors
export const featureStyle = (feature, isSelected) => 
  isSelected ? theme.map.selected : theme.map.unselected;

// Tag cloud options with lighter styling
export const tagCloudOptions = {
  luminosity: 'light',
  hue: 'blue',
  minSize: parseInt(theme.typography.sizes.body),
  maxSize: parseInt(theme.typography.sizes.h1),
  fontFamily: theme.typography.fontFamily,
  padding: parseInt(theme.spacing.xs),
  backgroundColor: theme.colors.background,
  colors: [
    theme.colors.primary,
    theme.colors.primaryDark,
    theme.colors.primaryLight
  ]
}; 