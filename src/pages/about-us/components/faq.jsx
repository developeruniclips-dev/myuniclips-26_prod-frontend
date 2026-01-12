import { Container, Accordion } from "react-bootstrap";

function Faq() {
    return(
        <section className="faq-section py-5">
            <Container>
                <h1 className="fw-bold text-primary text-center mb-5">
                Frequently Asked Questions
                </h1>

                {/* Learners Section */}
                <h4 className="fw-semibold text-dark mb-3">For Learners (Students Buying Courses)</h4>
                <Accordion defaultActiveKey="">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                    How is UniClips different from free YouTube videos or platforms like Coursera?
                    </Accordion.Header>
                    <Accordion.Body>
                    UniClips is designed specifically for your success in your local university. Our content is unique because it is:
                    <ul>
                        <li><strong>Syllabus-Aligned:</strong> Guaranteed to cover the exact topics you need for local university requirements.</li>
                        <li><strong>Scholar-Powered:</strong> Created by proven, top-performing peers who recently mastered the course from your institution.</li>
                        <li><strong>Short & Focused:</strong> Designed for maximum efficiency, offering simplified explanations for fast comprehension and revision.</li>
                    </ul>
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                    <Accordion.Header>
                    How long are the courses, and how many videos are included?
                    </Accordion.Header>
                    <Accordion.Body>
                    Our courses are designed to be concise and high-impact. Each course includes up to <strong>7 focused videos</strong>, each lasting no more than <strong>20 minutes</strong>.  
                    This makes them perfect for review sessions or last-minute revision.
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                    <Accordion.Header>
                    How much does a course cost?
                    </Accordion.Header>
                    <Accordion.Body>
                    We are committed to affordability. All UniClips courses are priced accessibly, typically under <strong>€6</strong> to ensure they fit a student budget.
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                    <Accordion.Header>
                    Can I download the videos for offline viewing?
                    </Accordion.Header>
                    <Accordion.Body>
                    For the security of our scholars' original content, all UniClips videos are <strong>stream-only</strong>.  
                    You must be logged in and connected to the internet to watch any purchased course.
                    </Accordion.Body>
                </Accordion.Item>
                </Accordion>

                {/* Scholars Section */}
                <h4 className="fw-semibold text-dark mt-5 mb-3">For Scholars (Students Creating Content)</h4>
                <Accordion defaultActiveKey="">
                <Accordion.Item eventKey="4">
                    <Accordion.Header>How do I apply to become a UniClips Scholar?</Accordion.Header>
                    <Accordion.Body>
                    It’s simple! Fill out the application form on the <strong>Scholar page</strong> (top right section) with your academic details and the course you wish to teach.  
                    We review applications and aim to respond within <strong>2–4 business days</strong> to discuss the next steps.
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="5">
                    <Accordion.Header>How much can I earn as a Scholar?</Accordion.Header>
                    <Accordion.Body>
                    We offer a highly competitive revenue share model:
                    <ul>
                        <li>You earn <strong>70%</strong> of the revenue for the first 100 sales of your specific course.</li>
                        <li>You earn <strong>50%</strong> of the revenue for all sales after the 100-sale threshold is met.</li>
                    </ul>
                    Your earnings are tracked in real-time on your private <strong>Scholar Dashboard</strong>.
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="6">
                    <Accordion.Header>What are the video quality requirements?</Accordion.Header>
                    <Accordion.Body>
                    We require clear, professional-grade content — especially high-quality audio.  
                    Videos should be easy to follow and use our official <strong>Intro/Outro bumper</strong>.  
                    We handle final editing and quality assurance before publishing.
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="7">
                    <Accordion.Header>What if the syllabus changes for my course?</Accordion.Header>
                    <Accordion.Body>
                    We encourage our scholars to keep their content current.  
                    If your university syllabus changes significantly, you’ll have the option to update your videos to ensure accuracy and value for learners.
                    </Accordion.Body>
                </Accordion.Item>
                </Accordion>
            </Container>
        </section>
    )
}

export default Faq;