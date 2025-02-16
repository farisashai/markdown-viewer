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

// const inlineRegexMap = {
//   bold: /[*]{2}.*?[*]{2}/,
// };

// const markdownToInlineJSX = (value: string) => {
//   return (
//     <span>
//       {value.replaceAll(inlineRegexMap.bold, () => {
//         return '';
//       })}
//     </span>
//   );
// };

const regexMap = {
  h1: /^[#]{1}\s.*$/,
  h2: /^[#]{2}\s.*$/,
  h3: /^[#]{3}\s.*$/,
};

const MarkdownToBlockJSX = ({ value }: { value: string }) => {
  if (regexMap.h1.test(value))
    return (
      <>
        <h1>{value.slice(2)}</h1>
        <hr />
      </>
    );
  if (regexMap.h2.test(value)) return <h2>{value.slice(3)}</h2>;
  if (regexMap.h3.test(value)) return <h3>{value.slice(4)}</h3>;

  return <p>{value}</p>;
};

export default function Home() {
  const [rawInput, setRawInput] = useState<string>('');
  const parsedInput = useMemo(() => (rawInput?.length ? rawInput?.split('\n') : []), [rawInput]);

  useEffect(() => {
    const storedText = localStorage.getItem('rawText');
    if (storedText) setRawInput(storedText);
  }, []);

  useEffect(() => {
    localStorage.setItem('rawText', rawInput);
  }, [rawInput]);

  return (
    <div className={styles.page}>
      <textarea
        className={styles.editor}
        value={rawInput}
        onChange={e => setRawInput(e.target.value)}
      />
      <div className={styles.preview}>
        {trimRight(parsedInput).map((value, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <MarkdownToBlockJSX value={value} key={`${value}-${index}`} />
        ))}
      </div>
    </div>
  );
}
