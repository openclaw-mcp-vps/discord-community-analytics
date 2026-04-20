declare module "react-wordcloud" {
  import { ComponentType } from "react";

  type Word = { text: string; value: number };

  interface ReactWordcloudProps {
    words: Word[];
    options?: Record<string, unknown>;
    callbacks?: Record<string, unknown>;
    maxWords?: number;
  }

  const ReactWordcloud: ComponentType<ReactWordcloudProps>;

  export default ReactWordcloud;
}
