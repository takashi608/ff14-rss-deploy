const fs = require('fs');
const fetch = require('node-fetch');
const { XMLParser } = require('fast-xml-parser');

// 全31カテゴリ（アイコンとRDF URL）
const rssSources = [
  { icon: 'paladin.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1123268.xml' },
  { icon: 'warrior.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1123269.xml' },
  { icon: 'gunbreaker.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1339958.xml' },
  { icon: 'darkknight.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1243803.xml' },
  { icon: 'whitemage.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1123278.xml' },
  { icon: 'astrologian.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1262192.xml' },
  { icon: 'sage.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1351530.xml' },
  { icon: 'scholar.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1123277.xml' },
  { icon: 'dragoon.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1123272.xml' },
  { icon: 'monk.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1123273.xml' },
  { icon: 'ninja.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1220916.xml' },
  { icon: 'samurai.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1317958.xml' },
  { icon: 'reaper.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1352544.xml' },
  { icon: 'viper.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1361703.xml' },
  { icon: 'pictomancer.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1362205.xml' },
  { icon: 'bard.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1123274.xml' },
  { icon: 'machinist.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1262306.xml' },
  { icon: 'dancer.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1341049.xml' },
  { icon: 'blackmage.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1122351.xml' },
  { icon: 'summoner.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1123276.xml' },
  { icon: 'redmage.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1315505.xml' },
  { icon: 'bluemag.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1338256.xml' },
  { icon: 'talk.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1323604.xml' },
  { icon: 'housing.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1171345.xml' },
  { icon: 'month.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1362211.xml' },
  { icon: 'news.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1128587.xml' },
  { icon: 'pvp.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1221801.xml' },
  { icon: 'mount.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1203979.xml' },
  { icon: 'limit_break.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1128880.xml' },
  { icon: 'blacklist.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1308461.xml' },
  { icon: 'hall_of_the_novice.png', rss: 'https://ff14net.2chblog.jp/archives/cat_1130376.xml' }
];

const shuffle = arr => arr.sort(() => Math.random() - 0.5);
const maxItems = 8;
const baseImgUrl = "https://shiny-arithmetic-861adc.netlify.app/";

async function fetchRssItem(rssUrl) {
  try {
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/xml,text/xml;q=0.9'
      }
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const items = parsed['rdf:RDF']?.item;
    return Array.isArray(items) ? items : [items];
  } catch {
    return [];
  }
}

(async () => {
  const entries = shuffle(rssSources);
  const blocks = [];

  for (let i = 0; i < entries.length && blocks.length < maxItems; i++) {
    const items = await fetchRssItem(entries[i].rss);
    if (items?.[0]?.title && items[0]?.link) {
      blocks.push({
        icon: entries[i].icon,
        title: items[0].title,
        link: items[0].link
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
      `).join('') : `<div class="rss-box"><a href="#">RSS取得失敗</a></div>`
    }
  </div>
</body>
</html>
  `;

  fs.writeFileSync('ff14_rss_safe_minified_netlify.html', html, 'utf8');
})();
