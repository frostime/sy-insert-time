<!--
 设置面板：一行一个模板，实时预览 + 校验 + 快捷键入口。
 只编辑本地草稿，点保存时才交给插件持久化。
-->
<script lang="ts">
    import { onMount, tick } from "svelte";
    import { confirm, openSetting } from "siyuan";
    import { COMMAND_PREFIX, i18n } from "@/libs/const";
    import { DefaultTemplates, type ITemplate } from "@/libs/store";
    import { formatDateTime } from "@/libs/format";
    import {
        draftsToTemplates,
        toDrafts,
        validateDrafts,
        type ITemplateDraft,
        type TFieldProblem,
        type TProblemField,
        type TTemplateProblems,
    } from "@/libs/template-validation";

    export let templates: Record<string, ITemplate>;
    export let pluginName: string;
    export let onSave: (templates: Record<string, ITemplate>) => void;
    export let onCancel: () => void;

    const PLACEHOLDERS = ["yyyy", "yy", "MM", "dd", "HH", "mm", "ss", "e", "E", "EEEE", "ECN"];

    /** 思源用零宽空格拼接键位路径 */
    const ZWSP = String.fromCharCode(0x200b);

    const initialSignature = JSON.stringify(toDrafts(templates));

    let drafts: ITemplateDraft[] = toDrafts(templates);
    let pendingDelete: string | null = null;
    let now = new Date();
    let hotkeys: Record<string, string> = readHotkeys();
    let panelElement: HTMLDivElement;

    $: validation = validateDrafts(drafts);
    $: canSave = validation.count === 0;
    $: dirty = JSON.stringify(drafts) !== initialSignature;
    $: enabledCount = drafts.filter(draft => draft.enabled).length;
    $: boundCount = drafts.filter(draft => draft.enabled && hotkeys[draft.key]).length;
    $: problemRows = collectProblemRows(drafts, validation.problems);

    export const isDirty = () => dirty;

    onMount(() => {
        const timer = setInterval(() => {
            now = new Date();
            hotkeys = readHotkeys();
        }, 1000);
        return () => clearInterval(timer);
    });

    /**
     * 插件 API 暴露的 openSetting(app) 不接受 tab 参数（对应的是内部 openPluginSetting），
     * 所以打开设置后手动切到快捷键页。
     */
    const openSettingDialog = openSetting as unknown as (app: unknown) => { element?: HTMLElement } | undefined;

    function readHotkeys(): Record<string, string> {
        const pluginKeymap = (window.siyuan?.config?.keymap?.plugin ?? {}) as Record<string,
            Record<string, { custom?: string; default?: string }>>;
        const bindings = pluginKeymap[pluginName] ?? {};
        const result: Record<string, string> = {};
        Object.entries(bindings).forEach(([langKey, keys]) => {
            if (!langKey.startsWith(COMMAND_PREFIX)) return;
            result[langKey.slice(COMMAND_PREFIX.length)] = keys?.custom || keys?.default || "";
        });
        return result;
    }

    const updateField = (draft: ITemplateDraft, field: "name" | "filterText" | "template") =>
        (event: Event) => {
            draft[field] = (event.currentTarget as HTMLInputElement).value;
            drafts = [...drafts];
        };

    const invalidate = () => {
        drafts = [...drafts];
    };

    function problemText(problem: TFieldProblem): string {
        switch (problem.code) {
            case "name-empty":
                return i18n.problemNameEmpty;
            case "name-duplicate":
                return i18n.problemNameDuplicate;
            case "filter-empty":
                return i18n.problemFilterEmpty;
            case "filter-duplicate":
                return fill(i18n.problemFilterDuplicate, problem.command);
            case "template-unknown":
                return fill(i18n.problemTemplateUnknown, problem.tokens.join("、"));
        }
    }

    function collectProblemRows(rows: ITemplateDraft[], problems: Record<string, TTemplateProblems>) {
        const result: { key: string; field: TProblemField; name: string; text: string }[] = [];
        rows.forEach(row => {
            const rowProblems = problems[row.key] ?? {};
            (Object.keys(rowProblems) as TProblemField[]).forEach(field => {
                const problem = rowProblems[field];
                if (!problem) return;
                result.push({
                    key: row.key,
                    field,
                    name: row.name.trim() || i18n.untitled,
                    text: problemText(problem),
                });
            });
        });
        return result;
    }

    function fill(text: string, ...args: string[]): string {
        return text.replace(/\{(\d+)\}/g, (_, index) => args[Number(index)] ?? "");
    }

    async function locate(key: string, field: TProblemField) {
        await tick();
        const input = panelElement.querySelector<HTMLInputElement>(`[data-field="${field}"][data-key="${key}"]`);
        input?.focus();
        input?.select();
    }

    function addDraft() {
        const key = `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        drafts = [
            ...drafts,
            {
                key,
                name: `${i18n.newTemplate} ${drafts.length + 1}`,
                enabled: false,
                filterText: "",
                template: "yyyy-MM-dd",
            },
        ];
    }

    function removeDraft(key: string) {
        drafts = drafts.filter(draft => draft.key !== key);
        pendingDelete = null;
    }

    function resetDrafts() {
        confirm(i18n.resetConfirm[0], i18n.resetConfirm[1], () => {
            drafts = toDrafts(DefaultTemplates());
            pendingDelete = null;
        });
    }

    function save() {
        if (!canSave) return;
        onSave(draftsToTemplates(drafts));
    }

    function openShortcutSettings() {
        const app = (window.siyuan as unknown as { ws?: { app?: unknown } }).ws?.app ?? window.siyuan;
        const dialog = openSettingDialog(app);
        dialog?.element
            ?.querySelector<HTMLElement>('.config__side .b3-list-item[data-name="keymap"]')
            ?.click();
        revealCommandRows();
    }

    /** 思源设置里的快捷键列表按「插件」分组、用命令名显示，这里滚动并高亮本插件的行 */
    function revealCommandRows() {
        const prefix = `plugin${ZWSP}${pluginName}${ZWSP}`;
        const deadline = Date.now() + 2500;
        const step = () => {
            const rows = Array.from(document.querySelectorAll<HTMLElement>(
                `.config-keymap__row[data-key^="${prefix}"]`));
            if (rows.length > 0) {
                const panel = rows[0].closest(".b3-list__panel");
                if (panel?.classList.contains("fn__none")) {
                    panel.classList.remove("fn__none");
                    panel.previousElementSibling?.querySelector(".b3-list-item__arrow")
                        ?.classList.add("b3-list-item__arrow--open");
                }
                rows[0].scrollIntoView({block: "center"});
                rows.forEach(row => {
                    row.style.transition = "box-shadow .25s";
                    row.style.boxShadow = "inset 0 0 0 2px var(--b3-theme-primary)";
                });
                setTimeout(() => rows.forEach(row => {
                    row.style.boxShadow = "";
                }), 1600);
                return;
            }
            if (Date.now() < deadline) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }
</script>

<div class="panel" bind:this={panelElement}>
    <div class="panel__scroll">
        {#if validation.count > 0}
            <div class="banner banner--warn">{fill(i18n.problemsCount, String(validation.count))}</div>
        {:else}
            <div class="banner banner--ok">{fill(i18n.summary, String(drafts.length), String(enabledCount), String(boundCount))}</div>
        {/if}

        <details class="help">
            <summary>{i18n.placeholders}</summary>
            <div class="chips">
                {#each PLACEHOLDERS as token}
                    <span class="chip" title={formatDateTime(token, now)}>{token}</span>
                {/each}
                <p class="help__note">{i18n.placeholdersNote}</p>
            </div>
        </details>

        {#if drafts.length === 0}
            <div class="empty">{i18n.emptyTemplates}</div>
        {:else}
            <div class="table-wrap">
                <table class="templates">
                    <colgroup>
                        <col class="col-switch" />
                        <col class="col-name" />
                        <col class="col-filter" />
                        <col class="col-template" />
                        <col class="col-preview" />
                        <col class="col-shortcut" />
                        <col class="col-ops" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th></th>
                            <th class="col-name">{i18n.name}</th>
                            <th class="col-filter">{i18n.filter}</th>
                            <th class="col-template">{i18n.template}</th>
                            <th class="col-preview">{i18n.preview}</th>
                            <th class="col-shortcut">{i18n.shortcut}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each drafts as draft (draft.key)}
                            {@const problems = validation.problems[draft.key] ?? {}}
                            <tr class:is-off={!draft.enabled} class:is-wrong={Object.keys(problems).length > 0}>
                                <td class="col-switch">
                                    <input
                                        class="b3-switch"
                                        type="checkbox"
                                        bind:checked={draft.enabled}
                                        on:change={invalidate}
                                    />
                                </td>
                                <td>
                                    <input
                                        class="b3-text-field field"
                                        class:is-error={Boolean(problems.name)}
                                        data-field="name"
                                        data-key={draft.key}
                                        value={draft.name}
                                        on:input={updateField(draft, "name")}
                                    />
                                </td>
                                <td>
                                    <input
                                        class="b3-text-field field"
                                        class:is-error={Boolean(problems.filter)}
                                        data-field="filter"
                                        data-key={draft.key}
                                        value={draft.filterText}
                                        on:input={updateField(draft, "filterText")}
                                    />
                                </td>
                                <td>
                                    <input
                                        class="b3-text-field field"
                                        class:is-error={Boolean(problems.template)}
                                        data-field="template"
                                        data-key={draft.key}
                                        value={draft.template}
                                        on:input={updateField(draft, "template")}
                                    />
                                </td>
                                <td class="col-preview">
                                    <code title={formatDateTime(draft.template, now)}>{formatDateTime(draft.template, now)}</code>
                                </td>
                                <td class="col-shortcut">
                                    <button class="shortcut" title={i18n.shortcutHint} on:click={openShortcutSettings}>
                                        {#if hotkeys[draft.key]}
                                            <kbd>{hotkeys[draft.key]}</kbd>
                                        {:else}
                                            <kbd class="is-empty">{i18n.unsetShortcut}</kbd>
                                        {/if}
                                    </button>
                                </td>
                                <td class="col-ops">
                                    <button class="icon-button" title={i18n.delete} on:click={() => pendingDelete = draft.key}>✕</button>
                                </td>
                            </tr>
                            {#if pendingDelete === draft.key}
                                <tr class="confirm-row">
                                    <td colspan="7">
                                        <div class="confirm">
                                            <span>{i18n.deleteConfirm}</span>
                                            <span class="spacer"></span>
                                            <button class="b3-button b3-button--remove" on:click={() => removeDraft(draft.key)}>{i18n.delete}</button>
                                            <button class="b3-button b3-button--cancel" on:click={() => pendingDelete = null}>{i18n.cancel}</button>
                                        </div>
                                    </td>
                                </tr>
                            {/if}
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}

        {#if problemRows.length > 0}
            <ul class="problems">
                {#each problemRows as row (`${row.key}-${row.field}`)}
                    <li>
                        <span class="problems__name">{row.name}</span>
                        <span>{row.text}</span>
                        <button class="b3-button b3-button--text problems__locate" on:click={() => locate(row.key, row.field)}>
                            {i18n.locate}
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}

        <div class="row-actions">
            <button class="b3-button b3-button--text" on:click={addDraft}>{i18n.add}</button>
            <button class="b3-button b3-button--text" on:click={resetDrafts}>{i18n.reset}</button>
        </div>
    </div>

    <div class="panel__foot">
        <span>
            {#if validation.count > 0}
                {fill(i18n.problemsShort, String(validation.count))}
            {:else}
                {fill(i18n.summary, String(drafts.length), String(enabledCount), String(boundCount))}
            {/if}
        </span>
        <span class="foot-actions">
            <button class="b3-button b3-button--cancel" on:click={onCancel}>{i18n.cancel}</button>
            <button class="b3-button b3-button--text" disabled={!canSave} on:click={save}>{i18n.save}</button>
        </span>
    </div>
</div>

<style lang="scss">
    .panel {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        padding: 12px 16px 0;
        font-size: 14px;
        box-sizing: border-box;
    }

    .panel__scroll {
        flex: 1;
        min-height: 0;
        overflow: auto;
    }

    .panel__foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 0;
        border-top: 1px solid var(--b3-border-color);
        font-size: 12.5px;
        color: var(--b3-theme-on-surface);
    }

    .foot-actions {
        display: inline-flex;
        gap: 6px;
    }

    .banner {
        font-size: 12.5px;
        padding: 8px 10px;
        border-radius: 6px;
        margin-bottom: 10px;
        line-height: 1.5;
    }

    .banner--warn {
        background: var(--b3-card-warning-background);
        color: var(--b3-card-warning-color);
    }

    .banner--ok {
        background: var(--b3-card-success-background);
        color: var(--b3-card-success-color);
    }

    .help {
        margin-bottom: 12px;
        font-size: 12.5px;
        color: var(--b3-theme-on-surface);
    }

    .help summary {
        cursor: pointer;
        user-select: none;
    }

    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
    }

    .chip {
        font-family: var(--b3-font-family-code);
        font-size: 11.5px;
        padding: 1px 6px;
        border: 1px solid var(--b3-border-color);
        border-radius: 4px;
        background: var(--b3-theme-surface);
        color: var(--b3-theme-on-background);
    }

    .help__note {
        width: 100%;
        margin: 4px 0 0;
        font-size: 11.5px;
    }

    .empty {
        padding: 24px 0;
        text-align: center;
        color: var(--b3-theme-on-surface);
    }

    .table-wrap {
        overflow-x: auto;
        border: 1px solid var(--b3-border-color);
        border-radius: 8px;
    }

    table.templates {
        width: 100%;
        min-width: 725px;
        border-collapse: collapse;
        table-layout: fixed;
    }

    .templates th {
        text-align: left;
        padding: 8px 10px;
        border-bottom: 1px solid var(--b3-border-color);
        background: var(--b3-theme-surface);
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
    }

    .templates th.col-name,
    .templates th.col-filter,
    .templates th.col-template {
        padding-left: 19px;
    }

    .templates td {
        height: 46px;
        padding: 6px 10px;
        border-bottom: 1px solid var(--b3-border-color);
        vertical-align: middle;
    }

    .templates tbody tr:last-child td {
        border-bottom: 0;
    }

    .templates .col-switch {
        width: 40px;
        padding-right: 2px;
    }

    .templates .col-name {
        width: 99px;
    }

    .templates .col-filter {
        width: 138px;
    }

    .templates .col-template {
        width: 175px;
    }

    .templates .col-preview {
        width: 143px;
    }

    .templates .col-shortcut {
        width: 96px;
    }

    .templates .col-ops {
        width: 34px;
        padding-left: 0;
    }

    .templates tr:hover td,
    .templates tr:focus-within td {
        background: var(--b3-theme-surface);
    }

    .templates tr.is-off .field,
    .templates tr.is-off .col-preview,
    .templates tr.is-off .col-shortcut {
        opacity: .55;
    }

    .templates tr.is-wrong td:first-child {
        box-shadow: inset 3px 0 0 var(--b3-card-error-color);
    }

    .templates .field {
        width: 100%;
        height: 28px;
        padding: 0 8px;
        font-size: 13px;
        box-sizing: border-box;
    }

    .templates .field.is-error {
        border-color: var(--b3-card-error-color);
    }

    .col-preview code {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--b3-font-family-code);
        font-size: 11px;
        color: var(--b3-theme-on-background);
    }

    .shortcut {
        border: 0;
        background: transparent;
        padding: 0;
        cursor: pointer;
        color: inherit;
    }

    .shortcut:hover kbd {
        border-color: var(--b3-theme-primary);
        color: var(--b3-theme-primary);
    }

    kbd {
        font-family: var(--b3-font-family-code);
        font-size: 12px;
        padding: 1px 6px;
        border: 1px solid var(--b3-border-color);
        border-bottom-width: 2px;
        border-radius: 4px;
        background: var(--b3-theme-surface);
        color: var(--b3-theme-on-background);
    }

    kbd.is-empty {
        background: transparent;
        border-style: dashed;
        color: var(--b3-theme-on-surface);
    }

    .icon-button {
        border: 0;
        background: transparent;
        padding: 2px 4px;
        border-radius: 4px;
        line-height: 1;
        cursor: pointer;
        color: var(--b3-theme-on-surface);
    }

    .icon-button:hover {
        color: var(--b3-card-error-color);
        background: var(--b3-card-error-background);
    }

    .confirm-row td {
        background: var(--b3-card-error-background);
    }

    .confirm {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 12.5px;
        color: var(--b3-card-error-color);
    }

    .confirm .spacer {
        flex: 1;
    }

    .problems {
        list-style: none;
        margin: 10px 0 0;
        padding: 10px 12px;
        border-radius: 8px;
        background: var(--b3-card-warning-background);
        color: var(--b3-card-warning-color);
        font-size: 12.5px;
    }

    .problems li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 0;
    }

    .problems__name {
        font-weight: 600;
    }

    .problems__locate {
        margin-left: auto;
        padding: 0 6px;
        font-size: 12px;
    }

    .row-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        padding: 8px 0 10px;
    }
</style>
