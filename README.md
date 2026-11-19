# AlgoJan funnel

Funnel for Jan (AlgoJan). The page structure comes from Jean Ivan's funnel and the look from the inspiration (warm off-white page, orange accents,
gold buttons, list of bonuses with prices). Plain static HTML, CSS and JS with no build step. It deploys to Vercel as-is (`vercel.json` sends `/` to `/discord`).

| Page | What's on it |
| --- | --- |
| `/discord` | Opt-in: headline + "Join The FREE Discord" form → **Everything You Get** (free AI bots & strategies, $3,000 value → FREE) → **Who Am I & Why Is This Free** (Jan's story) → **results wall** |
| `/apply` | Confetti for new opt-ins, Step #1 the **vertical (9:16) VSL**, Step #2 the application one question at a time → booking calendar (or the free Discord for answers that don't qualify) |
| `/booked` | "Your call is NOT confirmed yet": Step #1 thank-you video (vertical), Step #2 confirm (email / text / add to calendar), Step #3 four vertical FAQ videos |

## Dark version: `/v2/discord` (also at `/bots`)

The same opt-in in a dark design: a dim collage of results behind the headline, a horizontal VSL, a gold
"Join The Free Discord" button that opens the form in a pop-up, then the price line and the stars / members row. Under it are
the free bot list, Jan's story and the results wall. After the form it goes on to `/apply` like the light page.

- **Images:** upload them to `assets/v2/bg/` (background collage) and `assets/v2/results/` (results wall), named
  `1.jpg`, `2.png`, `3.webp`… with no gaps. The page finds them by itself. See `assets/v2/README.md`.
- **Join link:** `discordUrl` in `assets/funnel.js` points to Jan's Whop (https://whop.com/algo-world-db94/).
- **VSL:** two Vimeo videos in `V2.video` in `assets/v2/v2.js`. Phones (up to 767px wide) get the 9:16 one and
  tablets/desktops the 16:9 one. Like Jean's funnel, Vimeo's title, name, avatar, logo, captions and controls are off
  (our own controls instead), and the video stops just before the end and goes back to the thumbnail with "Watch again",
  so Vimeo's "More from…" end screen never shows. The thumbnail stays until the video is actually playing.
  `assets/vimeo-player.min.js` is Vimeo's player library (MIT), kept in the repo.
- **Video, stars, review count, members:** `V2` at the top of `assets/v2/v2.js`. Use real numbers only. The review
  count stays hidden until you fill it in.

## Things to fill in: `CONFIG` at the top of `assets/funnel.js`

- `videos.vsl`, `videos.nextSteps`: a Vimeo, YouTube (Shorts work) or `.mp4` link. Empty shows a "Video coming soon" placeholder.
- `calendarUrl`: the GoHighLevel, Calendly or iClosed booking link. In the calendar's own settings, set the redirect after booking to `/booked`.
- `leadWebhookUrl`: where opt-ins and applications are POSTed as JSON (Apps Script, Zapier, Make, GHL inbound webhook).
- `discordUrl`: the invite link for people who don't qualify.
- `results`: put the screenshots in `assets/results/` and list the file names, e.g. `["result-1.webp", "result-2.jpg"]`.
  They show in a masonry wall like the inspiration. Until then the page shows 9 placeholder tiles.
- `faqVideos`: the FAQ videos on `/booked` (What's inside, Is AlgoJan legit, Who is this for, How much time). Empty links show placeholders.
- `recentJoins` / `recentJoinsUrl`: the "Tristan from Dallas just joined" popup on `/discord`. **The names in there now are
  placeholders.** Before going live, feed it real opt-ins: point `recentJoinsUrl` at a JSON list of `{name, city, at}`
  (then it shows "12 seconds ago" from the real time), or set `recentJoins: []` to turn it off. Made-up sign-ups shown as
  real are deceptive and break FTC and Meta ad rules. Timing is in `joinedPopup`.
- The application questions are `QUESTIONS` in the same file, and `disqualify` lists the investment answers that don't get the calendar.

The bot names and prices in the list of bonuses are in `discord/index.html`. Jan's photo is `assets/coach/jan.webp`.

The footers link to `/privacy`, `/terms` and `/disclaimer`, but those pages aren't in this repo yet. They can be copied from the jeanivanfunnel repo.

Preview locally: `python3 -m http.server 8000`, then open http://localhost:8000/discord/
