export type SEOData = {
  supportLanguages: string[];
  fallbackLanguage: string;
  languages: Record<
    string,
    { title: string; description: string; image: string }
  >;
};

export const SEO_DATA: SEOData = {
  // TODO: Change to your own support languages
  supportLanguages: ["zh", "en", "ja"],
  fallbackLanguage: "en",
  // TODO: Change to your own SEO data
  languages: {
    zh: {
      title: "网页一键部署",
      description: "一键部署静态网页",
      image: "/images/global/webserve_cn_tool_logo.png",
    },
    en: {
      title: "Deploy web pages by one-click",
      description: "One click deployment of static web pages",
      image: "/images/global/webserve_en_tool_logo.png",
    },
    ja: {
      title: "Webページのワンクリック展開",
      description: "静的Webページのワンクリック配置",
      image: "/images/global/webserve_jp_tool_logo.png",
    },
  },
};
