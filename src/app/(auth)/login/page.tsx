import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — NoteFlow",
  description: "Sign in to your NoteFlow workspace",
};

export default function LoginPage() {
  return <LoginForm />;
}
