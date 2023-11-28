import {ClerkProvider} from '@clerk/nextjs';
import {Inter} from "next/font/google"
import { frFR } from "@clerk/localizations";
import { Metadata } from 'next';
import { dark } from '@clerk/themes';

import "../globals.css"

const inter = Inter({ subsets: ["latin"]})

export const metadata: Metadata = {
    title: "Folikan",
    description: "Une application threads meta faite avec nextjs 13"
}

export default function RootLayout({
    children
}: { children : React.ReactNode 
}) {
    return (
        <ClerkProvider 
          localization={frFR}
          appearance={{
            baseTheme: dark
          }}
        >
          <html lang='fr'>
              <body className={`${inter.className} bg-dark-1`}>
                <div className='w-full flex justify-center items-center min-h-screen'>
                  {children}
                </div>
              </body>
          </html>
        </ClerkProvider>
    )
}