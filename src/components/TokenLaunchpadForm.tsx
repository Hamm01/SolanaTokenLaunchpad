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

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name should be at least 2 characters",
    }),
    symbol: z.string().min(1, {
        message: "Symbol should be at least 1 character"
    }),
    imageURL: z
        .instanceof(File)
        .refine((file) => file.type === "image/jpeg" || file.type === "image/png", {
            message: "File must be in .jpg, .jpeg, or .png format",
        }),
    supply: z.coerce.number().min(1, {
        message: "Supply must be a positive number"
    })
})

export function TokenLaunchpad() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            symbol: '',
            imageURL: undefined,
            supply: 0

        },
        mode: 'onChange',
    });
    const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (values: z.infer<typeof formSchema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }
    async function handleFileUpload(file: File) {
        const response = await handleUpload(file)
        console.log(response)
    }


    return (
        <Card className="sm:w-[400px] md:w-[1000px] ">
            <CardHeader>
                <CardTitle className="text-3xl md:text-center md:p-2">Solana Token Generate</CardTitle>

            </CardHeader>
            <CardContent>
                <div className="flex sm:flex-col md:flex-row  gap-8 pb-4 ">
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
                                                <Input type="file" accept=".jpg,jpeg,.png" onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        field.onChange(file);
                                                        handleFileUpload(file);
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
                                <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Launch Token</Button>
                            </form>
                        </Form >
                    </div>
                    <div className="flex sm:w-[200px] md:w-[480px] ">
                        <img src="./solanaside.png" alt="Solana short" className="md:rounded-full flex" />
                    </div>
                </div>

            </CardContent>

        </Card>

    )
}
