import ISO639 from "iso-639-1";
import { GLOBAL } from "./values";

export type OptionProps = {
  id: number;
  label: string;
  value: string;
};

export const APP_LANG_OPTION: OptionProps[] = GLOBAL.LOCALE.SUPPORTED.map(
  (language, index) => {
    return {
      id: index,
      label: ISO639.getNativeName(language),
      value: language,
    };
  }
);

export const mainOption = (t: any) => {
  const TAB_OPTION: { value: 'upload' | 'paste' | 'markdown', label: string }[] = [
    { value: "upload", label: t('upload') },
    { value: "paste", label: t('paste') },
    { value: "markdown", label: 'markdown' },
  ]

  const VALIDITY_PERIOD_OPTION: { value: string, label: string }[] = [
    { value: '0', label: t('NoExpiration') },
    { value: '3600', label: t('one_hour') },
    { value: '43200', label: t('twelve_hours') },
    { value: '86400', label: t('one_day') },
    { value: '604800', label: t('seven_days') },
    { value: '2592000', label: t('Thirty_days') },
    { value: '15552000', label: t('half_year') },
    { value: '31536000', label: t('one_year') },
  ]
  return { TAB_OPTION, VALIDITY_PERIOD_OPTION }
}