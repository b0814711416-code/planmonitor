import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { SCHOOL_NAME } from "@/lib/constants";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `ระบบติดตามแผนงานโครงการ | ${SCHOOL_NAME}`,
  description: "ระบบจัดสรรและติดตามงบประมาณแผนปฏิบัติการประจำปี",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${geist.className} bg-slate-50 text-slate-900 antialiased`}>
        <Sidebar />
        <main className="ml-56 min-h-screen">
          <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
