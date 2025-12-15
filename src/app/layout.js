import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Import the provider
import { ThemeToggle } from "@/components/theme-toggle"; // Import the toggle button

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EnglishMastery",
  description: "Academic English Learning Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning is needed because next-themes updates the HTML class */}
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ThemeToggle /> {/* Floating Toggle Button */}
        </ThemeProvider>
      </body>
    </html>
  );
}
