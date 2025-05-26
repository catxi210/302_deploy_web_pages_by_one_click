import { toast } from "sonner";
import { useAtom } from "jotai";
import { userConfigAtom } from "@/stores";
import { CgCloseO } from "react-icons/cg";
import { useTranslations } from "next-intl";
import { FaRegFileAlt } from "react-icons/fa";
import { useRef, useState, DragEvent } from "react";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 最大文件为20M

interface UploadProps {
  onFileSelect: (file: File | null) => void;
}

export const Upload: React.FC<UploadProps> = ({ onFileSelect }) => {
  const t = useTranslations();
  const [{ tab }, setUserAtom] = useAtom(userConfigAtom);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (file: File | null) => {
    const compressType = ['application/x-zip-compressed', 'application/zip'];
    const mdType = 'text/markdown'; // MD 文件的 MIME 类型
    const mdExtensions = ['.md', '.markdown']; // MD 文件的常见扩展名
  
    if (file && fileInputRef?.current) {
      // 检查文件类型（MIME 类型或扩展名）
      const isMdFile = 
        file.type === mdType || 
        mdExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      if (
        file.size > MAX_FILE_SIZE || 
        !(
          file.type === "text/html" || 
          compressType.includes(file.type) || 
          isMdFile // 新增 MD 文件支持
        )
      ) {
        setFileName(null);
        onFileSelect(null);
        fileInputRef.current.value = '';
        toast.warning(t('file_upload_warning'));
      } else {
        onFileSelect(file);
        setFileName(file.name);
      }
    } else {
      onFileSelect(null);
    }
  };

  const onDeleteFile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
      setFileName('');
      onFileSelect(null);
    }
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  return (
    <div
      className={`flex-col items-center justify-center gap-5 
         border rounded-lg text-sm py-14 w-full cursor-pointer 
         ${tab === 'upload' ? 'flex' : 'hidden'}
         ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`
      }
      onClick={handleFileSelect}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept=".html,.zip,.md"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        style={{ display: 'none' }}
      />
      <div className="border rounded-full p-14 relative">
        {
          fileName ?
            <img src={fileName.indexOf('html') !== -1 ? "/images/global/html.png" : '/images/global/compress.png'} className="w-[35px]" />
            : <FaRegFileAlt className="text-[35px]" />
        }
        {
          fileName &&
          <div className="text-red-600 text-lg absolute right-5 top-7" onClick={onDeleteFile}><CgCloseO /></div>
        }
      </div>
      {
        fileName ?
          <div className="text-slate-500 text-ellipsis text-nowrap w-full overflow-hidden text-center text-xs">
            {fileName}
          </div> :
          <>
            <div className="text-slate-500">{t('upload_tips1')}</div>
            <div className="text-slate-500">{t('upload_tips2')}</div>
          </>
      }
    </div>
  )
}
