import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
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

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name should be at least 2 characters",
    }),
    symbol: z.string(),
    imageURL: z.string(),
    supply: z.number()
})

export function TokenLaunchpad() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            symbol: '',
            imageURL: '',
            supply: 0

        },
        mode: 'onChange',
    });
    const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (values: z.infer<typeof formSchema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }


    return (
        <Card className="w-[800px]">
            <CardHeader>
                <CardTitle className="text-2xl">Solana Token Generate</CardTitle>

            </CardHeader>
            <CardContent>
                <div className="flex flex-row gap-8 pb-4 ">
                    <div className="grow">
                        <Form {...form} >
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
                                    name="imageURL"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your token image url" {...field} />
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
                                                <Input placeholder="Supply" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Launch Token</Button>
                            </form>
                        </Form >
                    </div>
                    <div className="flex w-[350px]  ">
                        <img src="./solanaside.png" alt="Solana short" width="350px" height="350px" className="rounded-full" />
                    </div>
                </div>

            </CardContent>

        </Card>

    )
}
