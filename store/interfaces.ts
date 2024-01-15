import { providers } from "ethers";

export interface DBUser {
  address: string;
  createdAt: string;
  rounding: boolean;
  username: string;
}

export interface DBTransaction {
  receipt: providers.TransactionReceipt;
  from: string;
  fromUsername: string;
  to: string;
  amount: string;
  createdAt: string;
}
