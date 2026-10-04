import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useAuth } from "../../context/temp";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LearnerAvatar, { AVATARS } from './components/LearnerAvatar';
import './learnerDashboard.css';

function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    bio: "",
    favoriteSubject: "",
    favoriteFood: "",
    hobbies: "",
    avatarId: "avatar_01",
    universityId: "",
    degreeProgramme: "",
  });
  const [universities, setUniversities] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [preferencesAvailable, setPreferencesAvailable] = useState(false);
  const [locationsError, setLocationsError] = useState('');
  const [programmesLoading, setProgrammesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isScholar, setIsScholar] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [charCounts, setCharCounts] = useState({
    bio: 0,
    favoriteSubject: 0,
    favoriteFood: 0,
    hobbies: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/users/profile`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        
        const profile = res.data;
        setPreferencesAvailable(['avatar_id', 'university_id', 'degree_programme'].every(key => Object.prototype.hasOwnProperty.call(profile, key)));
        setFormData({
          fname: profile.fname || "",
          lname: profile.lname || "",
          email: profile.email || "",
          bio: profile.bio || "",
          favoriteSubject: profile.favorite_subject || "",
          favoriteFood: profile.favorite_food || "",
          hobbies: profile.hobbies || "",
          avatarId: profile.avatar_id || 'avatar_01',
          universityId: profile.university_id ? String(profile.university_id) : '',
          degreeProgramme: profile.degree_programme || '', 
        });
        setCharCounts({
          bio: (profile.bio || "").length,
          favoriteSubject: (profile.favorite_subject || "").length,
          favoriteFood: (profile.favorite_food || "").length,
          hobbies: (profile.hobbies || "").length
        });
        setProfileLoaded(true);
        setIsScholar(profile.roles?.includes("Scholar"));
      } catch (err) {
        setMessage({ type: "danger", text: "Failed to load profile" });
      }
    };

    if (user?.token) {
      fetchProfile();
    }
  }, [user?.token]);

  useEffect(() => {
    let cancelled = false;
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/locations/universities?available=1`)
      .then(res => { if (!cancelled) setUniversities(res.data); })
      .catch(() => { if (!cancelled) setLocationsError('Universities could not be loaded. Please reload to try again.'); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProgrammes([]);
    if (!formData.universityId) { setProgrammesLoading(false); return; }
    setProgrammesLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/locations/programs/by-university/${formData.universityId}`)
      .then(res => { if (!cancelled) setProgrammes(res.data); })
      .catch(() => { if (!cancelled) setLocationsError('Degree programmes could not be loaded. Please reload to try again.'); })
      .finally(() => { if (!cancelled) setProgrammesLoading(false); });
    return () => { cancelled = true; };
  }, [formData.universityId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Update character counts
    if (['bio', 'favoriteSubject', 'favoriteFood', 'hobbies'].includes(name)) {
      setCharCounts(prev => ({ ...prev, [name]: value.length }));
    }
    
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [name]: null }));
    
    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = null;
    
    switch(name) {
      case 'fname':
      case 'lname':
        if (value.length < 2) error = 'Must be at least 2 characters';
        if (value.length > 50) error = 'Must be less than 50 characters';
        if (!/^[a-zA-Z\s]+$/.test(value) && value.length > 0) error = 'Only letters allowed';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length > 0) error = 'Invalid email format';
        break;
      case 'bio':
        if (value.length > 500) error = 'Cannot exceed 500 characters';
        break;
      case 'favoriteSubject':
      case 'favoriteFood':
        if (value.length > 100) error = 'Cannot exceed 100 characters';
        break;
      case 'hobbies':
        if (value.length > 300) error = 'Cannot exceed 300 characters';
        break;
    }
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for validation errors
    if (Object.values(validationErrors).some(error => error !== null)) {
      setMessage({ type: "danger", text: "Please fix validation errors before submitting" });
      return;
    }
    
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { avatarId, universityId, degreeProgramme, ...basicProfile } = formData;
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/users/profile`,
        preferencesAvailable ? formData : basicProfile,
        { 
          headers: { 
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json"
          } 
        }
      );

      setMessage({ type: "success", text: "Profile updated successfully! ✨" });
      
      // Update user context so name changes reflect immediately everywhere
      updateUser({
        fname: formData.fname,
        lname: formData.lname,
        email: formData.email,
      });
      
      
    } catch (err) {
      
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const errors = {};
        err.response.data.errors.forEach(error => {
          errors[error.path || error.param] = error.msg;
        });
        setValidationErrors(errors);
        setMessage({ type: "danger", text: "Please fix the highlighted errors" });
      } else {
        setMessage({ 
          type: "danger", 
          text: err.response?.data?.message || "Failed to update profile" 
        });
      }
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Container className="my-5 learner-profile" style={{ maxWidth: "800px" }}>
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white">
          <h3 className="mb-0">
            <i className="bi bi-person-circle me-2"></i>
            Edit Profile
          </h3>
        </Card.Header>
        <Card.Body className="p-4">
          {message.text && (
            <Alert variant={message.type} dismissible onClose={() => setMessage({ type: "", text: "" })}>
              {message.text}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {profileLoaded && !preferencesAvailable && <Alert variant="info">Avatar and study preferences are not enabled yet. Your current avatar will stay unchanged. You can still update your other profile details.</Alert>}
            <fieldset className="text-center mb-4" disabled={!profileLoaded || loading || !preferencesAvailable}>
              <legend className="h5 fw-bold">Choose Avatar</legend>
              <LearnerAvatar id={formData.avatarId} size={88} />
              <div className="avatar-options">
                {AVATARS.map(([id], index) => <button key={id} type="button" className="avatar-option" aria-label={`Avatar ${index + 1}`} aria-pressed={formData.avatarId === id} onClick={() => setFormData(previous => ({ ...previous, avatarId: id }))}><LearnerAvatar id={id} size={56} /></button>)}
              </div>
              <p className="small text-muted mb-0">Pick a look that feels like you.</p>
            </fieldset>

            <h5 className="fw-bold mb-3 text-primary">University &amp; Degree Programme</h5>
            {locationsError && <Alert variant="warning">{locationsError}</Alert>}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="profile-university">
                  <Form.Label>University</Form.Label>
                  <Form.Select value={formData.universityId} disabled={!profileLoaded || !preferencesAvailable || !universities.length} onChange={event => setFormData(previous => ({ ...previous, universityId: event.target.value, degreeProgramme: '' }))}>
                    <option value="">Choose your university</option>
                    {universities.map(item => <option key={item.id} value={item.id}>{item.name}{item.short_name ? ` (${item.short_name})` : ''}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="profile-programme">
                  <Form.Label>Degree Programme</Form.Label>
                  <Form.Select name="degreeProgramme" value={formData.degreeProgramme} onChange={handleChange} disabled={!preferencesAvailable || !formData.universityId || programmesLoading || !programmes.length}>
                    <option value="">{programmesLoading ? 'Loading programmes?' : 'Choose your programme'}</option>
                    {formData.degreeProgramme && !programmes.some(item => item.program === formData.degreeProgramme) && <option value={formData.degreeProgramme}>{formData.degreeProgramme}</option>}
                    {programmes.map(item => <option key={item.program} value={item.program}>{item.program}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <p className="small text-muted">We use your study details to help you discover relevant courses.</p>

            <hr className="my-4" />

            {/* Basic Information */}
            <h5 className="fw-bold mb-3 text-primary">Basic Information</h5>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="fname"
                    value={formData.fname}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.fname}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.fname}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="lname"
                    value={formData.lname}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.lname}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.lname}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!validationErrors.email}
                required
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <hr className="my-4" />

            {/* Personal Details */}
            <h5 className="fw-bold mb-3 text-primary">Personal Details</h5>
            
            <Form.Group className="mb-3">
              <Form.Label>
                Bio
                <span className="text-muted ms-2 small">({charCounts.bio}/500)</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                isInvalid={!!validationErrors.bio}
                maxLength={500}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.bio}
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Favorite Subject
                    <span className="text-muted ms-2 small">({charCounts.favoriteSubject}/100)</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="favoriteSubject"
                    value={formData.favoriteSubject}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics"
                    isInvalid={!!validationErrors.favoriteSubject}
                    maxLength={100}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.favoriteSubject}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Favorite Food
                    <span className="text-muted ms-2 small">({charCounts.favoriteFood}/100)</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="favoriteFood"
                    value={formData.favoriteFood}
                    onChange={handleChange}
                    placeholder="e.g., Pizza"
                    isInvalid={!!validationErrors.favoriteFood}
                    maxLength={100}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.favoriteFood}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>
                Hobbies
                <span className="text-muted ms-2 small">({charCounts.hobbies}/300)</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="hobbies"
                value={formData.hobbies}
                onChange={handleChange}
                placeholder="e.g., Reading, Gaming, Sports"
                isInvalid={!!validationErrors.hobbies}
                maxLength={300}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.hobbies}
              </Form.Control.Feedback>
            </Form.Group>



            <div className="d-flex flex-wrap gap-3 justify-content-between">
              <div className="d-flex flex-wrap gap-2">
                <Button 
                  variant="outline-primary"
                  onClick={() => navigate('/dashboard')}
                >
                  <i className="bi bi-house me-2"></i>
                  Learner Dashboard
                </Button>
                {isScholar && (
                  <Button 
                    variant="outline-success"
                    onClick={() => navigate('/scholar-dashboard')}
                  >
                    <i className="bi bi-mortarboard me-2"></i>
                    Scholar Dashboard
                  </Button>
                )}
              </div>
              
              <div className="d-flex flex-wrap gap-2">
                <Button 
                  variant="outline-secondary"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading || !profileLoaded || programmesLoading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EditProfile;
