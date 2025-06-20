/* empty css                                    */
import { c as createAstro, a as createComponent, d as renderTemplate, b as addAttribute, e as renderComponent, F as Fragment, r as renderHead } from '../../chunks/astro/server_D0Xbu7qU.mjs';
import 'kleur/colors';
import { g as getCollection } from '../../chunks/_astro_content_CssdExQd.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://raisex-llc.github.io/ai-news-curation-site/");
async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { slug: post.slug }
  }));
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const posts = await getCollection("posts");
  const post = posts.find((p) => p.slug === slug);
  if (!post) throw new Error("Not found");
  const base = (Astro2.site?.pathname ?? "").replace(/\/$/, "");
  return renderTemplate(_a || (_a = __template(['<html lang="ja"> <head><meta charset="UTF-8"><title>', '</title><meta name="viewport" content="width=device-width, initial-scale=1.0">', '</head> <body class="bg-gray-100 text-gray-800 font-sans px-4 py-6"> <div class="max-w-3xl mx-auto"> <!-- \u2705 \u30BF\u30A4\u30C8\u30EB --> <header class="mb-6"> <h1 class="text-3xl font-extrabold text-sky-500 mb-2">\u{1F4F0} ', '</h1> <p class="text-sm text-gray-500"> ', " \u2013 ", " ", ' </p> </header> <!-- \u2705 \u672C\u6587 --> <article class="prose prose-sm sm:prose lg:prose-lg max-w-none bg-white rounded-lg shadow p-6"> ', ' </article> <!-- \u2705 \u623B\u308B\u30DC\u30BF\u30F3 --> <div class="mt-10 text-center"> <a id="backLink" href="#" class="inline-block px-4 py-2 border border-sky-600 text-sky-600 rounded hover:bg-gray-100 transition">\n\u2190 \u4E00\u89A7\u3078\u623B\u308B\n</a> </div> </div> <!-- \u2705 base \u3092\u6B63\u3057\u304F\u57CB\u3081\u8FBC\u3080 --> <script id="baseScript"', '><\/script> <!-- \u2705 \u623B\u308B\u30EA\u30F3\u30AF\u3092\u6B63\u3057\u304F\u69CB\u7BC9 --> <script>\n      const base = document.getElementById(\'baseScript\')?.dataset.base || \'\';\n      console.log("\u2705 base:", base);\n\n      const params = new URL(window.location.href).searchParams;\n      const fromPage = params.get("fromPage") || "1";\n      const fromSort = params.get("fromSort") || "date";\n\n      const backLink = document.getElementById("backLink");\n      if (backLink) {\n        backLink.href = `${base}/page/${fromSort}/${fromPage}`;\n        console.log("\u2705 backLink.href:", backLink.href);\n      } else {\n        console.warn("\u26A0\uFE0F backLink not found");\n      }\n    <\/script> </body> </html>'], ['<html lang="ja"> <head><meta charset="UTF-8"><title>', '</title><meta name="viewport" content="width=device-width, initial-scale=1.0">', '</head> <body class="bg-gray-100 text-gray-800 font-sans px-4 py-6"> <div class="max-w-3xl mx-auto"> <!-- \u2705 \u30BF\u30A4\u30C8\u30EB --> <header class="mb-6"> <h1 class="text-3xl font-extrabold text-sky-500 mb-2">\u{1F4F0} ', '</h1> <p class="text-sm text-gray-500"> ', " \u2013 ", " ", ' </p> </header> <!-- \u2705 \u672C\u6587 --> <article class="prose prose-sm sm:prose lg:prose-lg max-w-none bg-white rounded-lg shadow p-6"> ', ' </article> <!-- \u2705 \u623B\u308B\u30DC\u30BF\u30F3 --> <div class="mt-10 text-center"> <a id="backLink" href="#" class="inline-block px-4 py-2 border border-sky-600 text-sky-600 rounded hover:bg-gray-100 transition">\n\u2190 \u4E00\u89A7\u3078\u623B\u308B\n</a> </div> </div> <!-- \u2705 base \u3092\u6B63\u3057\u304F\u57CB\u3081\u8FBC\u3080 --> <script id="baseScript"', '><\/script> <!-- \u2705 \u623B\u308B\u30EA\u30F3\u30AF\u3092\u6B63\u3057\u304F\u69CB\u7BC9 --> <script>\n      const base = document.getElementById(\'baseScript\')?.dataset.base || \'\';\n      console.log("\u2705 base:", base);\n\n      const params = new URL(window.location.href).searchParams;\n      const fromPage = params.get("fromPage") || "1";\n      const fromSort = params.get("fromSort") || "date";\n\n      const backLink = document.getElementById("backLink");\n      if (backLink) {\n        backLink.href = \\`\\${base}/page/\\${fromSort}/\\${fromPage}\\`;\n        console.log("\u2705 backLink.href:", backLink.href);\n      } else {\n        console.warn("\u26A0\uFE0F backLink not found");\n      }\n    <\/script> </body> </html>'])), post.data.title, renderHead(), post.data.title, post.data.pubDate.toLocaleDateString("ja-JP"), post.data.source, post.data.url && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result2) => renderTemplate`${" "}<a${addAttribute(post.data.url, "href")} target="_blank" rel="noopener noreferrer" class="text-sky-500 hover:text-gray-500 no-underline border-b border-transparent hover:border-gray-300 transition">
元記事
</a> ` })}`, post.body, addAttribute(base, "data-base"));
}, "C:/dev/ai-news-curation-site/astro-site/src/pages/posts/[slug].astro", void 0);

const $$file = "C:/dev/ai-news-curation-site/astro-site/src/pages/posts/[slug].astro";
const $$url = "/ai-news-curation-site/posts/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
