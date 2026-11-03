import { unknownTokens } from "./format";
import type { ITemplate } from "./store";

/** 设置面板里正在编辑的一行，与持久化的 ITemplate 分开保存输入框原始文本 */
export interface ITemplateDraft {
    key: string;
    name: string;
    enabled: boolean;
    filterText: string;
    template: string;
}

export type TProblemField = "name" | "filter" | "template";

export type TFieldProblem =
    | { code: "name-empty" }
    | { code: "name-duplicate" }
    | { code: "filter-empty" }
    | { code: "filter-duplicate"; command: string }
    | { code: "template-unknown"; tokens: string[] };

export type TTemplateProblems = Partial<Record<TProblemField, TFieldProblem>>;

export interface IValidationResult {
    problems: Record<string, TTemplateProblems>;
    /** 有问题的字段总数，用于禁用保存与显示计数 */
    count: number;
}

/** 指令输入框允许用中英文逗号分隔，这里统一拆分并去掉空白 */
export const parseFilters = (text: string): string[] =>
    text.split(/[,，]/).map(filter => filter.trim()).filter(Boolean);

export const toDrafts = (templates: Record<string, ITemplate>): ITemplateDraft[] =>
    Object.entries(templates).map(([key, template]) => ({
        key,
        name: template.name,
        enabled: template.enabled,
        filterText: template.filter.join(", "),
        template: template.template,
    }));

export const draftsToTemplates = (drafts: ITemplateDraft[]): Record<string, ITemplate> => {
    const templates: Record<string, ITemplate> = {};
    drafts.forEach(draft => {
        templates[draft.key] = {
            name: draft.name.trim(),
            enabled: draft.enabled,
            filter: parseFilters(draft.filterText),
            template: draft.template,
        };
    });
    return templates;
};

export const validateDrafts = (drafts: ITemplateDraft[]): IValidationResult => {
    const nameCounts = new Map<string, number>();
    const filterCounts = new Map<string, number>();
    drafts.forEach(draft => {
        const name = draft.name.trim().toLowerCase();
        if (name) nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
        parseFilters(draft.filterText).forEach(filter => {
            const key = filter.toLowerCase();
            filterCounts.set(key, (filterCounts.get(key) ?? 0) + 1);
        });
    });

    const problems: Record<string, TTemplateProblems> = {};
    let count = 0;

    drafts.forEach(draft => {
        const row: TTemplateProblems = {};
        const name = draft.name.trim();
        if (!name) {
            row.name = { code: "name-empty" };
        } else if ((nameCounts.get(name.toLowerCase()) ?? 0) > 1) {
            row.name = { code: "name-duplicate" };
        }

        const filters = parseFilters(draft.filterText);
        if (filters.length === 0) {
            row.filter = { code: "filter-empty" };
        } else {
            const duplicated = filters.find(filter => (filterCounts.get(filter.toLowerCase()) ?? 0) > 1);
            if (duplicated) {
                row.filter = { code: "filter-duplicate", command: duplicated };
            }
        }

        const unknown = unknownTokens(draft.template);
        if (unknown.length > 0) {
            row.template = { code: "template-unknown", tokens: unknown };
        }

        if (Object.keys(row).length > 0) {
            problems[draft.key] = row;
            count += Object.keys(row).length;
        }
    });

    return { problems, count };
};
