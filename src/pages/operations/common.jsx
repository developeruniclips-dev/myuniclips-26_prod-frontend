import { Fragment, useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/temp';
import { formatMoney as currencyMoney } from '../../utils/paymentStatus.mjs';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export function formatMoney(value, currency = 'EUR') {
  if (!currency || !/^[A-Z]{3}$/i.test(currency)) return `${value ?? 'Not recorded'} · currency not recorded`;
  return currencyMoney(value, currency);
}
export const date = value => value ? new Date(value).toLocaleDateString() : 'Not recorded';
export function useApi() {
  const { user } = useAuth();
  return useCallback(async (path, method = 'GET', body) => {
    const response = await fetch(`${API}${path}`, { method, headers: { Authorization: `Bearer ${user?.token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.message || 'Unable to complete this request.'), { code: result.code });
    return result;
  }, [user?.token]);
}
export function useResource(path) {
  const api = useApi();
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [revision, setRevision] = useState(0);
  const reload = () => setRevision(value => value + 1);
  useEffect(() => {
    let active = true;
    setState({ loading: true, data: null, error: '' });
    api(path).then(data => active && setState({ loading: false, data, error: '' })).catch(error => active && setState({ loading: false, data: null, error: error.message, code: error.code }));
    return () => { active = false; };
  }, [api, path, revision]);
  return { ...state, reload };
}
export function Notice({ error, loading, data, code, children }) {
  if (loading) return <p role="status" className="ops-empty">Loading…</p>;
  if (error) return <p role={code?.endsWith('SCHEMA_UNAVAILABLE') ? 'status' : 'alert'} className={code?.endsWith('SCHEMA_UNAVAILABLE') ? 'ops-empty' : 'ops-error'}>{error}</p>;
  if (data?.available === false) return <p role="status" className="ops-empty">{data.message}</p>;
  return children;
}
export function Badge({ children }) { return <span className={`ops-badge ${['URGENT', 'review_required'].includes(children) ? 'ops-urgent' : ''}`}>{String(children ?? 'Not recorded').replaceAll('_', ' ')}</span>; }
export function Pager({ data, setPage }) {
  if (!data?.total) return null;
  const page = data.page || 1, limit = data.limit || 20;
  return <div className="ops-pager"><span>{data.total} records · Page {page}</span><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><button disabled={page * limit >= data.total} onClick={() => setPage(page + 1)}>Next</button></div>;
}
export function Search({ onSearch, placeholder = 'Search name or email' }) {
  const [value, setValue] = useState('');
  return <form className="ops-search" onSubmit={e => { e.preventDefault(); onSearch(value); }}><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => setValue(e.target.value)} /><button>Search</button></form>;
}
export function Table({ columns, rows = [], empty = 'No matching records.', expandedRow }) {
  if (!rows.length) return <p className="ops-empty">{empty}</p>;
  return <div className="ops-table-scroll" tabIndex={0} role="region" aria-label="Results"><table className="ops-table"><thead><tr>{columns.map(([label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((row, i) => { const expansion = expandedRow?.(row); return <Fragment key={row.id || row.reference || i}><tr>{columns.map(([label, render]) => <td key={label} data-label={label}>{render(row)}</td>)}</tr>{expansion && <tr className="ops-review-row"><td className="ops-review-cell" colSpan={columns.length}>{expansion}</td></tr>}</Fragment>; })}</tbody></table></div>;
}
export function Subnav({ items, value, onChange }) { return <nav className="ops-subnav" aria-label="Section navigation">{items.map(([key, label]) => <button key={key} aria-current={value === key ? 'page' : undefined} onClick={() => onChange(key)}>{label}</button>)}</nav>; }
export function ConfirmAction({ title, explanation, phrase, onConfirm, onClose }) {
  const [confirmation, setConfirmation] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  return <div className="ops-dialog-backdrop"><section role="dialog" aria-modal="true" aria-label={title} className="ops-dialog"><h2>{title}</h2><p>{explanation}</p><form onSubmit={async e => { e.preventDefault(); setBusy(true); try { await onConfirm(confirmation); onClose(); } catch (e) { setError(e.message); setBusy(false); } }}><label>Type <strong>{phrase}</strong><input autoFocus value={confirmation} onChange={e => setConfirmation(e.target.value)} required /></label>{error && <p role="alert" className="ops-error">{error}</p>}<div className="ops-actions"><button type="button" disabled={busy} onClick={onClose}>Cancel</button><button className="ops-primary" disabled={busy || confirmation !== phrase}>{busy ? 'Saving…' : 'Confirm'}</button></div></form></section></div>;
}
export function Form({ submit, children, label = 'Save', onSaved = () => {} }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState(false);
  return <form className="ops-form" onSubmit={async e => { e.preventDefault(); const body = Object.fromEntries(new FormData(e.currentTarget)); setBusy(true); setError(''); setDone(false); try { await submit(body); setDone(true); onSaved(); } catch (error) { setError(error.message); } finally { setBusy(false); } }}>{children}{error && <p role="alert" className="ops-error">{error}</p>}{done && <p role="status">Saved successfully.</p>}<button disabled={busy} className="ops-primary">{busy ? 'Saving…' : label}</button></form>;
}
export const query = values => new URLSearchParams(Object.entries(values).filter(([, v]) => v !== '' && v != null)).toString();
