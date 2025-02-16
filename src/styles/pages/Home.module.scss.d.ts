export type Styles = {
  editor: string;
  page: string;
  preview: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
