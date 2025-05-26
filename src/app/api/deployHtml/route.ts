import ky from "ky";
import { NextResponse } from "next/server";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function POST(req: Request): Promise<Response> {
  try {
    const formDataParams = await req.formData();
    const file = formDataParams.get('file');
    const md = formDataParams.get('md') as string;
    const apiKey = formDataParams.get('apiKey') as string;
    const htmlCode = formDataParams.get('htmlCode') as string;
    const validityPeriod = formDataParams.get('validityPeriod') as string;

    let coverSrc = '';
    let url = '';

    if (htmlCode || md) {
      const htmlResult = await webserveHtml({ apiKey, htmlCode, md });
      if (htmlResult?.url) {
        if (md) {
          coverSrc = await captureWebpageImage({ apiKey, url: htmlResult.url });
        } else {
          coverSrc = await captureWebpageImage({ apiKey, htmlCode });
        }
        url = htmlResult.url;
      }
    } else if (file) {
      const fileResult = await webserveUpload({ apiKey, file });
      if (fileResult?.url) {
        coverSrc = await captureWebpageImage({ apiKey, url: fileResult.url });
        url = fileResult.url;
      }
    }

    return NextResponse.json({ coverSrc, url });
  } catch (error: any) {
    if (error.response) {
      try {
        const errorData = await error.response.json();
        return NextResponse.json({ ...errorData }, { status: 200 });
      } catch (parseError) {
        return NextResponse.json({ message: 'Failed to parse error response' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 400 });
    }
  }
}

const webserveHtml = async (params: { apiKey: string, htmlCode: string, md: string }) => {
  const { htmlCode, apiKey, md } = params;
  const result = await ky(`${process.env.NEXT_PUBLIC_API_URL}/302/webserve/html`, {
    method: 'post',
    timeout: false,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      html: htmlCode || '',
      md: md || '',
      format: "json"
    })
  }).then(res => res.json()) as { id: "string", url: "string" };
  return result;
}

const webserveUpload = async (params: { apiKey: string, file: FormDataEntryValue }) => {
  const { file, apiKey } = params;
  const formData = new FormData();
  formData.append('file', file)
  const result = await ky(`${process.env.NEXT_PUBLIC_API_URL}/302/webserve/upload`, {
    method: 'post',
    timeout: false,
    headers: { "Authorization": `Bearer ${apiKey}`, },
    body: formData
  }).then(res => res.json()) as { id: "string", url: "string" };
  return result;
}

// 截取网页图片
const captureWebpageImage = async (prams: { apiKey: string, htmlCode?: string, md?: string, url?: string }) => {
  const { apiKey, htmlCode, url } = prams
  try {
    let html = htmlCode || '';
    if (url) {
      html = await getHtml(url) || '';
    }
    if (!html) return '';
    const result = await ky(`${process.env.NEXT_PUBLIC_API_URL}/v1/htmltopng`, {
      method: 'post',
      body: JSON.stringify({
        htmlCode: html
      }),
      timeout: false,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }).then(res => res.json()) as { output: string }
    return result?.output || ''
  } catch (error) {
    return '';
  }
}

// 获取网页地址的HTML
const getHtml = async (url: string) => {
  try {
    const response = await ky.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
    });
    if (response.status === 200) {
      return await response.text();
    }
    return null;
  } catch (error) {
    console.log('getHtml=========error', error);
    return null;
  }
}