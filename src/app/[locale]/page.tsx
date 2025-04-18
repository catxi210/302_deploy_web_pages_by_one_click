"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import { Main } from "@/components/main";
import { useTranslations } from "next-intl";
import { GenerateList } from "@/components/generateList";
import { appConfigAtom, userConfigAtom } from "@/stores";
import { deleteExpiredData } from "@/components/generateList/indexDB";

export default function Home() {
  const t = useTranslations();

  const [{ hideBrand }] = useAtom(appConfigAtom);
  const [{ record }, setUserAtom] = useAtom(userConfigAtom);

  useEffect(() => {
    deleteExpiredData().then((res) => {
      setUserAtom((v) => ({ ...v, record: res }))
    })
  }, [])

  useEffect(() => {
    if (hideBrand) {
      const metaTags = document.querySelectorAll('meta[property^="og:image"]');
      metaTags.forEach((tag) => {
        tag.setAttribute(
          "content",
          "/images/global/next-card.png"
        );
      });
    }

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = hideBrand ? "/next.ico" : "/favicon.ico";
  }, [hideBrand]);

  return (
    <div className="lg:w-[1280px] px-5 w-full mx-auto">
      <div className='h-20 w-full flex items-center justify-center gap-5 py-5'>
        {!hideBrand && <img src="/images/global/logo-mini.png" className='h-full' />}
        <h2 className='text-[26px] font-bold'>{t('home.title')}</h2>
      </div>
      <Main />
      <div className="grid gap-5 grid-cols-1 mt-5 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 transition-all">
        {
          record?.map(item => (
            <GenerateList item={item} key={item.uuid} />
          ))
        }
      </div>
    </div >
  );
}
