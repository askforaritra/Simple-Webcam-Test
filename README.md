# Simple-Webcam-Test

A browser-based webcam viewer and test page. It shows your camera live, reports what the browser knows about the stream, checks which video-call resolutions your camera supports, and can blur the background. Everything runs on your device and no video is uploaded.

**Current version:** 1.4.1 (see the [changelog](CHANGELOG.md))  
**License:** [GPL-3.0-or-later](LICENSE)

## Features

| Area | What you get |
| --- | --- |
| Preview | 720x540 live view, start and stop, camera picker, resolution picker (640x480, 720p, 1080p), mirror, full screen |
| Snapshots | Save the current frame as a PNG (click a thumbnail to download). Blur is included if it is on |
| Stream tab | Camera name, resolution, reported frame rate, measured frame rate, facing mode, number of cameras |
| Information tab | Quality rating, built-in microphone and speaker, megapixels, video standard, aspect ratio, PNG and JPEG size, bitrate, number of colors, average color, lightness, luminosity, brightness, hue, saturation |
| Video call resolutions | A table for Microsoft Teams, Zoom, Google Meet and Slack, plus a Test my camera button |
| Portrait blur | Device background blur when the browser offers it, otherwise a center-focus blur with a strength slider |

## Quick start

The camera only works on HTTPS or `localhost`.

```bash
git clone https://github.com/askforaritra/simple-webcam-test.git
cd webcam-test
npx serve .              # or: python3 -m http.server 8000
```

Open the address it prints, select **Start camera** and allow access when your browser asks.

## Using the page

1. **Start camera.** Pick a camera and resolution first if you have more than one option.
2. **Stream and Information tabs.** The right-hand panel updates live. The Information tab re-reads the current frame every 2 seconds.
3. **Video call resolutions.** Select **Test my camera** to see which of 360p, 720p, 1080p and 4K the selected camera supports. If the camera is already running, the test reuses it, so there is no extra permission prompt.
4. **Portrait blur.** Tick **Portrait blur**. The label next to the slider shows which mode is active.

### Resolutions by app

| Resolution | Size | Teams | Zoom | Google Meet | Slack |
| --- | --- | --- | --- | --- | --- |
| 360p | 640x360 | Yes | Yes (default) | Yes (default) | Yes |
| 720p (HD) | 1280x720 | Yes | Yes (HD setting) | Yes (selectable) | Yes |
| 1080p (Full HD) | 1920x1080 | Yes (maximum) | Yes (must be enabled) | Yes (selectable) | Yes |
| 4K (UHD) | 3840x2160 | No | No | No | Yes (up to 4K) |

These figures come from public help pages and community sources, not official specifications. Zoom's 720p and 1080p depend on account and settings. Slack's 4K support was supplied by the author and is not confirmed in Slack's help pages. Every app lowers the resolution it sends when bandwidth or the meeting layout requires it.

## Browser support

| Browser | Notes |
| --- | --- |
| Chrome, Edge | Full support, including device background blur where the OS offers it |
| Firefox | Works. Measured frame rate may show "not supported" on older versions, and speakers are often hidden from the page |
| Safari | Works. Set Camera to Allow for the site in Safari's website settings to avoid repeat prompts |

## Troubleshooting

- **Nothing appears:** Check that no other app is using the camera, that the site has camera permission, and that the page is on HTTPS or `localhost`.
- **Asked for permission repeatedly:** Choose the option that remembers your choice, for example "Allow on every visit" in Chrome. The page can't change this itself.
- **Resolution won't change:** The camera may not support that exact size. A message appears on the preview. Use Test my camera to see what it supports.
- **Embedded or preview frame blocks the camera:** Open the page in its own browser tab.
- **Built-in microphone or speaker shows "None" or "Not detected":** The browser only reports devices in the same hardware group as the camera, and some browsers hide speakers.

## How the numbers are worked out

- **Quality rating:** An estimate out of 1000 from resolution (up to 700 points) and frame rate (up to 300 points).
- **Bitrate:** JPEG size of the current frame multiplied by the measured frame rate.
- **Colors, brightness and the rest:** Calculated from the pixels of the current frame. Lightness and saturation use the HSL model, luminosity uses the 0.2126, 0.7152, 0.0722 weights, and brightness is the average of the three channels.
- **Center-focus blur:** Keeps an oval in the middle sharp and blurs the edges. It does not detect people.

## Deploy to GitHub Pages

1. Create an empty public repository on GitHub (no README, license or .gitignore).
2. In this folder run:
   ```bash
   git init -b main
   git add . && git commit -m "Release v1.4.1"
   git tag v1.4.1
   git remote add origin https://github.com/<your-username>/webcam-test.git
   git push -u origin main --tags
   ```
3. In the repository open **Settings > Pages** and set **Source** to **GitHub Actions**.
4. The workflow in `.github/workflows/pages.yml` deploys on every push to `main`. Your site will be at `https://<your-username>.github.io/webcam-test/`.

## Releasing a new version

This project uses [Semantic Versioning](https://semver.org/).

```bash
# 1. Add the new entry to CHANGELOG.md and commit it
npm version patch        # or minor / major
git push --follow-tags
```

`npm version` bumps `package.json`, updates the footer through `scripts/sync-version.js`, commits and creates the `vX.Y.Z` tag. Then draft a GitHub Release from that tag.

## Project structure

```
index.html                page markup
css/style.css             styles (light and dark themes)
js/app.js                 camera, tests, information panel, blur
scripts/sync-version.js   copies the version into the footer
.github/workflows/        GitHub Pages deployment
CHANGELOG.md              version history
LICENSE                   GPL-3.0
```

## Contributing

Issues and pull requests are welcome. Add a line to `CHANGELOG.md` for any user-visible change. By contributing you agree that your work is released under the same license as the project (GPL-3.0-or-later).

## License

Copyright (C) 2026 askforaritra

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the [GNU General Public License](LICENSE) for more details.

In short: you can use, study, share and modify this project. If you distribute a modified version, you must also release it under the GPL and make its source available.
