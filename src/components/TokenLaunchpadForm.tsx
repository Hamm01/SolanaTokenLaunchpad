import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { handleUpload } from "@/lib/fileupload"
import { TokenInfoDialogBox, ErrorInfoDialogBox } from "@/components/DialogBox"
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js"
import { createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddress, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"


const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name should be at least 2 characters",
    }),
    symbol: z.string().min(1, {
        message: "Symbol should be at least 1 character"
    }).max(8, { message: "Symbol should be less than 8 character" }),
    description: z.string().min(5, {
        message: "Description should be at least 5 character"
    }),
    imageFile: z
        .instanceof(File)
        .refine((file) => file.type === "image/jpeg" || file.type === "image/png", {
            message: "File must be in .jpg, .jpeg, or .png format",
        }),
    supply: z.coerce.number().min(0, {
        message: "Supply must be a zero or postive number"
    }),
    decimals: z.coerce.number().min(0, {
        message: "Decimal in range of 0 to 9 "
    }).max(9, {
        message: "Decimal in range of 0 to 9"
    })
})

export function TokenLaunchpad() {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [dialogopen, setDialogopen] = useState(false)
    const [loading, setLoading] = useState(false);
    const [errdialogopen, setErrdialogopen] = useState(false)
    const [tokenInfoStore, setTokenInfoStore] = useState({})
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            symbol: '',
            description: '',
            imageFile: undefined,
            decimals: 0,
            supply: 0

        },
        mode: 'onChange',
    });
    const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        const metaDataURI = await handleFileUpload({ ...values })
        if (wallet.publicKey) {
            await createToken({ ...values, metaDataURI, walletPubkey: wallet.publicKey })

        }
        form.reset()

    }

    async function handleFileUpload({ name, symbol, description, imageFile }: z.infer<typeof formSchema>) {
        const ImageUri = await handleUpload(imageFile)
        const jsonFile = new File([JSON.stringify({
            name,
            symbol,
            description,
            image: ImageUri
        })], 'metadata.json', { type: 'application/json' });
        const metaDataURI = await handleUpload(jsonFile)
        return metaDataURI
    }

    async function createToken({ metaDataURI, name, symbol, decimals, supply, walletPubkey }: any) {
        const mintKeypair = Keypair.generate();
        const mintKeypairPubkey = mintKeypair.publicKey.toBase58()
        const metaData = {
            mint: mintKeypair.publicKey,
            name,
            symbol,
            uri: metaDataURI,
            additionalMetadata: []
        }
        const mintLen = getMintLen([ExtensionType.MetadataPointer])
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metaData).length
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
        let transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: walletPubkey,
                newAccountPubkey: mintKeypair.publicKey,
                lamports,
                space: mintLen,
                programId: TOKEN_2022_PROGRAM_ID
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, walletPubkey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintKeypair.publicKey, decimals, walletPubkey, null, TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metaData.name,
                symbol: metaData.symbol,
                uri: metaData.uri,
                mintAuthority: walletPubkey,
                updateAuthority: walletPubkey
            }))
        transaction.feePayer = walletPubkey
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
        transaction.partialSign(mintKeypair)
        await wallet.sendTransaction(transaction, connection)
        toast.success(`Token mint created at ${mintKeypair.publicKey.toBase58()}`)
        console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`)

        // Creating ATA for the mint token
        const associatedTokenAccountAddress = await getAssociatedTokenAddress(
            mintKeypair.publicKey,    // Mint address of the token
            walletPubkey,             // Owner of the token account
            false,
            TOKEN_2022_PROGRAM_ID,
        )
        toast.success(`Associated Token Account Address: ${associatedTokenAccountAddress}`)
        console.log("Associated Token Account Address: ", associatedTokenAccountAddress)
        let associatedAccountSignature
        try {
            const accountInfo = await connection.getAccountInfo(associatedTokenAccountAddress);
            if (accountInfo === null) {

                const createAtaInstruction = createAssociatedTokenAccountInstruction(
                    walletPubkey,                  // Payer for creating the account
                    associatedTokenAccountAddress, // Associated token account address
                    walletPubkey,                  // Owner of the token account
                    mintKeypair.publicKey,          // Mint token address
                    TOKEN_2022_PROGRAM_ID,
                );
                transaction = new Transaction().add(createAtaInstruction);
                transaction.feePayer = walletPubkey;
                transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
                associatedAccountSignature = await wallet.sendTransaction(transaction, connection);

                toast.success(`Associated Token Account created with signature: ${associatedAccountSignature}`)
                console.log(`Associated Token Account created with signature: ${associatedAccountSignature}`);
            }
            else {
                toast.info(`Associated Token Account already exists at ${associatedTokenAccountAddress.toBase58()}`)
                console.log(`Associated Token Account already exists at ${associatedTokenAccountAddress.toBase58()}`);
            }
        }
        catch (error) {
            toast.error(`Error creating the associated token account:${error} `)
            console.error("Error creating the associated token account:", error);
            setErrdialogopen(true)
            setLoading(false);
            return;
        }
        // Minting Tokens To the ATA

        const mintAmount = supply * Math.pow(10, decimals)
        const mintToInstruction = createMintToInstruction(
            mintKeypair.publicKey,
            associatedTokenAccountAddress,
            walletPubkey,
            mintAmount,
            [],
            TOKEN_2022_PROGRAM_ID
        )
        const mintTransaction = new Transaction().add(mintToInstruction)
        mintTransaction.feePayer = walletPubkey;
        mintTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        await wallet.sendTransaction(mintTransaction, connection);
        setTokenInfoStore({ mintKeypairPubkey, associatedTokenAccountAddress, associatedAccountSignature, supply })
        toast.success(`Token Mint Sucessfull`)
        toast.success(`Minted ${supply} tokens to ${associatedTokenAccountAddress.toBase58()}`)
        console.log(`Minted ${supply} tokens to ${associatedTokenAccountAddress.toBase58()}`);
        setDialogopen(true)
        setLoading(false);
    }


    return (<div>
        {!(wallet.connected) && <div className="max-mobile:w-[320px] max-sm:w-[400px] max-md:w-3xl max-lg:w-5xl max-w-7xl h-[50vh] flex flex-col gap-6 justify-center items-center">

            <div className="max-sm:px-6 px-8 py-32">
                <div className="grid gap-8 items-start justify-center">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#9945FF] to-[#14F195] rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <button className="relative px-7 py-4 bg-black rounded-lg leading-none flex items-center divide-x divide-gray-600">
                            <span className="flex items-center space-x-5">
                                <img src="./solanaLogoMark.svg" alt="sol" width={"22px"} height={"22px"} />
                                <span className="max-sm:pr-2 pr-6 max-mobile:text-[12px] max-sm:text-[18px] text-gray-100 text-xl teko-regular">Token Launchpad Release 2024.04</span>
                            </span>
                            <span className="pl-6 text-indigo-400 group-hover:text-gray-100 transition duration-200">See what's new &rarr;</span>

                        </button>
                    </div>
                </div>
                <h2 className="font-semibold text-md text-center  text-red-500 mt-10">Please connect Wallet to use the Launchpad</h2>
                <div className="max-sm:hidden flex justify-center mt-5"><WalletMultiButton /></div>
            </div>
        </div>}
        {wallet.connected && <div className="relative max-mobile:w-[300px] max-sm:w-[350px] md:w-[1100px]">
            <div className="absolute -inset-1">
                <div className="w-full h-full mx-auto bg-gradient-to-tr from-[#9945FF] to-[#14F195] opacity-30 blur-lg filter ">
                </div>
            </div>

            <TokenInfoDialogBox open={dialogopen} setOpen={setDialogopen} tokenInfoStore={tokenInfoStore} />
            <ErrorInfoDialogBox open={errdialogopen} setOpen={setErrdialogopen} />
            <Card className="w-full relative overflow-hidden border-0 border-gray-200 rounded-2xl">
                <CardHeader>
                    <CardTitle className="max-sm:text-[24px] text-4xl mobile:text-center md:p-2 teko-regular">Solana Token Generate</CardTitle>

                </CardHeader>
                <CardContent className="mobile:p-3 mobile:pt-0 md:p-6 md:pt-0">
                    <div className="flex mobile:flex-col md:flex-row gap-8 pb-4 ">
                        <div className="md:p-4 md:grow md:border md:rounded-md ">
                            <Form {...form}  >
                                <form className="space-y-8">
                                    <FormField
                                        name="name"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Token Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="HK token" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="symbol"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Symbol</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="$ " {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="description"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="description " {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex flex-col max-sm:gap-8 md:flex-row md:space-x-2">
                                        <div className="flex flex-col max-sm:space-y-8 md:justify-between">
                                            <FormField
                                                name="decimals"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Decimals</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Decimals" type="number" min={0} max={9}
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            /><FormField
                                                name="supply"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Initial Supply</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Supply"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            name="imageFile"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Image</FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center justify-center w-[100%]">
                                                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 .dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 .dark:hover:bg-gray-600">
                                                                <div className="flex flex-col items-center justify-center pt-5 pb-8">
                                                                    <svg className="w-12 h-12  text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                                    </svg>

                                                                </div>
                                                                <Input type="file" accept=".jpg,jpeg,.png" onChange={(e) => {
                                                                    const file = e.target.files?.[0]
                                                                    if (file) {
                                                                        field.onChange(file);
                                                                    }

                                                                }} />
                                                            </label>
                                                        </div>

                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                    </div>


                                    <div className="flex justify-center">

                                        <Button disabled={loading} type="submit" onClick={form.handleSubmit(onSubmit)}>{loading ? (<><svg aria-hidden="true" className="inline w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                        </svg>
                                            <span >Submitting...</span></>) : ('Create Token')}</Button>
                                    </div>
                                </form>
                            </Form >
                        </div>
                        <div className="relative max-sm:hidden flex sm:w-[200px] md:w-[50%] group">
                            <img src="./solanaside.png" alt="Solana short" className="md:rounded-full w-full h-auto group-hover:opacity-0" />
                            <div
                                className="absolute inset-0 bg-opacity-60 teko-regular text-gray-600 flex flex-col text-2xl gap-2 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                            >
                                <h2 className="text-center text-4xl text-gray-500">How to use Solana Token Launchpad</h2>
                                <p>1. Connect your Solana wallet.</p>
                                <p>2. Specify the desired name for your Token</p>
                                <p>3. Indicate the symbol (max 8 characters).</p>
                                <p>4. Select the decimals quantity (0 for Whitelist Token, 5 for utility Token, 9 for meme token).</p>
                                <p>5. Provide a brief description for your SPL Token.</p>
                                <p>6. Upload the image for your token (PNG).</p>
                                <p>7. Determine the Supply of your Token.</p>
                                <p>8. Click on create, accept the transaction and wait until your tokens ready.</p>
                                <p>9. You will need to sign multiple times the transactions on wallet you are using</p>
                                <p>The cost of Token creation is 0.5 SOL, covering all fees for SPL Token Creation.</p>

                            </div>
                        </div>
                    </div>

                </CardContent>

            </Card>
        </div>

        }
    </div >

    )
}
