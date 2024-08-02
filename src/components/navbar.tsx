
import React from 'react'
import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui'
import { ModeToggle } from './mode-toggle'
export const Navbar = () => {
    return (
        <section className='navbar '>
            <div className='flex flex-row justify-between items-center '>
                <div className='flex flex-row justify-center items-center gap-2'>
                    <img src="./solanaLogo.svg" alt="Logo" width="250px"
                        height="250px" />
                    <h2 className='text-white scroll-m-20 text-md font-semibold tracking-tight'>TokenGenerator</h2>
                </div>
                <div className='flex gap-4 flex-row justify-center items-center'>
                    <WalletMultiButton />
                    <ModeToggle />
                </div>

            </div>

        </section>
    )
}
