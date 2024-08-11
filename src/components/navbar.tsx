
import React from 'react'
import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui'
import { ModeToggle } from './mode-toggle'
export const Navbar = () => {
    return (
        <section className='navbar  '>
            <div className='flex flex-row justify-between items-center'>
                <div className='flex flex-row gap-3 justify-center items-center '>
                    <img src="./solanaLogoMark.svg" alt="Logo" width="50px"
                        height="50px" />
                    <h2 className='text-primary teko-regular font-bold scroll-m-20 text-3xl tracking-normal'>TokenLaunchpad</h2>
                </div>
                <div className='flex gap-4 flex-row justify-center items-center'>
                    <WalletMultiButton />
                    <ModeToggle />
                </div>

            </div>

        </section>
    )
}
