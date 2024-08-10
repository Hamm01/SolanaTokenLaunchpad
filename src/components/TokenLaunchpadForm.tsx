import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

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
import { Input } from "@/components/ui/input"
import { handleUpload } from "@/lib/fileupload"
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js"
import { createInitializeMetadataPointerInstruction, createInitializeMintInstruction, ExtensionType, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token"
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
    supply: z.coerce.number().min(1, {
        message: "Supply must be a positive number"
    })
})

export function TokenLaunchpad() {
    const wallet = useWallet();
    const { connection } = useConnection();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            symbol: '',
            description: '',
            imageFile: undefined,
            supply: 0

        },
        mode: 'onChange',
    });
    const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (values: z.infer<typeof formSchema>) => {

        const metaDataURI = await handleFileUpload({ ...values })
        if (wallet.publicKey) {
            await createToken({ ...values, metaDataURI, walletPubkey: wallet.publicKey })

        }

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

    async function createToken({ metaDataURI, name, symbol, walletPubkey }: any) {
        const mintKeypair = Keypair.generate();
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

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: walletPubkey,
                newAccountPubkey: mintKeypair.publicKey,
                lamports,
                space: mintLen,
                programId: TOKEN_2022_PROGRAM_ID
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, walletPubkey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintKeypair.publicKey, 9, walletPubkey, null, TOKEN_2022_PROGRAM_ID),
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

        console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`)

    }


    return (<div>
        {!(wallet.connected) && <div className="sm:w-[400px] md:w-[1000px] h-[50vh] flex flex-col gap-6 justify-center items-center">
            <h2 className="font-semibold text-lg text-destructive">Please connect Wallet to use the Launchpad</h2>
            <WalletMultiButton />
        </div>}
        {wallet.connected && <div className="relative sm:w-[400px] md:w-[1100px]">
            <div className="absolute -inset-1">
                <div className="w-full h-full mx-auto bg-gradient-to-tr from-pink-400 to-cyan-400 opacity-30  blur-lg filter ">
                </div>
            </div>
            <div className="relative overflow-hidden bg-white border-0 border-gray-200 rounded-2xl">
                <Card className="sm:w-[400px] md:w-[1100px] ">
                    <CardHeader>
                        <CardTitle className="text-4xl md:text-center md:p-2 teko-regular">Solana Token Generate</CardTitle>

                    </CardHeader>
                    <CardContent>
                        <div className="flex sm:flex-col md:flex-row  gap-8 pb-4 ">
                            <div className="p-4 grow border rounded-md ">
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
                                        <FormField
                                            name="imageFile"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Image</FormLabel>
                                                    <FormControl>
                                                        <Input type="file" accept=".jpg,jpeg,.png" onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) {
                                                                field.onChange(file);
                                                            }

                                                        }} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="supply"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Intiial Supply</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Supply"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Create Token</Button>
                                    </form>
                                </Form >
                            </div>
                            <div className="relative flex sm:w-[200px] md:w-[50%] group">
                                <img src="./solanaside.png" alt="Solana short" className="md:rounded-full w-full h-auto group-hover:opacity-0" />
                                <div
                                    className="absolute inset-0 bg-opacity-60 teko-regular flex flex-col text-2xl gap-2 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                                >
                                    <h2 className="text-center text-4xl">How to use Solana Token Launchpad</h2>
                                    <p>1. Connect your Solana wallet.</p>
                                    <p>2. Specify the desired name for your Token</p>
                                    <p>3. Indicate the symbol (max 8 characters).</p>
                                    <p>4. Select the decimals quantity (0 for Whitelist Token, 5 for utility Token, 9 for meme token).</p>
                                    <p>5. Provide a brief description for your SPL Token.</p>
                                    <p>6. Upload the image for your token (PNG).</p>
                                    <p>7. Determine the Supply of your Token.</p>
                                    <p>8. Click on create, accept the transaction and wait until your tokens ready.</p>
                                    <p>The cost of Token creation is 0.5 SOL, covering all fees for SPL Token Creation.</p>

                                </div>
                            </div>
                        </div>

                    </CardContent>

                </Card>
            </div>
        </div>

        }
    </div >

    )
}
