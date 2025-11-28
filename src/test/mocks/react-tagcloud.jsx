import { vi } from 'vitest';

// Mock TagCloud component from react-tagcloud
// Preserves onClick handler and renders words for testing

export const TagCloud = ({ tags, onClick, minSize, maxSize, ...props }) => (
  <div data-testid="tag-cloud" {...props}>
    {tags && tags.map((tag, idx) => (
      <span
        key={idx}
        data-testid={`word-${tag.value}`}
        data-count={tag.count}
        data-color={tag.color}
        onClick={() => onClick && onClick(tag)}
        style={{
          fontSize: `${minSize + (tag.count / 10)}px`,
          color: tag.color,
          cursor: 'pointer',
          margin: '4px'
        }}
      >
        {tag.value}
      </span>
    ))}
  </div>
);

// Mock the module
vi.mock('react-tagcloud', () => ({
  TagCloud
}));
