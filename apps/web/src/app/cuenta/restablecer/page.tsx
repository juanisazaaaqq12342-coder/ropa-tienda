import type { Metadata } from "next";
import { PasswordRecovery } from "@/components/account";
export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false, follow: false } };
export default function ResetPage() { return <PasswordRecovery reset />; }
