import { useMapData } from '../../contexts/MapDataContext';
import { TagCloud } from 'react-tagcloud';
import { theme, colorPalettes } from '../../theme';

// Configuration for different data sources that will be visualized as word clouds
const DATA_SOURCES = [
  {
    id: 'services',
    title: 'Service Descriptions',
    textField: 'text_summary',      // Field containing the text to analyze
    postcodeField: 'postcode',      // Field containing the postcode
    stateKey: 'servicesData'        // Key in dataState where this data is stored
  },
  {
    id: 'feedback',
    title: 'User Feedback',
    textField: 'feedback_text',
    postcodeField: 'postcode',
    stateKey: 'feedbackData'
  }
];

const WordCloudPanel = () => {
  const { state } = useMapData();
  const { selectedAreas, dataState } = state;

  // Get colors from theme and set up color cycling
  const colors = colorPalettes.light.wordCloud;
  let colorIndex = 0;

  // Cycle through available colors for words
  const getNextColor = () => {
    const color = colors[colorIndex];
    colorIndex = (colorIndex + 1) % colors.length;
    return color;
  };

  console.log('Selected Areas:', selectedAreas);
  console.log('Data State:', dataState);

  // Generate word clouds for each data source
  const wordClouds = DATA_SOURCES.map(source => {
    console.log('Processing source:', source);
    const words = generateWordCloud(source, dataState, selectedAreas);
    console.log('Generated words for', source.title, ':', words);
    const coloredWords = words.map(word => ({
      ...word,
      color: getNextColor()
    }));
    return {
      title: source.title,
      words: coloredWords
    };
  });

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.lg,
      padding: theme.spacing.md
    }}>
      {wordClouds.map(({ title, words }) => (
        <div key={title} style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{
            fontSize: theme.typography.sizes.h3,
            margin: 0,
            marginBottom: theme.spacing.sm,
            color: theme.colors.text,
            fontWeight: theme.typography.weights.medium,
            padding: `0 ${theme.spacing.md}`
          }}>
            {title}
          </h3>
          <div style={{
            minHeight: '200px',
            border: `${theme.borders.width.thin} solid ${theme.colors.border}`,
            borderRadius: theme.borders.radius.md,
            backgroundColor: theme.colors.surface
          }}>
            {words && words.length > 0 ? (
              <TagCloud
                minSize={14}
                maxSize={36}
                tags={words}
                colorOptions={{}} // Disable random colors
                style={{
                  padding: theme.spacing.md,
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px'
                }}
                className="tag-cloud"
                onClick={tag => console.log('clicking on tag:', tag)}
              />
            ) : (
              <div style={{
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.textSecondary,
                padding: theme.spacing.md
              }}>
                No words found in selected areas
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Process text data to generate word cloud data
const generateWordCloud = (source, dataState, selectedAreas) => {
  const data = dataState[source.stateKey];
  console.log('First item in data:', data[0]);
  console.log('Available fields:', data[0] ? Object.keys(data[0]) : 'No data');
  
  if (!data) {
    console.log('No data found for stateKey:', source.stateKey);
    return [];
  }

  const filteredData = data.filter(item => {
    console.log('Item structure:', item);
    return selectedAreas.includes(item[source.postcodeField]);
  });
  
  console.log('Filtered data for', source.title, ':', filteredData);

  // Get all text fields
  const texts = filteredData.map(item => {
    console.log('Item fields available:', Object.keys(item));
    const text = item[source.textField];
    console.log(`Text from field ${source.textField}:`, text);
    return text;
  });
  console.log('Extracted texts:', texts);

  // Combine all text and split into words
  const combinedText = texts.filter(text => text).join(' ');
  console.log('Combined text:', combinedText);

  const words = combinedText
    .toLowerCase()
    .split(/\W+/)
    .filter(word => 
      word.length > 2 && 
      !commonWords.includes(word)
    );

  console.log('Processed words:', words);

  // Count word frequencies
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  console.log('Word counts:', wordCount);

  // Convert to format needed by TagCloud
  return Object.entries(wordCount)
    .map(([value, count]) => ({
      value,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
};

// Common English words to exclude from word clouds
const commonWords = [
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
  'give', 'day', 'most', 'us'
];

export default WordCloudPanel; 