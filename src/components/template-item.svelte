<!--
 Copyright (c) 2024 by frostime. All Rights Reserved.
 Author       : frostime
 Date         : 2024-08-18 22:35:36
 FilePath     : /src/components/template-item.svelte
 LastEditTime : 2024-08-19 00:31:31
 Description  : 
-->
<script lang="ts">
    import { i18n as I18n } from "@/libs/const";
    import { ITemplate } from "@/libs/store";
    import { getContext, onDestroy } from "svelte";

    import useTemplates from "@/libs/store";

    export let key: string;
    export let template: ITemplate;

    const TemplatesStore: ReturnType<typeof useTemplates> =
        getContext("TemplatesStore");

    const filterChanged = (e: Event) => {
        const target = e.target as HTMLInputElement;
        template.filter = target.value.split(",");
    };

    let thisIsDeleted = false;
    const deleteThis = () => {
        thisIsDeleted = true;
        TemplatesStore.remove(key);
    }

    //$: TemplatesStore.update(key, template);

    onDestroy(() => {
        //如果这个模板被删除了，就不更新了
        if (thisIsDeleted) return;
        TemplatesStore.update(key, template);
    });
</script>

<div class="flex col conf-item" style="gap: 3px;">
    <div class="flex row1">
        <div class="flex-1" style="font-size: 1.1rem; font-weight: bold;">
            {key}
        </div>
        <div class="flex" style="gap: 10px;">
            <input
                class="b3-switch fn__flex-center"
                type="checkbox"
                bind:checked={template.enabled}
            />
            <span class="toolbar__item" on:click={deleteThis}>
                <svg><use xlink:href="#iconClose"></use></svg>
            </span>
        </div>
    </div>
    <div class="flex" style="gap: 5px;">
        <div class="flex col">
            <span>Name</span>
            <input
                class="name b3-text-field"
                type="text"
                bind:value={template.name}
                style="width: 120px;"
            />
        </div>
        <div class="flex col flex-1">
            <span>{I18n.filter}</span>
            <input
                class="filter b3-text-field"
                type="text"
                value={template.filter.join(",")}
                on:change={filterChanged}
            />
        </div>
        <div class="flex col flex-2">
            <span>{I18n.template}</span>
            <input
                class="template b3-text-field"
                type="text"
                bind:value={template.template}
            />
        </div>
    </div>
</div>

<style lang="scss">
    .row1 .toolbar__item:hover {
        color: var(--b3-theme-primary);
    }

    .flex {
        display: flex;
    }
    .col {
        flex-direction: column;
    }
    .flex-1 {
        flex: 1;
    }
    .flex-2 {
        flex: 2;
    }
    .conf-item {
        margin-bottom: 10px;
        padding: 10px 0px;
        border-bottom: 1px solid var(--b3-border-color);
    }
</style>
