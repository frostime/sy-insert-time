<!--
 Copyright (c) 2023 by frostime All Rights Reserved.
 Author       : frostime
 Date         : 2023-07-01 19:23:50
 FilePath     : /src/components/setting-panel.svelte
 LastEditTime : 2024-08-18 23:52:01
 Description  : 
-->
<script lang="ts">
    import { i18n } from "@/libs/const";
    import useTemplates from "@/libs/store";
    import Form from "./Form";
    import { setContext } from "svelte";

    import TemplateItem from "./template-item.svelte";

    export let TemplatesStore: ReturnType<typeof useTemplates>;
    const templates = TemplatesStore.templates;

    $: templateList = Object.entries($templates).map(([key, value]) => {
        return {
            key,
            value,
        };
    });

    setContext("TemplatesStore", TemplatesStore);
</script>

<div class="config__tab-container fn__flex-1">
    <Form.Wrap
        title={'<span style="color: var(--b3-theme-primary); font-size: 1.25em; font-weight: bold">Hint</span>'}
        description={i18n.description}
        direction="row"
    >
        {#each templateList as template}
            <TemplateItem
                key={template.key}
                template={template.value}
            />
        {/each}

        <div style="margin-top: 10px; text-align: right;">
            <button
                class:b3-button={true}
                on:click={() => TemplatesStore.reset()}
            >
                重置
            </button>
        </div>
    </Form.Wrap>
</div>
