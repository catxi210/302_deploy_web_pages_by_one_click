import ky from "ky";
import { env } from "@/env";

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file)
    return await ky(`${env.NEXT_PUBLIC_AUTH_API_URL}/gpt/api/upload/gpt/image`, {
        method: 'POST',
        body: formData,
        timeout: false,
    }).then(res => res.json()) as { data: { url: string } };
}