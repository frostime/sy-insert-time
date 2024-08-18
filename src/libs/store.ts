import { get, writable } from "svelte/store"
import { i18n } from "./const"

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
            template: '[EEEE] yyyy-MM-dd'
        },
        time: {
            filter: ['sj', 'time'],
            name: i18n.time,
            enabled: true,
            template: 'HH:mm:ss'
        }
    }
}


export const useTemplates = (iniVal: Record<string, ITemplate>) => {
    const templates_ = writable<Record<string, ITemplate>>(iniVal);
    let keys_ = Object.keys(iniVal);
    return {
        templates: templates_,
        keys: () => keys_,
        reset: () => {
            let t = DefaultTemplates();
            templates_.set(t);
            keys_ = Object.keys(t);
        },
        dump: () => get(templates_),
        update: (key: string, value: ITemplate) => {
            templates_.update(t => {
                t[key].name = value.name || t[key].name;
                t[key].enabled = value.enabled ?? t[key].enabled;
                t[key].template = value.template || t[key].template;
                t[key].filter = value.filter || t[key].filter;
                return t;
            });
            if (!keys_.includes(key)) {
                keys_.push(key);
            }
        },
        remove: (key: string) => {
            templates_.update(t => {
                delete t[key];
                return t;
            });
            keys_ = keys_.filter(k => k !== key);
        },
        iterate: (fn: (key: string, value: ITemplate) => void) => {
            let templates = get(templates_);
            for (let key of keys_) {
                fn(key, templates[key]);
            }
        }
    }
}

export default useTemplates;
