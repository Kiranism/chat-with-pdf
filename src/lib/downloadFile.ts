import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";

export async function downloadFromURL(file_url: string) {
  try {
    // Use axios to download the PDF content
    const response = await axios.get(file_url, {
      responseType: "arraybuffer", // Ensure it's treated as an array buffer
    });

    // The PDF content is stored in response.data as an array buffer
    const pdfContent = response.data;

    // Create a temporary directory using the OS's tmpdir and store the PDF there
    // const tempDirectory = process.env.TEMP! || process.env.TMP!;
    const tempDirectory = os.tmpdir();

    // const file_name = path.join(process.cwd(), `pdf-${Date.now()}.pdf`);
    const file_name = path.join("/tmp", `pdf-${Date.now()}.pdf`);

    // const file_name = `/temp/pdf-${Date.now()}.pdf`;
    // fs.writeFileSync(file_name, obj.Body as Buffer);
    fs.writeFileSync(file_name, pdfContent);
    console.log(
      "File successfully written to the temporary directory:",
      file_name
    );
    return file_name;
  } catch (error) {
    console.error(error);
    return null;
  }
}
