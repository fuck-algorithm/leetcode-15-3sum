import { useEffect, useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import type { ProgrammingLanguage, AlgorithmStep, VariableState } from '../../types';
import { CODE_SNIPPETS, LANGUAGE_NAMES } from '../../algorithms/codeSnippets';
import { getLanguage, saveLanguage } from '../../utils/storage';
import './CodePanel.css';

interface CodePanelProps {
  currentStep: AlgorithmStep | null;
}

const LANGUAGES: ProgrammingLanguage[] = ['java', 'python', 'golang', 'javascript'];

const PRISM_LANGUAGE_MAP: Record<ProgrammingLanguage, string> = {
  java: 'java',
  python: 'python',
  golang: 'go',
  javascript: 'javascript'
};

export function CodePanel({ currentStep }: CodePanelProps) {
  const [language, setLanguage] = useState<ProgrammingLanguage>('java');

  useEffect(() => {
    getLanguage().then(setLanguage);
  }, []);

  const handleLanguageChange = (lang: ProgrammingLanguage) => {
    setLanguage(lang);
    saveLanguage(lang);
  };

  const code = CODE_SNIPPETS[language];
  const highlightedLines = currentStep?.codeLines[language] || [];
  const variables = currentStep?.variables || [];

  const getLineVariables = (lineNumber: number): VariableState[] => {
    if (!highlightedLines.includes(lineNumber)) return [];
    return variables.filter(variable => variable.highlight).slice(0, 3);
  };

  return (
    <div className="code-panel">
      <div className="code-header">
        <div className="language-tabs">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              className={`language-tab ${language === lang ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang)}
            >
              {LANGUAGE_NAMES[lang]}
            </button>
          ))}
        </div>
      </div>
      
      <div className="code-container">
        <Highlight
          theme={themes.vsLight}
          code={code}
          language={PRISM_LANGUAGE_MAP[language]}
        >
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre className="code-pre">
              {tokens.map((line, i) => {
                const lineNumber = i + 1;
                const isHighlighted = highlightedLines.includes(lineNumber);
                const lineVars = getLineVariables(lineNumber);
                
                return (
                  <div
                    key={i}
                    {...getLineProps({ line })}
                    className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
                  >
                    <span className="line-number">{lineNumber}</span>
                    <span className="line-content">
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                    {lineVars.length > 0 && (
                      <span className="line-variables">
                        {lineVars.map((v, idx) => (
                          <span key={idx} className={`variable ${v.highlight ? 'highlight' : ''}`}>
                            {v.name}: {formatValue(v.value)}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}

function formatValue(value: string | number | number[] | number[][]): string {
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      return `[${(value as number[][]).map(arr => `[${arr.join(',')}]`).join(', ')}]`;
    }
    return `[${value.join(', ')}]`;
  }
  return String(value);
}
