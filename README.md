# Constructo — Verdieping Software Prototype

Static multi-page website prototype for the *Verdieping Software* keuzedeel.

Built with **Visual Studio Code**, **HTML**, **CSS**, and **JavaScript**.

## Live site

https://boholter.github.io/constructo-verdieping-software/

## Preview locally

Open `index.html` or serve the folder:

```bash
npx serve .
```

The old filename `Verdieping Software Prototype.html` redirects to `index.html`.

## Pages

- Home (`index.html`) — intro, process, projects, reviews, team, estimate
- `pages/projects.html` — search + filterable project index
- Project detail pages with galleries + before/after lightbox
- Services, process, team, careers, about, FAQ, contact, estimate calculator, style quiz
- Legal: privacy, cookies, terms
- Custom `404.html` for GitHub Pages

## Structure

```
css/     main.css (home), project.css (inner pages), scrollbar.css
img/     project photos, team portraits, favicons, gallery assets
js/      theme, i18n, nav-mega, page, estimate, quiz, lightbox, cookies…
pages/   inner pages
robots.txt, sitemap.xml
```

`main.css` and `project.css` share the same design tokens (incl. light-mode header). Keep those token blocks in sync when editing themes.
