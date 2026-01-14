// ./User/user.model.ts
/* =======================
   USERS TABLE
   ======================= */
export interface User {
  id: string;             // VARCHAR(10)
  username: string;       // VARCHAR(16)
  passwordHash: string;   // VARCHAR(255)
  email: string;          // VARCHAR(255)
  isActive: boolean;      // BOOLEAN
  createdAt: string;      // TIMESTAMP
  perId: string;          // VARCHAR(10)
}

/* =======================
   PROFILES TABLE
   ======================= */
export type Gender = "Nam" | "Nữ" | "Khác";

export interface Profile {
  userId: string;         // VARCHAR(10)
  fullName: string;       // VARCHAR(50)
  avatarUrl: string;      // TEXT
  phone: string;          // CHAR(10)
  birthday: string;       // DATE
  gender: Gender;
}

export interface UserFull {
  user: User;
  profile: Profile;
}

export const sampleUsers: User[] = [
  {
    id: "U001",
    username: "admin01",
    passwordHash: "$2b$10$adminhashedpassword", // giả lập
    email: "admin@celestebooks.com",
    isActive: true,
    createdAt: "2025-01-01T08:00:00",
    perId: "admin", // role admin
  },
  {
    id: "U002",
    username: "user01",
    passwordHash: "$2b$10$userhashedpassword",
    email: "user01@gmail.com",
    isActive: true,
    createdAt: "2025-01-03T10:30:00",
    perId: "user", // role user
  },
  {
    id: "U003",
    username: "user02",
    passwordHash: "$2b$10$user02hashedpassword",
    email: "user02@gmail.com",
    isActive: false,
    createdAt: "2025-01-05T14:20:00",
    perId: "user",
  },
];

export const sampleProfiles: Profile[] = [
  {
    userId: "U001",
    fullName: "Nguyễn Văn Admin",
    avatarUrl: "/img/avatar-admin.png",
    phone: "0901234567",
    birthday: "1990-01-15",
    gender: "Nam",
  },
  {
    userId: "U002",
    fullName: "Trần Thị User",
    avatarUrl: "/img/avatar-user.png",
    phone: "0912345678",
    birthday: "1998-06-20",
    gender: "Nữ",
  },
  {
    userId: "U003",
    fullName: "Lê Văn Khách",
    avatarUrl: "/img/avatar-default.png",
    phone: "0923456789",
    birthday: "2000-09-10",
    gender: "Khác",
  },
];