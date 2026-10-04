import { useSearchParams, Link } from 'react-router-dom';
import { Badge, formatMoney, Notice, Subnav, Table, useResource } from './common';
import People, { Transactions } from './People';
import Approvals from './Approvals';
import Cases from './Cases';
import { AdminCreate, Audit, Catalogue, Finance, Profile, Security } from './FinanceSystem';
import './operations.css';

const adminNav = [['overview', 'Overview', 'grid'], ['people', 'People', 'people'], ['approvals', 'Approvals', 'check2-square'], ['support', 'Support', 'chat-square-text'], ['transactions', 'Transactions', 'receipt'], ['profile', 'My Profile', 'person-circle']];
const ownerNav = [['overview', 'Overview', 'grid'], ['universities', 'Universities', 'buildings'], ['people', 'People', 'people'], ['operations', 'Operations', 'check2-square'], ['finance', 'Finance', 'receipt'], ['analytics', 'Analytics', 'bar-chart'], ['system', 'System', 'shield-check']];
const approvalPanels = [['scholars', 'Scholar Applications'], ['courses', 'Course Applications'], ['videos', 'Video Reviews']];
const panels = { approvals: approvalPanels, support: [['support', 'Support Cases'], ['escalations', 'My Escalations'], ['activity', 'My Activity']], operations: [...approvalPanels, ['support', 'Support Cases'], ['escalations', 'Escalations']], finance: [['transactions', 'Transactions'], ['allocations', 'Allocations / Transfers'], ['legacy', 'Historical Transfers'], ['pricing', 'Pricing'], ['review', 'Financial Review']], system: [['admins', 'Admins & Permissions'], ['catalogue', 'Academic Catalogue'], ['security', 'Security'], ['audit', 'Audit Log'], ['settings', 'Platform Settings'], ['profile', 'Profile']] };
export default function Workspace({ owner = false }) {
  const [params, setParams] = useSearchParams(), nav = owner ? ownerNav : adminNav;
  const requested = params.get('section'), section = nav.some(([key]) => key === requested) ? requested : 'overview';
  const available = panels[section], requestedPanel = params.get('panel'), panel = available?.some(([key]) => key === requestedPanel) ? requestedPanel : available?.[0][0];
  const personId = params.get('person');
  const go = (section, panel) => setParams({ section, ...(panel ? { panel } : {}) });
  const openPerson = id => { const next = new URLSearchParams(params); next.set('person', id); setParams(next); };
  const closePerson = () => { const next = new URLSearchParams(params); next.delete('person'); setParams(next); };
  let content;
  if (section === 'people') content = <People {...{ owner, personId, openPerson, closePerson }} />;
  else if (section === 'overview') content = <Overview {...{ owner, go }} />;
  else if (section === 'universities') content = <Universities />;
  else if (section === 'analytics') content = <Analytics />;
  else if (section === 'profile' || panel === 'profile') content = <Profile />;
  else if (section === 'transactions' || panel === 'transactions') content = <Transactions />;
  else if (['scholars', 'courses', 'videos'].includes(panel)) content = <Approvals key={panel} kind={panel} {...{ openPerson, owner }} />;
  else if (['support', 'escalations'].includes(panel)) content = <Cases key={panel} kind={panel} {...{ openPerson }} />;
  else if (['activity', 'audit'].includes(panel)) content = <Audit />;
  else if (['allocations', 'legacy', 'review'].includes(panel)) content = <Finance key={panel} view={panel} />;
  else if (panel === 'pricing' || panel === 'catalogue') content = <Catalogue key={panel} pricing={panel === 'pricing'} />;
  else if (panel === 'admins') content = <><AdminCreate /><People {...{ owner, personId, openPerson, closePerson }} adminOnly /></>;
  else if (panel === 'security') content = <Security />;
  else content = <><h2>Platform settings</h2><p className="ops-empty">No safe runtime configuration editor exists in the current system. Deployment configuration, provider credentials and payment activation are managed separately.</p></>;
  return <main className={`ops-shell ${owner ? 'ops-owner' : ''}`}><header className="ops-hero"><div><span className="ops-eyebrow">UNICLIPS / {owner ? 'PLATFORM CONTROL' : 'OPERATIONS'}</span><h1>{owner ? 'SuperAdmin Dashboard' : 'Admin Workspace'}</h1><p>{owner ? 'A clear view of your platform. The authority to guide it.' : 'Keep UniClips running smoothly.'}</p><span className="ops-context">{owner ? 'Platform Owner' : 'General Admin'} <span aria-hidden="true">·</span> All Universities</span></div><div className="ops-hero-icon" aria-hidden="true"><i className={`bi bi-${owner ? 'shield-check' : 'diagram-3'}`} /></div></header><div className="ops-layout"><nav className="ops-sidebar" aria-label={owner ? 'SuperAdmin workspace' : 'Admin workspace'}>{nav.map(([key, label, icon]) => <button key={key} aria-current={section === key ? 'page' : undefined} onClick={() => go(key)}><i className={`bi bi-${icon}`} aria-hidden="true" />{label}</button>)}</nav><section className="ops-content">{available && !personId && <Subnav items={available} value={panel} onChange={value => go(section, value)} />}{personId && section !== 'people' && <People {...{ owner, personId, openPerson, closePerson }} />}<div hidden={!!personId && section !== 'people'}>{content}</div></section></div></main>;
}
function Overview({ owner, go }) {
  const resource = useResource('/operations/overview'), data = resource.data;
  const attention = [['scholars', 'Scholar applications', 'scholarApplications'], ['courses', 'Course applications', 'courseApplications'], ['videos', 'Videos awaiting review', 'videoReviews'], ['support', 'Open support cases', 'openSupport']];
  return <Notice {...resource}>{data && <>{<div className="ops-section-heading"><div><h2>Your operational overview</h2><p>Current work across UniClips, including users without study preferences.</p></div><button onClick={resource.reload}>Refresh</button></div>}{data.operationsMessage && <p role="status" className="ops-empty">{data.operationsMessage}</p>}<div className="ops-metrics">{[['Total Users', data.users, 'people'], ['Approved Scholars', data.scholars, 'mortarboard'], ['Pending Approvals', Number(data.scholarApplications) + Number(data.courseApplications) + Number(data.videoReviews), 'clipboard-check'], ['Open Support', data.openSupport, 'chat-square-text']].map(([label, value, icon]) => <article key={label}><i className={`bi bi-${icon}`} aria-hidden="true" /><strong>{value ?? 'Unavailable'}</strong><span>{label}</span></article>)}</div><div className="ops-overview-grid"><section className="ops-inset"><h3>Needs attention</h3><div className="ops-attention">{attention.map(([panel, label, key]) => <button key={key} onClick={() => go(owner ? 'operations' : panel === 'support' ? 'support' : 'approvals', panel)}><span>{label}</span><Badge>{data[key] ?? 'Unavailable'}</Badge><span aria-hidden="true">→</span></button>)}{owner && <button onClick={() => go('operations', 'escalations')}><span>Open escalations</span><Badge>{data.openEscalations ?? 'Unavailable'}</Badge><span aria-hidden="true">→</span></button>}</div></section><section className="ops-inset"><h3>Platform snapshot</h3><p>{data.publishedCourses} published offerings / {data.publishedVideos} approved videos / {data.academicUniversities} academic universities</p><h4>Recorded course purchases by currency</h4>{data.revenue.length ? data.revenue.map(r => <p key={r.currency}>{formatMoney(r.amount, r.currency)}</p>) : <p>No recorded course purchases.</p>}<small>{data.revenueBasis}</small><p>{data.unassignedUsers} users have no university selected.</p><button onClick={() => go('people')}>Open People</button></section></div></>}</Notice>;
}
export function Analytics() {
  const resource = useResource('/operations/overview'), universities = useResource('/operations/universities'), data = resource.data;
  return <><h2>Marketplace analytics</h2><Notice {...resource}>{data && <><div className="ops-metrics">{[['Users', data.users], ['Approved Scholars', data.scholars], ['Published Offerings', data.publishedCourses], ['Approved Videos', data.publishedVideos], ['Academic Universities', data.academicUniversities], ['Recorded Course Purchases', data.coursePurchases]].map(([label, value]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div><section className="ops-inset"><h3>Recorded course purchase value by currency</h3>{data.revenue.map(r => <p key={r.currency}>{r.currency} {formatMoney(r.amount, r.currency)}</p>)}<small>{data.revenueBasis}</small></section><p>{data.unassignedUsers} users without a university preference. University is not inferred.</p></>}</Notice><h3>University activity</h3><Notice {...universities}><Table rows={universities.data} columns={[
    ['University', r => r.name], ['Academic catalogue', r => `${r.programmes} programmes / ${r.courseEntries} entries`], ['Learner preferences', r => r.users], ['Approved Scholars', r => r.scholars]
  ]} /></Notice><section className="ops-inset"><h3>Traffic &amp; Product Analytics - unavailable</h3><p>Visitor, session, page-view and engagement tracking is not installed.</p></section></>;
}
function Universities() {
  const resource = useResource('/operations/universities');
  return <><h2>Universities</h2><p>Learner study preferences and approved Scholar context remain separate. A user may appear in both measures.</p><Notice {...resource}>{resource.data?.some(r => r.openSupport == null) && <p role="status" className="ops-empty">Support counts will become available after the operations migration. Current university and catalogue information remains available.</p>}<Table rows={resource.data} columns={[
    ['University', r => <>{r.name}<small>{r.country}</small></>], ['Learner preferences', r => r.users], ['Approved Scholars', r => r.scholars], ['Pending work', r => r.pendingItems], ['Academic catalogue', r => <>{r.programmes} programmes<small>{r.courseEntries} course entries</small></>], ['Open support', r => r.openSupport ?? 'Unavailable']
  ]} /></Notice></>;
}
export function SupportPage() {
  return <main className="ops-shell"><header className="ops-hero"><div><span className="ops-eyebrow">MY UNICLIPS / HELP</span><h1>How can we help?</h1><p>Your support requests, together in one place.</p><Link to="/dashboard">← Learner Dashboard</Link></div></header><section className="ops-content"><Cases /></section></main>;
}
