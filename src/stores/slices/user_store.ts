import { atomWithStorage, createJSONStorage } from "jotai/utils";

export interface IRecord {
    id?: number;
    url: string;
    uuid: string;
    coverSrc: string; // 封面截图
    deadline: string; // 保存截止日
    createdAt: string; // 创建时间
}

export type UserConfigState = {
    tab: 'upload' | 'paste',
    validityPeriod: string,
    htmlCode: string,
    record: IRecord[]
};

export const userConfigAtom = atomWithStorage<UserConfigState>(
    "userConfig",
    {
        tab: 'upload',
        validityPeriod: '0',
        htmlCode: '',
        record: [],
    },
    createJSONStorage(() =>
        typeof window !== "undefined"
            ? sessionStorage
            : {
                getItem: () => null,
                setItem: () => null,
                removeItem: () => null,
            }
    ),
    {
        getOnInit: true,
    }
);
