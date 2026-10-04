import { useState } from 'react';
import axios from 'axios';
import { formatMoney } from '../../../utils/paymentStatus.mjs';
export const money = (value, currency = 'EUR') => value == null ? '?' : formatMoney(value, currency);
export default function ScholarEarnings({ data, stripe, token, countryCode, hasVideos }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function connect(action) {
    setBusy(true); setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/stripe-connect/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      window.location.assign(response.data.url);
    } catch (err) { setError(err.response?.data?.message || 'Unable to open Stripe. Please try again.'); setBusy(false); }
  }
  const summary = data?.summary;
  return <section className="scholar-section" aria-labelledby="scholar-earnings-title">
    <div className="scholar-section-heading"><div><h2 id="scholar-earnings-title">Earnings & Payouts</h2><p>70% for the first 100 sales per course, 50% thereafter.</p></div></div>
    {!data ? <p role="status">Earnings are unavailable right now. Please refresh to try again.</p> : <>
      <div className="scholar-metrics">
        {[['Total earnings', summary.scholarEarnings], ['This month', summary.monthlyEarnings], ['Transferred to Stripe', summary.totalPaid], ['Pending balance', summary.pendingBalance]].map(([label, value]) => <div className="scholar-metric" key={label}><span>{label}</span><strong>{money(value, summary.currency)}</strong></div>)}
      </div>
      {hasVideos === false && Number(summary.totalSales) > 0 && <p className="scholar-note">Your historical sales and earnings are retained. You currently have no uploaded videos.</p>}
      {summary.legacyReconciliationRequired && <p className="scholar-note">Legacy calculated earnings: {money(summary.legacyCalculatedEarnings, summary.currency)}. Historical transfers need reconciliation. Pending balance includes only new recorded allocations; a Stripe transfer does not confirm bank receipt.</p>}
      <h3 className="mt-4">Course earnings</h3>
      {data.salesByCourse?.length ? <div className="scholar-table-wrap"><table className="table"><thead><tr><th>Course</th><th>Sales</th><th>Revenue</th><th>Your earnings</th><th>This month</th></tr></thead><tbody>{data.salesByCourse.map(course => <tr key={`${course.id}-${course.currency}`}><th scope="row">{course.courseName}</th><td>{course.salesCount}</td><td>{money(course.revenue, course.currency)}</td><td>{money(course.scholarEarnings, course.currency)}</td><td>{money(course.monthlyEarnings, course.currency)}</td></tr>)}</tbody></table></div> : <p>No course earnings breakdown is available yet. Any recorded totals remain shown above.</p>}
    </>}
    <div className="scholar-stripe"><div><h3>Stripe connection</h3><p>{!stripe ? 'Connection status is unavailable.' : stripe.onboardingComplete ? 'Stripe connected' : stripe.connected ? 'Complete your Stripe setup to receive payouts.' : 'Connect Stripe to receive eligible payouts.'}</p></div>
      {stripe && (stripe.connected || countryCode === 'FI') && <button className="btn btn-outline-primary" disabled={busy} onClick={() => connect(stripe.onboardingComplete ? 'dashboard-link' : 'create-account')}>{busy ? 'Opening…' : stripe.onboardingComplete ? 'Manage Stripe account' : stripe.connected ? 'Complete Stripe Setup' : 'Connect with Stripe'}</button>}
      {stripe && !stripe.connected && countryCode !== 'FI' && <p className="small mb-0">Payout onboarding for your country is not enabled yet. Contact UniClips for support.</p>}
    </div>
    {error && <p role="alert" className="text-danger">{error}</p>}
    <h3 className="mt-4">Historical transfers</h3>
    {!data ? <p>Payout history is currently unavailable.</p> : data.payoutHistory?.length ? <div className="scholar-table-wrap"><table className="table"><thead><tr><th>Date</th><th>Amount</th><th>Recorded status</th><th>Transfer reference</th></tr></thead><tbody>{data.payoutHistory.map(payout => <tr key={payout.id}><td>{new Date(payout.date).toLocaleDateString()}</td><td>{Number(payout.amount).toFixed(2)} {payout.currency.toUpperCase()}</td><td>{payout.status}</td><td className="scholar-reference">{payout.stripeTransferId || '—'}</td></tr>)}</tbody></table></div> : <p>No transfers recorded yet. A recorded Stripe transfer does not confirm bank receipt.</p>}
  </section>;
}
