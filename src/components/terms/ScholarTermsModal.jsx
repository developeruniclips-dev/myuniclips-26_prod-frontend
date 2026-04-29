// src/components/terms/ScholarTermsModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const SCHOLAR_TERMS_CONTENT = `
UNICLIPS SCHOLAR TERMS AND AGREEMENT

1. INTRODUCTION
By becoming a Scholar on the Uniclips platform, you agree to abide by these terms and conditions.

2. CONTENT OWNERSHIP & LICENSING
- You retain ownership of your educational content
- You grant Uniclips a non-exclusive license to distribute your content
- You warrant that your content does not infringe on any third-party rights

3. REVENUE SHARING
- Scholars receive 70% of course revenue for the first 100 sales
- After 100 sales, scholars receive 50% of course revenue
- Payouts are processed monthly via Stripe Connect

4. CONTENT REQUIREMENTS
- All content must be educational and appropriate
- Content must be original or properly licensed
- Maximum 7 videos per subject bundle
- Videos must meet quality standards

5. SCHOLAR RESPONSIBILITIES
- Maintain accurate profile information
- Respond to student inquiries in a timely manner
- Keep content up-to-date and relevant
- Comply with all applicable laws and regulations

6. PLATFORM RULES
- No misleading or false information
- No spam or promotional content unrelated to courses
- Respect intellectual property rights
- Follow community guidelines

7. TERMINATION
Uniclips reserves the right to remove content or terminate scholar accounts for violations of these terms.

8. LIABILITY
Scholars are responsible for the accuracy and legality of their content. Uniclips is not liable for content created by scholars.

9. MODIFICATIONS
These terms may be updated periodically. Continued use of the platform constitutes acceptance of modified terms.

10. CONTACT
For questions about these terms, contact: support@myuniclips.com

Last updated: January 2026
`;

function ScholarTermsModal({ show, onHide, onAccept, loading = false }) {
    const [accepted, setAccepted] = useState(false);

    const handleAccept = () => {
        if (accepted) {
            onAccept();
        }
    };

    const handleClose = () => {
        setAccepted(false);
        onHide();
    };

    return (
        <Modal 
            show={show} 
            onHide={handleClose} 
            size="lg" 
            scrollable
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Scholar Terms and Agreement
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div className="terms-content p-3 bg-light rounded" style={{ whiteSpace: 'pre-line' }}>
                    {SCHOLAR_TERMS_CONTENT}
                </div>
            </Modal.Body>
            <Modal.Footer className="d-flex flex-column align-items-start">
                <Form.Check
                    type="checkbox"
                    id="scholar-terms-checkbox"
                    label="I have read and agree to the Scholar Terms and Agreement"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mb-3"
                />
                <div className="d-flex gap-2 w-100 justify-content-end">
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleAccept}
                        disabled={!accepted || loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Processing...
                            </>
                        ) : (
                            'Accept & Continue'
                        )}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default ScholarTermsModal;
export { SCHOLAR_TERMS_CONTENT };
