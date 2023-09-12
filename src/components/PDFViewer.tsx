import React from "react";

type Props = { file_url: string | "" };

const PDFViewer = ({ file_url }: Props) => {
  console.log("fileUrl", file_url);
  return (
    <iframe
      src={`https://docs.google.com/gview?url=${file_url}&embedded=true`}
      className="w-full h-full"
    ></iframe>
  );
};

export default PDFViewer;
