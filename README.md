# usage-band

![Preview](docs/screenshot.png)

A mod for the Claude desktop app that shows two segmented usage bars above the prompt box:

- **SESSION** (5-hour limit): the bar fills up as the limit is consumed.
- **WEEK**: the bar drains as the limit is consumed.
- Uses theme colors; turns orange at 70 % used and red at 90 %.
- The text shows the percentage used and the time of the next reset.

## Installation

In Claude Code:

```
/plugin marketplace add icefrogqc/usage-band
/plugin install usage-band@usage-band
```

Accept the "Enable hot reloading for this session?" prompt if it appears.

## Customization

Edit `plugins/usage-band/hooks/register.tsx`:

- `SEGMENTS`: number of blocks per bar (default 13).
- `LABELS`: the text shown above each bar (defaults are in French: `Session` / `Semaine`; change them to `Session` / `Week`).
- Color thresholds: 70 (orange) and 90 (red).
- The reset time uses the `fr-CA` locale; change it in `hour()` to match yours.

## Notes

- Tested with the Claude desktop app on Zorin OS / Ubuntu 24.04. The mod engine may differ on other platforms.
- No data leaves your machine: the mod only reads the local session usage.

## License

MIT, see [LICENSE](LICENSE).
