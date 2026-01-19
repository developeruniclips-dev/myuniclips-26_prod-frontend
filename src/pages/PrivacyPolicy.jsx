import React from "react";
import { Container, Card } from "react-bootstrap";
import Footer from "../components/footer/Footer";

function PrivacyPolicy() {
  return (
    <>
      <div className="bg-light min-vh-100">
        <Container className="py-5">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              <h1 className="fw-bold text-primary mb-4">Privacy Policy</h1>
              <p className="text-muted mb-4">Last updated: January 18, 2026</p>

              <section className="mb-5">
                <h4 className="fw-bold mb-3">1. Introduction</h4>
                <p>
                  Welcome to UNICLIPS ("we," "our," or "us"). We are committed to protecting your personal 
                  information and your right to privacy. This Privacy Policy explains how we collect, use, 
                  disclose, and safeguard your information when you use our educational platform.
                </p>
              </section>

              <section className="mb-5">
                <h4 className="fw-bold mb-3">2. Information We Collect</h4>
                <h6 className="fw-semibold">Personal Information</h6>
                <ul>
                  <li>Name and email address when you create an account</li>
                  <li>Profile information you choose to provide</li>
                  <li>Payment information processed through Stripe (we do not store card details)</li>
                  <li>Educational credentials for Scholar applications</li>
                </ul>
                
                <h6 className="fw-semibold mt-3">Usage Information</h6>
                <ul>
                  <li>Course viewing history and progress</li>
                  <li>Device information and IP address</li>
                  <li>Browser type and operating system</li>
                </ul>
              </section>

              <section className="mb-5">
                <h4 className="fw-bold mb-3">3. How We Use Your Information</h4>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Track and analyze usage patterns to improve user experience</li>
                  <li>Verify Scholar credentials and process payouts</li>
                </ul>
              </section>

              <section className="mb-5">
                <h4 className="fw-bold mb-3">4. Information Sharing</h4>
                <p>We may share your information in the following situations:</p>
                <ul>
                  <li><strong>Service Providers:</strong> With third parties who perform services on our behalf (e.g., Stripe for payments, Vimeo for video hosting)</li>
                  <li><strong>Legal Requirements:</strong> If required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
                <p>We do not sell your personal information to third parties.</p>
              </section>

              <section className="mb-5">
                <h4 className="fw-bold mb-3">5. Data Security</h4>
                <p>
                  We implement appropriate technical and organizational security measures to protect your 
                  personal information. However, no method of transmission over the Internet is 100% secure, 
                  and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="mb-5">
                <h4 className="fw-bold mb-3">6. Your Rights (GDPR)</h4>
                <p>Under the General Data Protection Regulation (GDPR), you have the right to:</p>
                <ul>
                  <li><strong>Access:</strong> Request copies of your personal data</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Restriction:</strong> Request restriction of processing</li>
                  <li><strong>Portability:</strong> Request transfer of your data</li>
                  <li><strong>Object:</strong> Object to processing of your personal data</li>
                </ul>
                <p>To exercise these rights, contact us at <a href="mailto:support@uniclips.com">support@uniclips.com</a></p>
              </section>

              <section className="mb-5">
                <h4 className="fw-bold mb-3">7. Cookies</h4>
                <p>
                  We use cookies and similar tracking technologies to track activity on our platform and 
                  hold certain information. You can instruct your browser to refuse all cookies or to 
                  indicate when a cookie is being sent.
                </p>
              </section>

              <section className="mb-5">
                <h4 className="fw-bold mb-3">8. Children's Privacy</h4>
                <p>
                  Our service is not intended for users under 16 years of age. We do not knowingly 
                  collect personal information from children under 16. If you are a parent or guardian 
                  and become aware that your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section className="mb-5">
                <h4 className="fw-bold mb-3">9. Changes to This Policy</h4>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-4">
                <h4 className="fw-bold mb-3">10. Contact Us</h4>
                <p>If you have questions about this Privacy Policy, please contact us at:</p>
                <ul className="list-unstyled">
                  <li><strong>Email:</strong> <a href="mailto:support@uniclips.com">support@uniclips.com</a></li>
                  <li><strong>Phone:</strong> <a href="tel:+358451723342">+358 45 1723342</a></li>
                  <li><strong>Address:</strong> Kaartokatu 2, 11100 Riihimäki, Finland</li>
                </ul>
              </section>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
}

export default PrivacyPolicy;
