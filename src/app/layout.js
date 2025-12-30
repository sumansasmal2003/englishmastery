import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Import the provider
import { ThemeToggle } from "@/components/theme-toggle"; // Import the toggle button


export const metadata = {
  title: "EnglishMastery",
  description: "Academic English Learning Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Replaced inter.className with standard Tailwind font classes */}
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
