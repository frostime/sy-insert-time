/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-03-23 21:37:33
 * @FilePath     : /src/libs/dialog.ts
 * @LastEditTime : 2024-08-18 22:27:18
 * @Description  : Kits about dialogs
 */
import { Dialog } from "siyuan";
import { type SvelteComponent } from "svelte";

export const simpleDialog = (args: {
    title: string, ele: HTMLElement | DocumentFragment,
    width?: string, height?: string,
    callback?: () => void;
}) => {
    const dialog = new Dialog({
        title: args.title,
        content: `<div class="dialog-content" style="display: flex; height: 100%;"/>`,
        width: args.width,
        height: args.height,
        destroyCallback: args.callback
    });
    dialog.element.querySelector(".dialog-content").appendChild(args.ele);
    return dialog;
}


export const svelteDialog = (args: {
    title: string, constructor: (container: HTMLElement) => SvelteComponent,
    width?: string, height?: string,
    callback?: () => void;
}) => {
    let container = document.createElement('div')
    container.style.display = 'contents';
    let component = args.constructor(container);
    simpleDialog({...args, ele: container, callback: () => {
        component.$destroy();
        if (args.callback) args.callback();;
    }});
    return component;
}