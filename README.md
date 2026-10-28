# APPSCON 2026 – e-Souvenir Unveiling (GitHub Pages)

The auditorium laptop shows the closed curtain with the title. When someone touches the button on the tablet, the full unveiling video plays (curtain opens with applause, cover, page turns, Thank-you page) and stays on the last page.

## Put it online (one time, about 5 minutes)
1. Sign in at github.com. Click **+ → New repository**, name it `esouvenir`, set it to **Public**, and click **Create repository**.
2. On the new repository page, click **uploading an existing file**. Drag in **everything in this folder**, including the `assets` folder. Then click **Commit changes**.
3. Go to **Settings → Pages**. Under *Branch*, pick **main** and **/(root)**, then click **Save**.
4. Wait 1–2 minutes. The site appears at `https://<your-username>.github.io/esouvenir/`.

## Links
- Laptop: `https://<your-username>.github.io/esouvenir/screen.html` in **Chrome or Edge**. Click **Go full screen**.
- Tablet: `https://<your-username>.github.io/esouvenir/tablet.html`. Two ways to remove the browser bar and tabs:
  - **Best:** in Chrome, tap **⋮ → Add to Home screen → Install**, then open **Unveil** from the home-screen icon. It opens full screen with no browser bar.
  - **Quick:** open the link and tap **Tap to go full screen** before handing over the tablet. A back swipe leaves full screen, so do this last.

## The video
The whole sequence is one video, `assets/unveil-v10.mp4`, with a WebM copy `assets/unveil-v10.webm` for browsers that can't play MP4. It is the same video as the PowerPoint backup. The cover and pages are part of it, so no separate cover image is needed.
Note: anything in a public repository can be seen by anyone who finds it.

## Backups on the day
- On the laptop, press **Space**, **→** or the slide clicker to start. Press **R** to go back to the closed curtain.
- The operator panel is hidden. Press **P** on the laptop to show or hide it; its title shows the version (v10) and whether the video has fully loaded ("Video ready").

## How the link works
The two pages keep an always-open connection through the free HiveMQ public broker, so the curtain opens about 0.2 s after the touch.
If the network blocks that connection, they switch automatically to the free ntfy.sh relay over normal HTTPS, which takes about 1 s.
The screen's operator panel shows which path is in use ("fast" or "backup"). The private channel name is in `relay.js`; don't share it.
