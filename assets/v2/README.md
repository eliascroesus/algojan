# Images for /v2/discord (and /bots)

- `bg/`: the scattered, dimmed images behind the headline (certificates, charts, Discord wins, Jan's photos).
  `bg/sm/` holds small copies (about 440px) that the background actually loads, so the page stays fast.
- `results/`: the member results in the scrolling marquee under the button.
- `certs/`: Jan's certificates, used in the video thumbnail and the "Who's Jan?" section.

## Adding images

1. Export as JPG or WebP, around 1000px wide (no iPhone `.HEIC`, browsers can't show it).
2. Name them with the next number: `bg/` is at 27, `results/` is at 13 (e.g. `results/14.webp`).
3. Raise `bgCount` / `resultsCount` in `assets/v2/v2.js` to the new last number.

A background image without a small copy in `bg/sm/` still works (the page falls back to the full image), it's just
slower. Or ask Claude to convert, number and shrink a batch of uploads for you.
