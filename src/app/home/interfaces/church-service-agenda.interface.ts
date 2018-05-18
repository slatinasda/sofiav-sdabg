export interface IChurchServiceAgenda {
  id: number;
  day: string;
  label: string;
  time: { [key: string]: string };
  icon: string;
}
