import type { Metadata } from "next";
import { Checkout } from "@/components/checkout";
export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false, follow: false } };
export default function CheckoutPage() { return <Checkout />; }
