import { useMapData } from '../../contexts/MapDataContext';
import { TagCloud } from 'react-tagcloud';
import { theme, colorPalettes } from '../../theme';
import nlp from 'compromise';

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
      gap: theme.spacing.lg
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
            fontWeight: theme.typography.weights.medium
          }}>
            {title}
          </h3>
          <div style={{
            border: `${theme.borders.width.thin} solid ${theme.colors.border}`,
            borderRadius: theme.borders.radius.md,
            backgroundColor: theme.colors.surface,
            minHeight: '250px'
          }}>
            {words && words.length > 0 ? (
              <TagCloud
                minSize={14}
                maxSize={36}
                tags={words}
                colorOptions={{}}
                style={{
                  padding: theme.spacing.md,
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '250px'
                }}
                className="tag-cloud"
                onClick={tag => console.log('clicking on tag:', tag)}
              />
            ) : (
              <div style={{
                height: '250px',
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
  
  if (!data) {
    console.log('No data found for stateKey:', source.stateKey);
    return [];
  }

  const filteredData = data.filter(item => 
    selectedAreas.includes(item[source.postcodeField])
  );

  // Get all text fields
  const texts = filteredData
    .map(item => item[source.textField])
    .filter(text => text);

  // Process n-grams with NLP
  const phraseCount = {};
  
  texts.forEach(text => {
    const doc = nlp(text);

    // Extract meaningful phrases using NLP patterns
    const phrases = [
      // Noun phrases (e.g., "digital skills", "community support")
      ...doc.match('#Adjective+ #Noun+').out('array'),
      // Verb phrases (e.g., "providing support", "accessing services")
      ...doc.match('#Verb #Noun+').out('array'),
      // Organization names (e.g., "Citizens Advice", "Job Centre")
      ...doc.organizations().out('array'),
      // Topics (automatically detected subjects)
      ...doc.topics().out('array')
    ];

    // Process and count phrases
    phrases.forEach(phrase => {
      const normalized = phrase.toLowerCase();
      if (isSignificantPhrase(normalized)) {
        // Weight phrases by type (you can adjust these weights)
        const weight = phrase.includes(' ') ? 2 : 1;
        phraseCount[normalized] = (phraseCount[normalized] || 0) + weight;
      }
    });
  });

  return Object.entries(phraseCount)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
};

// Helper function to determine if a phrase is significant
const isSignificantPhrase = (phrase) => {
  const doc = nlp(phrase);
  
  // More sophisticated validation using NLP
  return (
    // Must contain at least one significant term
    !commonWords.includes(phrase) &&
    // Check for valid grammatical structures
    (
      // Valid noun phrase
      doc.match('#Adjective+ #Noun+').found ||
      // Valid verb phrase
      doc.match('#Verb #Noun+').found ||
      // Is an organization name
      doc.organizations().found ||
      // Is a known topic
      doc.topics().found
    )
  );
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