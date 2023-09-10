"use client";
import { UploadDropzone } from "@uploadthing/react";

import { OurFileRouter } from "@/app/api/uploadthing/core";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
export const FileUpload = () => {
  const router = useRouter();
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
      className="bg-gradient-to-r from-rose-100 to-teal-100 ut-label:text-lg ut-allowed-content:ut-uploading:text-red-300"
      endpoint="pdfUploader"
      onClientUploadComplete={(res) => {
        // Do something with the response
        console.log("Files: ", res);

        alert("Upload Completed");
        const data = {
          file_key: res![0].key,
          file_name: res![0].name,
        };
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            // toast.success("Chat created!");
            router.push(`/chat/${chat_id}`);
          },
          onError: (err) => {
            // toast.error("Error creating chat");
            console.error(err);
          },
        });
      }}
      onUploadError={(error: Error) => {
        alert(`ERROR! ${error.message}`);
      }}
      onUploadBegin={(name) => {
        // Do something once upload begins
        console.log("Uploading: ", name);
      }}
    />
  );
};
