import Topbar from '@/components/shared/Topbar'
import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import LeftSidebar from '@/components/shared/LeftSidebar'
import RightSidebar from '@/components/shared/RightSidebar'
import Bottombar from '@/components/shared/Bottombar'
import { dark } from "@clerk/themes";
import { ClerkProvider } from '@clerk/nextjs'
import { frFR } from "@clerk/localizations";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata  = {
  title: "Folikan",
  description: "Une application threads meta faite avec nextjs 13"
}


export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider 
      appearance={{
        baseTheme: dark,
      }}
      localization={frFR} 
    >
      <html lang="fr">
          <body className={inter.className}>
            <Topbar/>

            <main className='flex flex-row'>
              <LeftSidebar/>
              <section className='main-container'>
                <div className='w-full max-w-4x1'>{children}</div>
              </section>
              <RightSidebar/>
            </main>

            <Bottombar/>
          </body>
      </html>
    </ClerkProvider>
  )
}
