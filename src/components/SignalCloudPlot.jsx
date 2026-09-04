// 词云渲染组件：用可测量的绝对布局保留自由分布，同时避免关键词重叠。
import { useLayoutEffect, useRef, useState } from "react";

function overlaps(a, b, gap = 4) {
  return !(a.right + gap < b.left || a.left - gap > b.right || a.bottom + gap < b.top || a.top - gap > b.bottom);
}

function hashWord(word) {
  return [...word].reduce((hash, char, index) => (hash * 31 + char.charCodeAt(0) + index) >>> 0, 7);
}

function placeWords(data, elements, width, height) {
  const placed = [];
  return [...data]
    .sort((a, b) => b.value - a.value)
    .map((item, index) => {
      const el = elements.get(item.word);
      const size = { width: el.offsetWidth, height: el.offsetHeight };
      const hash = hashWord(item.word);
      const angle = index * 2.399963 + (hash % 11) * 0.04;
      const rotation = [0, -3, 2, 1, -2, 3, -1, 0][index % 8];
      const preferred = {
        x: width * (0.14 + (hash % 70) / 100),
        y: height * (0.12 + ((hash >>> 8) % 74) / 100),
      };
      const candidates = [];
      for (let step = 0; step < 100; step += 1) {
        const radius = step < 14 ? step * 5 : 70 + (step - 14) * 7;
        const wobble = 1 + ((index * 13 + step * 7) % 9) / 35;
        candidates.push({
          x: preferred.x + Math.cos(angle + step * 0.31) * radius * wobble,
          y: preferred.y + Math.sin(angle + step * 0.31) * radius * wobble,
        });
      }
      let chosen = null;
      for (let attempt = 0; attempt < 3 && !chosen; attempt += 1) {
        for (const candidate of candidates) {
          const left = candidate.x - size.width / 2;
          const top = candidate.y - size.height / 2;
          const rect = { left, top, right: left + size.width, bottom: top + size.height };
          if (left < 12 || top < 12 || rect.right > width - 12 || rect.bottom > height - 12) continue;
          if (placed.every((other) => !overlaps(rect, other, 3))) {
            chosen = { candidate, rect };
            break;
          }
        }
        if (!chosen) {
          el.style.fontSize = `${parseFloat(el.style.fontSize) * 0.9}px`;
        }
      }
      if (!chosen) {
        const currentSize = { width: el.offsetWidth, height: el.offsetHeight };
        const candidate = {
          x: Math.max(currentSize.width / 2 + 12, Math.min(width - currentSize.width / 2 - 12, preferred.x)),
          y: Math.max(currentSize.height / 2 + 12, Math.min(height - currentSize.height / 2 - 12, preferred.y)),
        };
        chosen = { candidate, rect: { left: candidate.x - currentSize.width / 2, top: candidate.y - currentSize.height / 2, right: candidate.x + currentSize.width / 2, bottom: candidate.y + currentSize.height / 2 } };
      }
      placed.push(chosen.rect);
      return { ...item, left: chosen.candidate.x, top: chosen.candidate.y, rotation };
    });
}

export function SignalCloudPlot({ data, activeGroup, activeWord, groupByWord, onWordEnter }) {
  const containerRef = useRef(null);
  const wordRefs = useRef(new Map());
  const [layout, setLayout] = useState([]);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return undefined;
    const renderLayout = () => {
      if (!container.clientWidth || !container.clientHeight || wordRefs.current.size !== data.length) return;
      setReady(false);
      setLayout(placeWords(data, wordRefs.current, container.clientWidth, container.clientHeight));
      requestAnimationFrame(() => setReady(true));
    };
    renderLayout();
    const observer = new ResizeObserver(renderLayout);
    observer.observe(container);
    return () => observer.disconnect();
  }, [data]);

  const layoutByWord = new Map(layout.map((item) => [item.word, item]));
  return (
    <div className={`signal-cloud-plot${ready ? " is-ready" : ""}`} ref={containerRef} aria-label="技术栈词云" role="list">
      {data.map((item) => {
        const group = groupByWord[item.word] || "frontend";
        const positioned = layoutByWord.get(item.word);
        return (
          <span
            className={`signal-cloud-word${activeGroup && activeGroup !== group ? " is-dim" : ""}${activeWord === item.word ? " is-active" : ""}`}
            key={item.word}
            ref={(node) => { if (node) wordRefs.current.set(item.word, node); else wordRefs.current.delete(item.word); }}
            role="listitem"
            onMouseEnter={() => onWordEnter(group, item.word)}
            style={{
              color: signalCloudColor(group),
              fontSize: `${Math.min(27, 14 + item.value * 0.13)}px`,
              left: positioned ? `${positioned.left}px` : "50%",
              top: positioned ? `${positioned.top}px` : "50%",
              "--word-rotation": `${positioned?.rotation || 0}deg`,
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
}

function signalCloudColor(group) {
  return { frontend: "#20231f", backend: "#798b19", engineering: "#657a45", "ai-research": "#8a4f67" }[group] || "#20231f";
}
