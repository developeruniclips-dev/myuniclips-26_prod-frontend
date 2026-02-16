// src/pages/dashboard/VideoUploadPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/temp";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Card, Form, Button, Spinner, Alert, Container, Badge } from "react-bootstrap";
import ScholarTermsModal from "../../components/terms/ScholarTermsModal";

const MAX_VIDEOS_PER_SUBJECT = 7;

function VideoUploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sequenceIndex, setSequenceIndex] = useState("1");
  const [subjectId, setSubjectId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [videoCounts, setVideoCounts] = useState({});
  const [maxSequences, setMaxSequences] = useState({});
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Fetch scholar's subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/status`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const approvedSubjects = res.data.subjects.filter(s => s.approved === 1);
        setSubjects(approvedSubjects);
        
        // Check if subject_id is in URL params
        const urlSubjectId = searchParams.get('subject_id');
        if (urlSubjectId && approvedSubjects.some(s => s.subject_id === parseInt(urlSubjectId))) {
          setSubjectId(urlSubjectId);
        } else if (approvedSubjects.length > 0) {
          setSubjectId(approvedSubjects[0].subject_id);
        }

        // Fetch video counts for each subject
        const videosRes = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/scholar/my-videos`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const counts = {};
        const maxSequences = {};
        (videosRes.data.videos || []).forEach(video => {
          counts[video.subject_id] = (counts[video.subject_id] || 0) + 1;
          // Track the highest sequence number for each subject
          const seq = parseInt(video.sequence_index) || 0;
          maxSequences[video.subject_id] = Math.max(maxSequences[video.subject_id] || 0, seq);
        });
        setVideoCounts(counts);
        setMaxSequences(maxSequences);
        
        // Set initial sequence for the first subject
        const initialSubjectId = urlSubjectId || (approvedSubjects.length > 0 ? approvedSubjects[0].subject_id : null);
        if (initialSubjectId) {
          setSequenceIndex(String((maxSequences[initialSubjectId] || 0) + 1));
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    if (user) fetchSubjects();
  }, [user, searchParams]);

  // Auto-update sequence number when subject changes
  useEffect(() => {
    if (subjectId) {
      const nextSequence = (maxSequences[subjectId] || 0) + 1;
      setSequenceIndex(String(nextSequence));
    }
  }, [subjectId, maxSequences]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      // Check file size (max 800MB)
      if (selectedFile.size > 800 * 1024 * 1024) {
        setError('File size must be less than 800MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setShowTermsModal(true);
      return;
    }

    if (!file) {
      setError("Please select a video file!");
      return;
    }

    if (!subjectId) {
      setError("Please select a subject!");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("sequenceIndex", sequenceIndex);
      formData.append("subjectId", subjectId);

      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setUploading(false);
      alert("Video uploaded successfully!");
      navigate("/scholar-dashboard");
    } catch (err) {
      console.error(err);
      setUploading(false);
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    }
  };

  if (subjects.length === 0) {
    return (
      <Container className="py-5" style={{ maxWidth: "700px" }}>
        <Card className="border-0 shadow-sm p-4">
          <Alert variant="warning">
            <Alert.Heading>No Approved Subjects</Alert.Heading>
            <p>You need to have at least one approved subject before uploading videos.</p>
            <Button variant="primary" onClick={() => navigate("/become-scholar")}>
              Apply to Become a Scholar
            </Button>
          </Alert>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: "700px" }}>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-5">
          <h3 className="fw-bold mb-2 text-center">Upload New Course Video</h3>
          <p className="text-muted text-center mb-4">Share your knowledge with students</p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Video File <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                required
                className="py-2"
              />
              {file && (
                <div className="mt-2 text-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}
              <Form.Text className="text-muted">
                Max file size: 800MB. Supported formats: MP4, AVI, MOV, WMV
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Subject <span className="text-danger">*</span></Form.Label>
              <Form.Select 
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                className="py-2"
              >
                {subjects.map((subject) => {
                  const count = videoCounts[subject.subject_id] || 0;
                  const remaining = MAX_VIDEOS_PER_SUBJECT - count;
                  return (
                    <option
                      key={subject.id}
                      value={subject.subject_id}
                      disabled={remaining <= 0}
                    >
                      {subject.subject_name} - {subject.degree} ({count}/{MAX_VIDEOS_PER_SUBJECT} videos)
                    </option>
                  );
                })}
              </Form.Select>
              {subjectId && (
                <div className="mt-2">
                  {(videoCounts[subjectId] || 0) >= MAX_VIDEOS_PER_SUBJECT ? (
                    <Badge bg="danger">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Maximum videos reached for this subject
                    </Badge>
                  ) : (
                    <Badge bg="info">
                      <i className="bi bi-info-circle me-1"></i>
                      {MAX_VIDEOS_PER_SUBJECT - (videoCounts[subjectId] || 0)} video slots remaining
                    </Badge>
                  )}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Video Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to JavaScript - Part 1"
                required
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Description <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn in this video..."
                required
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Sequence Number <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={sequenceIndex}
                readOnly
                className="py-2 bg-light"
                style={{ cursor: 'not-allowed' }}
              />
              <Form.Text className="text-muted">
                Auto-calculated based on existing videos. First video (sequence 1) is always free.
              </Form.Text>
            </Form.Group>

            <Alert variant="info" className="mb-4">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Note:</strong> Video pricing will be set by admin after review and approval.
            </Alert>

            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                id="scholar-terms-checkbox"
                checked={termsAccepted}
                onChange={() => setShowTermsModal(true)}
                label={
                  <span>
                    I agree to the{" "}
                    <span 
                      className="text-primary" 
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                    >
                      Scholar Terms and Agreement
                    </span>
                  </span>
                }
              />
            </Form.Group>

            <div className="d-grid">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                disabled={uploading || !termsAccepted}
                className="py-3 fw-semibold"
                style={{ borderRadius: '10px' }}
              >
                {uploading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Uploading... Please wait
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload me-2"></i>
                    Upload Video
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-muted mt-3 mb-0">
              <small>Your video will be reviewed before being published</small>
            </p>
          </Form>
        </Card.Body>
      </Card>

      {/* Scholar Terms Modal */}
      <ScholarTermsModal
        show={showTermsModal}
        onHide={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
      />
    </Container>
  );
}

export default VideoUploadPage;
