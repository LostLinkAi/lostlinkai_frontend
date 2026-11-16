# LostLink authentication background videos

The cinematic background assets are included in this repository and are loaded by the auth artwork component:

| Asset | Format | Duration | Approx. size |
| --- | --- | ---: | ---: |
| `lostlink-desktop.mp4` | 1280×720 landscape, 24 fps | 10 seconds | 2.24 MB |
| `lostlink-mobile.mp4` | 720×1280 portrait, 24 fps | 7.92 seconds | 2.24 MB |

Both files are silent H.264 MP4s. Keep these public paths stable:

- `/videos/lostlink-desktop.mp4`
- `/videos/lostlink-mobile.mp4`

## Playback and fallback behavior

- `AuthBackground.tsx` selects one video URL with `matchMedia('(max-width: 620px)')`. It deliberately sets `src` on the video element instead of relying on a `media` attribute on `<source>`, which is not a dependable responsive source-selection mechanism for video.
- Playback uses muted autoplay, looping, inline playback, and `preload="metadata"`.
- The video is decorative and sits only inside the left auth artwork panel. It has no controls, is removed from keyboard navigation, and the artwork wrapper ignores pointer input.
- The existing `EclipseScene` and navy background remain visible while the video loads and whenever the selected asset fails.
- The video is disabled when the visitor has enabled reduced motion. The existing CSS also reduces the remaining decorative animation.

## Updating the clips

Keep the landscape and portrait compositions aligned with the auth artwork: place the main object near the visual center, avoid baked-in text or logos, and leave enough negative space around the lower-left copy. Use silent H.264 MP4, a short seamless loop, and web-optimized bitrates. If the filenames change, update the constants in `src/components/auth/AuthBackground.tsx` at the same time.

## Creative direction

A cinematic 3D lost-and-found journey: a meaningful everyday object (for example, a backpack) suspended in a midnight-navy environment; a restrained cyan/blue holographic scan sweeps across it; a few fine particles and data-like light trails converge into a subtle amber connection; the object resolves into a warm, hopeful glow. Premium realistic 3D rendering, smooth restrained camera movement, deep navy shadows, cyan highlights and a small amber accent. No UI, words, symbols, logos, watermarks, people, or audio. End on a composition that can transition cleanly back to the opening frame.
