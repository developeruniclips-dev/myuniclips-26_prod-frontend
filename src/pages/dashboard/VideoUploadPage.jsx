// src/pages/dashboard/VideoUploadPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/temp";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Card, Form, Button, Spinner, Alert, Container, Badge } from "react-bootstrap";
import ScholarTermsModal from "../../components/terms/ScholarTermsModal";

import VideoMetadataFields, { metadataError } from './components/VideoMetadataFields';
import useCourseLimits from './components/useCourseLimits';
import './scholarDashboard.css';

function VideoUploadPage() {
  const { user } = useAuth();
  const limits = useCourseLimits();
  const MAX_VIDEOS_PER_SUBJECT = limits?.maxVideos;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sequenceIndex, setSequenceIndex] = useState("1");
  const [subjectId, setSubjectId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [videosLoaded, setVideosLoaded] = useState(false);
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
        setVideosLoaded(true);
        setMaxSequences(maxSequences);
        
        // Set initial sequence for the first subject
        const initialSubjectId = urlSubjectId || (approvedSubjects.length > 0 ? approvedSubjects[0].subject_id : null);
        if (initialSubjectId) {
          setSequenceIndex(String((maxSequences[initialSubjectId] || 0) + 1));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load your course content. Please refresh before uploading.');
      } finally {
        setLoadingSubjects(false);
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
    setFile(null);
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      // Use the same server-provided limit as backend validation
      if (!limits || selectedFile.size > limits.maxVideoBytes) {
        setError('File size must be no larger than 1 GB');
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

    if (!limits || !videosLoaded || (videoCounts[subjectId] || 0) >= limits.maxVideos) {
      setError('Upload limits or course content are unavailable, or this course is full. Please refresh.');
      return;
    }
    const textError = metadataError(title, description, limits);
    if (textError) { setError(textError); return; }
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
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos?subjectId=${encodeURIComponent(subjectId)}`,
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
      navigate(`/manage-course/${subjectId}`);
    } catch (err) {
      setUploading(false);
      const reference = err.response?.data?.uploadReference;
      const supportReference = typeof reference === 'string' && /^[0-9a-f-]{36}$/.test(reference) ? ` Upload reference: ${reference}.` : '';
      setError((err.response?.data?.message || "Upload failed. Please try again.") + supportReference);
    }
  };

  if (loadingSubjects) return <Container className="py-5 scholar-management"><Link to="/scholar-dashboard" className="btn btn-outline-primary mb-3">Scholar Dashboard</Link><p role="status">Loading your courses…</p></Container>;

  if (subjects.length === 0) {
    return (
      <Container className="py-5 scholar-management" style={{ maxWidth: "700px" }}>
        <Link to="/scholar-dashboard" className="btn btn-outline-primary mb-3">&larr; Scholar Dashboard</Link>
      {subjectId && <Link to={`/manage-course/${subjectId}`} className="btn btn-outline-primary mb-3 ms-2">Manage Course</Link>}
      {!limits && <Alert variant="warning">Loading upload limits. If this persists, refresh before uploading.</Alert>}
      <Card className="border-0 shadow-sm p-4">
          <Alert variant="warning">
            {error && <p role="alert">{error}</p>}
            <Alert.Heading>No Approved Subjects</Alert.Heading>
            <p>You need to have at least one approved subject before uploading videos.</p>
            <Button variant="primary" onClick={() => navigate("/create-course")}>
              Teach a New Course
            </Button>
          </Alert>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-5 scholar-management" style={{ maxWidth: "700px" }}>
      <Link to="/scholar-dashboard" className="btn btn-outline-primary mb-3">&larr; Scholar Dashboard</Link>
      {subjectId && <Link to={`/manage-course/${subjectId}`} className="btn btn-outline-primary mb-3 ms-2">Manage Course</Link>}
      {!limits && <Alert variant="warning">Unable to load upload limits yet. Please refresh before uploading.</Alert>}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3 p-sm-4">
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
                Max file size: 1 GB. Supported formats: MP4, AVI, MOV, MKV, WEBM
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
                  const count = videosLoaded ? (videoCounts[subject.subject_id] || 0) : null;
                  const remaining = limits && videosLoaded ? MAX_VIDEOS_PER_SUBJECT - count : 0;
                  return (
                    <option
                      key={subject.id}
                      value={subject.subject_id}
                      disabled={remaining <= 0}
                    >
                      {subject.subject_name} - {subject.degree} ({count ?? '...'}/{MAX_VIDEOS_PER_SUBJECT ?? '...'} videos)
                    </option>
                  );
                })}
              </Form.Select>
              {subjectId && limits && videosLoaded && (
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

            <VideoMetadataFields title={title} description={description} onTitleChange={setTitle} onDescriptionChange={setDescription} limits={limits} />

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
                Added after existing lessons. You can reorder lessons in Manage Course before approval. Lesson 1 is always free.
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
                disabled={uploading || !termsAccepted || !limits || !videosLoaded || !file || (videoCounts[subjectId] || 0) >= MAX_VIDEOS_PER_SUBJECT}
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
