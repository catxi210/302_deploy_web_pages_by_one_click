import { toast } from "sonner";
import { useAtom } from "jotai";
import { FaLink } from "react-icons/fa6";
import { IoCopy } from "react-icons/io5";
import { deleteData } from "./indexDB";
import { useTranslations } from "next-intl";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { IRecord, userConfigAtom } from "@/stores";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";

export const GenerateList = (props: { item: IRecord }) => {
  const { item } = props;
  const t = useTranslations();
  const [_, setUserAtom] = useAtom(userConfigAtom);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      toast.success(t('copy_success'))
    } catch (err) {
      toast.error(t('copy_error'))
      console.error(err);
    }
  }

  const onDelete = async () => {
    deleteData(item.id!).then((res) => {
      setUserAtom((v) => ({ ...v, record: res }))
    }).catch(() => {
      toast.error(t('delete_error'))
    })
  }

  return (
    <div className="w-full h-[200px] border rounded-lg overflow-hidden flex flex-col">
      <div className="h-[150px] w-full bg-cover" style={{ backgroundImage: `url(${item.coverSrc || '/images/global/404.png'})` }} />
      <div className="border-t flex items-center justify-between p-3 gap-3">
        <a target="_blank" href={item.url} className="text-blue-600 flex items-center gap-2 text-ellipsis text-nowrap overflow-hidden w-full cursor-pointer">
          <FaLink className="min-w-fit" />
          <p className="text-ellipsis text-nowrap overflow-hidden text-sm">{item.url}</p>
        </a>
        <div className="flex items-center gap-3 min-w-fit">
          <IoCopy className="text-[#8e47f0] cursor-pointer" onClick={onCopy} />
          <AlertDialog>
            <AlertDialogTrigger asChild >
              <RiDeleteBin5Fill className="text-red-700 cursor-pointer" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('delete_works_title')}</AlertDialogTitle>
                <AlertDialogDescription />
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>{t('continue')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
} 