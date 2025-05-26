import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useTranslations } from 'next-intl';
import { useAtom } from "jotai";
import { userConfigAtom } from "@/stores";
import { getCommands, getExtraCommands, ICommand, TextState, TextAreaTextApi } from "@uiw/react-md-editor";
import MDEditor from '@uiw/react-md-editor';
import { useRef, useState } from 'react';
import { uploadFile } from "@/api/upload";
import { toast } from "sonner";
import { HiMiniTableCells } from "react-icons/hi2";
import { FaRegImage } from "react-icons/fa";
import { BiCodeBlock } from "react-icons/bi";

export const Markdown = () => {
  const t = useTranslations();
  const [{ md, tab }, setUserAtom] = useAtom(userConfigAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentTextApi, setCurrentTextApi] = useState<TextAreaTextApi | null>(null);

  const handleImageUpload = async (file: File) => {
    if (!currentTextApi) return;
    if (file) {
      uploadFile(file).then(res => {
        console.log(res);
        if (res?.data?.url) {
          const imageMarkdown = `![${file.name}](${res?.data?.url})`;
          currentTextApi.replaceSelection(imageMarkdown);
        } else {
          toast.warning(t('image_upload_failed'))
        }
      }).catch(() => {
        toast.warning(t('image_upload_failed'))
      })
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const customTableCommand: ICommand = {
    name: 'table',
    keyCommand: 'table',
    buttonProps: { 'aria-label': t('mdEditor.table'), title: t('mdEditor.table') },
    icon: <HiMiniTableCells />,
    execute: (state: TextState, api: TextAreaTextApi) => {
      const tableTemplate = `
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Cell 2   | Cell 3   |
| Row 2    | Cell 5   | Cell 6   |`;
      api.replaceSelection(tableTemplate);
    },
  };

  const customImageCommand: ICommand = {
    name: 'image',
    keyCommand: 'image',
    buttonProps: { 'aria-label': t('mdEditor.image'), title: t('mdEditor.image') },
    icon: <FaRegImage />,
    execute: (state: TextState, api: TextAreaTextApi) => {
      setCurrentTextApi(api);
      fileInputRef.current?.click();
    },
  };

  const translateCommands = (commands: ICommand[]): ICommand[] => {
    return commands.map(cmd => {
      if (cmd?.name) {
        if (cmd.name === 'image') {
          return customImageCommand;
        }
        if (cmd.name === 'codeBlock') {
          return {
            ...cmd,
            icon: <BiCodeBlock />,
            buttonProps: {
              ...cmd.buttonProps,
              'aria-label': t(`mdEditor.${cmd.name}`),
              'title': t(`mdEditor.${cmd.name}`),
            }
          }
        }
        return {
          ...cmd,
          buttonProps: {
            ...cmd.buttonProps,
            'aria-label': t(`mdEditor.${cmd.name}`),
            'title': t(`mdEditor.${cmd.name}`),
          }
        };
      }
      return { ...cmd };
    });
  };

  const translateExtraCommands = (commands: ICommand[]): ICommand[] => {
    return commands.map(cmd => {
      if (cmd?.name) {
        return {
          ...cmd,
          buttonProps: {
            ...cmd.buttonProps,
            'aria-label': t(`mdEditor.${cmd.name}`),
            'title': t(`mdEditor.${cmd.name}`),
          }
        };
      }
      return { ...cmd };
    });
  };

  const baseCommands = [...getCommands(), customTableCommand];
  const translatedCommands = translateCommands(baseCommands);

  const translatedExtraCommands = translateExtraCommands(getExtraCommands());

  const onChange = (value?: string) => {
    setUserAtom((v) => ({ ...v, md: value || '' }));
  };

  return (
    <div className={`border rounded-lg w-full bg-background  ${tab === 'markdown' ? 'block' : 'hidden'}`}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageUpload(file);
            e.target.value = '';
          }
        }}
      />
      <MDEditor
        className="!h-[50vh]"
        value={md}
        onChange={onChange}
        commands={translatedCommands}
        extraCommands={translatedExtraCommands}
      />
    </div>
  );
}
