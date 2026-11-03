This plugin provides a simple way to insert the current date and time into your editor using custom commands and formats.

## Basic Usage

- Enter `/xz` or `/now` to insert the complete date and time, like `2023-08-19 18:59:41`.
- Enter `/sj` or `/time` to insert only the time, like `18:59:41`.
- Enter `/rq`, `/date`, `/jt`, or `/today` to insert the current date, like `2023-08-19 Friday`.

The above are the built-in commands and templates of the plugin, but you can also configure custom commands in the settings.

## Custom Configuration

Open the plugin settings. Each row is one template; click Save to apply. The panel previews the output of every template while you type and checks duplicate names, empty or duplicated commands, and unknown placeholders before saving.


- **Time Formatting**: Customize the format for the date and time insertion.
  - For example, `yyyy-MM-dd HH:mm:ss` will output `2020-01-01 12:00:00`.
  - You can also format in various styles, such as `yyyy 年 MM 月 dd 日` for `2023 年 09 月 12 日`, or `EEEE yyyy-MM-dd` for `Sunday 2023-09-12`.


- **Custom Commands**: Define your own commands following the `/` symbol.
  - Multiple commands can be separated by commas, such as `rq,now` to allow both `/rq` and `/date` to insert the date.

- **Shortcuts**: every template is also registered as a SiYuan command.
  - Click the shortcut column to jump to Settings → Keymap → Plugins → Insert time and bind a key.
  - Commands are searchable in the command panel and work inside table cells, where the slash menu only shows built-in items.

Available Template Placeholders:

- `yyyy` — Year, e.g., `2023`
- `MM` — Month, e.g., `09`
- `dd` — Day, e.g., `12`
- `HH` — Hour, e.g., `18`
- `mm` — Minute, e.g., `59`
- `ss` — Second, e.g., `41`
- `yy` — Last two digits of the year, e.g., `23`
- `e` — Day of the week as a number (1-7)
- `E` — Day of the week abbreviation, e.g., `Sun`
- `EEEE` — Full name of the day of the week, e.g., `Sunday`
- `ECN` — Chinese abbreviation for the day of the week, e.g., `一 - 日`

Brackets have no escape meaning and are inserted literally. Use `HH` for hours, not `hh`.