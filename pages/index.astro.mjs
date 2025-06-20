/* empty css                                 */
import { a as createComponent, r as renderHead, b as addAttribute, d as renderTemplate } from '../chunks/astro/server_D0Xbu7qU.mjs';
import 'kleur/colors';
import 'clsx';
import { g as getCollection } from '../chunks/_astro_content_CssdExQd.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = (await getCollection("posts")).sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate)).slice(0, 30);
  return renderTemplate`<html lang="ja"> <head><meta charset="UTF-8"><title>AIニュースまとめ - 最新記事</title><meta name="viewport" content="width=device-width, initial-scale=1.0">${renderHead()}</head> <body class="bg-white text-gray-800 font-sans"> <!-- ✅ ヘッダー --> <header class="text-center py-6 border-b border-gray-200"> <h1 class="text-2xl font-bold text-blue-700">AIニュースまとめ</h1> <p class="text-sm text-gray-500 mt-1">最新のAI関連ニュースをお届けします</p> </header> <!-- ✅ 広告枠（ヘッダー下） --> <div class="mx-auto max-w-screen-md py-4"> <div class="bg-gray-100 text-center py-4">🔰 広告エリア（ヘッダー下）</div> </div> <!-- ✅ 記事カード一覧 --> <main class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 max-w-screen-xl mx-auto py-8"> ${posts.map(({ data }, index) => renderTemplate`<a${addAttribute(data.link, "href")} target="_blank" rel="noopener noreferrer" class="block border border-gray-200 rounded-lg overflow-hidden shadow hover:shadow-md transition"> <img${addAttribute(data.thumbnail || "/assets/default-thumbnail.jpg", "src")} alt="サムネイル" class="w-full h-48 object-cover"> <div class="p-4 text-left"> <p class="text-green-600 text-xs mb-1">${data.media}</p> <h2 class="text-blue-700 font-semibold text-base line-clamp-2">${data.title}</h2> <p class="text-sm text-gray-600 mt-2 line-clamp-3">${data.summary}</p> <p class="text-xs text-green-600 mt-2">${data.pubDate}</p> </div> </a>`)} </main> <!-- ✅ 広告枠（カード下） --> <div class="mx-auto max-w-screen-md py-4"> <div class="bg-gray-100 text-center py-4">📢 広告エリア（記事下）</div> </div> <!-- ✅ ページネーション --> <div class="flex justify-center gap-4 py-6"> <a href="/page/date/2" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
次のページ →
</a> <a href="#top" class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
ページTOPへ ↑
</a> </div> <!-- ✅ フッター --> <footer class="text-center text-sm text-gray-500 py-6 border-t border-gray-200">
© 2025 raisex, LLC. All rights reserved.
</footer> </body></html>`;
}, "C:/dev/ai-news-curation-site/astro-site/src/pages/index.astro", void 0);

const $$file = "C:/dev/ai-news-curation-site/astro-site/src/pages/index.astro";
const $$url = "/ai-news-curation-site";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
