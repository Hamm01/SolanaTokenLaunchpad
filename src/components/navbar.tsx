
import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui'
import { ModeToggle } from './mode-toggle'

export const Navbar = () => {
    return (
        <section className='navbar'>
            <div className='flex mobile:flex-col mobile:max-sm:gap-4 mobile:items-start md:flex-row md:justify-between md:items-center mobile:p-4 lg:p-0 lg:pt-2'>
                <div className='flex flex-row mobile:gap-1 md:gap-3 justify-center items-center '>
                    <img src="./solanaLogoMark.svg" alt="Logo" className={`mobile:w-[40px] md:w-[50px]`} />
                    <h2 className='text-primary teko-regular mobile:max-sm:text-[24px] font-bold scroll-m-20 text-3xl tracking-normal'>TokenLaunchpad</h2>
                </div>
                <div className='flex gap-4 flex-row mobile:max-sm:w-[320px] mobile:items-center mobile:justify-end  md:justify-center md:items-center'>

                    <WalletMultiButton />
                    <div className='mobile:max-sm:hidden'>
                        <ModeToggle />
                    </div>
                </div>

            </div>

        </section>
    )
}
