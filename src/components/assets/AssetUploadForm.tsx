import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Upload, ImagePlus, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Asset name must be at least 2 characters.",
  }),
  price: z.coerce
    .number()
    .min(0.01, { message: "Price must be greater than 0." }),
  marketValue: z.coerce
    .number()
    .min(0.01, { message: "Market value must be greater than 0." }),
  description: z.string().optional(),
  image: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AssetUploadFormProps {
  onSubmit?: (data: FormValues) => void;
}

const AssetUploadForm = ({ onSubmit }: AssetUploadFormProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: undefined,
      marketValue: undefined,
      description: "",
      image: undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    form.setValue("image", undefined);
    setPreviewUrl(null);
    const fileInput = document.getElementById(
      "image-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (values: FormValues) => {
    console.log("Form submitted with values:", values);
    if (onSubmit) {
      try {
        console.log("Calling onSubmit handler");
        await onSubmit(values);
        console.log("Form submission successful");
        // Reset form after successful submission
        form.reset({
          name: "",
          price: undefined,
          marketValue: undefined,
          description: "",
          image: undefined,
        });
        setPreviewUrl(null);
      } catch (error) {
        console.error("Failed to submit form:", error);
      }
    } else {
      console.warn("No onSubmit handler provided");
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coin Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1794 Flowing Hair Dollar"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the full name of your coin
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the purchase price in USD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Value ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the current market value in USD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description of the coin..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any relevant details about the coin
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel>Coin Image</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] relative">
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewUrl}
                      alt="Asset preview"
                      className="max-h-[180px] max-w-full mx-auto object-contain"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                  >
                    <ImagePlus className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to upload an image
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </label>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              {form.formState.errors.image && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {form.formState.errors.image.message as string}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Upload className="mr-2 h-4 w-4" /> Add Coin
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AssetUploadForm;
