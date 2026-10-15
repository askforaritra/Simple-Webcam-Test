# Changelog

All notable changes to this project are listed here. Versions follow [Semantic Versioning](https://semver.org/).

## [1.4.1] - 2026-10-15
### Changed
- The project is licensed under GPL-3.0-or-later. The full license text is in `LICENSE` and each source file carries a short notice.

### Fixed
- Resolution test now opens the camera once and tries every size on the same stream, so the browser no longer asks for permission repeatedly.
- Changing the resolution while the camera is running adjusts the live stream instead of restarting it (no new permission prompt).
- Resolution switching requests the exact size, so it no longer stays stuck on one resolution. If the camera can't do the size, a short message explains it.

## [1.4.0] - 2026-10-15
### Added
- Portrait blur option with a strength slider. Uses the device's own background blur when the browser exposes it, otherwise a center-focus blur. Snapshots include the blur.

## [1.3.0] - 2026-10-15
### Added
- Google Meet and Slack columns in the video call resolution table.
- 4K (3840x2160) row, supported by Slack.

## [1.2.0] - 2026-10-15
### Added
- Video call resolutions table for Microsoft Teams and Zoom (360p, 720p, 1080p).
- "Test my camera" button that checks which of those sizes the selected camera supports.

## [1.1.0] - 2026-10-15
### Added
- Information tab with webcam name, quality rating, built-in microphone and speaker, frame rate, stream type, image mode, megapixels, resolution, video standard, aspect ratio, PNG and JPEG file size, bitrate, number of colors, average RGB color, lightness, luminosity, brightness, hue and saturation.
- Credit line in the footer.

## [1.0.0] - 2026-10-15
### Added
- Webcam viewer built around the `<video id="webcam-stream">` element.
- Start and stop, camera picker, resolution picker, mirror preview, snapshots (click a thumbnail to download) and full screen.
- Stream tab with camera name, resolution, reported and measured frame rate, facing mode and number of cameras.
- 720x540 preview with the details panel on the right; single column on narrow screens.
- Clear messages for blocked, missing, busy or unsupported cameras.

[1.4.1]: ../../releases/tag/v1.4.1
[1.4.0]: ../../releases/tag/v1.4.0
[1.3.0]: ../../releases/tag/v1.3.0
[1.2.0]: ../../releases/tag/v1.2.0
[1.1.0]: ../../releases/tag/v1.1.0
[1.0.0]: ../../releases/tag/v1.0.0
