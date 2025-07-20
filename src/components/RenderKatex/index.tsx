import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface RenderKatexProps {
  content: string;
}

const RenderKatex: React.FC<RenderKatexProps> = ({ content }) => {
  return (
    <div
      className="katex-container"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(content, {
          throwOnError: false,
          displayMode: true,
          trust: true,
          strict: 'ignore'
        })
      }}
    />
  );
};

export default RenderKatex;