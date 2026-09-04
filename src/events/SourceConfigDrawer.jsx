import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildSourceSearchQuery,
  filterSourceNames,
  normalizeSourceName,
  readProjectSourceConfig,
  sourceStatusLabel,
  writeProjectSourceConfig,
} from "./sourceConfig.js";

function sourceRowsFromConfig(config, payloadSources) {
  const projectSources = Array.isArray(config?.sources) ? config.sources : [];
  const publicSources = Array.isArray(payloadSources) ? payloadSources : [];
  const publicById = new Map(publicSources.filter(Boolean).map((source) => [source.id, source]));
  const rows = projectSources.map((source) => ({ ...source, ...(publicById.get(source.id) || {}), name: source.name }));
  if (rows.length) return rows;
  return publicSources.map((source) => ({ ...source, custom: Boolean(source.custom) }));
}

function editableSources(rows) {
  return rows.map((source) => ({
    id: String(source.id || "").trim(),
    name: source.name,
    ...(source.custom ? { custom: true } : {}),
  }));
}

function summaryFor(rows) {
  return rows.reduce((summary, source) => {
    const label = sourceStatusLabel(source);
    if (label === "已确认" || label === "已接入") summary.confirmed += 1;
    else if (label === "暂不可用" || label === "读取失败") summary.unavailable += 1;
    else summary.pending += 1;
    return summary;
  }, { confirmed: 0, pending: 0, unavailable: 0 });
}

export default function SourceConfigDrawer({ open, onClose, payloadSources = [], returnFocusRef }) {
  const queryRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [projectConfig, setProjectConfig] = useState(null);
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setLoading(true);
    setError("");
    setMessage("");
    setQuery("");
    readProjectSourceConfig()
      .then((config) => {
        if (cancelled) return;
        setProjectConfig(config);
        setRows(sourceRowsFromConfig(config, payloadSources));
        setReadOnly(false);
      })
      .catch(() => {
        if (cancelled) return;
        setProjectConfig(null);
        setRows(sourceRowsFromConfig(null, payloadSources));
        setReadOnly(true);
        setError("请在本地开发服务器中配置；公开页面为只读。 ");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, payloadSources]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => queryRef.current?.focus(), 0);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  function closeDrawer() {
    const trigger = returnFocusRef?.current;
    onClose();
    trigger?.focus();
  }

  function updateName(id, value) {
    setRows((current) => current.map((source) => source.id === id ? { ...source, name: value } : source));
    setError("");
    setMessage("");
  }

  function addSource(event) {
    event.preventDefault();
    try {
      const name = normalizeSourceName(newName);
      const duplicate = rows.some((source) => source.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase());
      if (duplicate) throw new Error("duplicate source name");
      const id = `custom-${Date.now()}-${rows.length}`;
      setRows((current) => [...current, { id, name, custom: true, status: "pending" }]);
      setNewName("");
      setError("");
      setMessage("已加入待保存来源");
    } catch (saveError) {
      setError(saveError.message.includes("duplicate") ? "名称重复，未添加。" : "请输入公众号名称。 ");
    }
  }

  async function saveSources() {
    if (readOnly || !projectConfig) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const seen = new Set();
      const sources = editableSources(rows).map((source) => {
        const name = normalizeSourceName(source.name);
        const key = name.toLocaleLowerCase();
        if (seen.has(key)) throw new Error("duplicate source name");
        seen.add(key);
        return { ...source, name };
      });
      const saved = await writeProjectSourceConfig(sources);
      setProjectConfig(saved);
      setRows(sourceRowsFromConfig(saved, payloadSources));
      setMessage(`已保存到项目 JSON · ${new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}`);
    } catch (saveError) {
      setError(saveError.message.includes("duplicate") ? "名称重复，请修改后再保存。" : saveError.message.includes("required") ? "名称不能为空。" : "保存失败，请检查本地开发服务器终端。 ");
    } finally {
      setSaving(false);
    }
  }

  async function restoreConfig() {
    if (!projectConfig) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const current = await readProjectSourceConfig();
      setProjectConfig(current);
      setRows(sourceRowsFromConfig(current, payloadSources));
      setMessage("已恢复当前 JSON");
    } catch {
      setError("无法读取当前 JSON，请检查本地开发服务器。 ");
    } finally {
      setLoading(false);
    }
  }

  const visibleRows = useMemo(() => filterSourceNames(rows, query), [rows, query]);
  const summary = useMemo(() => summaryFor(rows), [rows]);

  if (!open) return null;

  return (
    <div className="source-config-layer">
      <button type="button" className="source-config-backdrop" aria-label="关闭来源配置" onClick={closeDrawer} />
      <aside className="source-config-drawer" role="dialog" aria-modal="true" aria-labelledby="source-config-title">
        <header className="source-config-header">
          <div>
            <p className="events-kicker">PROJECT JSON / 项目配置</p>
            <h2 id="source-config-title">来源配置</h2>
            <p>只填写公众号名称。保存后再提交并推送 JSON，下一次刷新才会使用新名称。</p>
          </div>
          <button type="button" className="source-config-close" aria-label="关闭来源配置" onClick={closeDrawer}>×</button>
        </header>

        <div className="source-config-body">
          <div className="source-config-stats" aria-label="来源状态概览">
            <span><strong>{rows.length}</strong> 个来源</span>
            <span><strong>{summary.confirmed}</strong> 已确认</span>
            <span><strong>{summary.pending}</strong> 待确认</span>
            <span><strong>{summary.unavailable}</strong> 暂不可用</span>
          </div>

          {error ? <p className="source-config-error" role="alert">{error}</p> : null}
          {message ? <p className="source-config-message" role="status">{message}</p> : null}

          <label className="source-config-query">
            <span>搜索来源名称</span>
            <input ref={queryRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：量子位" />
          </label>

          <form className="source-config-add" onSubmit={addSource}>
            <label>
              <span>新增公众号名称</span>
              <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="只填写名称" />
            </label>
            <button type="submit" className="source-config-add-button">添加名称</button>
          </form>

          {loading ? <p className="source-config-loading">正在读取项目 JSON…</p> : null}
          <div className="source-config-list" aria-label="公众号来源列表">
            {visibleRows.map((source) => {
              const status = sourceStatusLabel(source);
              const tone = status === "暂不可用" || status === "读取失败" ? "warning" : status === "已确认" || status === "已接入" ? "ok" : "pending";
              return (
                <div className="source-config-row" key={source.id}>
                  <div className="source-config-row-top">
                    <label>
                      <span className="source-config-label">公众号名称</span>
                      <input value={source.name} onChange={(event) => updateName(source.id, event.target.value)} aria-label={`${source.name}名称`} />
                    </label>
                    <span className={`source-config-status source-config-status-${tone}`}>{status}</span>
                  </div>
                  <div className="source-config-row-meta">
                    <span>{source.custom ? "本页新增来源" : "项目原始来源"}</span>
                    <code>{buildSourceSearchQuery(source.name || "待填写")}</code>
                  </div>
                </div>
              );
            })}
            {!loading && !visibleRows.length ? <p className="source-config-empty">没有匹配的来源名称。</p> : null}
          </div>
        </div>

        <footer className="source-config-actions">
          <button type="button" className="source-config-reset" onClick={restoreConfig} disabled={readOnly || loading || saving}>恢复当前 JSON</button>
          <button type="button" className="source-config-save" onClick={saveSources} disabled={readOnly || loading || saving || !rows.length}>{saving ? "保存中…" : "保存到项目 JSON"}</button>
        </footer>
      </aside>
    </div>
  );
}
