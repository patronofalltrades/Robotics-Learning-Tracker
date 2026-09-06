import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "../components/app-provider";

export const metadata: Metadata = { title: "Robotics Learning Tracker", description: "A private Friday and Saturday learning log for Robotics and Physical AI." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppProvider>{children}</AppProvider></body></html>;
}
