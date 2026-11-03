import { Dialog } from "siyuan";
import type { SvelteComponent } from "svelte";

interface ISvelteDialogOptions<T extends SvelteComponent> {
    title: string;
    /** 组件挂载在对话框正文里，自己负责布局与滚动 */
    createComponent: (container: HTMLElement) => T;
    width?: string;
    height?: string;
    /** 返回 false 时不关闭，用于拦截未保存的修改 */
    beforeClose?: () => boolean;
}

export const svelteDialog = <T extends SvelteComponent>(options: ISvelteDialogOptions<T>) => {
    let component: T | undefined;
    // beforeClose 是较新版本思源才有的选项，旧版本会忽略它，此时只是少了未保存拦截
    const options_ = {
        title: options.title,
        content: '<div class="plugin-panel-root" style="display: flex; flex-direction: column; flex: 1; min-height: 0;"></div>',
        width: options.width,
        height: options.height,
        destroyCallback: () => component?.$destroy(),
        beforeClose: options.beforeClose,
    };
    const dialog = new Dialog(options_ as unknown as ConstructorParameters<typeof Dialog>[0]);
    const container = dialog.element.querySelector(".plugin-panel-root") as HTMLElement;
    component = options.createComponent(container);
    return { dialog, component };
}
