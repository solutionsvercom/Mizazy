import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, type Doc } from "./adminApi";
import { getPath, setPath, type CollectionConfig, type Field } from "./collections";

interface Props {
  config: CollectionConfig;
  onAuthError: (err: unknown) => boolean;
  openId?: string | null;
  onOpened?: () => void;
}

const PAGE_SIZE = 25;
const inputClass =
  "w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#D4A520]/60";

export default function CollectionManager({ config, onAuthError, openId, onOpened }: Props) {
  const [items, setItems] = useState<Doc[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Doc | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.list(config.id, { q: query, page, limit: PAGE_SIZE });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      if (!onAuthError(err)) setError(err instanceof Error ? err.message : "Could not load");
    } finally {
      setLoading(false);
    }
  }, [config.id, query, page, onAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!openId || loading) return;
    const found = items.find((i) => i._id === openId);
    if (found) setEditing(found);
    onOpened?.();
  }, [openId, items, loading, onOpened]);

  const remove = async (doc: Doc) => {
    if (!window.confirm(`Delete this ${config.singular}? This cannot be undone.`)) return;
    try {
      await adminApi.remove(config.id, doc._id);
      setEditing(null);
      load();
    } catch (err) {
      if (!onAuthError(err)) window.alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (editing) {
    return (
      <Editor
        config={config}
        doc={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
        onDelete={config.canDelete && editing._id ? () => remove(editing) : undefined}
        onAuthError={onAuthError}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">{config.label}</h1>
          <p className="text-white/40 text-sm">{total} total</p>
        </div>
        <div className="flex gap-2">
          <input className={`${inputClass} sm:w-64`} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {config.canCreate && (
            <button
              onClick={() => setEditing({ _id: "", ...(config.defaults || {}) } as Doc)}
              className="px-4 py-2 rounded-lg bg-[#D4A520] text-black text-sm font-bold whitespace-nowrap hover:bg-[#e6b830]"
            >
              + Add {config.singular}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-white/8 bg-[#0b0b0b]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/8">
              {config.columns.map((c, i) => (
                <th key={i} className="px-4 py-3 font-semibold">{c.label}</th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-white/40">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-white/40">Nothing here yet.</td></tr>
            ) : (
              items.map((doc) => (
                <tr key={doc._id} onClick={() => setEditing(doc)} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] cursor-pointer text-white/70">
                  {config.columns.map((c, i) => (
                    <td key={i} className="px-4 py-3 align-middle">{c.render(doc)}</td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-[#D4A520] text-xs font-semibold">Edit →</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4 text-sm text-white/50">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30">Previous</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}

function initialText(field: Field, doc: Doc): string {
  const value = getPath(doc, field.key);
  if (field.type === "list" || field.type === "images") return Array.isArray(value) ? value.join("\n") : "";
  if (field.type === "json") return value === undefined || value === null ? "" : JSON.stringify(value, null, 2);
  return "";
}

interface EditorProps {
  config: CollectionConfig;
  doc: Doc;
  onCancel: () => void;
  onSaved: () => void;
  onDelete?: () => void;
  onAuthError: (err: unknown) => boolean;
}

function Editor({ config, doc, onCancel, onSaved, onDelete, onAuthError }: EditorProps) {
  const isNew = !doc._id;
  const [draft, setDraft] = useState<Doc>(doc);
  const [texts, setTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      config.fields.filter((f) => ["list", "images", "json"].includes(f.type)).map((f) => [f.key, initialText(f, doc)])
    )
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");

  const sections = useMemo(() => {
    const out: { name: string; fields: Field[] }[] = [];
    for (const field of config.fields) {
      const name = field.section || "";
      let group = out.find((s) => s.name === name);
      if (!group) out.push((group = { name, fields: [] }));
      group.fields.push(field);
    }
    return out;
  }, [config.fields]);

  const update = (key: string, value: unknown) => setDraft((d) => setPath(d, key, value));

  const upload = async (field: Field, files: FileList | null) => {
    if (!files?.length) return;
    setUploading(field.key);
    setError("");
    try {
      const urls = await adminApi.uploadImages(files, config.id);
      if (field.type === "image") update(field.key, urls[0]);
      else setTexts((t) => ({ ...t, [field.key]: [t[field.key], ...urls].filter(Boolean).join("\n") }));
    } catch (err) {
      if (!onAuthError(err)) setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading("");
    }
  };

  const save = async () => {
    setError("");
    let body: Record<string, unknown> = { ...draft };
    for (const field of config.fields) {
      if (field.type === "readonly") continue;
      if (field.type === "list" || field.type === "images") {
        body = setPath(body, field.key, (texts[field.key] || "").split("\n").map((s) => s.trim()).filter(Boolean));
      } else if (field.type === "json") {
        const raw = (texts[field.key] || "").trim();
        try {
          body = setPath(body, field.key, raw ? JSON.parse(raw) : undefined);
        } catch {
          setError(`"${field.label}" is not valid JSON. Check brackets, quotes and commas.`);
          return;
        }
      } else if (field.type === "select" && getPath(body, field.key) === "") {
        body = setPath(body, field.key, null);
      }
      if (field.required) {
        const v = getPath(body, field.key);
        if (v === undefined || v === null || v === "") {
          setError(`"${field.label}" is required.`);
          return;
        }
      }
    }
    delete body._id;
    setSaving(true);
    try {
      if (isNew) await adminApi.create(config.id, body);
      else await adminApi.update(config.id, doc._id, body);
      onSaved();
    } catch (err) {
      if (!onAuthError(err)) setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  };

  const renderField = (field: Field) => {
    const value = getPath(draft, field.key);
    switch (field.type) {
      case "readonly":
        return (
          <pre className="bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/60 whitespace-pre-wrap break-words max-h-64 overflow-auto">
            {value === undefined || value === null || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
          </pre>
        );
      case "textarea":
        return <textarea className={`${inputClass} min-h-28`} value={String(value ?? "")} onChange={(e) => update(field.key, e.target.value)} />;
      case "number":
        return (
          <input
            type="number"
            className={inputClass}
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(e) => update(field.key, e.target.value === "" ? null : Number(e.target.value))}
          />
        );
      case "boolean":
        return (
          <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-white/70">
            <input type="checkbox" className="w-4 h-4 accent-[#D4A520]" checked={Boolean(value)} onChange={(e) => update(field.key, e.target.checked)} />
            {value ? "Yes" : "No"}
          </label>
        );
      case "select":
        return (
          <select className={`${inputClass} input-dark`} value={String(value ?? "")} onChange={(e) => update(field.key, e.target.value)}>
            {!field.options?.some((o) => o.value === String(value ?? "")) && <option value={String(value ?? "")}>{String(value ?? "") || "—"}</option>}
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      case "date":
        return (
          <input
            type="date"
            className={`${inputClass} [color-scheme:dark]`}
            value={value ? new Date(String(value)).toISOString().slice(0, 10) : ""}
            onChange={(e) => update(field.key, e.target.value ? new Date(e.target.value).toISOString() : null)}
          />
        );
      case "list":
        return (
          <textarea
            className={`${inputClass} min-h-24 font-mono text-xs`}
            value={texts[field.key] || ""}
            onChange={(e) => setTexts((t) => ({ ...t, [field.key]: e.target.value }))}
          />
        );
      case "json":
        return (
          <textarea
            className={`${inputClass} min-h-40 font-mono text-xs`}
            spellCheck={false}
            value={texts[field.key] || ""}
            onChange={(e) => setTexts((t) => ({ ...t, [field.key]: e.target.value }))}
          />
        );
      case "image":
        return (
          <div className="flex gap-3 items-start">
            {value ? <img src={String(value)} alt="" className="w-20 h-20 rounded-lg object-contain bg-white/5 flex-shrink-0" /> : null}
            <div className="flex-1 space-y-2">
              <input className={inputClass} placeholder="https://res.cloudinary.com/…" value={String(value ?? "")} onChange={(e) => update(field.key, e.target.value)} />
              <UploadButton busy={uploading === field.key} onFiles={(f) => upload(field, f)} />
            </div>
          </div>
        );
      case "images": {
        const urls = (texts[field.key] || "").split("\n").map((s) => s.trim()).filter(Boolean);
        return (
          <div className="space-y-2">
            {urls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {urls.map((u, i) => (
                  <img key={`${u}-${i}`} src={u} alt="" className="w-16 h-16 rounded-lg object-contain bg-white/5" />
                ))}
              </div>
            )}
            <textarea
              className={`${inputClass} min-h-24 font-mono text-xs`}
              placeholder="One image URL per line"
              value={texts[field.key] || ""}
              onChange={(e) => setTexts((t) => ({ ...t, [field.key]: e.target.value }))}
            />
            <UploadButton multiple busy={uploading === field.key} onFiles={(f) => upload(field, f)} />
          </div>
        );
      }
      default:
        return <input className={inputClass} value={String(value ?? "")} onChange={(e) => update(field.key, e.target.value)} />;
    }
  };

  return (
    <div className="max-w-3xl">
      <button onClick={onCancel} className="text-white/50 text-sm hover:text-white mb-4">← Back to {config.label.toLowerCase()}</button>
      <h1 className="text-2xl font-bold text-white mb-6">
        {isNew ? `Add ${config.singular}` : `Edit ${config.singular}`}
      </h1>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.name} className="rounded-xl border border-white/8 bg-[#0b0b0b] p-5">
            {section.name && <h2 className="text-[#D4A520] text-xs font-bold uppercase tracking-wider mb-4">{section.name}</h2>}
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-white/60 text-xs font-semibold mb-1.5">
                    {field.label}
                    {field.required && <span className="text-[#D4A520]"> *</span>}
                  </label>
                  {renderField(field)}
                  {field.help && <p className="text-white/30 text-xs mt-1">{field.help}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mt-5">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 mt-6 sticky bottom-0 bg-[#050505]/95 py-4 border-t border-white/8">
        <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-lg bg-[#D4A520] text-black text-sm font-bold hover:bg-[#e6b830] disabled:opacity-50">
          {saving ? "Saving…" : isNew ? `Create ${config.singular}` : "Save changes"}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-lg border border-white/12 text-white/70 text-sm hover:text-white">Cancel</button>
        {onDelete && (
          <button onClick={onDelete} className="ml-auto px-5 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function UploadButton({ onFiles, busy, multiple }: { onFiles: (files: FileList | null) => void; busy: boolean; multiple?: boolean }) {
  return (
    <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold cursor-pointer ${busy ? "text-white/30" : "text-white/70 hover:text-white hover:border-white/25"}`}>
      {busy ? "Uploading…" : multiple ? "Upload images" : "Upload image"}
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}
