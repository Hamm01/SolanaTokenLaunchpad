
import {
    ConnectionProvider,
    WalletProvider
} from '@solana/wallet-adapter-react'
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui'

export const WalletContext = ({ children }: any) => {
    const endPoint = 'https://api.devnet.solana.com'
    return (
        <div>
            <ConnectionProvider endpoint={endPoint}>
                <WalletProvider wallets={[]} autoConnect>
                    <WalletModalProvider>
                        {children}
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </div>
    )
}
