# APPSCON 2026 – e-Souvenir Unveiling (GitHub Pages)

The auditorium laptop shows a closed curtain. When the Director touches the tablet, the curtain video plays and reveals the e-Souvenir cover.

## Put it online (one time, about 5 minutes)
1. Sign in at github.com. Click **+ → New repository**, name it `esouvenir`, set it to **Public**, and click **Create repository**.
2. On the new repository page, click **uploading an existing file**. Drag in **everything in this folder**, including the `assets` folder. Then click **Commit changes**.
3. Go to **Settings → Pages**. Under *Branch*, pick **main** and **/(root)**, then click **Save**.
4. Wait 1–2 minutes. The site appears at `https://<your-username>.github.io/esouvenir/`.

## Links
- Laptop: `https://<your-username>.github.io/esouvenir/screen.html` in **Chrome or Edge**. Click **Go full screen**.
- Tablet: `https://<your-username>.github.io/esouvenir/tablet.html`. In Chrome, use **⋮ → Add to Home screen** to get a full-screen app icon.

## Add the cover
Name the cover image `cover.jpg` (or `cover.png`) and upload it into the `assets` folder of the repository. The site picks it up automatically.
Note: anything in a public repository can be seen by anyone who finds it. Upload the cover close to the event if it must stay secret.

## Backups on the day
- On the laptop, press **Space**, **→** or the slide clicker to open the curtain. Press **R** to close it again.
- If the laptop browser can't play the video, it falls back to a simple slide-apart curtain.

## How the link works
The two pages talk through the free ntfy.sh relay over normal HTTPS. The private channel name is in `relay.js`; don't share it.
