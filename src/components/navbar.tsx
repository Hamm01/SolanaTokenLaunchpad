
import React from 'react'
import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui'
import { ModeToggle } from './mode-toggle'
export const Navbar = () => {
    return (
        <section className='navbar  '>
            <div className='flex flex-row justify-between items-center'>
                <div className='flex flex-row justify-center items-center '>
                    <img src="./solanaMain.png" alt="Logo" width="80px"
                        height="80px" />
                    <h2 className='text-primary teko-regular font-bold scroll-m-20 text-4xl tracking-normal'>TokenLaunchpad</h2>
                </div>
                <div className='flex gap-4 flex-row justify-center items-center'>
                    <WalletMultiButton />
                    <ModeToggle />
                </div>

            </div>

        </section>
    )
}
