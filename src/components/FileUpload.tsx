"use client";
import { UploadDropzone } from "@uploadthing/react";

import { OurFileRouter } from "@/app/api/uploadthing/core";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
export const FileUpload = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const { mutate, isLoading } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  return (
    <UploadDropzone<OurFileRouter>
      className="bg-gradient-to-r from-yellow-50 to-teal-100 ut-label:text-lg ut-allowed-content:ut-uploading:text-red-300"
      endpoint="pdfUploader"
      content={{
        allowedContent({ isUploading }) {
          if (isUploading || isLoading)
            return (
              <>
                <p className="mt-2 text-sm text-slate-400 animate-pulse">
                  Spilling Tea to GPT...
                </p>
              </>
            );
        },
      }}
      onClientUploadComplete={(res) => {
        // Do something with the response
        console.log("Files: ", res);
        const data = {
          file_key: res![0].key,
          file_name: res![0].name,
        };
        mutate(data, {
          onSuccess: ({ chat_id, chat_name }) => {
            toast({
              title: "Chat created!",
              description: `Chat session created for ${chat_name}`,
            });
            router.push(`/chat/${chat_id}`);
          },
          onError: (err) => {
            toast({
              variant: "destructive",
              title: "Error creating chat!",
            });
            console.error(err);
          },
        });
      }}
      onUploadError={(error: Error) => {
        toast({
          variant: "destructive",
          title: `ERROR! ${error.message}`,
        });
      }}
      onUploadBegin={(name) => {
        // Do something once upload begins
        console.log("Uploading: ", name);
      }}
    />
  );
};
