# Personal portfolio — Antoine Hinary

Static site, no build step. Open `index.html` in a browser to preview.

## Publish free on GitHub Pages
1. Create a public repo named `<your-github-username>.github.io`.
2. Upload everything in this folder (index.html, assets/, reports/) to the repo root.
3. Repo **Settings → Pages → Source: Deploy from a branch → main / root**.
4. After ~1 minute the site is live at `https://<your-github-username>.github.io`.

## Adding your media
Search `index.html` for `ADD:` — every slot has a comment with the exact file name and the snippet to paste.
Orange dashed boxes in the page are those slots; delete the `<figure class="slot">` once filled.

- Videos: MP4 (H.264), keep under ~20 MB each. Convert with:
  `ffmpeg -i input.mov -c:v libx264 -crf 26 -preset veryfast -an -movflags +faststart output.mp4`
- Images: JPG, ~1200–1600 px wide.
- Also replace `YOUR-HANDLE` in the LinkedIn/GitHub links.
