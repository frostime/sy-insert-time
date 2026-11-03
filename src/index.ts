import {
    Plugin, Protyle, confirm, getActiveEditor, getFrontend,
    type Dialog, type ICommand, type ICommandContext, type IProtyle,
} from "siyuan";

import { COMMAND_PREFIX, setI18n } from "./libs/const";
import { formatDateTime } from "./libs/format";
import { svelteDialog } from "./libs/dialog";
import { DefaultTemplates, type ITemplate } from "./libs/store";
import SettingPanel from "@/components/setting-panel.svelte";

/** 斜杠项除了插件的字段，还带一个给基类调用的 update */
type TPluginSlash = Plugin["protyleSlash"][number] & { update: () => void };

const escapeHtml = (text: string) => text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export default class InsertTimePlugin extends Plugin {

    private updateBindThis = this.update.bind(this);
    private templates: Record<string, ITemplate> = {};
    /** 每个模板注册过一次命令就不能重复注册，这里记住已经注册过的对象，改名时原地更新 */
    private templateCommands = new Map<string, ICommand>();

    async onload() {
        setI18n(this.i18n as typeof import("@/i18n/zh_CN.json"));
        this.templates = DefaultTemplates();

        await this.load();
        this.refreshSlash();
        this.registerCommands();

        window.addEventListener('keypress', this.updateBindThis);
    }

    onunload() {
        window.removeEventListener('keypress', this.updateBindThis);
    }

    openSetting() {
        let forceClose = false;
        let dialog: Dialog | undefined;
        let panel: SettingPanel | undefined;

        const close = (discardChanges: boolean) => {
            forceClose = discardChanges;
            dialog?.destroy();
        };

        const opened = svelteDialog({
            title: this.displayName || this.name,
            width: getFrontend().endsWith("mobile") ? "92vw" : "800px",
            height: getFrontend().endsWith("mobile") ? "82vh" : "640px",
            beforeClose: () => {
                if (forceClose || !panel?.isDirty()) return true;
                confirm(this.i18n.unsavedTitle as string, this.i18n.unsavedBody as string, () => close(true));
                return false;
            },
            createComponent: (container) => new SettingPanel({
                target: container,
                props: {
                    templates: this.templates,
                    pluginName: this.name,
                    onSave: (templates: Record<string, ITemplate>) => {
                        this.templates = templates;
                        void this.save();
                        this.refreshSlash();
                        this.registerCommands();
                        close(true);
                    },
                    onCancel: () => close(true),
                },
            }),
        });

        dialog = opened.dialog;
        panel = opened.component;
    }

    /** 斜杠菜单：每行显示模板名和当前的插入结果 */
    private refreshSlash() {
        this.protyleSlash = Object.entries(this.templates)
            .filter(([, template]) => template.enabled)
            .map<TPluginSlash>(([key, template]) => {
                const name = escapeHtml(template.name);
                return {
                    filter: template.filter,
                    id: key,
                    html: `<span>${name} ${formatDateTime(template.template)}</span>`,
                    callback: (protyle: Protyle) => {
                        const current = this.templates[key];
                        if (!current || !current.enabled) return;
                        protyle.insert(formatDateTime(current.template), false);
                    },
                    update() {
                        this.html = `<span>${name} <b>${formatDateTime(template.template)}</b></span>`;
                    },
                };
            });
    }

    /**
     * 为每个模板注册一条命令，快捷键由用户在思源「设置 → 快捷键」里绑定。
     * 同一个 langKey 重复注册会被思源拒绝，所以只注册一次，之后只更新显示名。
     */
    private registerCommands() {
        Object.entries(this.templates).forEach(([key, template]) => {
            const registered = this.templateCommands.get(key);
            if (registered) {
                registered.langText = template.name;
                return;
            }
            const command: ICommand = {
                langKey: `${COMMAND_PREFIX}${key}`,
                langText: template.name,
                hotkey: "",
                // 快捷键走 editorCallback；旧版命令面板只认 callback，两个都给，新版不会重复触发
                callback: (context?: ICommandContext) => this.insertTemplate(key, context?.protyle),
                editorCallback: (protyle: IProtyle) => this.insertTemplate(key, protyle),
            };
            this.templateCommands.set(key, command);
            this.addCommand(command);
        });
    }

    private insertTemplate(key: string, protyle?: IProtyle) {
        const template = this.templates[key];
        if (!template || !template.enabled) return;
        // 命令回调拿到的是内部 IProtyle，insert 在它对应的 Protyle 实例上
        const editor = protyle?.getInstance?.() ?? this.activeEditor();
        if (!editor?.insert) return;
        editor.insert(formatDateTime(template.template), false);
    }

    private activeEditor(): Protyle | undefined {
        try {
            return getActiveEditor();
        } catch (error) {
            return undefined;
        }
    }

    private async load() {
        const data = await this.loadData('templates.json');
        if (data && typeof data === "object") {
            this.templates = data as Record<string, ITemplate>;
        }
    }

    private async save() {
        await this.saveData('templates.json', this.templates);
    }

    private update(event: KeyboardEvent) {
        if (event.key !== "/") return;
        this.protyleSlash.forEach(slash => (slash as TPluginSlash).update?.());
    }
}
