# MediaGo Client-Side Conversions

MediaGo is a serverless static application. All file conversions are processed locally on the client-side within the browser sandboxed environment using FFmpeg WebAssembly (WASM) and browser decoders.

---

## 1. Supported Conversions

### Image Conversions
| Source Format | Target Format | Method | Controls |
|---|---|---|---|
| **JPEG / JPG** | WebP | FFmpeg WASM | Quality, Resize Width |
| **JPEG / JPG** | PNG | FFmpeg WASM | Resize Width |
| **PNG** | WebP | FFmpeg WASM | Quality, Resize Width |
| **PNG** | JPEG | FFmpeg WASM | Quality, Resize Width |
| **WebP** | PNG | FFmpeg WASM | Resize Width |
| **WebP** | JPEG | FFmpeg WASM | Quality, Resize Width |
| **WebP (animated)** | GIF | FFmpeg WASM | FPS, Scale Width |
| **HEIC / HEIF** | PNG | `heic2any` (Browser) | Quality |
| **HEIC / HEIF** | JPEG | `heic2any` (Browser) | Quality |
| **HEIC / HEIF** | WebP | `heic2any` (Browser) + FFmpeg WASM | Quality, Resize Width |
| **SVG** | PNG | Canvas API (Browser) | Quality, Resize Width |
| **SVG** | WebP | Canvas API + FFmpeg WASM | Quality, Resize Width |

### Video Conversions
| Source Format | Target Format | Method | Controls |
|---|---|---|---|
| **MP4 / MOV / AVI / WEBM** | GIF (Animated) | FFmpeg WASM | FPS, Scale Width |
| **MP4 / MOV / AVI / WEBM** | WebM | FFmpeg WASM | FPS, Scale Width |
| **MP4 / MOV / AVI / WEBM** | MP3 (Audio Extraction) | FFmpeg WASM | None (192kbps) |

### GIF Conversions
| Source Format | Target Format | Method | Controls |
|---|---|---|---|
| **GIF** | MP4 | FFmpeg WASM | FPS, Scale Width |
| **GIF** | WebM | FFmpeg WASM | FPS, Scale Width |
| **GIF** | PNG (Static Frame) | FFmpeg WASM | Resize Width |
| **GIF** | JPEG (Static Frame) | FFmpeg WASM | Quality, Resize Width |

---

## 2. Parameter & Quality Controls

### Image Options
* **Quality Slider (0% - 100%):**
  * Controls the lossy compression level for target formats supporting compression (`webp`, `jpeg`).
  * Default is `80%`.
* **Resize Width Selection:**
  * Downscales the image width to a specified dimension while preserving the aspect ratio.
  * Options: `Original Size`, `1920px (Full HD)`, `1280px (HD)`, `800px (Medium)`, `640px (Mobile)`, `320px (Thumbnail)`.

### Video & GIF Options
* **Frame Rate (FPS) Slider (5 - 30 FPS):**
  * Configures the number of frames per second for target animations (`gif`, `mp4`, `webm`).
  * Lower frame rates drastically decrease file size. Default is `10 FPS`.
* **Output Scale Width:**
  * Scales the video resolution down to avoid heavy wasm processing times.
  * Options: `Original Size`, `1080px`, `720px`, `480px`, `320px`, `240px`.
