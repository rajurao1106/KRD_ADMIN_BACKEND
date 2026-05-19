import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "KRD Admin Panel",
  description: "KRD Clean And Care - Admin Management Panel",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
