declare module 'markdown-it-toc-done-right' {
  import { PluginSimple } from 'markdown-it';

  interface TocPluginOptions {
    level?: number[];
    containerClass?: string;
    listClass?: string;
    itemClass?: string;
    linkClass?: string;
    anchorLink?: boolean;
    tocFirstLevel?: number;
    containerId?: string;
    markerPattern?: RegExp;
    listType?: 'ul' | 'ol';
  }

  const tocPlugin: PluginSimple<TocPluginOptions>;
  export default tocPlugin;
}