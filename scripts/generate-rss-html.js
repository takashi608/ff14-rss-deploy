const fs = require('fs');
const fetch = require('node-fetch');

const rssSources = [
  { icon: 'news.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1128587.xml' },
  { icon: 'talk.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1323604.xml' },
  { icon: 'month.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1362211.xml' },
  { icon: 'mount.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1203979.xml' },
  { icon: 'housing.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1171345.xml' },
];

const shuffle = array => array.sort(() => Math.random() - 0.5);
const maxItems = 8;
const baseImgUrl = "https://ff14-rss.netlify.app/";

async function fetchRssItem(rssUrl) {
  try {
    const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rssUrl));
    const data = await res.json();
    const items = data.items?.slice(0, 3) || [];
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
      blocks.push({ icon: entries[i].icon, title: item.title, url: item.link });
    }
  }

  if (blocks.length === 0) {
    blocks.push({
      icon: 'news.png',
      title: 'RSSを取得できませんでした',
      url: 'https://ff14net.2chblog.jp/',
    });
  }

  const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  body { font-family: Meiryo,sans-serif; margin: 0; padding: 5px; background: #fff; }
  .rss-box { display: flex; align-items: center; padding: 4px 0; border-bottom: 1px solid #eee; }
  .rss-box img { height: 50px; margin-right: 8px; transition: transform .3s ease; }
  .rss-box:hover img { transform: scale(1.05); }
  .rss-box a { font: 700 15px Meiryo,sans-serif; text-decoration: none; color: #06c; transition: .2s; }
  .rss-box a:hover { color: #048; }
  .divider { border-top: 1px dashed #ccc; margin: 4px 0; }
  </style></head><body><div id="rss-list">` +
  blocks.map(b => `
    <div class="rss-box">
      <img src="${baseImgUrl + b.icon}" alt="icon">
      <a href="${b.url}" target="_blank">${b.title}</a>
    </div>
    <div class="divider"></div>
  `).join('') +
  `</div></body></html>`;

  fs.writeFileSync("ff14_rss_safe_minified_netlify.html", html, "utf8");
})();
