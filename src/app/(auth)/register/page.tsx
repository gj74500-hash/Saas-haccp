import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Start free trial" };

export default function RegisterPage() {
  return <RegisterForm />;
}
