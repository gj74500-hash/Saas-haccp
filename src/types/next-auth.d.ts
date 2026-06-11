import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      companyId: string;
      role: "OWNER" | "MANAGER" | "EMPLOYEE";
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }

  interface User {
    companyId: string;
    role: "OWNER" | "MANAGER" | "EMPLOYEE";
    firstName: string;
    lastName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    companyId: string;
    role: "OWNER" | "MANAGER" | "EMPLOYEE";
    firstName: string;
    lastName: string;
  }
}
