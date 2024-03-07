export interface ProgressiveTextProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  period?: number | string;
  onCharacter?: () => void;
}
