import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Award, BookOpen, ExternalLink, Eye, FileText, FlaskConical, LockKeyhole,
  Pencil, Plus, Trash2, UnlockKeyhole, X,
} from 'lucide-react';
import { contentApi, isContentApiConfigured } from '../services/contentApi';

const ContentContext = createContext(null);
const CONTENT_TYPES = ['blog', 'paper', 'certificate', 'demo'];
const TYPE_META = {
  blog: { title: 'Engineering Blog', short: 'Blog', description: 'Notes from projects, experiments, and engineering work.', icon: BookOpen },
  paper: { title: 'Research Papers', short: 'Papers', description: 'Research worth reading, with personal context.', icon: FileText },
  certificate: { title: 'Certificates', short: 'Certificates', description: 'Credentials and their verification links.', icon: Award },
  demo: { title: 'Recent Project Demos', short: 'Project Demos', description: 'Small builds, experiments, and working demos.', icon: FlaskConical },
};
const DEMO_CATEGORIES = ['Data Engineering', 'Analytics Engineering', 'Data Analytics', 'AI/ML', 'Other'];

const FIELDS = {
  blog: [
    { key: 'title', label: 'Title', required: true },
    { key: 'summary', label: 'Summary', multiline: true },
    { key: 'body', label: 'Article body', multiline: true, rows: 9 },
    { key: 'publicationDate', label: 'Publication date' },
    { key: 'tags', label: 'Tags', list: true },
    { key: 'projectReferences', label: 'Project references', list: true },
    { key: 'imageUrl', label: 'Optional image URL', url: true },
    { key: 'linksText', label: 'Links (one label | HTTPS URL per line)', multiline: true, rows: 3 },
  ],
  paper: [
    { key: 'title', label: 'Paper title', required: true },
    { key: 'authors', label: 'Authors' },
    { key: 'publicationYear', label: 'Publication year' },
    { key: 'publicationDate', label: 'Publication date' },
    { key: 'source', label: 'Source / journal / conference' },
    { key: 'sourceUrl', label: 'Original paper / DOI / PDF URL', url: true },
    { key: 'summary', label: 'Summary', multiline: true },
    { key: 'tags', label: 'Tags', list: true },
    { key: 'personalNotes', label: 'My notes', multiline: true, rows: 5 },
  ],
  certificate: [
    { key: 'title', label: 'Certificate title', required: true },
    { key: 'issuer', label: 'Issuing organization', required: true },
    { key: 'issueDate', label: 'Issue date' },
    { key: 'credentialId', label: 'Credential ID' },
    { key: 'certificateUrl', label: 'Certificate / PDF URL', url: true },
    { key: 'imageUrl', label: 'Certificate image URL', url: true },
    { key: 'verificationUrl', label: 'Verification URL', url: true },
  ],
  demo: [
    { key: 'title', label: 'Demo title', required: true },
    { key: 'description', label: 'Description', multiline: true },
    { key: 'category', label: 'Category', category: true, required: true },
    { key: 'technologies', label: 'Technologies', list: true },
    { key: 'thumbnailUrl', label: 'Thumbnail URL', url: true },
    { key: 'screenshots', label: 'Screenshot URLs', list: true },
    { key: 'githubUrl', label: 'GitHub URL', url: true },
    { key: 'liveDemoUrl', label: 'Live demo URL', url: true },
    { key: 'creationDate', label: 'Creation date' },
  ],
};

function blankData(type) {
  return Object.fromEntries(FIELDS[type].filter(field => field.key !== 'linksText').map(field => [field.key, field.list ? [] : '']));
}

function initialEditorData(entry) {
  const data = entry?.data ? { ...entry.data } : blankData(entry.type);
  if (entry.type === 'blog') {
    data.linksText = (data.links || []).map(link => `${link.label || ''} | ${link.url || ''}`).join('\n');
  }
  if (entry.type === 'demo' && data.category && !DEMO_CATEGORIES.includes(data.category)) data.customCategory = data.category;
  return data;
}

function safeHttpsUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : '';
  } catch {
    return '';
  }
}

function listText(value) {
  return Array.isArray(value) ? value.join(', ') : typeof value === 'string' ? value : '';
}

function normalizeEditorData(type, source, categoryOther) {
  let data = { ...source };
  if (type === 'blog') {
    data.links = (data.linksText || '').split('\n').map(line => {
      const [label, ...urlParts] = line.split('|');
      const url = urlParts.join('|').trim();
      return url ? { label: label.trim() || 'Reference', url } : null;
    }).filter(Boolean);
    delete data.linksText;
  }
  if (type === 'demo') {
    data.category = categoryOther ? data.customCategory || '' : data.category || '';
    delete data.customCategory;
  }
  data = Object.fromEntries(Object.entries(data).map(([key, value]) => [
    key,
    typeof value === 'string' && ['tags', 'projectReferences', 'technologies', 'screenshots'].includes(key)
      ? value.split(',').map(item => item.trim()).filter(Boolean)
      : value,
  ]));
  return data;
}

function EditorValue({ entry, onEdit, onClose }) {
  const [data, setData] = useState(() => initialEditorData(entry));
  const [categoryOther, setCategoryOther] = useState(() => entry?.data?.category && !DEMO_CATEGORIES.includes(entry.data.category));
  const [status, setStatus] = useState(entry?.forceStatus || entry?.status || 'draft');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const { saveEntry } = useContentOwner();

  const updateField = (field, value) => setData(current => ({ ...current, [field]: value }));
  const fieldValue = field => field.list ? listText(data[field.key]) : (data[field.key] || '');

  const submit = async nextStatus => {
    setBusy(true);
    setError('');
    try {
      const cleanData = normalizeEditorData(entry.type, data, categoryOther);
      await saveEntry(entry.type, entry.id, cleanData, nextStatus);
    } catch (saveError) {
      setError(saveError.message || 'Could not save this entry.');
      if (saveError.status === 401) onClose();
    } finally {
      setBusy(false);
    }
  };

  const previewEntry = { ...entry, data: normalizeEditorData(entry.type, data, categoryOther), status };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[6px] border border-lime-400/25 bg-[#101610] shadow-[0_20px_80px_rgba(0,0,0,0.55)]" role="dialog" aria-modal="true" aria-labelledby="content-editor-title">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-lime-400/15 bg-[#101610] px-5 py-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime-400">{entry.id ? 'Edit entry' : 'New entry'} · {TYPE_META[entry.type].short}</p>
            <h3 id="content-editor-title" className="mt-1 text-lg font-bold text-white">{entry.id ? 'Update content' : 'Create content'}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-white/15 p-2 text-white/70 hover:border-lime-400/40 hover:text-lime-400" aria-label="Close editor"><X size={16} /></button>
        </div>

        <form className="space-y-4 p-5" onSubmit={event => { event.preventDefault(); submit(status); }}>
          {FIELDS[entry.type].map(field => (
            <label key={field.key} className="block">
              <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.13em] text-white/55">{field.label}{field.required ? ' *' : ''}</span>
              {field.category ? (
                <>
                  <select value={categoryOther ? 'Other' : (data.category || '')} required onChange={event => {
                    const custom = event.target.value === 'Other';
                    setCategoryOther(custom);
                    updateField('category', custom ? 'Other' : event.target.value);
                  }} className="content-field">
                    <option value="">Choose a category</option>
                    {DEMO_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                  </select>
                  {categoryOther && <input className="content-field mt-2" placeholder="Enter category" value={data.customCategory || ''} required onChange={event => updateField('customCategory', event.target.value)} />}
                </>
              ) : field.key === 'linksText' ? (
                <textarea className="content-field" rows={field.rows} value={data.linksText || ''} onChange={event => updateField(field.key, event.target.value)} placeholder="Documentation | https://example.com" />
              ) : field.multiline ? (
                <textarea className="content-field" rows={field.rows || 4} required={field.required} value={fieldValue(field)} onChange={event => updateField(field.key, event.target.value)} />
              ) : (
                <input className="content-field" type="text" required={field.required} value={fieldValue(field)} onChange={event => updateField(field.key, event.target.value)} placeholder={field.list ? 'Separate values with commas' : ''} />
              )}
            </label>
          ))}

          <label className="block">
            <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.13em] text-white/55">When saved</span>
            <select className="content-field" value={status} onChange={event => setStatus(event.target.value)}>
              <option value="draft">Save as draft</option>
              <option value="published">Publish</option>
            </select>
          </label>

          {error && <p role="alert" className="rounded border border-red-400/25 bg-red-400/5 px-3 py-2 text-sm text-red-200">{error}</p>}
          {preview && <div className="rounded border border-lime-400/15 bg-[#171817] p-4"><p className="mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-lime-400">Preview · unsaved</p><EntryDetails entry={previewEntry} /></div>}

          <div className="flex flex-wrap justify-end gap-2 border-t border-lime-400/10 pt-4">
            <button type="button" onClick={() => setPreview(value => !value)} className="owner-secondary"><Eye size={13} />{preview ? 'Hide preview' : 'Preview'}</button>
            <button type="button" onClick={onClose} className="owner-secondary">Cancel</button>
            <button type="submit" disabled={busy} className="owner-primary">{busy ? 'Saving…' : 'Save entry'}</button>
          </div>
          <p className="text-right font-mono text-[9px] text-white/35">Saving locks owner mode. Re-authenticate for the next change.</p>
        </form>
      </div>
    </div>
  );
}

function EntryDetails({ entry }) {
  const { type, data = {} } = entry;
  const image = safeHttpsUrl(data.imageUrl || data.thumbnailUrl);
  const links = [];
  if (type === 'paper' && data.sourceUrl) links.push({ label: data.source || 'Original paper', url: data.sourceUrl });
  if (type === 'certificate') {
    if (data.certificateUrl) links.push({ label: 'Certificate / PDF', url: data.certificateUrl });
    if (data.verificationUrl) links.push({ label: 'Verify credential', url: data.verificationUrl });
  }
  if (type === 'demo') {
    if (data.githubUrl) links.push({ label: 'GitHub', url: data.githubUrl });
    if (data.liveDemoUrl) links.push({ label: 'Open demo', url: data.liveDemoUrl });
  }
  if (type === 'blog' && Array.isArray(data.links)) links.push(...data.links);

  return (
    <div className="space-y-3 text-sm text-white/75">
      {image && <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" className="max-h-72 w-full rounded border border-lime-400/10 object-contain" />}
      {type === 'paper' && <p>{[data.authors, data.publicationYear, data.publicationDate].filter(Boolean).join(' · ')}</p>}
      {type === 'certificate' && <p>{[data.issuer, data.issueDate, data.credentialId && `ID ${data.credentialId}`].filter(Boolean).join(' · ')}</p>}
      {type === 'demo' && <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-lime-400">{data.category}{data.creationDate ? ` · ${data.creationDate}` : ''}</p>}
      {type === 'blog' && data.publicationDate && <p className="font-mono text-[10px] text-white/45">{data.publicationDate}</p>}
      {(data.summary || data.description) && <p className="whitespace-pre-wrap leading-relaxed">{data.summary || data.description}</p>}
      {type === 'blog' && data.body && <p className="whitespace-pre-wrap leading-relaxed">{data.body}</p>}
      {type === 'paper' && data.personalNotes && <p className="whitespace-pre-wrap border-l border-lime-400/25 pl-3 leading-relaxed"><span className="block pb-1 font-mono text-[9px] uppercase text-lime-400/75">Personal notes</span>{data.personalNotes}</p>}
      {type === 'demo' && Array.isArray(data.screenshots) && data.screenshots.filter(safeHttpsUrl).map((url, index) => <img key={`${url}-${index}`} src={safeHttpsUrl(url)} alt={`Project screenshot ${index + 1}`} loading="lazy" referrerPolicy="no-referrer" className="max-h-72 w-full rounded border border-lime-400/10 object-contain" />)}
      {Array.isArray(data.tags) && data.tags.length > 0 && <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-white/45">{data.tags.join(' · ')}</p>}
      {Array.isArray(data.technologies) && data.technologies.length > 0 && <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-white/45">{data.technologies.join(' · ')}</p>}
      {Array.isArray(data.projectReferences) && data.projectReferences.length > 0 && <p className="text-xs text-white/50">Projects: {data.projectReferences.join(', ')}</p>}
      {links.length > 0 && <div className="flex flex-wrap gap-2 pt-1">{links.map((link, index) => {
        const href = safeHttpsUrl(link.url);
        return href ? <a key={`${link.label}-${index}`} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded border border-lime-400/20 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-lime-400 hover:border-lime-400/50">{link.label || 'Open link'}<ExternalLink size={11} /></a> : null;
      })}</div>}
    </div>
  );
}

function useContentOwner() {
  const value = useContext(ContentContext);
  if (!value) throw new Error('Content card must be rendered inside AboutContentProvider.');
  return value;
}

export function AboutContentProvider({ children }) {
  const [publicEntries, setPublicEntries] = useState({});
  const [ownerEntries, setOwnerEntries] = useState([]);
  const [token, setToken] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [editorEntry, setEditorEntry] = useState(null);
  const [activeEntry, setActiveEntry] = useState(null);
  const [collectionType, setCollectionType] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [publicError, setPublicError] = useState('');

  const refreshPublic = useCallback(async () => {
    if (!isContentApiConfigured()) {
      setLoading(false);
      setPublicError('Content service is not configured yet.');
      return;
    }
    try {
      const results = await Promise.all(CONTENT_TYPES.map(type => contentApi.publicEntries(type)));
      setPublicEntries(Object.fromEntries(CONTENT_TYPES.map((type, index) => [type, results[index].entries || []])));
      setPublicError('');
    } catch (error) {
      setPublicError(error.message || 'Content could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshPublic(); }, [refreshPublic]);

  const lockOwner = useCallback(async (notify = false) => {
    const activeToken = token;
    setToken('');
    setExpiresAt('');
    setOwnerEntries([]);
    setLoginOpen(false);
    setEditorEntry(null);
    setActiveEntry(null);
    setCollectionType('');
    if (activeToken) {
      try { await contentApi.logout(activeToken); } catch { /* The expiring server token remains bounded by its TTL. */ }
    }
    if (notify) setNotice('Saved. Owner mode is locked.');
  }, [token]);

  useEffect(() => {
    if (!token || !expiresAt) return undefined;
    const timeout = window.setTimeout(() => lockOwner(), Math.max(0, Date.parse(expiresAt) - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [token, expiresAt, lockOwner]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    contentApi.ownerEntries(token).then(result => {
      if (!cancelled) setOwnerEntries(result.entries || []);
    }).catch(error => {
      if (cancelled) return;
      if (error.status === 401) lockOwner();
      else setNotice(error.message || 'Owner entries could not be loaded.');
    });
    return () => { cancelled = true; };
  }, [token, lockOwner]);

  const login = async password => {
    const result = await contentApi.login(password);
    setToken(result.token);
    setExpiresAt(result.expiresAt);
    setNotice('Owner mode unlocked for this session.');
  };

  const saveEntry = async (type, id, data, status) => {
    if (!token) throw new Error('Owner session expired. Sign in again.');
    try {
      if (id) await contentApi.update(token, id, data, status);
      else await contentApi.create(token, type, data, status);
    } catch (error) {
      if (error.status === 401) {
        await lockOwner();
        setNotice('Owner session expired. Sign in again to continue.');
      }
      throw error;
    }
    setEditorEntry(null);
    setActiveEntry(null);
    await lockOwner(true);
    await refreshPublic();
  };

  const removeEntry = async entry => {
    if (!token) throw new Error('Owner session expired. Sign in again.');
    if (!window.confirm(`Delete “${entry.title}” permanently?`)) return;
    try {
      await contentApi.remove(token, entry.id);
      setActiveEntry(null);
      await lockOwner(true);
      await refreshPublic();
    } catch (error) {
      if (error.status === 401) await lockOwner();
      setNotice(error.message || 'Could not delete this entry.');
      throw error;
    }
  };

  const context = useMemo(() => ({
    publicEntries,
    ownerEntries,
    token,
    loading,
    publicError,
    notice,
    setNotice,
    setLoginOpen,
    setEditorEntry,
    setActiveEntry,
    setCollectionType,
    login,
    lockOwner,
    removeEntry,
    saveEntry,
  }), [publicEntries, ownerEntries, token, loading, publicError, notice, lockOwner]);

  return (
    <ContentContext.Provider value={context}>
      {children}
      {loginOpen && <OwnerLoginModal onClose={() => setLoginOpen(false)} onLogin={login} />}
      {editorEntry && <EditorValue key={`${editorEntry.type}-${editorEntry.id || 'new'}`} entry={editorEntry} onClose={() => setEditorEntry(null)} />}
      {activeEntry && <EntryModal entry={activeEntry} onClose={() => setActiveEntry(null)} onEdit={entry => { setActiveEntry(null); setEditorEntry(entry); }} />}
      {collectionType && <CollectionModal type={collectionType} onClose={() => setCollectionType('')} onSelect={entry => { setCollectionType(''); setActiveEntry(entry); }} />}
      {notice && !loginOpen && !editorEntry && !activeEntry && <div className="fixed bottom-4 right-4 z-[90] max-w-sm rounded border border-lime-400/20 bg-[#101610] px-4 py-3 text-sm text-white shadow-lg" role="status">{notice}<button type="button" className="ml-3 text-lime-400" onClick={() => setNotice('')}>Dismiss</button></div>}
    </ContentContext.Provider>
  );
}

function OwnerLoginModal({ onClose, onLogin }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const value = password;
      setPassword('');
      await onLogin(value);
      onClose();
    } catch (loginError) {
      setPassword('');
      setError(loginError.message || 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" role="presentation">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-[6px] border border-lime-400/25 bg-[#101610] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)]" role="dialog" aria-modal="true" aria-labelledby="owner-login-title">
        <div className="flex items-start justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime-400">Private controls</p><h3 id="owner-login-title" className="mt-1 text-lg font-bold text-white">Owner login</h3></div><button type="button" onClick={onClose} className="text-white/55 hover:text-white" aria-label="Close login"><X size={17} /></button></div>
        <label className="block"><span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.13em] text-white/55">Password</span><input autoFocus type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required maxLength={1024} className="content-field" /></label>
        {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
        <button disabled={busy} type="submit" className="owner-primary w-full justify-center">{busy ? 'Checking…' : 'Unlock owner mode'}</button>
      </form>
    </div>
  );
}

function EntryModal({ entry, onClose, onEdit }) {
  const { token, setEditorEntry, removeEntry } = useContentOwner();
  const [actionError, setActionError] = useState('');
  const owner = Boolean(token);
  const status = entry.status === 'draft' ? 'Draft preview' : 'Published';
  const togglePublish = () => {
    setEditorEntry({ ...entry, data: { ...entry.data }, forceStatus: entry.status === 'published' ? 'draft' : 'published' });
    onClose();
  };
  const deleteEntry = async () => {
    setActionError('');
    try { await removeEntry(entry); } catch (error) { setActionError(error.message || 'Could not delete this entry.'); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[6px] border border-lime-400/25 bg-[#101610] shadow-[0_20px_80px_rgba(0,0,0,0.55)]" role="dialog" aria-modal="true" aria-labelledby="content-details-title">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-lime-400/15 bg-[#101610] px-5 py-4"><div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime-400">{TYPE_META[entry.type].title} · {status}</p><h3 id="content-details-title" className="mt-1 text-xl font-bold text-white">{entry.title}</h3></div><button type="button" onClick={onClose} className="rounded border border-white/15 p-2 text-white/70 hover:text-lime-400" aria-label="Close details"><X size={16} /></button></div>
        <div className="space-y-5 p-5"><EntryDetails entry={entry} />
          {actionError && <p role="alert" className="rounded border border-red-400/25 bg-red-400/5 px-3 py-2 text-sm text-red-200">{actionError}</p>}
          {owner && <div className="flex flex-wrap justify-end gap-2 border-t border-lime-400/10 pt-4">
            <button type="button" onClick={() => onEdit(entry)} className="owner-secondary"><Pencil size={13} />Edit</button>
            {entry.id && <button type="button" onClick={togglePublish} className="owner-secondary">{entry.status === 'published' ? 'Unpublish' : 'Publish'}</button>}
            {entry.id && <button type="button" onClick={deleteEntry} className="owner-secondary text-red-200"><Trash2 size={13} />Delete</button>}
          </div>}
        </div>
      </div>
    </div>
  );
}

function CollectionModal({ type, onClose, onSelect }) {
  const { publicEntries, ownerEntries, token } = useContentOwner();
  const entries = token ? ownerEntries.filter(entry => entry.type === type) : (publicEntries[type] || []);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-[6px] border border-lime-400/25 bg-[#101610] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)]" role="dialog" aria-modal="true" aria-labelledby="content-list-title">
        <div className="mb-4 flex items-center justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime-400">{TYPE_META[type].title}</p><h3 id="content-list-title" className="mt-1 text-lg font-bold text-white">Entries</h3></div><button type="button" onClick={onClose} className="text-white/60 hover:text-lime-400" aria-label="Close list"><X size={17} /></button></div>
        <div className="divide-y divide-lime-400/10">{entries.map(entry => <button type="button" key={entry.id} onClick={() => onSelect(entry)} className="block w-full py-3 text-left"><span className="block text-sm text-white hover:text-lime-400">{entry.title}</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-white/40">{entry.status === 'draft' ? 'Draft' : 'Published'}{entry.updatedAt ? ` · Updated ${entry.updatedAt.slice(0, 10)}` : ''}</span></button>)}</div>
      </div>
    </div>
  );
}

export function AboutContentCards({ slot, className = '' }) {
  const { publicEntries, ownerEntries, token, loading, publicError, notice, setLoginOpen, setEditorEntry, setActiveEntry, setCollectionType, lockOwner } = useContentOwner();
  const types = slot === 'profile' ? ['blog', 'paper'] : ['certificate', 'demo'];
  const owner = Boolean(token);
  return (
    <div className={className}>
      {slot === 'profile' && <div className="mb-2 flex min-h-7 items-center justify-end gap-2">
        {notice && <span role="status" className="mr-auto truncate font-mono text-[9px] text-lime-400/75">{notice}</span>}
        {owner ? <button type="button" onClick={() => lockOwner()} className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/45 hover:text-lime-400"><UnlockKeyhole size={12} />Lock editor</button> : <button type="button" onClick={() => setLoginOpen(true)} className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/45 transition-colors hover:text-lime-400"><LockKeyhole size={12} />Owner edit</button>}
      </div>}
      <div className="grid grid-cols-1 items-stretch gap-2.5 lg:grid-cols-2">
        {types.map(type => {
          const meta = TYPE_META[type];
          const Icon = meta.icon;
          const entries = owner ? ownerEntries.filter(entry => entry.type === type) : (publicEntries[type] || []);
          return (
            <article key={type} className="group relative flex min-h-[164px] h-full min-w-0 flex-col overflow-hidden rounded-[4px] border border-lime-400/15 bg-[#101610] p-3.5 transition-colors hover:border-lime-400/30 sm:p-4">
              <div className="mb-3 flex items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><Icon size={14} className="shrink-0 text-lime-400" /><h3 className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/75 sm:text-[10px]">{meta.short}</h3></div>{owner && <button type="button" onClick={() => setEditorEntry({ type, data: blankData(type), status: 'draft' })} aria-label={`Add ${meta.short}`} className="shrink-0 rounded border border-lime-400/20 p-1 text-lime-400 hover:bg-lime-400 hover:text-[#171817]"><Plus size={12} /></button>}</div>
              <p className="mb-3 min-h-8 text-[11px] leading-relaxed text-white/45">{meta.description}</p>
              <div className="mt-auto space-y-1.5">
                {loading && <p className="font-mono text-[9px] text-white/40">Loading…</p>}
                {!loading && entries.slice(0, 2).map(entry => <button type="button" key={entry.id} onClick={() => setActiveEntry(entry)} className="block w-full truncate text-left text-xs text-lime-100/80 transition-colors hover:text-lime-400">{entry.status === 'draft' && <span className="mr-1 font-mono text-[8px] text-amber-300">DRAFT</span>}{entry.title}</button>)}
                {!loading && entries.length === 0 && <p className="font-mono text-[9px] text-white/35">{owner ? 'No entries yet.' : publicError ? 'Content is unavailable.' : 'No published entries yet.'}</p>}
                {entries.length > 2 && <button type="button" onClick={() => setCollectionType(type)} className="font-mono text-[9px] uppercase tracking-[0.1em] text-lime-400/70">View all {entries.length}</button>}
              </div>
              {!owner && publicError && !loading && <span className="sr-only">{publicError}</span>}
            </article>
          );
        })}
      </div>
    </div>
  );
}
