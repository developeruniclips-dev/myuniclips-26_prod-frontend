import { useState, useEffect } from "react";
import { Card, Form, Button, Modal } from "react-bootstrap";
import { useAuth } from "../../context/temp"; // your auth context
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './scholarDashboard.css';

function NewCourse() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expertise, setExpertise] = useState("");
  const [degree, setDegree] = useState("");
  const [subject, setSubject] = useState("");

  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [scholarProfile, setScholarProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [redirectAfterModal, setRedirectAfterModal] = useState(false);

  // Fetch scholar profile to get their degree
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-profile/status`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setScholarProfile(res.data.profile);
        setDegree(res.data.profile?.degree || "");
      } catch (err) {
        console.error("Error fetching scholar profile:", err);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user?.token) return;
    let active = true;
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/scholar-subjects/available`,
      { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => { if (active) setFilteredSubjects(res.data.subjects); })
      .catch(error => { if (active) { setModalMessage(error.response?.data?.message || 'Unable to load your programme courses'); setShowModal(true); } });
    return () => { active = false; };
  }, [user?.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) {
      setModalMessage("You must be logged in to create a course");
      setRedirectAfterModal(false);
      setShowModal(true);
      return;
    }

    const payload = {
      expertise,
      degree,
      subject_id: subject,
      user_id: user.id,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setModalMessage("Course created successfully!");
      setRedirectAfterModal(true); // set redirect flag
      setShowModal(true);
    } catch (err) {
      setModalMessage(err.response?.data?.message || "Error creating course");
      setRedirectAfterModal(false);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (redirectAfterModal) {
      navigate("/scholar-dashboard"); // redirect after success
    }
  };

  return (
    <div className="container py-5 scholar-management" style={{ maxWidth: "700px" }}>
      <Link to="/scholar-dashboard" className="btn btn-outline-primary mb-3">&larr; Scholar Dashboard</Link>
      <Card className="p-4 border-0 shadow rounded-4">
        <h3 className="fw-bold text-center mb-4">Apply to Teach a Subject</h3>
        
        {scholarProfile && (
          <div className="alert alert-info mb-4">
            <strong>Your Program:</strong> {scholarProfile.degree}
            <br />
            <small>Select which subject from your program you want to teach</small>
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>Degree Program <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              value={degree}
              
              placeholder="e.g., Computer Applications"
              required
              readOnly
            />
            <Form.Text className="text-muted">
              {scholarProfile?.degree ? 
                "This is from your scholar profile" : 
                "Available after your scholar profile is approved"
              }
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Subject to Teach <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={!degree || filteredSubjects.length === 0}
            >
              <option value="">
                {!degree ? "Waiting for approved scholar profile" : 
                 filteredSubjects.length === 0 ? "No subjects found for this program" :
                 "Select Subject"}
              </option>
              {filteredSubjects.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  {subj.name}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              {filteredSubjects.length > 0 && `${filteredSubjects.length} subjects available in ${degree}`}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Your Expertise in This Subject <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="e.g., I have 2 years experience teaching this subject and achieved A+ grade"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              required
            />
          </Form.Group>

          <div className="alert alert-warning">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Note:</strong> Your application to teach this subject will be reviewed by admin before you can upload videos.
          </div>

          <div className="text-center mt-4">
            <Button type="submit" variant="primary" className="px-5 py-2" size="lg">
              Submit Application
            </Button>
          </div>
        </Form>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default NewCourse;
