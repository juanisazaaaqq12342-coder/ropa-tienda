import type { Metadata } from "next";
import { PasswordRecovery } from "@/components/account";
export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false, follow: false } };
export default function RecoveryPage() { return <PasswordRecovery />; }
