Quickly insert the time in editor

## Basic Usage

- Input `/xz`, `/now`, insert `2023-08-19 18:59:41`
- Input `/sj`, `/time`, insert `18:59:41`
- Input `/rq`, `/date`, `/jt`, `/today` insert `2023-08-19`

## Custom Configuration

Open the plugin settings to customize the input commands and insert templates.

- Insert Templates:

    - Template for time formatting.
    - For example, `yyyy-MM-dd HH:mm:ss` represents `2020-01-01 12:00:00`.

- Input Commands:

    - Commands following the `/` symbol.
    - Multiple commands can be specified, separated by commas (`,`), for example, `rq,now` represents the `/rq` and `/date` commands.

Available template placeholder`:
- `yyyy` year, e.g. `2023`
- `MM` month, e.g. `09`
- `dd` date, e.g. `12`
- `HH` hour, e.g. `18`
- `mm` minute, e.g. `59`
- `ss` second, e.g. `41`
- `yy` last two digits of the year, e.g. `23`