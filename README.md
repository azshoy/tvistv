# tvistv

Töimisto Visual Införmation System Television — the office dashboard, served from GitHub
Pages at <https://azshoy.github.io/tvistv/>.

`index.html` cross-fades two `view.html` iframes once a minute so the content refreshes
without the screen blinking, and reloads itself fully once a day.

Everything that changes lives in [`data/state.json`](data/state.json). `script/render.js`
drops those values into any element with a matching `data-panel` attribute; the markup in
`view.html` doubles as the fallback if the fetch fails.

Edit `data/state.json` by hand, or from Discord via the bot in [`bot/`](bot/).
