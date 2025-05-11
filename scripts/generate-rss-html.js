const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { XMLParser } = require('fast-xml-parser');

const rssSources = [
  { icon: 'paladin.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1132268.xml' },
  { icon: 'warrior.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1132269.xml' },
  { icon: 'gunbreaker.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1339983.xml' },
  { icon: 'darkknight.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1243883.xml' },
  { icon: 'hall_of_the_novice.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1133076.xml' }
];

const shuffle = arr => arr.sort(() => Math.random() - 0.5);
const maxItems = 8;
const baseImgUrl = "https://ff14-rss.netlify.app/";

async function fetchRssItem(rssUrl) {
  try {
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/rss+xml,application/xml,text/xml;q=0.9'
      }
    });

    if (!res.ok) {
      console.error(`❌ HTTPエラー: ${res.status} ${rssUrl}`);
      return [];
    }

    const xml = await res.text();
    const parser = new XMLParser();
    const parsed = parser.parse(xml);
    const items = parsed.rss?.channel?.item || [];

    if (items.length === 0) {
      console.warn(`⚠️ RSSアイテムが見つかりません: ${rssUrl}`);
    }

    return items.slice(0, 5).map(entry => ({
      title: entry.title,
      link: entry.link,
      pubDate: entry.pubDate
    }));
  } catch (e) {
    console.error(`🛑 Error fetching RSS from ${rssUrl}`, e);
    return [];
  }
}

(async () => {
  const entries = shuffle(rssSources).slice(0, 10);
  const blocks = [];

  for (let i = 0; i < entries.length && blocks.length < maxItems; i++) {
    const items = await fetchRssItem(entries[i].rss);
    if (items.length > 0 && items[0].title && items[0].link) {
      const item = items[0];
      blocks.push({
        icon: entries[i].icon,
        link: item.link,
        title: item.title
      });
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
    .rss-box { display: flex; align-items: center; padding: 6px 0; }
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
      blocks.length > 0 ? blocks.map(b => `
        <div class="rss-box">
          <img src="${baseImgUrl + b.icon}" alt="icon">
          <a href="${b.link}" target="_blank">${b.title}</a>
        </div>
        <div class="divider"></div>
      `).join('') : `
        <div class="rss-box"><img src="icon" alt="icon"><a href="#">RSSを取得できませんでした</a></div>
      `
    }
  </div>
</body>
</html>
  `;

  fs.writeFileSync('ff14_rss_safe_minified_netlify.html', html, 'utf8');
})();
