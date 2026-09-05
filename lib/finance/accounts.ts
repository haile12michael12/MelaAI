export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
}
