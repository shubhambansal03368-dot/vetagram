# 🐾 Vetagram — Modern Android Social Care Homepage

> **The #1 Social Care Network for Pets, Vets & Animal Lovers**  
> Built with AMOLED pitch-black aesthetics, pure white typography & icons, and a vivid animated rainbow brand spectrum.

---

## 🌟 Highlights & Features

- **📱 Android Flagship Experience**:
  - Precision flagship mockup chassis with camera punch-hole cutout and side hardware buttons.
  - Realistic **Android 15 Status Bar** with dynamic clock, 5G+, Wi-Fi 6, and battery gauge (98%).
  - Bottom centered Android gesture navigation bar.
  - View switcher: Toggle between **Android Phone View** and **Expanded Fullscreen View**.

- **🔺 Navbar Care Emblem**:
  - Official brand emblem: A circle enclosing a sleek delta/triangle symbol (`<circle>` + `<polygon>`).

- **🌈 Top App Header**:
  - **Left**: `+` Plus button opening the *New Clinical Post & Consult* modal.
  - **Middle**: Stylized cursive *"vetagram"* in an animated 6-color rainbow gradient with drop-shadow glow.
  - **Right**: Heart-shaped message icon with an unread badge (`3`) opening direct encrypted chats.

- **⭕ Stories Carousel**:
  - Horizontal tray with vivid rainbow gradient border rings (`linear-gradient(45deg, #ff0055, #ff5500, #ffcc00, #00d26a, #00b4d8, #9b5de5)`).
  - Usernames clearly positioned directly beneath each circular avatar (*Your Story*, *dr.oliver_vet*, *golden.cooper*, *wildlife_maya*, *dr.whiskers*, *luna_kitten*, *rescue_rio*, etc.).
  - **Full-Screen Story Viewer**: Timed progress bars, pause on hold, tap left/right navigation, heart reaction, and direct message replies.

- **📸 Clinical Feed Posts**:
  - **Author Header**: Circular profile avatar on the left with verified DVM badge, sideways username, hospital department, and options menu.
  - **Media**: 1:1 square aspect ratio (`aspect-ratio: 1 / 1`) veterinary care photography.
  - **Double-Tap Interaction**: Instant animated pulsing rainbow heart pop with tactile audio.
  - **Post Action Bar (Left)**:
    - 💖 **Like Icon** (heart shape): Toggles active state, animates, and increments like count.
    - 💬 **Comment Icon** (speech bubble): Opens slide-up interactive comments drawer.
    - ✈️ **Share Icon** (paper airplane / arrow): Copies consultation link.
    - 🔁 **Repost Icon** (retweet cycle arrows): Reposts to user's feed with green highlight.
  - **Post Action Bar (Right)**:
    - 🔖 **Save Icon** (bookmark): Saves post to user's veterinary collection.
  - **Footer & Details**: Like counter ("Liked by dr_paw and 14,230 others"), expandable caption with hashtags, comments preview, timestamp, and quick-comment input with emoji shortcuts.

- **🔬 Bottom Navigation Bar (5 Exact Icons in Pure White)**:
  1. 🏠 **Home Shape**: Main feed & stories stream.
  2. ⏹️▶️ **Square inside Triangle**: Vetagram Shorts / Reels video player.
  3. ✈️ **Plane Shape**: Direct Messages & 24/7 on-call veterinary doctors.
  4. 🔬 **Microscope Shape**: Clinical symptom triage search & emergency animal clinic finder.
  5. 👤 **Circle inside Person**: Doctor & Pet Health Passport Profile with stats and photo grid.

- **🔊 Web Audio API Haptics**:
  - Pure synthesized sound effects for likes, sends, story taps, and tab switches (no external audio files required, 100% offline).
  - Sound on/off toggle in the top header.

---

## 📂 Project Structure

```
homepage/
├── index.html         # Semantic HTML5 markup & responsive Android chassis
├── css/
│   └── style.css      # AMOLED black theme, rainbow gradients, and animations
├── js/
│   └── app.js        # Double-tap likes, tab switcher, story player, Web Audio synth
├── assets/            # Static assets and icons
├── .gitignore         # Git ignore rules
└── README.md          # Project documentation
```

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser, or serve it locally:

```bash
# Using Python 3
python3 -m http.server 4321

# Or using Node.js / npx
npx serve .
```

Open `http://localhost:4321` in your browser.

---

## 🎨 Design System

- **Background**: AMOLED Pitch Black (`#000000`) & Deep Dark Surface (`#0f0f11`, `#151518`)
- **Text & Icons**: Pure White (`#ffffff`) with secondary accents (`#a1a1aa`, `#71717a`)
- **Brand Gradient**: `linear-gradient(135deg, #ff0055, #ff5500, #ffcc00, #00cc66, #00b4d8, #9b5de5)`
- **Typography**: `Grand Hotel` (cursive brand script) & `Plus Jakarta Sans` (modern UI font)

---

## 📄 License

MIT License • Created for Vetagram Community.
