export type AlertMessage = {
  id: string;
  message: string;
  location: string | null;
  name: string | null;
  createdAt: number;
  read: boolean;
};
