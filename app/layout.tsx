import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import './globals.css'

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Tobacco Inventory Management System",
  description: "Eastern Tobacco Association - Inventory Management",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* <Providers> */}
          {children}
        {/* </Providers> */}
      </body>
    </html>
  )
}
