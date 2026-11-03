## 3.1.0

* 设置面板重做为紧凑表格：实时预览、重名/空指令/未知占位符校验、删除二次确认
* 每个模板注册一条命令，快捷键在「设置 → 快捷键 → 插件 → 插入时间」中绑定；命令可在命令面板搜索，在表格单元格内同样可用
* 修复默认日期模板会把方括号原样插入的问题（`[EEEE] yyyy-MM-dd` → `yyyy-MM-dd EEEE`）
* 修复同一占位符只替换第一次出现的问题（`yyyy-MM-dd yyyy` 的第二处现在也会替换）
* 斜杠项改用模板内部 key 作为 id，模板重名不再互相覆盖
* 指令输入支持中英文逗号，并忽略首尾空白
* 点击设置面板的快捷键列会直接打开思源的快捷键页，并滚动高亮本插件的命令
* 升级 `siyuan` 类型依赖到 `^1.2.9`，CI 改用 Node 24 / pnpm 11，发布前执行类型检查

## 3.0.1

* [#8](https://github.com/frostime/sy-insert-time/pull/8) 修复移动端删除按钮图标过大与窄面板下「插入模板」输入框被截断的问题（by [@wmy2981](https://github.com/wmy2981)）

## 0.2.0

* [Add plugin event bus `open-siyuan-url-plugin` and `open-siyuan-url-block`](https://github.com/siyuan-note/siyuan/pull/8927)


## 0.1.12 2023-08-01

* Upgrade siyuan to 0.7.9

## 0.1.11

* [Add `input-search` event bus to plugins](https://github.com/siyuan-note/siyuan/issues/8725)


## 0.1.10

* [Add `bind this` example for eventBus in plugins](https://github.com/siyuan-note/siyuan/issues/8668)
* [Add `open-menu-breadcrumbmore` event bus to plugins](https://github.com/siyuan-note/siyuan/issues/8666)

## 0.1.9

* [Add `open-menu-xxx` event bus for plugins ](https://github.com/siyuan-note/siyuan/issues/8617)

## 0.1.8

* [Add protyleSlash to the plugin](https://github.com/siyuan-note/siyuan/issues/8599)
* [Add plugin API protyle](https://github.com/siyuan-note/siyuan/issues/8445)

## 0.1.7

* [Support build js and json](https://github.com/siyuan-note/plugin-sample/pull/8)

## 0.1.6

* add `fetchPost` example
