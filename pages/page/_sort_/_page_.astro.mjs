/* empty css                                       */
import { c as createAstro, a as createComponent, r as renderHead, b as addAttribute, d as renderTemplate } from '../../../chunks/astro/server_D0Xbu7qU.mjs';
import 'kleur/colors';
import 'clsx';
import { g as getCollection } from '../../../chunks/_astro_content_CssdExQd.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://raisex-llc.github.io/ai-news-curation-site/");
async function getStaticPaths() {
  const PAGE_SIZE = 30;
  const allPosts = await getCollection("posts");
  const sorts = ["date", "source"];
  const paths = [];
  for (const sort of sorts) {
    const sorted = sort === "source" ? [...allPosts].sort((a, b) => a.data.source.localeCompare(b.data.source)) : [...allPosts].sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    for (let i = 1; i <= totalPages; i++) {
      paths.push({ params: { sort, page: String(i) } });
    }
  }
  return paths;
}
const $$page = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$page;
  const PAGE_SIZE = 30;
  const { sort = "date", page } = Astro2.params;
  const currentPage = parseInt(page);
  const base = Astro2.site?.pathname ?? "";
  const allPosts = await getCollection("posts");
  const sortedPosts = sort === "source" ? allPosts.sort((a, b) => a.data.source.localeCompare(b.data.source)) : allPosts.sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const posts = sortedPosts.slice(start, end);
  const totalPages = Math.ceil(sortedPosts.length / PAGE_SIZE);
  return renderTemplate`<html lang="ja"> <head><meta charset="UTF-8"><title>AIニュースまとめ - ページ ${currentPage}</title><meta name="viewport" content="width=device-width, initial-scale=1.0">${renderHead()}</head> <body class="bg-gray-100 text-gray-800 font-sans px-4 py-6"> <div class="max-w-6xl mx-auto"> <!-- タイトル --> <header class="mb-8 text-center"> <h1 class="text-6xl font-extrabold leading-tight tracking-tight"> <a${addAttribute(`${base}/page/date/1`, "href")} class="no-underline text-sky-400 hover:text-sky-600 active:text-sky-600">
🤖 最新AIニュースまとめ
</a> </h1> <div class="text-gray-600 text-lg mt-2">
(ページ ${currentPage} / 全 ${totalPages} ページ中)
</div> <!-- 並び順切替 --> <div class="text-gray-500 text-sm mt-1">
並び順：
${sort === "date" ? renderTemplate`<a${addAttribute(`${base}/page/date/1`, "href")} class="inline-block px-2 py-1 rounded border font-bold text-sky-700 border-sky-300 bg-sky-50">
新着順（投稿日が新しい順）
</a>` : renderTemplate`<a${addAttribute(`${base}/page/date/1`, "href")} class="inline-block px-2 py-1 rounded border text-gray-400 hover:text-sky-600 hover:border-sky-200">
新着順（投稿日が新しい順）
</a>`} <span class="mx-2">|</span> ${sort === "source" ? renderTemplate`<a${addAttribute(`${base}/page/source/1`, "href")} class="inline-block px-2 py-1 rounded border font-bold text-sky-700 border-sky-300 bg-sky-50">
ソース別
</a>` : renderTemplate`<a${addAttribute(`${base}/page/source/1`, "href")} class="inline-block px-2 py-1 rounded border text-gray-400 hover:text-sky-600 hover:border-sky-200">
ソース別
</a>`} </div> </header> <!-- ページネーション（上） --> <nav class="mb-6 text-center space-x-2"> ${currentPage > 1 && renderTemplate`<a${addAttribute(`${base}/page/${sort}/${currentPage - 1}`, "href")} class="inline-block px-4 py-2 border border-sky-600 text-sky-600 rounded hover:bg-gray-100 transition">
← 前のページ
</a>`} ${currentPage < totalPages && renderTemplate`<a${addAttribute(`${base}/page/${sort}/${currentPage + 1}`, "href")} class="inline-block px-4 py-2 border border-sky-600 text-sky-600 rounded hover:bg-gray-100 transition">
次のページ →
</a>`} </nav> <!-- 一覧表示 --> <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"> ${posts.map((post, index) => renderTemplate`<div> <a${addAttribute(`${base}/posts/${post.slug}?fromPage=${currentPage}&fromSort=${sort}`, "href")} class="block bg-white rounded shadow hover:shadow-md transition"> <div class="p-4"> <h2 class="text-lg font-bold no-underline text-sky-400 hover:text-gray-500 line-clamp-2"> ${post.data.title} </h2> <p class="text-sm text-gray-500 mt-2"> ${post.data.source} / ${new Date(post.data.pubDate).toLocaleDateString("ja-JP")} </p> </div> </a> ${index < posts.length - 1 && renderTemplate`<hr class="my-6 border-t border-gray-100">`} </div>`)} </div> <!-- ページネーション（下） --> <nav class="mt-10 text-center space-x-2"> ${currentPage > 1 && renderTemplate`<a${addAttribute(`${base}/page/${sort}/${currentPage - 1}`, "href")} class="inline-block px-4 py-2 border border-sky-600 text-sky-600 rounded hover:bg-gray-100 transition">
← 前のページ
</a>`} ${currentPage < totalPages && renderTemplate`<a${addAttribute(`${base}/page/${sort}/${currentPage + 1}`, "href")} class="inline-block px-4 py-2 border border-sky-600 text-sky-600 rounded hover:bg-gray-100 transition">
次のページ →
</a>`} </nav> </div> </body></html>`;
}, "C:/dev/ai-news-curation-site/astro-site/src/pages/page/[sort]/[page].astro", void 0);

const $$file = "C:/dev/ai-news-curation-site/astro-site/src/pages/page/[sort]/[page].astro";
const $$url = "/ai-news-curation-site/page/[sort]/[page]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$page,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
