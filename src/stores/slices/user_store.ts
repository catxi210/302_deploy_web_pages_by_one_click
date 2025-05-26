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
    tab: 'upload' | 'paste' | 'markdown',
    validityPeriod: string,
    htmlCode: string,
    md: string;
    record: IRecord[]
};

const md = `
# 你好，世界！

这是正文内容，用于测试你的元数据解析代码。

- 这是一条列表
- 这也是一条列表

> 引用内容`;
 
export const userConfigAtom = atomWithStorage<UserConfigState>(
    "userConfig",
    {
        tab: 'upload',
        validityPeriod: '0',
        htmlCode: '',
        record: [],
        md,
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
