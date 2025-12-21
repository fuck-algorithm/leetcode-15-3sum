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
  const [language, setLanguage] = useState<ProgrammingLanguage>('python');

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

  // 获取某行的变量值
  const getLineVariables = (lineNumber: number): VariableState[] => {
    return variables.filter(v => {
      // 简单映射：根据变量名和当前高亮行判断
      const varLineMap: Record<string, number[]> = {
        'nums': [3, 2, 3, 2],
        'n': [4, 3, 4, 3],
        'i': [8, 7, 8, 7],
        'left': [14, 11, 14, 11],
        'right': [15, 12, 15, 12],
        'sum': [17, 14, 17, 14],
        'target': [18, 14, 18, 14],
        'triplet': [20, 16, 20, 16],
        'result': [32, 27, 32, 27]
      };
      const langIndex = LANGUAGES.indexOf(language);
      const varLines = varLineMap[v.name];
      if (varLines && varLines[langIndex] === lineNumber) {
        return true;
      }
      return false;
    });
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
