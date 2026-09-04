# tvistv

Töimisto Visual Införmation System Television — the office dashboard, served from GitHub
Pages at <https://azshoy.github.io/tvistv/>.

`index.html` cross-fades two `view.html` iframes once a minute so the content refreshes
without the screen blinking, and reloads itself fully once a day.

Everything that changes lives in a Firebase Realtime Database. `script/render.js` drops those
values into any element with a matching `data-panel` attribute and then listens for changes,
so an edit reaches the screen without waiting for the next refresh. The markup in `view.html`
doubles as the fallback if the database cannot be reached.

Change it from Discord with the bot in [`bot/`](bot/), or by hand in the Firebase console.
[`data/seed.json`](data/seed.json) is only the initial import.
