
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Label } from "@/components/ui/label"
import { Input } from '@/components/ui/input'
import { CircleCheck, SquareArrowOutUpRight } from 'lucide-react';
export const TokenInfoDialogBox = (props: any) => {
    const link = "https://explorer.solana.com"
    const { tokenInfoStore, open, setOpen } = props

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>

                <DialogContent className="sm:max-w-[425px] md:max-w-[550px]">
                    <DialogHeader className="w-full ">
                        <div className="flex flex-col gap-2 items-center">
                            <CircleCheck size={52} color="#80ff00" className="" />
                            <DialogTitle className="text-center md:text-xl " >Token Mint successful</DialogTitle>
                        </div>
                        <DialogDescription className="text-center">
                            Tokens Succesfully Added to the wallet
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-4">
                        <div className="flex">
                            <Label htmlFor="tokenMint" className="text-right text-sm whitespace-nowrap ">
                                Token Mint Public Address
                            </Label>
                        </div>
                        <div className="grid grid-cols-4 gap-4">

                            <Input id="tokenMint" value={tokenInfoStore.mintKeypairPubkey} className="col-span-3" />
                            <Button variant="outline"
                                className="hover:bg-destructive"
                                onClick={() => window.open(`${link}/address/${tokenInfoStore.mintKeypairPubkey}?cluster=devnet`, '_blank')}
                            > <span ><SquareArrowOutUpRight size={18} /></span>  </Button>
                        </div>
                        <div className="flex">
                            <Label htmlFor="username" className="text-right text-sm whitespace-nowrap">
                                Associated Token Account Address
                            </Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">

                            <Input id="username" value={tokenInfoStore.associatedTokenAccountAddress} className="col-span-3" />
                            <Button variant="outline"
                                className="hover:bg-destructive"
                                onClick={() => window.open(`${link}/address/${tokenInfoStore.associatedTokenAccountAddress}?cluster=devnet`, '_blank')}
                            > <span ><SquareArrowOutUpRight size={18} /></span>  </Button>
                        </div>
                        <div className="flex">
                            <Label htmlFor="username" className="text-right">
                                Associated Token Account Signature
                            </Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Input id="username" value={tokenInfoStore.associatedAccountSignature} className="col-span-3" />
                            <Button variant="outline"
                                className="hover:bg-destructive"
                                onClick={() => window.open(`${link}/tx/${tokenInfoStore.associatedAccountSignature}?cluster=devnet`, '_blank')}
                            > <span ><SquareArrowOutUpRight size={18} /></span>  </Button>
                        </div>
                        <div className="flex">
                            <Label htmlFor="username" className="text-right">
                                Supplied Tokens
                            </Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">

                            <Input id="username" value={tokenInfoStore.supply} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <div className="border-t-2 w-full flex justify-end pt-2">
                            <p className="text-lg ">Developed by Himanish</p>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
