/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-08-19 18:51:23
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2023-11-22 14:42:45
 * @Description  : 
 */
import {
    Plugin,
    Protyle
} from "siyuan";


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
    return renderString(template, {
        'yyyy': year.toString(),
        'MM': month.toString().padStart(2, '0'),
        'dd': day.toString().padStart(2, '0'),
        'HH': hour.toString().padStart(2, '0'),
        'mm': minute.toString().padStart(2, '0'),
        'ss': second.toString().padStart(2, '0'),
        'yy': year.toString().slice(-2),
    });
}


export default class InsertTimePlugin extends Plugin {

    updateBindThis = this.update.bind(this);

    Templates: {[key: string]: {filter: string[], name: string, template: string}} = {};

    async onload() {

        this.Templates = {
            datetime: {
                filter: ['xz', 'now'],
                name: this.i18n.now,
                template: 'yyyy-MM-dd HH:mm:ss'
            },
            date: {
                filter: ['rq', 'date', 'jt', 'today'],
                name: this.i18n.date,
                template: 'yyyy-MM-dd'
            },
            time: {
                filter: ['sj', 'time'],
                name: this.i18n.time,
                template: 'HH:mm:ss'
            }
        };

        await this.load();
        this.updateSlash();
        window.addEventListener('keypress', this.updateBindThis);
    }

    onunload() {
        window.removeEventListener('keypress', this.updateBindThis);
        this.saveData('templates.json', this.Templates);
    }

    updateSlash() {
        this.protyleSlash = Object.values(this.Templates).map((template) => {
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
        if (data !== undefined && data !== null) {
            for (let id in this.Templates) {
                if (data[id] !== undefined) {
                    this.Templates[id] = data[id];
                }
            }
        }
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