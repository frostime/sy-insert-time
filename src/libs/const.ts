import type zh_CN from '@/i18n/zh_CN.json';

export let i18n: typeof zh_CN;

export const setI18n = (i18n_: typeof zh_CN) => {
    i18n = i18n_;
}

/** 模板快捷键使用的命令 key 前缀，避免和以后的内置命令冲突 */
export const COMMAND_PREFIX = "template:";
