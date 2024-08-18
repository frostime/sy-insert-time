/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-08-19 18:51:23
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2024-08-19 00:16:57
 * @Description  : 
 */
import {
    Plugin,
    Protyle
} from "siyuan";

// import { SettingUtils } from "./libs/setting-utils";
import useTemplates from "./libs/store";
import { DefaultTemplates } from "./libs/store";
import "./index.scss";
import { svelteDialog } from "./libs/dialog";

import SettingPanel from "@/components/setting-panel.svelte";
import { setI18n } from "./libs/const";

let I18n = null;


const renderString = (template: string, data: { [key: string]: string }) => {
    for (let key in data) {
        template = template.replace(key, data[key]);
    }
    return template;
}

const formatDateTime = (template: string, now?: Date) => {
    now = now || new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
    let weekday = now.getDay(); // 0 (Sunday) to 6 (Saturday)

    // 星期的中文表示
    const weekdaysInChinese = ["日", "一", "二", "三", "四", "五", "六"];
    const weekdaysInEnglishFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekdaysInEnglishShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return renderString(template, {
        'yyyy': year.toString(),
        'MM': month.toString().padStart(2, '0'),
        'dd': day.toString().padStart(2, '0'),
        'HH': hour.toString().padStart(2, '0'),
        'mm': minute.toString().padStart(2, '0'),
        'ss': second.toString().padStart(2, '0'),
        'yy': year.toString().slice(-2),
        'e': (weekday === 0 ? 7 : weekday).toString(),
        'EEEE': weekdaysInEnglishFull[weekday],
        'ECN': weekdaysInChinese[weekday],
        'E': weekdaysInEnglishShort[weekday],
    });
}

// let settings: SettingUtils;

export default class InsertTimePlugin extends Plugin {

    updateBindThis = this.update.bind(this);

    // Templates: {[key: string]: {filter: string[], name: string, enabled: boolean, template: string}} = {};

    TemplatesStore: ReturnType<typeof useTemplates>;

    async onload() {

        I18n = this.i18n;

        setI18n(I18n);

        // this.Templates = DefaultTemplates();
        this.TemplatesStore = useTemplates(DefaultTemplates());

        await this.load();
        this.updateSlash();

        window.addEventListener('keypress', this.updateBindThis);
    }

    openSetting() {
        svelteDialog({
            title:  this.name,
            constructor: (container: HTMLElement) => {
                return new SettingPanel({
                    target: container,
                    props: {
                        TemplatesStore: this.TemplatesStore
                    }
                });
            },
            width: '700px',
            height: '600px',
            callback: () => {
                this.updateSlash();
                this.save();
            }
        })
    }

    onunload() {
        window.removeEventListener('keypress', this.updateBindThis);
        // this.saveData('templates.json', this.TemplatesStore.dump());
    }

    updateSlash() {
        // let templates = Object.values(this.Templates).filter((template) => template.enabled);
        let tempVals = this.TemplatesStore.dump();
        let templates = Object.values(tempVals).filter((template) => template.enabled);
        this.protyleSlash = templates.map((template) => {
            return {
                filter: template.filter,
                html: `<span>${template.name} ${formatDateTime(template.template)}</span>`,
                id: template.name,
                callback: (protyle: Protyle) => {
                    let strnow = formatDateTime(template.template);
                    console.log(template.name, strnow);
                    protyle.insert(strnow, false);
                },
                //@ts-ignore
                update() {
                    this.html = `<span>${template.name} ${formatDateTime(template.template)}</span>`;
                }
            }
        });
    }

    async load() {
        let data = await this.loadData('templates.json');
        console.log('Load data', data);
        const keys = this.TemplatesStore.keys();
        if (data !== undefined && data !== null) {
            for (let id of keys) {
                if (data[id] !== undefined) {
                    this.TemplatesStore.update(id, data[id]);
                }
            }
        }
    }

    async save() {
        let data = this.TemplatesStore.dump();
        console.log('Save data', data);
        this.saveData('templates.json', data);
    }

    update(e) {
        if (e.key === '/') {
            this.protyleSlash.forEach((slash) => {
                //@ts-ignore
                slash.update();
            })
        }
    }
}