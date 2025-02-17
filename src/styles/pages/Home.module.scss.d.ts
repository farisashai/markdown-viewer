export type Styles = {
  container: string;
  editor: string;
  header: string;
  page: string;
  preview: string;
  toggle: string;
  toggleBtn: string;
  wrapper: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
