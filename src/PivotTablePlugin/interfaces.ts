
export interface IPersistAbleState {
  name: string;
  tableState: ITableState;
}

export interface ITableState {
  [key: string]: string | string[] | ITableState;
}