// src/components/terms/LearnerTermsModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const LEARNER_TERMS_CONTENT = `
UNICLIPS LEARNER TERMS AND CONDITIONS

1. INTRODUCTION
Welcome to Uniclips! By creating an account or purchasing courses, you agree to these terms and conditions.

2. ACCOUNT REGISTRATION
- You must provide accurate information during registration
- You are responsible for maintaining the security of your account
- One account per person; sharing accounts is prohibited

3. COURSE ACCESS
- Purchased courses grant you 5 months of access from the purchase date
- After 5 months, you will need to repurchase the course at the current price to regain access
- Course access is non-transferable

4. PAYMENT & REFUNDS
- All payments are processed securely through Stripe
- Prices are displayed in EUR (€)
- Refund requests may be considered within 14 days of purchase if no content has been accessed

5. ACCEPTABLE USE
- Use the platform for personal educational purposes only
- Do not share, distribute, or resell course content
- Do not attempt to download or record course videos
- Respect other users and scholars

6. INTELLECTUAL PROPERTY
- All course content is protected by copyright
- You may not reproduce, distribute, or create derivative works
- Uniclips and its scholars retain all intellectual property rights

7. PRIVACY
- Your personal data is handled according to our Privacy Policy
- We may use anonymized data to improve our services

8. LIMITATION OF LIABILITY
- Uniclips provides educational content "as is"
- We are not responsible for learning outcomes
- Maximum liability is limited to the purchase price

9. TERMINATION
We may suspend or terminate accounts that violate these terms.

10. CHANGES TO TERMS
We may update these terms periodically. Continued use constitutes acceptance.

11. CONTACT
Questions? Email us at: support@myuniclips.com

Last updated: January 2026
`;

function LearnerTermsModal({ show, onHide, onAccept, loading = false, context = 'signup' }) {
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

    const getTitle = () => {
        switch(context) {
            case 'purchase':
                return 'Terms & Conditions - Course Purchase';
            case 'signup':
            default:
                return 'Terms & Conditions';
        }
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
                    {getTitle()}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div className="terms-content p-3 bg-light rounded" style={{ whiteSpace: 'pre-line' }}>
                    {LEARNER_TERMS_CONTENT}
                </div>
                {context === 'purchase' && (
                    <div className="alert alert-info mt-3">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Note:</strong> Course access is valid for 5 months from the date of purchase.
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="d-flex flex-column align-items-start">
                <Form.Check
                    type="checkbox"
                    id="learner-terms-checkbox"
                    label="I have read and agree to the Terms and Conditions"
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
                            context === 'purchase' ? 'Accept & Proceed to Payment' : 'Accept & Create Account'
                        )}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default LearnerTermsModal;
export { LEARNER_TERMS_CONTENT };
