import { useState } from 'react'
import './App.css'

import '@solana/wallet-adapter-react-ui/styles.css'

import { WalletContext } from '@/components/walletContext'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/Footer'
import { TokenLaunchpad } from '@/components/TokenLaunchpadForm'

function App() {


  return (
    <div>
      <main className='max-w-7xl mx-auto flex flex-col gap-4 p-4 min-h-[92vh] '>
        <WalletContext>
          <Navbar />
          <div className='flex flex-col pt-10 pb-10 justify-center items-center '>
            <TokenLaunchpad />

          </div>
          {/* <TokenLaunchpad></TokenLaunchpad> */}
        </WalletContext>
      </main>
      <Footer />
    </div>
  )
}

export default App
