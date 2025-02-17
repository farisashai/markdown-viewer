'use client';

import '@/styles/globals.scss';
import styles from '@/styles/pages/Home.module.scss';
import { useEffect, useMemo, useState } from 'react';

/**
 * Trim trailing empty lines from content
 * @param array Array of lines
 * @returns
 */
const collapseNewlines = (value: string) => value.replace(/\n{3,}/g, '\n\n').split('\n');

const inlineRegexMap = {
  bold: /[*]{2}(?<text>.*?)[*]{2}/,
  italics: /[*]{1}(?<text>.*?)[*]{1}/,
  link: /\[(?<text>.*?)\]\((?<link>.*?)\)/,
  code: /`(?<text>.*?)`/,
};

const blockRegexMap = {
  h1: /^[#]{1}\s(?<text>.*?)$/,
  h2: /^[#]{2}\s(?<text>.*?)$/,
  h3: /^[#]{3}\s(?<text>.*?)$/,
  hr: /^[-]{3}$/,
  blockquote: /^>\s(?<text>.*?)$/,
};

const InlineMarkdown = ({ value }: { value?: string }) => {
  if (!value) return <span>{value}</span>;

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, pattern] of Object.entries(inlineRegexMap)) {
    const match = pattern.exec(value);

    if (match) {
      const { groups } = match;
      const before = value.slice(0, match.index);
      const after = value.slice(match.index + match[0].length);

      let replacement = null;

      switch (key) {
        case 'bold':
          replacement = <strong>{groups?.text}</strong>;
          break;
        case 'italics':
          replacement = <em>{groups?.text}</em>;
          break;
        case 'link':
          replacement = <a href={groups?.link}>{groups?.text}</a>;
          break;
        case 'code':
          replacement = (
            <code>
              <InlineMarkdown value={groups?.text} />
            </code>
          );
          break;
        default:
      }

      if (replacement) {
        return (
          <span>
            <InlineMarkdown value={before} />
            {replacement}
            <InlineMarkdown value={after} />
          </span>
        );
      }
    }
  }

  return <span>{value}</span>;
};

const BlockMarkdown = ({ value }: { value: string }) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, pattern] of Object.entries(blockRegexMap)) {
    const match = pattern.exec(value);

    if (match) {
      const { groups } = match;

      switch (key) {
        case 'h1':
          return (
            <>
              <h1>
                <InlineMarkdown value={groups?.text} />
              </h1>
              <hr />
            </>
          );
        case 'h2':
          return (
            <h2>
              <InlineMarkdown value={groups?.text} />
            </h2>
          );
        case 'h3':
          return (
            <h3>
              <InlineMarkdown value={groups?.text} />
            </h3>
          );
        case 'hr':
          return <hr />;
        default:
      }
    }
  }

  // Show empty as newlines
  if (value === '') return <br />;

  return (
    <p>
      <InlineMarkdown value={value} />
    </p>
  );
};

// Perform block and inline element regex matching to find the raw displayed text element
const getRawText = (value: string) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, pattern] of Object.entries(blockRegexMap)) {
    const match = pattern.exec(value);

    if (match) {
      const { groups } = match;

      switch (key) {
        case 'h1':
          return getRawText(groups?.text);
        case 'h2':
          return getRawText(groups?.text);
        case 'h3':
          return getRawText(groups?.text);
        case 'hr':
          return null;
        default:
      }
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, pattern] of Object.entries(inlineRegexMap)) {
    const match = pattern.exec(value);

    if (match) {
      const { groups } = match;
      const before = value.slice(0, match.index);
      const after = value.slice(match.index + match[0].length);

      let replacement = null;

      switch (key) {
        case 'bold':
          replacement = groups?.text;
          break;
        case 'italics':
          replacement = groups?.text;
          break;
        case 'link':
          replacement = groups?.text;
          break;
        case 'code':
          replacement = groups?.text;
          break;
        default:
      }

      if (replacement) {
        return `${getRawText(before) ?? ''}${replacement}${getRawText(after) ?? ''}`;
      }
    }
  }

  return value;
};

const sampleText = `# Hello, World!
## Built by Faris Ashai
### February 15, 2025


This is a custom Markdown processor and previewer build in **Next.js with SCSS and TypeScript.**


The source code is public on [my Github](https://github.com/farisashai/markdown-viewer).
It is written using a very simple implementation of lexical tokenization and *parsing splitting text line by line and first parsing out blocks elements and then inline elements recursively.*

This demo text is showing all of the Markdown syntax that is currently supported.

To run this project locally, you can run \`git clone https://github.com/farisashai/markdown-viewer.git\` followed by \`yarn install && yarn dev\` in the repository folder.
`;

export default function Home() {
  const [rawInput, setRawInput] = useState<string>('');
  const parsedInput = useMemo(
    () => (rawInput?.length ? collapseNewlines(rawInput) : []),
    [rawInput]
  );

  // Populate input textarea from localStorage on initial render
  useEffect(() => {
    const storedText = localStorage.getItem('rawText');
    if (storedText) setRawInput(storedText);
    else setRawInput(sampleText);
  }, []);

  // Update localStorage on input value change
  useEffect(() => {
    localStorage.setItem('rawText', rawInput);
  }, [rawInput]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>Lines: {parsedInput.length}</div>
        <textarea
          className={styles.editor}
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
        />
      </div>
      <div className={styles.container}>
        <div className={styles.header}>{getRawText(parsedInput.find(value => value) ?? '')}</div>
        <div className={styles.preview}>
          {parsedInput.map((value, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <BlockMarkdown value={value} key={`${value}-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
