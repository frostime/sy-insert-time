/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-08-19 18:51:23
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2023-08-19 19:55:30
 * @Description  : 
 */
import {
    Plugin,
    Protyle
} from "siyuan";

let i18n;


export default class InsertTimePlugin extends Plugin {

    updateBindThis = this.update.bind(this);

    onload() {
        i18n = this.i18n;
        const now = (date = true, time = true) => {
            let now = new Date();
            let year = now.getFullYear();
            let month = now.getMonth() + 1;
            let day = now.getDate();
            let hour = now.getHours();
            let minute = now.getMinutes();
            let second = now.getSeconds();
            let result = '';

            let strdate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            let strtime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
            if (date && time) {
                result = `${strdate} ${strtime}`;
            } else if (date) {
                result = strdate;
            } else if (time) {
                result = strtime;
            }
            return result;
        }

        this.protyleSlash = [
            {
                filter: ['sj', 'time'],
                html: `<span id="time">${this.i18n.time} ${now(false, true)}</span>`,
                id: 'time',
                callback: (protyle: Protyle) => {
                    let strnow = now(false, true);
                    console.log(this.i18n.time, strnow);
                    protyle.insert(strnow, false);
                },
                //@ts-ignore
                update() {
                    this.html = `<span id="time">${i18n.time} ${now(false, true)}</span>`;
                }
            },
            {
                filter: ['rq', 'date', 'jt', 'today'],
                html: `<span id="date">${this.i18n.date} ${now(true, false)}</span>`,
                id: 'date',
                callback: (protyle: Protyle) => {
                    let strnow = now(true, false);
                    console.log(this.i18n.date, strnow);
                    protyle.insert(strnow, false);
                },
                //@ts-ignore
                update() {
                    this.html = `<span id="date">${i18n.date} ${now(true, false)}</span>`;
                }
            },
            {
                filter: ['xz', 'now'],
                html: `<span id="datetime">${this.i18n.now} ${now()}</span>`,
                id: 'now',
                callback: (protyle: Protyle) => {
                    let strnow = now();
                    console.log(this.i18n.now, strnow);
                    protyle.insert(strnow, false);
                },
                //@ts-ignore
                update() {
                    this.html = `<span id="datetime">${i18n.now} ${now()}</span>`;
                }
            }
        ]

        window.addEventListener('keypress', this.updateBindThis);
    }

    onunload() {
        window.removeEventListener('keypress', this.updateBindThis);
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