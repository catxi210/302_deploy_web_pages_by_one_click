'use server'

import ky from 'ky';
import { createOpenAI } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { streamText, TextStreamPart } from 'ai';
import { LanguageModelV1LogProbs } from '@ai-sdk/provider';

interface IPrames {
  htmlCode: string;
  model?: string;
  apiKey: string;
  content: string;
}

type AsyncIterableStream<T> = AsyncIterable<T> & ReadableStream<T>;

export async function generate(params: IPrames) {
  const { content, htmlCode, apiKey, model='gpt-4o-mini' } = params;

  const prompt = `Generate an HTML file based on the user request, which can be serving standalone.

Base requirements:
- Include all features in a single HTML file, such as HTML, CSS, Javascript.
- External resources are allowed, you can use any third-part packages via CDN services, or icons, fonts, placeholder images, or other staffs.
- Prefer use modern libraries to implement the request.
- Necessary comments, concise and easy understand.
- Follow best practices, keep the code high quality. 

You might be provided latest version HTML file, modify it based on user request, if not, generate from scratch.

Latest version:`+

  "```html" +
    `${htmlCode}`+
  "```" +

    `User request:
${content}

Output the HTML directly without any other contents, wrapped the code in code block.`

  const stream = createStreamableValue<{
    type: string,
    textDelta?: string,
    logprobs?: LanguageModelV1LogProbs,
  }>({ type: 'text-delta', textDelta: '' })
  try {
    const openai = createOpenAI({
      apiKey,
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/v1`,
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input instanceof URL ? input : new URL(input.toString())
        try {
          return await ky(url, {
            ...init,
            retry: 0,
            timeout: false,
          })
        } catch (error: any) {
          if (error.response) {
            const errorData = await error.response.json();
            stream.error({ message: errorData })
          } else {
            stream.error({ message: error })
          }
          return error;
        }
      },
    });
    (async () => {
      try {
        const { fullStream } = streamText({
          model: openai(model),
          messages: [{
            role: 'user',
            content: prompt
          }],
        });
        const onGetResult = async (fullStream: AsyncIterableStream<TextStreamPart<any>>) => {
          for await (const chunk of fullStream) {
            if (chunk.type === 'text-delta') {
              stream.update({ type: 'text-delta', textDelta: chunk.textDelta })
            } else if (chunk.type === 'finish') {
              stream.update({ type: 'logprobs', logprobs: chunk.logprobs })
            }
          }
        }
        await onGetResult(fullStream)
        stream.done()
      } catch (error) {
        stream.done()
        stream.error({ message: 'Initialization error' })
      }
    })();
  } catch (error) {
    stream.done()
    stream.error({ message: 'Initialization error' })
  }
  return { output: stream.value }
}