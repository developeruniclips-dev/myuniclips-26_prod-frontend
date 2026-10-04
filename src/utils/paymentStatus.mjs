export function paymentStatus(result, subjectId, scholarId) {
    if (result?.success === true && result.state === 'fulfilled' &&
        String(result.subjectId) === String(subjectId) && String(result.scholarId) === String(scholarId)) {
        if (result.accessActive !== true) return { confirmed: false, type: 'info', text: 'This payment was confirmed previously. Course access has expired or is no longer active.' };
        return { confirmed: true, type: 'success', text: 'Payment confirmed. Your course purchase is available.' };
    }
    if (result?.state === 'review_required') return { confirmed: false, type: 'warning', text: 'This payment needs review. Please contact support before paying again.' };
    return { confirmed: false, type: 'info', text: 'Payment is still processing. Refresh to check again; please do not pay again.' };
}
export function formatMoney(value, currency = 'EUR') {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(value || 0));
}
