// Next .js
import type { Metadata } from "next"

// Fonts
import { Geist, Geist_Mono } from "next/font/google"

// Styles
import "./globals.css"

// Initialize Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Error Handling System Boilerplate",
  description: "A Next.js boilerplate with a robust error handling system implemented.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
