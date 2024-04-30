/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-08-19 18:51:23
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2024-04-30 22:05:51
 * @Description  : 
 */
import {
    Plugin,
    Protyle,
    Setting
} from "siyuan";

import { SettingUtils } from "./libs/setting-utils";
import "./index.scss";

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

let settings: SettingUtils;

export default class InsertTimePlugin extends Plugin {

    updateBindThis = this.update.bind(this);

    Templates: {[key: string]: {filter: string[], name: string, template: string}} = {};

    async onload() {

        I18n = this.i18n;

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

        settings = new SettingUtils({
            plugin: this,
            name: 'templates.json',
            width: '800px',
            height: '600px',
            callback: (data) => {
                delete data['hint'];
                this.Templates = data;
                this.updateSlash();
            }
        });
        settings.addItem({
            type: 'hint',
            key: 'hint',
            value: '',
            title: '<span style="color: var(--b3-theme-primary); font-size: 1.25em; font-weight: bold">Hint</span>',
            description: this.i18n.description,
            direction: 'row'
        });
        for (let key in this.Templates) {
            const Templates = this.Templates;
            settings.addItem({
                key: key,
                title: Templates[key].name,
                description: `Id: ${key}`,
                type: 'custom',
                direction: 'row',
                value: {
                    filter: Templates[key].filter,
                    name: Templates[key].name,
                    template: Templates[key].template
                },
                createElement: (currentVal) => {
                    const html = `
                    <div class="fn__flex conf-item" style="gap: 10px;">
                        <div class="fn__flex-1">
                            <span display="inline-block">名称</span>
                            <div class="fn__space"></div>
                            <input
                                class="name b3-text-field fn__flex-center"
                                type="text" value="${currentVal.name}"
                            />
                        </div>
                        <div class="fn__flex-1">
                            <span display="inline-block">${I18n.filter}</span>
                            <div class="fn__space"></div>
                            <input
                                class="filter b3-text-field fn__flex-center"
                                type="text" value="${currentVal.filter.join(',')}"
                            />
                        </div>
                        <div class="fn__flex-1">
                            <span display="inline-block">${I18n.template}</span>
                            <div class="fn__space"></div>
                            <input
                                class="template b3-text-field fn__flex-center"
                                type="text" value="${currentVal.template}"
                            />
                        </div>
                    </div>
                    `;
                    const div = document.createElement('div');
                    div.innerHTML = html;
                    return div.querySelector('.conf-item') as HTMLElement;
                },
                getEleVal: (ele) => {
                    return {
                        filter: (<HTMLInputElement>ele.querySelector('.filter')).value.split(',').map((item) => item.trim()),
                        name: (<HTMLInputElement>ele.querySelector('.name')).value,
                        template: (<HTMLInputElement>ele.querySelector('.template')).value
                    }
                },
                setEleVal: (ele, val) => {
                    (<HTMLInputElement>ele.querySelector('.filter')).value = val.filter.join(',');
                    (<HTMLInputElement>ele.querySelector('.name')).value = val.name;
                    (<HTMLInputElement>ele.querySelector('.template')).value = val.template;
                },
            });
        }

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
                    this.Templates[id].template = data[id]?.template || this.Templates[id].template;
                    this.Templates[id].filter = data[id]?.filter || this.Templates[id].filter;
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