import ky from "ky";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { Paste } from "./paste";
import { useState } from "react";
import { Upload } from "./upload";
import { v4 as uuidV4 } from 'uuid';
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorToast } from "../ui/errorToast";
import { mainOption } from "@/constants/options";
import { addData } from "../generateList/indexDB";
import { appConfigAtom, userConfigAtom } from "@/stores";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export const Main = () => {
  const t = useTranslations();
  const [{ apiKey, modelName }] = useAtom(appConfigAtom);
  const { TAB_OPTION, VALIDITY_PERIOD_OPTION } = mainOption(t)
  const [{ tab, validityPeriod, htmlCode }, setUserAtom] = useAtom(userConfigAtom);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isLoad, setIsLoad] = useState(false);
  const [inGenerate, setInGenerate] = useState(false);

  const onButtonDis = () => {
    return (tab === 'upload' && !selectedFile) || (tab === 'paste' && !htmlCode) || (tab === 'paste' && inGenerate) || isLoad
  }

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const onSwitchTab = (value: 'paste' | 'upload') => {
    setUserAtom((v) => ({ ...v, tab: value }))
  }

  const onSelectValidityPeriod = (value: string) => {
    setUserAtom((v) => ({ ...v, validityPeriod: value }))
  }

  const onDeployHtml = async () => {
    try {
      setIsLoad(true);
      const formData = new FormData();
      formData.append('apiKey', apiKey || '');
      formData.append('model', modelName || '');
      formData.append('validityPeriod', validityPeriod);
      if (tab === 'paste') {
        formData.append('htmlCode', htmlCode);
      } else if (tab === 'upload' && selectedFile) {
        formData.append('file', selectedFile);
      }
      const result = await ky('/api/deployHtml', {
        method: 'post',
        timeout: false,
        body: formData
      }).then(res => res.json()) as { url: string, coverSrc: string, error?: any };
      if (result?.url) {
        let deadline = '0'
        if (validityPeriod !== '0') {
          deadline = dayjs().add(+validityPeriod, 'second').format('YYYY-MM-DD HH:mm:ss')
        }
        const newData = await addData({ ...result, deadline, uuid: uuidV4() })
        setUserAtom((v) => ({ ...v, record: newData }))
      } else if (result?.error) {
        onDeployHtmlError(result?.error)
      } else {
        toast.error(t('deployment_error'))
      }
    } catch (error) {
      toast.error(t('deployment_error'))
    }
    setIsLoad(false);
  }

  const onGenerateHtml = (inGenerate: boolean) => {
    setInGenerate(inGenerate)
  }

  const onDeployHtmlError = (error: any) => {
    if (error?.err_code) {
      toast.error(() => (ErrorToast(error.err_code)))
    } else if (error?.message === 'The resource file does not exist') {
      toast.error(t('file_not_exist'))
    } else if (error?.message === 'No index.html or index.htm file found in the extracted ZIP archiv') {
      toast.error(t('cannot_find_file'))
    } else {
      toast.error(t('deployment_error'))
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div className="border flex items-center justify-center text-base gap-5 rounded-lg overflow-hidden px-2 py-2 flex-wrap">
        {
          TAB_OPTION.map(item => (
            <div
              key={item.value}
              onClick={() => onSwitchTab(item.value)}
              className={`px-10 py-2 cursor-pointer rounded-lg transition-all
               hover:bg-[#8e47f0] hover:text-white 
               ${item.value === tab && 'text-white bg-[#8e47f0]'}
            `}
            >{item.label}</div>
          ))
        }
      </div>
      <Upload onFileSelect={handleFileSelect} />
      <Paste inDeployment={isLoad} onGenerateHtml={onGenerateHtml} />
      <div className="flex items-center justify-center gap-10 flex-wrap">
        <div className="flex items-center justify-center">
          <div className="min-w-fit w-auto">{t('periodOfValidity')}：</div>
          <Select value={validityPeriod || '0'} onValueChange={onSelectValidityPeriod}>
            <SelectTrigger className='flex-1 min-w-[100px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {
                  VALIDITY_PERIOD_OPTION.map(item => (
                    <SelectItem value={item.value} key={item.value}>{item.label}</SelectItem>
                  ))
                }
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button disabled={onButtonDis()} onClick={onDeployHtml}>
          {t('OneClickDeployment')}
          {isLoad && <Loader2 className="w-[20px] h-[20px] animate-spin" />}
        </Button>
      </div>
    </div>
  )
}
