import type zh_CN from '@/i18n/zh_CN.json';

export let i18n: typeof zh_CN;

export const setI18n = (i18n_: typeof zh_CN) => {
    i18n = i18n_;
}
