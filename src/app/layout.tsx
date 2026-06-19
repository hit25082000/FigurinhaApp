import type { Metadata } from "next";
import "./globals.css";
import { DevResetButton } from "@/components/DevResetButton";

export const metadata: Metadata = {
  title: "Minha Figurinha Copa 2026 | Crie sua Figurinha Personalizada",
  description: "Transforme-se em uma figurinha personalizada estilo álbum de futebol! Envie sua foto de rosto e faça parte da seleção.",
  icons: {
    icon: "/soccer-favicon.png",
    shortcut: "/soccer-favicon.png",
    apple: "/soccer-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <DevResetButton />
      </body>
    </html>
  );
}
