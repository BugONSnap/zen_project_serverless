export interface Locals {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface User {
  username: string;
  email: string;
  password: string;
  uniqueInfo: string;
  totalPoints: number;
  rankId: number;
}
