import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  BookOpen,
  ExternalLink,
  Eye,
  FileText,
  FlaskConical,
  LockKeyhole,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UnlockKeyhole,
  X,
} from "lucide-react";
import { contentApi, isContentApiConfigured } from "../services/contentApi";

const ContentContext = createContext(null);
const CONTENT_TYPES = ["blog", "paper", "certificate", "demo"];
const EMPTY_PUBLIC_STATE = { entries: [], loading: true, error: "" };
const TYPE_META = {
  blog: {
    title: "Engineering Blog",
    short: "Blog",
    description: "Engineering articles, project progress, and technical learnings.",
    icon: BookOpen,
    action: "Read Articles",
    unit: "articles",
    emptyTitle: "No published articles yet",
    emptyDescription: "Engineering write-ups and technical notes will appear here once published.",
  },
  paper: {
    title: "Research Papers",
    short: "Papers",
    description: "Research papers, reading notes, and technical insights.",
    icon: FileText,
    action: "Explore Library",
    unit: "papers",
    emptyTitle: "No research papers yet",
    emptyDescription: "Curated papers and personal reading notes will appear here once published.",
  },
  certificate: {
    title: "Certificates",
    short: "Certificates",
    description: "Credentials and certificate verification.",
    icon: Award,
    action: "View Certificates",
    unit: "credentials",
    emptyTitle: "No certificates yet",
    emptyDescription:
      "Completed certifications and credential verifications will appear here once published.",
  },
  demo: {
    title: "Recent Project Demos",
    short: "Project Demos",
    description: "Prototypes, experiments, and working demonstrations.",
    icon: FlaskConical,
    action: "Explore Demos",
    unit: "demos",
    emptyTitle: "No project demos yet",
    emptyDescription:
      "Interactive prototypes and proof-of-concept demos will appear here once published.",
  },
};
const DEMO_CATEGORIES = [
  "Data Engineering",
  "Analytics Engineering",
  "Data Analytics",
  "AI/ML",
  "Other",
];

const FIELDS = {
  blog: [
    { key: "title", label: "Title", required: true },
    { key: "summary", label: "Summary", multiline: true },
    { key: "body", label: "Article body", multiline: true, rows: 9 },
    { key: "publicationDate", label: "Publication date" },
    { key: "tags", label: "Tags", list: true },
    { key: "projectReferences", label: "Project references", list: true },
    { key: "imageUrl", label: "Optional image URL", url: true },
    { key: "linksText", label: "Links (one label | HTTPS URL per line)", multiline: true, rows: 3 },
  ],
  paper: [
    { key: "title", label: "Paper title", required: true },
    { key: "authors", label: "Authors" },
    { key: "publicationYear", label: "Publication year" },
    { key: "publicationDate", label: "Publication date" },
    { key: "source", label: "Source / journal / conference" },
    { key: "sourceUrl", label: "Original paper / DOI / PDF URL", url: true },
    { key: "summary", label: "Summary", multiline: true },
    { key: "tags", label: "Tags", list: true },
    { key: "personalNotes", label: "My notes", multiline: true, rows: 5 },
  ],
  certificate: [
    { key: "title", label: "Certificate title", required: true },
    { key: "issuer", label: "Issuing organization", required: true },
    { key: "issueDate", label: "Issue date" },
    { key: "credentialId", label: "Credential ID" },
    { key: "certificateUrl", label: "Certificate / PDF URL", url: true },
    { key: "imageUrl", label: "Certificate image URL", url: true },
    { key: "verificationUrl", label: "Verification URL", url: true },
  ],
  demo: [
    { key: "title", label: "Demo title", required: true },
    { key: "description", label: "Description", multiline: true },
    { key: "category", label: "Category", category: true, required: true },
    { key: "technologies", label: "Technologies", list: true },
    { key: "thumbnailUrl", label: "Thumbnail URL", url: true },
    { key: "screenshots", label: "Screenshot URLs", list: true },
    { key: "githubUrl", label: "GitHub URL", url: true },
    { key: "liveDemoUrl", label: "Live demo URL", url: true },
    { key: "creationDate", label: "Creation date" },
  ],
};

function blankData(type) {
  return Object.fromEntries(
    FIELDS[type]
      .filter((field) => field.key !== "linksText")
      .map((field) => [field.key, field.list ? [] : ""]),
  );
}

function initialEditorData(entry) {
  const data = entry?.data ? { ...entry.data } : blankData(entry.type);
  if (entry.type === "blog") {
    data.linksText = (data.links || [])
      .map((link) => `${link.label || ""} | ${link.url || ""}`)
      .join("\n");
  }
  if (entry.type === "demo" && data.category && !DEMO_CATEGORIES.includes(data.category))
    data.customCategory = data.category;
  return data;
}

function safeHttpsUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : "";
  } catch {
    return "";
  }
}

function listText(value) {
  return Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : "";
}

function normalizeEditorData(type, source, categoryOther) {
  let data = { ...source };
  if (type === "blog") {
    data.links = (data.linksText || "")
      .split("\n")
      .map((line) => {
        const [label, ...urlParts] = line.split("|");
        const url = urlParts.join("|").trim();
        return url ? { label: label.trim() || "Reference", url } : null;
      })
      .filter(Boolean);
    delete data.linksText;
  }
  if (type === "demo") {
    data.category = categoryOther ? data.customCategory || "" : data.category || "";
    delete data.customCategory;
  }
  data = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === "string" &&
      ["tags", "projectReferences", "technologies", "screenshots"].includes(key)
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : value,
    ]),
  );
  return data;
}

function EditorValue({ entry, onEdit, onClose }) {
  const [data, setData] = useState(() => initialEditorData(entry));
  const [categoryOther, setCategoryOther] = useState(
    () => entry?.data?.category && !DEMO_CATEGORIES.includes(entry.data.category),
  );
  const [status, setStatus] = useState(entry?.forceStatus || entry?.status || "draft");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const { saveEntry } = useContentOwner();

  const updateField = (field, value) => setData((current) => ({ ...current, [field]: value }));
  const fieldValue = (field) => (field.list ? listText(data[field.key]) : data[field.key] || "");

  const submit = async (nextStatus) => {
    setBusy(true);
    setError("");
    try {
      const cleanData = normalizeEditorData(entry.type, data, categoryOther);
      await saveEntry(entry.type, entry.id, cleanData, nextStatus);
    } catch (saveError) {
      setError(saveError.message || "Could not save this entry.");
      if (saveError.status === 401) onClose();
    } finally {
      setBusy(false);
    }
  };

  const previewEntry = {
    ...entry,
    data: normalizeEditorData(entry.type, data, categoryOther),
    status,
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (window.lenisInstance && !window.lenisInstance.isDestroyed) {
      window.lenisInstance.stop();
    }

    const onEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (window.lenisInstance && !window.lenisInstance.isDestroyed) {
        window.lenisInstance.start();
      }
      window.removeEventListener("keydown", onEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 md:p-6 overscroll-contain"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        data-lenis-prevent
        className="w-full max-w-3xl h-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[90dvh] flex flex-col rounded-[6px] border border-lime-400/25 bg-[#101610] shadow-[0_20px_80px_rgba(0,0,0,0.55)] overflow-hidden overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-editor-title"
      >
        <div className="shrink-0 flex items-center justify-between border-b border-lime-400/15 bg-[#101610] px-5 py-4 z-10">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime-400">
              {entry.id ? "Edit entry" : "New entry"} · {TYPE_META[entry.type].short}
            </p>
            <h3 id="content-editor-title" className="mt-1 text-lg font-bold text-white">
              {entry.id ? "Update content" : "Create content"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/15 p-2 text-white/70 hover:border-lime-400/40 hover:text-lime-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-lime-400"
            aria-label="Close editor"
          >
            <X size={16} />
          </button>
        </div>

        <form
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 pb-8 space-y-4 modal-scroll focus:outline-none"
          onSubmit={(event) => {
            event.preventDefault();
            submit(status);
          }}
        >
          {FIELDS[entry.type].map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.13em] text-white/55">
                {field.label}
                {field.required ? " *" : ""}
              </span>
              {field.category ? (
                <>
                  <select
                    value={categoryOther ? "Other" : data.category || ""}
                    required
                    onChange={(event) => {
                      const custom = event.target.value === "Other";
                      setCategoryOther(custom);
                      updateField("category", custom ? "Other" : event.target.value);
                    }}
                    className="content-field"
                  >
                    <option value="">Choose a category</option>
                    {DEMO_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {categoryOther && (
                    <input
                      className="content-field mt-2"
                      placeholder="Enter category"
                      value={data.customCategory || ""}
                      required
                      onChange={(event) => updateField("customCategory", event.target.value)}
                    />
                  )}
                </>
              ) : field.key === "linksText" ? (
                <textarea
                  className="content-field"
                  rows={field.rows}
                  value={data.linksText || ""}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder="Documentation | https://example.com"
                />
              ) : field.multiline ? (
                <textarea
                  className="content-field"
                  rows={field.rows || 4}
                  required={field.required}
                  value={fieldValue(field)}
                  onChange={(event) => updateField(field.key, event.target.value)}
                />
              ) : (
                <input
                  className="content-field"
                  type="text"
                  required={field.required}
                  value={fieldValue(field)}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder={field.list ? "Separate values with commas" : ""}
                />
              )}
            </label>
          ))}

          <label className="block">
            <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.13em] text-white/55">
              When saved
            </span>
            <select
              className="content-field"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="draft">Save as draft</option>
              <option value="published">Publish</option>
            </select>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded border border-red-400/25 bg-red-400/5 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </p>
          )}
          {preview && (
            <div className="rounded border border-lime-400/15 bg-[#171817] p-4">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-lime-400">
                Preview · unsaved
              </p>
              <EntryDetails entry={previewEntry} />
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-lime-400/10 pt-4">
            <button
              type="button"
              onClick={() => setPreview((value) => !value)}
              className="owner-secondary"
            >
              <Eye size={13} />
              {preview ? "Hide preview" : "Preview"}
            </button>
            <button type="button" onClick={onClose} className="owner-secondary">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="owner-primary">
              {busy ? "Saving…" : "Save entry"}
            </button>
          </div>
          <p className="text-right font-mono text-[9px] text-white/35">
            Saving locks owner mode. Re-authenticate for the next change.
          </p>
        </form>
      </div>
    </div>
  );
}

function EntryDetails({ entry }) {
  const { type, data = {} } = entry;
  const image = safeHttpsUrl(data.imageUrl || data.thumbnailUrl);
  const links = [];
  if (type === "paper" && data.sourceUrl)
    links.push({ label: data.source || "Original paper", url: data.sourceUrl });
  if (type === "certificate") {
    if (data.certificateUrl) links.push({ label: "Certificate / PDF", url: data.certificateUrl });
    if (data.verificationUrl) links.push({ label: "Verify credential", url: data.verificationUrl });
  }
  if (type === "demo") {
    if (data.githubUrl) links.push({ label: "GitHub", url: data.githubUrl });
    if (data.liveDemoUrl) links.push({ label: "Open demo", url: data.liveDemoUrl });
  }
  if (type === "blog" && Array.isArray(data.links)) links.push(...data.links);

  return (
    <div className="space-y-3 text-sm text-white/75">
      {image && (
        <img
          src={image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="max-h-72 w-full rounded border border-lime-400/10 object-contain"
        />
      )}
      {type === "paper" && (
        <p>
          {[data.authors, data.publicationYear, data.publicationDate].filter(Boolean).join(" · ")}
        </p>
      )}
      {type === "certificate" && (
        <p>
          {[data.issuer, data.issueDate, data.credentialId && `ID ${data.credentialId}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {type === "demo" && (
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-lime-400">
          {data.category}
          {data.creationDate ? ` · ${data.creationDate}` : ""}
        </p>
      )}
      {type === "blog" && data.publicationDate && (
        <p className="font-mono text-[10px] text-white/45">{data.publicationDate}</p>
      )}
      {(data.summary || data.description) && (
        <p className="whitespace-pre-wrap leading-relaxed">{data.summary || data.description}</p>
      )}
      {type === "blog" && data.body && (
        <p className="whitespace-pre-wrap leading-relaxed">{data.body}</p>
      )}
      {type === "paper" && data.personalNotes && (
        <p className="whitespace-pre-wrap border-l border-lime-400/25 pl-3 leading-relaxed">
          <span className="block pb-1 font-mono text-[9px] uppercase text-lime-400/75">
            Personal notes
          </span>
          {data.personalNotes}
        </p>
      )}
      {type === "demo" &&
        Array.isArray(data.screenshots) &&
        data.screenshots
          .filter(safeHttpsUrl)
          .map((url, index) => (
            <img
              key={`${url}-${index}`}
              src={safeHttpsUrl(url)}
              alt={`Project screenshot ${index + 1}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="max-h-72 w-full rounded border border-lime-400/10 object-contain"
            />
          ))}
      {Array.isArray(data.tags) && data.tags.length > 0 && (
        <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-white/45">
          {data.tags.join(" · ")}
        </p>
      )}
      {Array.isArray(data.technologies) && data.technologies.length > 0 && (
        <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-white/45">
          {data.technologies.join(" · ")}
        </p>
      )}
      {Array.isArray(data.projectReferences) && data.projectReferences.length > 0 && (
        <p className="text-xs text-white/50">Projects: {data.projectReferences.join(", ")}</p>
      )}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {links.map((link, index) => {
            const href = safeHttpsUrl(link.url);
            return href ? (
              <a
                key={`${link.label}-${index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded border border-lime-400/20 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-lime-400 hover:border-lime-400/50"
              >
                {link.label || "Open link"}
                <ExternalLink size={11} />
              </a>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

function useContentOwner() {
  const value = useContext(ContentContext);
  if (!value) throw new Error("Content card must be rendered inside AboutContentProvider.");
  return value;
}

export function AboutContentProvider({ children }) {
  const [publicStates, setPublicStates] = useState(() =>
    Object.fromEntries(CONTENT_TYPES.map((type) => [type, EMPTY_PUBLIC_STATE])),
  );
  const [ownerEntries, setOwnerEntries] = useState([]);
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [editorEntry, setEditorEntry] = useState(null);
  const [activeEntry, setActiveEntry] = useState(null);
  const [collectionType, setCollectionType] = useState("");
  const [notice, setNotice] = useState("");
  const refreshPublic = useCallback(async (onlyType = "") => {
    const types = onlyType ? [onlyType] : CONTENT_TYPES;
    if (!isContentApiConfigured()) {
      setPublicStates((current) =>
        Object.fromEntries(
          Object.entries(current).map(([type, state]) => [
            type,
            types.includes(type)
              ? { ...state, loading: false, error: "Content service is not configured yet." }
              : state,
          ]),
        ),
      );
      return;
    }
    await Promise.all(
      types.map(async (type) => {
        setPublicStates((current) => ({
          ...current,
          [type]: { ...current[type], loading: true, error: "" },
        }));
        try {
          const result = await contentApi.publicEntries(type);
          if (!Array.isArray(result?.entries))
            throw new Error("The content service returned an invalid response.");
          setPublicStates((current) => ({
            ...current,
            [type]: { entries: result.entries, loading: false, error: "" },
          }));
        } catch (error) {
          setPublicStates((current) => ({
            ...current,
            [type]: {
              ...current[type],
              loading: false,
              error: error.message || "Content could not be loaded.",
            },
          }));
        }
      }),
    );
  }, []);

  useEffect(() => {
    refreshPublic();
  }, [refreshPublic]);

  const lockOwner = useCallback(
    async (notify = false) => {
      const activeToken = token;
      setToken("");
      setExpiresAt("");
      setOwnerEntries([]);
      setLoginOpen(false);
      setEditorEntry(null);
      setActiveEntry(null);
      setCollectionType("");
      if (activeToken) {
        try {
          await contentApi.logout(activeToken);
        } catch {
          /* The expiring server token remains bounded by its TTL. */
        }
      }
      if (notify) setNotice("Saved. Owner mode is locked.");
    },
    [token],
  );

  useEffect(() => {
    if (!token || !expiresAt) return undefined;
    const timeout = window.setTimeout(
      () => lockOwner(),
      Math.max(0, Date.parse(expiresAt) - Date.now()),
    );
    return () => window.clearTimeout(timeout);
  }, [token, expiresAt, lockOwner]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    contentApi
      .ownerEntries(token)
      .then((result) => {
        if (!cancelled) setOwnerEntries(result.entries || []);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.status === 401) lockOwner();
        else setNotice(error.message || "Owner entries could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, [token, lockOwner]);

  const login = async (password) => {
    const result = await contentApi.login(password);
    setToken(result.token);
    setExpiresAt(result.expiresAt);
    setNotice("Owner mode unlocked for this session.");
  };

  const saveEntry = async (type, id, data, status) => {
    if (!token) throw new Error("Owner session expired. Sign in again.");
    try {
      if (id) await contentApi.update(token, id, data, status);
      else await contentApi.create(token, type, data, status);
    } catch (error) {
      if (error.status === 401) {
        await lockOwner();
        setNotice("Owner session expired. Sign in again to continue.");
      }
      throw error;
    }
    setEditorEntry(null);
    setActiveEntry(null);
    await lockOwner(true);
    await refreshPublic();
  };

  const removeEntry = async (entry) => {
    if (!token) throw new Error("Owner session expired. Sign in again.");
    if (!window.confirm(`Delete “${entry.title}” permanently?`)) return;
    try {
      await contentApi.remove(token, entry.id);
      setActiveEntry(null);
      await lockOwner(true);
      await refreshPublic();
    } catch (error) {
      if (error.status === 401) await lockOwner();
      setNotice(error.message || "Could not delete this entry.");
      throw error;
    }
  };

  const context = useMemo(
    () => ({
      publicStates,
      ownerEntries,
      token,
      notice,
      setNotice,
      setLoginOpen,
      setEditorEntry,
      setActiveEntry,
      setCollectionType,
      refreshPublic,
      login,
      lockOwner,
      removeEntry,
      saveEntry,
    }),
    [publicStates, ownerEntries, token, notice, lockOwner, refreshPublic],
  );

  return (
    <ContentContext.Provider value={context}>
      {children}
      {loginOpen && <OwnerLoginModal onClose={() => setLoginOpen(false)} onLogin={login} />}
      {editorEntry && (
        <EditorValue
          key={`${editorEntry.type}-${editorEntry.id || "new"}`}
          entry={editorEntry}
          onClose={() => setEditorEntry(null)}
        />
      )}
      {activeEntry && (
        <EntryModal
          entry={activeEntry}
          onClose={() => setActiveEntry(null)}
          onEdit={(entry) => {
            setActiveEntry(null);
            setEditorEntry(entry);
          }}
        />
      )}
      {collectionType && (
        <CollectionModal
          type={collectionType}
          onClose={() => setCollectionType("")}
          onSelect={(entry) => {
            setCollectionType("");
            setActiveEntry(entry);
          }}
          onRetry={() => refreshPublic(collectionType)}
        />
      )}
      {notice && !loginOpen && !editorEntry && !activeEntry && (
        <div
          className="fixed bottom-4 right-4 z-[90] max-w-sm rounded border border-lime-400/20 bg-[#101610] px-4 py-3 text-sm text-white shadow-lg"
          role="status"
        >
          {notice}
          <button type="button" className="ml-3 text-lime-400" onClick={() => setNotice("")}>
            Dismiss
          </button>
        </div>
      )}
    </ContentContext.Provider>
  );
}

function OwnerLoginModal({ onClose, onLogin }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (window.lenisInstance && !window.lenisInstance.isDestroyed) {
      window.lenisInstance.stop();
    }

    const onEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (window.lenisInstance && !window.lenisInstance.isDestroyed) {
        window.lenisInstance.start();
      }
      window.removeEventListener("keydown", onEscape);
    };
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const value = password;
      setPassword("");
      await onLogin(value);
      onClose();
    } catch (loginError) {
      setPassword("");
      setError(loginError.message || "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overscroll-contain"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        data-lenis-prevent
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-[6px] border border-lime-400/25 bg-[#101610] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)] overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="owner-login-title"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime-400">
              Private controls
            </p>
            <h3 id="owner-login-title" className="mt-1 text-lg font-bold text-white">
              Owner login
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/55 hover:text-white"
            aria-label="Close login"
          >
            <X size={17} />
          </button>
        </div>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.13em] text-white/55">
            Password
          </span>
          <input
            autoFocus
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            maxLength={1024}
            className="content-field"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-200">
            {error}
          </p>
        )}
        <button disabled={busy} type="submit" className="owner-primary w-full justify-center">
          {busy ? "Checking…" : "Unlock owner mode"}
        </button>
      </form>
    </div>
  );
}

function EntryModal({ entry, onClose, onEdit }) {
  const { token, setEditorEntry, removeEntry } = useContentOwner();
  const [actionError, setActionError] = useState("");
  const owner = Boolean(token);
  const status = entry.status === "draft" ? "Draft preview" : "Published";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (window.lenisInstance && !window.lenisInstance.isDestroyed) {
      window.lenisInstance.stop();
    }

    const onEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (window.lenisInstance && !window.lenisInstance.isDestroyed) {
        window.lenisInstance.start();
      }
      window.removeEventListener("keydown", onEscape);
    };
  }, [onClose]);

  const togglePublish = () => {
    setEditorEntry({
      ...entry,
      data: { ...entry.data },
      forceStatus: entry.status === "published" ? "draft" : "published",
    });
    onClose();
  };
  const deleteEntry = async () => {
    setActionError("");
    try {
      await removeEntry(entry);
    } catch (error) {
      setActionError(error.message || "Could not delete this entry.");
    }
  };
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 md:p-6 overscroll-contain"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        data-lenis-prevent
        className="w-full max-w-2xl h-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[88dvh] flex flex-col rounded-[6px] border border-lime-400/25 bg-[#101610] shadow-[0_20px_80px_rgba(0,0,0,0.55)] overflow-hidden overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-details-title"
      >
        <div className="shrink-0 flex items-center justify-between border-b border-lime-400/15 bg-[#101610] px-5 py-4 z-10">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime-400">
              {TYPE_META[entry.type].title} · {status}
            </p>
            <h3 id="content-details-title" className="mt-1 text-xl font-bold text-white">
              {entry.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/15 p-2 text-white/70 hover:text-lime-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-lime-400"
            aria-label="Close details"
          >
            <X size={16} />
          </button>
        </div>
        <div
          tabIndex={0}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 pb-8 space-y-5 modal-scroll focus:outline-none"
        >
          <EntryDetails entry={entry} />
          {actionError && (
            <p
              role="alert"
              className="rounded border border-red-400/25 bg-red-400/5 px-3 py-2 text-sm text-red-200"
            >
              {actionError}
            </p>
          )}
          {owner && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-lime-400/10 pt-4">
              <button type="button" onClick={() => onEdit(entry)} className="owner-secondary">
                <Pencil size={13} />
                Edit
              </button>
              {entry.id && (
                <button type="button" onClick={togglePublish} className="owner-secondary">
                  {entry.status === "published" ? "Unpublish" : "Publish"}
                </button>
              )}
              {entry.id && (
                <button
                  type="button"
                  onClick={deleteEntry}
                  className="owner-secondary text-red-200"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getEntryTimestamp(entry) {
  const { type, data = {} } = entry;
  let dateStr = "";
  if (type === "blog") dateStr = data.publicationDate;
  else if (type === "paper") dateStr = data.publicationDate || data.publicationYear;
  else if (type === "certificate") dateStr = data.issueDate;
  else if (type === "demo") dateStr = data.creationDate;

  if (dateStr) {
    const trimmed = String(dateStr).trim();
    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) return parsed;
    if (/^\d{4}$/.test(trimmed)) {
      const yearParsed = Date.parse(`${trimmed}-01-01`);
      if (!Number.isNaN(yearParsed)) return yearParsed;
    }
  }
  if (entry.updatedAt) {
    const parsed = Date.parse(entry.updatedAt);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (entry.createdAt) {
    const parsed = Date.parse(entry.createdAt);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function sortEntriesNewestFirst(entries) {
  return [...entries].sort((a, b) => {
    const timeA = getEntryTimestamp(a);
    const timeB = getEntryTimestamp(b);
    if (timeA !== timeB) return timeB - timeA;
    return (a.title || "").localeCompare(b.title || "");
  });
}

function CertificateCard({ entry, onEdit, onDelete, owner }) {
  const { data = {} } = entry;
  const certUrl = safeHttpsUrl(data.certificateUrl);
  const imageUrl = safeHttpsUrl(data.imageUrl);
  const verifyUrl = safeHttpsUrl(data.verificationUrl);
  const docPreviewUrl = imageUrl || certUrl;

  return (
    <div className="flex flex-col justify-between rounded-[4px] border border-lime-400/15 bg-[#171817] p-5 transition-colors hover:border-lime-400/30">
      <div>
        {docPreviewUrl && (
          <div className="mb-4 overflow-hidden rounded-[3px] border border-lime-400/15 bg-[#101610] aspect-[16/9] flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={entry.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-white/50 p-4">
                <FileText size={28} className="text-lime-400" />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/60">
                  Certificate Document
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          {entry.status === "draft" && (
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-amber-400/15 border border-amber-400/30 text-amber-300">
              Draft
            </span>
          )}
          {entry.title.includes("DEMO — SAMPLE CONTENT") && (
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-white/5 border border-white/20 text-white/55">
              Sample Content
            </span>
          )}
          {data.issuer && (
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-lime-400/10 border border-lime-400/20 text-lime-400">
              {data.issuer}
            </span>
          )}
        </div>

        <h4 className="font-display text-[15.5px] sm:text-[16px] font-semibold text-white leading-snug break-words">
          {entry.title}
        </h4>

        <div className="mt-3 space-y-1.5 font-mono text-[11px] text-white/60">
          {data.issueDate && (
            <p className="flex items-center gap-2">
              <span className="text-white/40">Issued:</span>
              <span className="text-white/85">{data.issueDate}</span>
            </p>
          )}
          {data.credentialId && (
            <p className="flex items-center gap-2">
              <span className="text-white/40">ID:</span>
              <span className="text-lime-300/80 font-mono text-[10.5px] break-all">
                {data.credentialId}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-lime-400/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {(certUrl || imageUrl) && (
            <a
              href={certUrl || imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[3px] border border-lime-400/25 bg-lime-400/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-lime-400 hover:bg-lime-400 hover:text-[#171817] transition-all"
            >
              <span>View Certificate</span>
              <ExternalLink size={11} />
            </a>
          )}
          {verifyUrl && (
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[3px] border border-white/20 bg-white/5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white/75 hover:border-lime-400/40 hover:text-lime-300 transition-all"
            >
              <span>Verify Credential</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>

        {owner && (
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="rounded border border-lime-400/20 p-1 text-white/60 hover:text-lime-400"
              aria-label="Edit certificate"
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry)}
              className="rounded border border-red-400/20 p-1 text-red-300 hover:text-red-200"
              aria-label="Delete certificate"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BlogArticleCard({ entry, onSelect }) {
  const { data = {} } = entry;
  return (
    <article
      onClick={() => onSelect(entry)}
      className="group cursor-pointer rounded-[4px] border border-lime-400/15 bg-[#171817] p-5 sm:p-6 transition-all hover:border-lime-400/35 hover:bg-[#191d19]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {entry.status === "draft" && (
              <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-amber-400/15 border border-amber-400/30 text-amber-300">
                Draft
              </span>
            )}
            {entry.title.includes("DEMO — SAMPLE CONTENT") && (
              <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-white/5 border border-white/20 text-white/55">
                Sample Content
              </span>
            )}
            {data.publicationDate && (
              <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/45">
                {data.publicationDate}
              </span>
            )}
          </div>
          <h4 className="font-display text-[17px] sm:text-[18px] font-bold text-white group-hover:text-lime-400 transition-colors leading-snug">
            {entry.title}
          </h4>
          {data.summary && (
            <p className="text-[13px] sm:text-[13.5px] text-white/65 leading-relaxed">
              {data.summary}
            </p>
          )}
          {Array.isArray(data.tags) && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-lime-400/5 border border-lime-400/15 text-lime-400/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 pt-1 text-white/40 group-hover:text-lime-400 group-hover:translate-x-0.5 transition-all">
          <ArrowUpRight size={18} />
        </div>
      </div>
    </article>
  );
}

function BlogReaderView({ entry, onBack, onEdit, onDelete, owner }) {
  const { data = {} } = entry;
  const image = safeHttpsUrl(data.imageUrl);
  const links = Array.isArray(data.links) ? data.links : [];

  return (
    <article className="max-w-2xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between gap-4 border-b border-lime-400/10 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-lime-400 hover:text-lime-300 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to all articles</span>
        </button>

        {owner && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="owner-secondary text-[10px]"
            >
              <Pencil size={11} /> Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry)}
              className="owner-secondary text-[10px] text-red-200"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        )}
      </div>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {entry.status === "draft" && (
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-amber-400/15 border border-amber-400/30 text-amber-300">
              Draft
            </span>
          )}
          {entry.title.includes("DEMO — SAMPLE CONTENT") && (
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-white/5 border border-white/20 text-white/55">
              Sample Article
            </span>
          )}
          {data.publicationDate && (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/45">
              {data.publicationDate}
            </span>
          )}
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
          {entry.title}
        </h3>

        {data.summary && (
          <p className="text-[14px] text-white/70 italic leading-relaxed border-l-2 border-lime-400/40 pl-3">
            {data.summary}
          </p>
        )}
      </header>

      {image && (
        <div className="overflow-hidden rounded border border-lime-400/15">
          <img
            src={image}
            alt={entry.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full max-h-80 object-cover"
          />
        </div>
      )}

      {data.body && (
        <div className="text-[14.5px] text-white/80 leading-[1.8] whitespace-pre-wrap space-y-4 font-sans">
          {data.body}
        </div>
      )}

      {Array.isArray(data.tags) && data.tags.length > 0 && (
        <div className="pt-4 border-t border-lime-400/10 flex flex-wrap gap-2">
          {data.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[9px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-[2px] bg-lime-400/5 border border-lime-400/15 text-lime-400/80"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {Array.isArray(data.projectReferences) && data.projectReferences.length > 0 && (
        <div className="p-3.5 rounded bg-[#171817] border border-lime-400/10 text-xs text-white/60">
          <span className="font-mono uppercase text-[9px] text-lime-400 tracking-[0.1em] block mb-1">
            Related Projects
          </span>
          {data.projectReferences.join(", ")}
        </div>
      )}

      {links.length > 0 && (
        <div className="pt-2 space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">
            References & Links
          </p>
          <div className="flex flex-wrap gap-2">
            {links.map((link, idx) => {
              const href = safeHttpsUrl(link.url);
              return href ? (
                <a
                  key={`${link.label}-${idx}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded border border-lime-400/20 bg-lime-400/5 px-2.5 py-1 font-mono text-[10px] uppercase text-lime-400 hover:border-lime-400/50"
                >
                  {link.label || "Reference"}
                  <ExternalLink size={11} />
                </a>
              ) : null;
            })}
          </div>
        </div>
      )}
    </article>
  );
}

function PaperCard({ entry, onEdit, onDelete, owner }) {
  const { data = {} } = entry;
  const paperUrl = safeHttpsUrl(data.sourceUrl);

  return (
    <div className="rounded-[4px] border border-lime-400/15 bg-[#171817] p-5 sm:p-6 transition-colors hover:border-lime-400/30">
      <div className="flex flex-wrap items-center gap-2 mb-2.5">
        {entry.status === "draft" && (
          <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-amber-400/15 border border-amber-400/30 text-amber-300">
            Draft
          </span>
        )}
        {entry.title.includes("DEMO — SAMPLE CONTENT") && (
          <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-white/5 border border-white/20 text-white/55">
            Sample Reading Note
          </span>
        )}
        {(data.publicationYear || data.publicationDate) && (
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-lime-400/80 bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 rounded-[2px]">
            {data.publicationYear || data.publicationDate}
          </span>
        )}
      </div>

      <h4 className="font-display text-[16px] sm:text-[17px] font-bold text-white leading-snug mb-2">
        {entry.title}
      </h4>

      {(data.authors || data.source) && (
        <p className="font-mono text-[11px] text-white/55 mb-3">
          {[data.authors, data.source].filter(Boolean).join(" · ")}
        </p>
      )}

      {data.summary && (
        <p className="text-[13px] text-white/70 leading-relaxed mb-4">{data.summary}</p>
      )}

      {data.personalNotes && (
        <div className="my-4 rounded-[3px] border-l-2 border-lime-400 bg-[#101610] p-3.5 sm:p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-lime-400 mb-1.5 font-semibold">
            Personal Reading Notes
          </p>
          <p className="text-[12.5px] text-white/80 leading-relaxed whitespace-pre-wrap">
            {data.personalNotes}
          </p>
        </div>
      )}

      {Array.isArray(data.tags) && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {data.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-lime-400/5 border border-lime-400/15 text-lime-400/80"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-lime-400/10 flex flex-wrap items-center justify-between gap-2">
        {paperUrl ? (
          <a
            href={paperUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-lime-400/25 bg-lime-400/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-lime-400 hover:bg-lime-400 hover:text-[#171817] transition-all"
          >
            <span>Original Paper / DOI</span>
            <ExternalLink size={11} />
          </a>
        ) : (
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/35">
            Reading notes only · No external link
          </span>
        )}

        {owner && (
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="rounded border border-lime-400/20 p-1 text-white/60 hover:text-lime-400"
              aria-label="Edit paper entry"
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry)}
              className="rounded border border-red-400/20 p-1 text-red-300 hover:text-red-200"
              aria-label="Delete paper entry"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DemoCard({ entry, onEdit, onDelete, owner }) {
  const { data = {} } = entry;
  const thumbUrl = safeHttpsUrl(data.thumbnailUrl);
  const githubUrl = safeHttpsUrl(data.githubUrl);
  const liveDemoUrl = safeHttpsUrl(data.liveDemoUrl);
  const screenshots = Array.isArray(data.screenshots)
    ? data.screenshots.map(safeHttpsUrl).filter(Boolean)
    : [];

  return (
    <div className="flex flex-col justify-between rounded-[4px] border border-lime-400/15 bg-[#171817] p-5 transition-colors hover:border-lime-400/30">
      <div>
        {thumbUrl && (
          <div className="mb-4 overflow-hidden rounded-[3px] border border-lime-400/15 bg-[#101610] aspect-[16/9]">
            <img
              src={thumbUrl}
              alt={entry.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          {entry.status === "draft" && (
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-amber-400/15 border border-amber-400/30 text-amber-300">
              Draft
            </span>
          )}
          {entry.title.includes("DEMO — SAMPLE CONTENT") && (
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-white/5 border border-white/20 text-white/55">
              Sample Demo
            </span>
          )}
          {data.category && (
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] bg-lime-400/10 border border-lime-400/20 text-lime-400">
              {data.category}
            </span>
          )}
          {data.creationDate && (
            <span className="font-mono text-[9px] text-white/40">{data.creationDate}</span>
          )}
        </div>

        <h4 className="font-display text-[16px] sm:text-[17px] font-bold text-white leading-snug mb-2">
          {entry.title}
        </h4>

        {data.description && (
          <p className="text-[13px] text-white/65 leading-relaxed mb-4">{data.description}</p>
        )}

        {Array.isArray(data.technologies) && data.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {data.technologies.map((tech) => (
              <span
                key={tech}
                className="font-mono text-[9px] uppercase tracking-[0.08em] px-2 py-0.5 rounded-[2px] bg-lime-400/5 border border-lime-400/15 text-lime-400/80"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {screenshots.length > 0 && (
          <div className="my-3 grid grid-cols-2 gap-2">
            {screenshots.slice(0, 2).map((url, idx) => (
              <img
                key={url}
                src={url}
                alt={`${entry.title} preview ${idx + 1}`}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="rounded border border-lime-400/10 object-cover aspect-video"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-lime-400/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {liveDemoUrl && (
            <a
              href={liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[3px] border border-lime-400/25 bg-lime-400/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-lime-400 hover:bg-lime-400 hover:text-[#171817] transition-all"
            >
              <span>Live Demo</span>
              <ExternalLink size={11} />
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[3px] border border-white/20 bg-white/5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white/75 hover:border-lime-400/40 hover:text-lime-300 transition-all"
            >
              <span>Code Repository</span>
              <ExternalLink size={11} />
            </a>
          )}
          {!liveDemoUrl && !githubUrl && (
            <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/35">
              Prototype showcase
            </span>
          )}
        </div>

        {owner && (
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="rounded border border-lime-400/20 p-1 text-white/60 hover:text-lime-400"
              aria-label="Edit demo entry"
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry)}
              className="rounded border border-red-400/20 p-1 text-red-300 hover:text-red-200"
              aria-label="Delete demo entry"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CollectionModal({ type, onClose, onRetry }) {
  const { publicStates, ownerEntries, token, setEditorEntry, removeEntry } = useContentOwner();
  const [activeBlogEntry, setActiveBlogEntry] = useState(null);
  const contentRef = useRef(null);
  const publicState = publicStates[type] || EMPTY_PUBLIC_STATE;
  const entries = token ? ownerEntries.filter((entry) => entry.type === type) : publicState.entries;
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  const owner = Boolean(token);
  const sortedEntries = useMemo(() => sortEntriesNewestFirst(entries), [entries]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (window.lenisInstance && !window.lenisInstance.isDestroyed) {
      window.lenisInstance.stop();
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (window.lenisInstance && !window.lenisInstance.isDestroyed) {
        window.lenisInstance.start();
      }
    };
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [activeBlogEntry]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (activeBlogEntry) setActiveBlogEntry(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBlogEntry, onClose]);

  const handleEdit = (entry) => {
    setEditorEntry(entry);
  };

  const handleDelete = async (entry) => {
    try {
      await removeEntry(entry);
      if (activeBlogEntry?.id === entry.id) setActiveBlogEntry(null);
    } catch {
      // handled in context
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 md:p-6 lg:p-8 overscroll-contain"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        data-lenis-prevent
        className="w-full max-w-4xl h-[calc(100dvh-1.5rem)] sm:h-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] md:max-h-[88dvh] flex flex-col rounded-[6px] border border-lime-400/25 bg-[#101610] shadow-[0_25px_90px_rgba(0,0,0,0.7)] overflow-hidden overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-modal-title"
      >
        {/* Sticky Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-lime-400/15 bg-[#101610] px-5 sm:px-6 py-4 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-lime-400/20 bg-lime-400/10 text-lime-400">
              <Icon size={16} />
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime-400">
                Collection · {meta.short}
              </p>
              <h3
                id="collection-modal-title"
                className="text-lg sm:text-xl font-bold font-display text-white"
              >
                {meta.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {owner && (
              <button
                type="button"
                onClick={() => setEditorEntry({ type, data: blankData(type), status: "draft" })}
                className="owner-primary text-[10px]"
                aria-label={`Add new ${meta.short}`}
              >
                <Plus size={12} /> Add Entry
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-[3px] border border-white/15 p-2 text-white/70 hover:border-lime-400/40 hover:text-lime-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-lime-400 transition-colors"
              aria-label="Close collection"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          ref={contentRef}
          tabIndex={0}
          role="region"
          aria-label={`${meta.title} collection content`}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7 pb-10 sm:pb-12 focus:outline-none focus-visible:ring-1 focus-visible:ring-lime-400/40 modal-scroll"
        >
          {!owner && publicState.loading && (
            <div
              className="py-20 flex flex-col items-center justify-center gap-3 text-center"
              role="status"
            >
              <RefreshCw size={22} className="animate-spin text-lime-400" />
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/50">
                Loading {meta.short.toLowerCase()}…
              </p>
            </div>
          )}

          {!owner && publicState.error && (
            <div className="py-16 px-6 text-center space-y-4" role="alert">
              <p className="text-sm text-red-200/90">{publicState.error}</p>
              <button type="button" onClick={onRetry} className="owner-secondary mx-auto">
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {(owner || (!publicState.loading && !publicState.error)) &&
            sortedEntries.length === 0 && (
              <div
                className="py-16 px-6 text-center rounded-[4px] border border-dashed border-lime-400/20 bg-[#171817]/40 space-y-2.5"
                role="status"
              >
                <div className="mx-auto w-10 h-10 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 mb-3">
                  <Icon size={18} />
                </div>
                <h4 className="font-display text-base font-bold text-white">
                  {owner ? "No entries yet" : meta.emptyTitle}
                </h4>
                <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                  {owner
                    ? "Use the “Add Entry” button above to create the first record."
                    : meta.emptyDescription}
                </p>
              </div>
            )}

          {(owner || (!publicState.loading && !publicState.error)) && sortedEntries.length > 0 && (
            <>
              {type === "certificate" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedEntries.map((entry) => (
                    <CertificateCard
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      owner={owner}
                    />
                  ))}
                </div>
              )}

              {type === "demo" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedEntries.map((entry) => (
                    <DemoCard
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      owner={owner}
                    />
                  ))}
                </div>
              )}

              {type === "paper" && (
                <div className="space-y-4">
                  {sortedEntries.map((entry) => (
                    <PaperCard
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      owner={owner}
                    />
                  ))}
                </div>
              )}

              {type === "blog" &&
                (activeBlogEntry ? (
                  <BlogReaderView
                    entry={activeBlogEntry}
                    onBack={() => setActiveBlogEntry(null)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    owner={owner}
                  />
                ) : (
                  <div className="space-y-3.5">
                    {sortedEntries.map((entry) => (
                      <BlogArticleCard key={entry.id} entry={entry} onSelect={setActiveBlogEntry} />
                    ))}
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AboutContentCards({ slot, className = "" }) {
  const { publicStates, ownerEntries, token, notice, setLoginOpen, setCollectionType, lockOwner } =
    useContentOwner();
  const isLeft = slot === "left" || slot === "profile";
  const isRight = slot === "right" || slot === "highlights";
  const types = isLeft
    ? ["blog", "paper"]
    : isRight
      ? ["certificate", "demo"]
      : ["blog", "paper", "certificate", "demo"];
  const owner = Boolean(token);

  const headerTitle = isLeft
    ? "Articles & Research"
    : isRight
      ? "Credentials & Demos"
      : "Collections";

  return (
    <div className={className}>
      <div className="mb-2.5 flex min-h-6 items-center justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
          {headerTitle}
        </span>
        {!isLeft && (
          <div className="flex items-center gap-2">
            {notice && (
              <span role="status" className="truncate font-mono text-[9px] text-lime-400/75">
                {notice}
              </span>
            )}
            {owner ? (
              <button
                type="button"
                onClick={() => lockOwner()}
                className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/45 hover:text-lime-400 transition-colors"
              >
                <UnlockKeyhole size={12} />
                Lock editor
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/45 transition-colors hover:text-lime-400"
              >
                <LockKeyhole size={12} />
                Owner edit
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${isLeft ? "gap-2.5" : "gap-3 sm:gap-3.5"} items-stretch`}
      >
        {types.map((type) => {
          const meta = TYPE_META[type];
          const Icon = meta.icon;
          const publicState = publicStates[type] || EMPTY_PUBLIC_STATE;
          const entries = owner
            ? ownerEntries.filter((entry) => entry.type === type)
            : publicState.entries;

          let countLabel = "";
          if (!owner && publicState.loading) {
            countLabel = "Loading…";
          } else if (!owner && publicState.error) {
            countLabel = "—";
          } else {
            const count = entries.length;
            countLabel = `${count} ${count === 1 ? meta.short.toLowerCase() : meta.unit}`;
          }

          return (
            <article
              key={type}
              className="group relative flex flex-col justify-between h-full min-h-[140px] rounded-[4px] border border-lime-400/15 bg-[#101610] p-3.5 sm:p-4 transition-all duration-200 hover:border-lime-400/35 hover:bg-[#121912] focus-within:border-lime-400/50"
            >
              <button
                type="button"
                onClick={() => setCollectionType(type)}
                aria-label={`Open ${meta.title} collection`}
                className="absolute inset-0 z-0 cursor-pointer rounded-[4px] focus:outline-none focus-visible:ring-1 focus-visible:ring-lime-400"
              />

              <div className="relative z-10 pointer-events-none">
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border border-lime-400/20 bg-lime-400/10 text-lime-400">
                      <Icon size={14} />
                    </div>
                    <h3 className="truncate font-mono text-[11px] sm:text-[11.5px] uppercase tracking-[0.14em] font-bold text-white group-hover:text-lime-400 transition-colors">
                      {meta.short}
                    </h3>
                  </div>
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-lime-400/90 bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 rounded-[2px] font-semibold">
                    {countLabel}
                  </span>
                </div>

                <p className="text-[11.5px] sm:text-[12px] text-white/55 leading-relaxed line-clamp-2 min-h-[34px]">
                  {meta.description}
                </p>
              </div>

              <div className="relative z-10 pointer-events-none mt-3 pt-2.5 border-t border-lime-400/10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] text-lime-400 font-medium group-hover:text-lime-300 transition-colors">
                  <span>{meta.action}</span>
                  <ArrowUpRight
                    size={12}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
