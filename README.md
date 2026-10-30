# Antoine Hinary — portfolio

Pages: index.html (home), projects.html, certificates.html, beyond.html.
Shared style: assets/css/site.css · behaviour: assets/js/site.js

## Adding media — no code needed
Upload a file with the exact name below and it appears automatically in its slot.

| File | Where it shows |
|---|---|
| assets/video/drone-flight.mp4 | Projects → Avian drone |
| assets/video/flex-robot.mp4 | Projects → Flexible charging robot |
| assets/video/race-car.mp4 | Projects → Mini race car |
| assets/video/thesis-docking.mp4 (optional) | Projects → Thesis |
| assets/video/rocket-sim.mp4 (optional) | Projects → Rocket MPC |
| assets/img/fpga-demo.jpg | Projects → FPGA |
| assets/img/wilbe.jpg | Projects → Wilbe |
| assets/img/dodgeball-1.jpg / -2 / -3 | Beyond → Euro 2023 / Worlds 2024 / Euro 2025 |
| assets/certs/hf-agents-course.jpg | Certificates → AI Agents Course |

Names are case-sensitive: lowercase, .mp4 / .jpg exactly.
When everything is uploaded, open assets/js/site.js and set SHOW_EMPTY_SLOTS = false
so visitors never see an empty box.

## Videos: keep each under 25 MB (GitHub's browser upload limit)
ffmpeg -i input.mov -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset veryfast -an -movflags +faststart output.mp4

## Publish on GitHub Pages
Upload everything in this folder to the root of the repo antoinehinary.github.io (replace the old files),
commit, wait 1–2 minutes, then hard-refresh (Ctrl/Cmd + Shift + R).
