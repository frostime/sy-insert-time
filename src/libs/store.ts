import { i18n } from "./const";

export interface ITemplate {
    name: string;
    filter: string[];
    enabled: boolean;
    template: string;
}

export const DefaultTemplates = (): Record<string, ITemplate> => {
    return {
        datetime: {
            filter: ['xz', 'now'],
            name: i18n.now,
            enabled: true,
            template: 'yyyy-MM-dd HH:mm:ss'
        },
        date: {
            filter: ['rq', 'date', 'jt', 'today'],
            name: i18n.date,
            enabled: true,
            template: 'yyyy-MM-dd EEEE'
        },
        time: {
            filter: ['sj', 'time'],
            name: i18n.time,
            enabled: true,
            template: 'HH:mm:ss'
        }
    }
}
