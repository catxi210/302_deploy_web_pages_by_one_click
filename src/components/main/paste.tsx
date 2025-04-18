import { toast } from "sonner";
import { useAtom } from "jotai";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import * as monaco from 'monaco-editor';
import { Textarea } from "../ui/textarea";
import { generate } from "@/api/generate";
import Editor from '@monaco-editor/react';
import { useTranslations } from "next-intl";
import { readStreamableValue } from "ai/rsc";
import { ErrorToast } from "../ui/errorToast";
import { appConfigAtom, userConfigAtom } from "@/stores";
import { ChangeEvent, useState, useRef, useMemo } from "react";

export const Paste = (props: { inDeployment: boolean, onGenerateHtml: (inGenerate: boolean) => void }) => {
  const t = useTranslations();

  const [content, setContent] = useState('');
  const [isLoad, setIsLoad] = useState({ update: false, generate: false });

  const [{ apiKey, modelName: model }] = useAtom(appConfigAtom);
  const [{ htmlCode, tab }, setUserAtom] = useAtom(userConfigAtom);
  const [actionType, setActionType] = useState('edit')

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const onGenerate = async (type: 'update' | 'generate') => {
    if (isLoad.update || isLoad.generate || props.inDeployment) return;
    if (!apiKey) return toast(t('global.error.code-10001'));
    try {
      setIsLoad((v) => ({ ...v, [type]: true }))
      props.onGenerateHtml(true);
      setActionType('edit')
      const params = { apiKey, model, content, htmlCode: '' }
      if (type === 'update') params.htmlCode = htmlCode;
      if (!content) {
        params.content = t('example');
        setContent(params.content)
      }
      const result = await generate({ ...params });
      if (result?.output) {
        let chatValue = '';
        for await (const delta of readStreamableValue(result.output)) {
          if (delta?.type === 'text-delta') {
            chatValue += delta?.textDelta;
            if (chatValue?.length > 0) {
              setUserAtom((v) => ({ ...v, htmlCode: chatValue }));
              onFollowScrolling()
            }
          } else if (delta?.type === 'logprobs') {
            setIsLoad((v) => ({ ...v, [type]: false }))
            props.onGenerateHtml(false)
            const regex = /```html([\s\S]*?)```/;
            const match = chatValue.match(regex);
            const htmlContent = match ? match[1].trim() : '';
            if (htmlContent) {
              setUserAtom((v) => ({ ...v, htmlCode: htmlContent }))
            }
            onFollowScrolling(1)
            toast.success(t('generate_complete'))
          }
        }
      }
    } catch (error: any) {
      console.log(error);
      setIsLoad((v) => ({ ...v, [type]: false }))
      props.onGenerateHtml(false)
      if (error?.message?.error?.err_code) {
        toast.error(() => (ErrorToast(error.message.error.err_code)))
      } else {
        toast.error(t('generate_error'))
      }
    }
  }

  const onFollowScrolling = (lineCount?: number) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const model = editor.getModel();
      if (model) {
        if (!lineCount) {
          lineCount = model.getLineCount();
        }
        editor.revealLine(lineCount);
      }
    }
  }

  const onEditorChange = (value: string | undefined) => {
    setUserAtom((v) => ({ ...v, htmlCode: value || '' }))
  }

  const onChangeContent = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  const previewCode = useMemo(() => {
    const blob = new Blob([htmlCode], {
      'type': 'text/html'
    });
    return (
      <iframe className="w-full h-full" src={URL.createObjectURL(blob)}></iframe>
    )
  }, [htmlCode, actionType])

  return (
    <div className={`flex-col items-center justify-center border rounded-lg text-sm w-full bg-background relative  ${tab === 'paste' ? 'flex' : 'hidden'}`}>
      <div className="flex items-center gap-3 text-xs absolute right-0 -top-[37px] border rounded-md p-1">
        <button disabled={isLoad.update || isLoad.generate} className={`${actionType === 'edit' && 'bg-[#8e47f0] text-white'} py-1 px-2 rounded-md cursor-pointer`} onClick={() => setActionType('edit')}>{t('edit')}</button>
        <button disabled={isLoad.update || isLoad.generate} className={`${actionType === 'preview' && 'bg-[#8e47f0] text-white'} py-1 px-2 rounded-md cursor-pointer`} onClick={() => setActionType('preview')}>{t('preview')}</button>
      </div>
      <div className="h-[50vh] w-full">
        {
          actionType === 'edit' && (
            <Editor
              height='100%'
              value={htmlCode}
              defaultLanguage="html"
              onChange={onEditorChange}
              options={{ contextmenu: false, readOnly: isLoad.update || isLoad.generate }}
              onMount={(editor: monaco.editor.IStandaloneCodeEditor) => {
                editorRef.current = editor;
              }}
            />
          )
        }
        {actionType === 'preview' && (previewCode)}
      </div>
      <div className="flex items-end gap-3 p-5 w-full border-t">
        <Textarea
          value={content}
          disabled={isLoad.update || isLoad.generate}
          onChange={onChangeContent}
          placeholder={t('input_placeholder')}
          className="w-full border-none shadow-none !outline-0"
        />
        <div className="flex items-center gap-5">
          {
            htmlCode && (
              <Button disabled={isLoad.update || isLoad.generate} onClick={() => onGenerate('update')}>
                {t('update')}
                {isLoad.update && <Loader2 className="w-[20px] h-[20px] animate-spin" />}
              </Button>
            )
          }
          <Button disabled={isLoad.update || isLoad.generate} onClick={() => onGenerate('generate')}>
            {t('generate')}
            {isLoad.generate && <Loader2 className="w-[20px] h-[20px] animate-spin" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
