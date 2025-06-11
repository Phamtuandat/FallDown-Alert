export type DeviceStatus = {
  device_id?: string;
  status: "Active" | "Inactive";
  location: string;
  name: string;
  lastSeen: number;
  userStatus: UserStatus | undefined;
};

export type UserStatus = {
  needHelp: boolean;
  reason: string | null;
  reportedAt: number;
};

export type Device = {
  device_id?: string;
  name: string;
  phone: string;
  email: string;
  owner: string;
  createdAt: number;
  location: string;
};
