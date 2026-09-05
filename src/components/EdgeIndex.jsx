// 页面边缘索引：让访客知道自己正在阅读哪一段，但不把页面变成导航面板。
import { useEffect, useState } from "react";
import { textByLang } from "../utils/i18n.js";

const indexItems = [
  { id: "top", en: "About me", zh: "关于我" },
  { id: "section-breakdown", en: "Projects", zh: "项目" },
  { id: "section-signal-cloud", en: "Capabilities", zh: "能力" },
  { id: "section-workflow", en: "Workflow", zh: "工作流" },
  { id: "section-coverage", en: "Now", zh: "现在" },
  { id: "section-roadmap", en: "Experience", zh: "经历" },
  { id: "live-news", en: "Daily", zh: "日报" },
];

function getInitialSection() {
  if (typeof window === "undefined") return "top";
  const hash = window.location.hash.slice(1);
  return indexItems.some((item) => item.id === hash) ? hash : "top";
}

export function EdgeIndex({ lang }) {
  const [activeId, setActiveId] = useState(getInitialSection);

  useEffect(() => {
    const sections = indexItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!("IntersectionObserver" in window) || sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

        if (visibleSections[0]) setActiveId(visibleSections[0].target.id);
      },
      { rootMargin: "-22% 0px -58% 0px", threshold: [0, 0.2, 0.5] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleNavigate = (event, id) => {
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    setActiveId(id);
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav className="edge-index" aria-label={textByLang(lang, "Page index", "页面索引")}>
      <div className="edge-index-list">
        {indexItems.map((item, index) => (
          <a
            className={`edge-index-link ${activeId === item.id ? "is-active" : ""}`}
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "location" : undefined}
            key={item.id}
            onClick={(event) => handleNavigate(event, item.id)}
          >
            <span className="edge-index-number">{String(index + 1).padStart(2, "0")}</span>
            <span>{textByLang(lang, item.en, item.zh)}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
