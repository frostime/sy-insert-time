/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-08-19 18:51:23
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2023-11-22 16:01:35
 * @Description  : 
 */
import {
    Plugin,
    Protyle,
    Setting
} from "siyuan";

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

        this.setting = new Setting({
            width: '700px',
            height: '500px',
            destroyCallback: () => { },
            confirmCallback: () => {
                const config_items: NodeListOf<HTMLElement> = document.querySelectorAll('.plugin-insert-time__conf-item');
                for (let ele of config_items) {
                    const key = ele.dataset.key;
                    const template = (<HTMLInputElement>ele.querySelector('#template')).value;
                    const filter = (<HTMLInputElement>ele.querySelector('#filter')).value.split(',').map((item) => item.trim());
                    this.Templates[key].template = template;
                    this.Templates[key].filter = filter;
                    console.debug(key, template, filter);
                }
                this.updateSlash();
                this.saveData('templates.json', this.Templates);
            }
        });
        this.setting.addItem({
            title: '<span style="color: var(--b3-theme-primary); font-size: 1.25em; font-weight: bold">Hint</span>',
            description: this.i18n.description
        })
        for (let key in this.Templates) {
            const Templates = this.Templates;
            this.setting.addItem({
                title: Templates[key].name,
                createActionElement() {
                    let template = Templates[key];
                    const html = `
                    <div class="fn__flex-column plugin-insert-time__conf-item" data-key="${key}" data-name="${template.name}">
                        <div class="form-row">
                            <span display="inline-block">${I18n.template}</span>
                            <div class="fn__space"></div>
                            <input
                                class="b3-text-field fn__flex-center fn__size200"
                                type="text" id="template" value="${template.template}"
                            />
                        </div>
                        <div class="form-row">
                            <span display="inline-block">${I18n.filter}</span>
                            <div class="fn__space"></div>
                            <input
                                class="b3-text-field fn__flex-center fn__size200"
                                type="text" id="filter" value="${template.filter.join(',')}"
                            />
                        </div>
                    </div>
                    `;
                    const div = document.createElement('div');
                    div.innerHTML = html;
                    return div;
                }
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