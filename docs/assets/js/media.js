// 자료 버튼(영상·PDF)을 누르면 같은 항목 아래 패널에 펼친다. 자동 재생하지 않는다.
// JS가 없으면 버튼은 그냥 새 탭 링크로 동작한다.
(function () {
  "use strict";

  var coarse = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  function youtubeId(url) {
    var m = (url || "").match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  function driveId(url) {
    var m = (url || "").match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/);
    return m ? m[1] : null;
  }

  function actions(link) {
    var kind = link.dataset.kind;
    var href = link.getAttribute("href");
    var list = [h("a", { href: href, target: "_blank", rel: "noopener", text: "새 탭에서 열기" })];
    if (kind === "pdf") {
      var dl = h("a", { href: href, text: "다운로드" });
      dl.setAttribute("download", link.dataset.download || "");
      list.push(dl);
    }
    var close = h("button", { type: "button", text: "닫기" });
    close.addEventListener("click", function () { closePanel(link, true); });
    list.push(close);
    return h("span", { class: "panel-actions" }, list);
  }

  function content(link) {
    var kind = link.dataset.kind;
    var href = link.getAttribute("href");
    var title = link.dataset.title || "";
    if (kind === "video") {
      var attrs = { class: "panel-media", controls: "", preload: "metadata", playsinline: "", src: href };
      if (link.dataset.poster) attrs.poster = link.dataset.poster;
      return h("video", attrs);
    }
    if (kind === "youtube") {
      return h("iframe", { class: "panel-media", title: title, loading: "lazy", allowfullscreen: "",
        src: "https://www.youtube-nocookie.com/embed/" + youtubeId(href) + "?rel=0",
        allow: "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" });
    }
    if (kind === "drive-video" || kind === "drive-pdf") {
      return h("iframe", { class: kind === "drive-pdf" ? "panel-pdf" : "panel-media", title: title, loading: "lazy",
        allowfullscreen: "", src: "https://drive.google.com/file/d/" + driveId(href) + "/preview" });
    }
    if (kind === "pdf") {
      return h("iframe", { class: "panel-pdf", title: title, src: href + "#view=FitH" });
    }
    return null;
  }

  function closePanel(link, focusBack) {
    var panel = document.getElementById(link.getAttribute("aria-controls"));
    if (!panel) return;
    panel.hidden = true;
    panel.replaceChildren();
    panel.removeAttribute("data-owner");
    link.setAttribute("aria-expanded", "false");
    if (focusBack) link.focus();
  }

  function openPanel(link) {
    var panel = document.getElementById(link.getAttribute("aria-controls"));
    if (!panel) return;
    var owner = panel.getAttribute("data-owner");
    if (owner) {
      var prev = document.querySelector('[data-panel-id="' + owner + '"]');
      if (prev) closePanel(prev, false);
    }
    var body = content(link);
    if (!body) return;
    panel.replaceChildren(body, h("div", { class: "panel-bar" }, [
      h("span", { class: "panel-title", text: link.dataset.title || "" }),
      actions(link)
    ]));
    panel.hidden = false;
    panel.setAttribute("data-owner", link.getAttribute("data-panel-id"));
    link.setAttribute("aria-expanded", "true");
  }

  var seq = 0;
  document.querySelectorAll("a[data-kind]").forEach(function (link) {
    link.setAttribute("data-panel-id", "res-" + (++seq));
    // 모바일 브라우저는 iframe 안 PDF를 제대로 그리지 못하므로 새 탭으로 연다.
    if (coarse && link.dataset.kind === "pdf") {
      link.removeAttribute("aria-controls");
      link.removeAttribute("aria-expanded");
      return;
    }
    link.setAttribute("role", "button");
    link.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      if (link.getAttribute("aria-expanded") === "true") closePanel(link, false);
      else openPanel(link);
    });
    link.addEventListener("keydown", function (e) {
      if (e.key === " ") { e.preventDefault(); link.click(); }
    });
  });

  // 접힌 학회 목록 안의 논문으로 이동할 때 목록을 연다.
  function revealHash() {
    if (!location.hash) return;
    var target;
    try { target = document.querySelector(decodeURIComponent(location.hash)); } catch (err) { return; }
    if (!target) return;
    var details = target.closest("details");
    if (details && !details.open) {
      details.open = true;
      target.scrollIntoView();
    }
  }
  window.addEventListener("hashchange", revealHash);
  revealHash();
})();
