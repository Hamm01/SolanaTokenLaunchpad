
import './App.css'

import '@solana/wallet-adapter-react-ui/styles.css'
import { WalletContext } from '@/components/walletContext'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/Footer'
import { TokenLaunchpad } from '@/components/TokenLaunchpadForm'

function App() {


  return (
    <div>
      <WalletContext>
        <main className='max-w-7xl  mx-auto flex flex-col gap-4 md:p-4 min-h-[92vh] '>

          <Navbar />

          <div className='flex flex-col pt-10 pb-10 justify-center items-center '>
            <TokenLaunchpad />

          </div>
          {/* <TokenLaunchpad></TokenLaunchpad> */}
        </main>
      </WalletContext>
      <Toaster position="top-center" expand={false} richColors />
      <Footer />
    </div>
  )
}

export default App
