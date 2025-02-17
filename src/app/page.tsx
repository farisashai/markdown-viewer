'use client';

import '@/styles/globals.scss';
import styles from '@/styles/pages/Home.module.scss';
import { useEffect, useMemo, useState } from 'react';

const trimRight = (array: string[]) => {
  return array.reduceRight<string[]>((acc, curr) => {
    if (!acc?.length && curr === '') return [];
    return [curr, ...acc];
  }, []);
};

const inlineRegexMap = {
  bold: /[*]{2}(?<text>.*?)[*]{2}/,
  italics: /[*]{1}(?<text>.*?)[*]{1}/,
  link: /\[(?<text>.*?)\]\((?<link>.*?)\)/,
  code: /`(?<text>.*?)`/,
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

const regexMap = {
  h1: /^[#]{1}\s(?<text>.*?)$/,
  h2: /^[#]{2}\s(?<text>.*?)$/,
  h3: /^[#]{3}\s(?<text>.*?)$/,
  hr: /^[-]{3}$/,
  blockquote: /^>\s(?<text>.*?)$/,
};

const MarkdownToBlockJSX = ({ value }: { value: string }) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, pattern] of Object.entries(regexMap)) {
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

  return (
    <p>
      <InlineMarkdown value={value} />
    </p>
  );
};

export default function Home() {
  const [rawInput, setRawInput] = useState<string>('');
  const parsedInput = useMemo(
    () => (rawInput?.length ? trimRight(rawInput?.split('\n')) : []),
    [rawInput]
  );

  useEffect(() => {
    const storedText = localStorage.getItem('rawText');
    if (storedText) setRawInput(storedText);
  }, []);

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
        <div className={styles.header}>test</div>
        <div className={styles.preview}>
          {parsedInput.map((value, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <MarkdownToBlockJSX value={value} key={`${value}-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
