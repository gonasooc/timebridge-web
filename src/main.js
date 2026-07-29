import "./styles.css";

// 헤더 링크에 현재 페이지 표시를 남긴다. 파셜을 공유하므로 런타임에서 처리한다.
function markCurrentNavLink() {
  const path = window.location.pathname.replace(/index\.html$/, "") || "/";

  for (const link of document.querySelectorAll(".site-nav-link")) {
    const target = new URL(link.getAttribute("href"), window.location.origin);
    const targetPath = target.pathname.replace(/index\.html$/, "") || "/";

    if (targetPath === path && (targetPath !== "/" || !target.hash)) {
      link.setAttribute("aria-current", "page");
    }
  }
}

function fillCurrentYear() {
  const year = String(new Date().getFullYear());

  for (const slot of document.querySelectorAll("[data-current-year]")) {
    slot.textContent = year;
  }
}

markCurrentNavLink();
fillCurrentYear();
