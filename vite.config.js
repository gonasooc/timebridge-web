import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const partialsDir = resolve(import.meta.dirname, "partials");
const includePattern = /^([ \t]*)<!--\s*include:\s*([\w.-]+)\s*-->[ \t]*$/gm;

// `<!-- include: header.html -->` 한 줄을 partials/ 파일 내용으로 바꾼다.
// 들여쓰기를 유지해 빌드 결과 HTML이 손으로 쓴 것처럼 읽히게 한다.
function htmlPartials() {
  const expand = (html, depth = 0) => {
    if (depth > 4) return html;

    return html.replace(includePattern, (match, indent, name) => {
      let partial;

      try {
        partial = readFileSync(resolve(partialsDir, name), "utf8");
      } catch {
        throw new Error(`partials/${name} 파일을 찾을 수 없습니다.`);
      }

      return expand(partial, depth + 1)
        .trimEnd()
        .split("\n")
        .map((line) => (line ? indent + line : line))
        .join("\n");
    });
  };

  return {
    name: "timebridge-html-partials",
    transformIndexHtml: {
      order: "pre",
      handler: (html) => expand(html)
    },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(partialsDir)) {
        server.hot.send({ type: "full-reload" });
      }
    }
  };
}

const page = (name) => resolve(import.meta.dirname, `${name}.html`);

export default defineConfig({
  appType: "mpa",
  plugins: [htmlPartials(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        index: page("index")
      }
    }
  }
});
