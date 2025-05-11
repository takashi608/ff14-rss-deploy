const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const rssSources = [
  { icon: 'paladin.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1132268.xml' },
  { icon: 'warrior.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1132269.xml' },
  { icon: 'gunbreaker.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1339983.xml' },
  { icon: 'darkknight.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1243883.xml' },
  { icon: 'hall_of_the_novice.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1133076.xml' }
];

const GAS_API = 'https://script.google.com/macros/s/AKfycbznPNERcBnFkr3MfgWMXslO6l9z_wVEU3THIgD2rLa8HAH0LsDI9FFGW1Y80zepAVyD/exec';

const shuffle = arr => arr.sort(() => Math.random() - 0.5);
const maxItems = 8;
const baseImgUrl = "https://ff14-rss.netlify.app/";

async function fetchRssItem(rssUrl) {
  try {
    const res = await fetch(`${GAS_API}?url=` + encodeURIComponent(rssUrl));
    const data = await res.json();
    const items = data.items || [];
    return items[Math.floor(Math.random() * items.length)];
  } catch (e) {
    return null;
  }
}

(async () => {
  const entries = shuffle(rssSources).slice(0, 16);
  const blocks = [];

  for (let i = 0; i < entries.length && blocks.length < maxItems; i++) {
    const item = await fetchRssItem(entries[i].rss);
    if (item?.title && item?.link) {
      blocks.push({ ...item, icon: entries[i].icon });
    }
  }

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Meiryo,sans-serif; margin: 0; padding: 5px; background: #fff; }
    .rss-box { display: flex; align-items: center; padding: 0px 0; }
    .rss-box img { height: 50px; margin-right: 8px; transition: transform .3s ease; }
    .rss-box:hover img { transform: scale(1.05); }
    .rss-box a { font: 700 15px Meiryo,sans-serif; text-decoration: none; color: #06c; transition: .2s; }
    .rss-box a:hover { color: #048; }
    .divider { border-top: 1px dashed #ccc; margin: 4px 0; }
  </style>
</head>
<body>
<div id="rss-list">
  ${
    blocks.length === 0
      ? `<div class="rss-box"><img src="icon" alt="icon"><a href="#">RSSを取得できませんでした</a></div>`
      : blocks.map(b => `
        <div class="rss-box">
          <img src="${baseImgUrl}${b.icon}" alt="icon">
          <a href="${b.link}" target="_blank">${b.title}</a>
        </div>
        <div class="divider"></div>
      `).join('')
  }
</div>
</body>
</html>`;

  fs.writeFileSync("ff14_rss_safe_minified_netlify.html", html, "utf8");
})();
