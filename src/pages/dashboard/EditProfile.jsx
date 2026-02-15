import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col, Alert, Image } from "react-bootstrap";
import { useAuth } from "../../context/temp";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    bio: "",
    favoriteSubject: "",
    favoriteFood: "",
    hobbies: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
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
        setFormData({
          fname: profile.fname || "",
          lname: profile.lname || "",
          email: profile.email || "",
          bio: profile.bio || "",
          favoriteSubject: profile.favorite_subject || "",
          favoriteFood: profile.favorite_food || "",
          hobbies: profile.hobbies || "",
        });
        setCharCounts({
          bio: (profile.bio || "").length,
          favoriteSubject: (profile.favorite_subject || "").length,
          favoriteFood: (profile.favorite_food || "").length,
          hobbies: (profile.hobbies || "").length
        });
        setProfileImagePreview(profile.profile_image_url || null);
        setIsScholar(profile.roles?.includes("Scholar"));
      } catch (err) {
        console.error("Error fetching profile:", err);
        setMessage({ type: "danger", text: "Failed to load profile" });
      }
    };

    if (user?.token) {
      fetchProfile();
    }
  }, [user]);

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

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "warning", text: "Profile image must be less than 5MB" });
        return;
      }
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
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
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/users/profile`,
        data,
        { 
          headers: { 
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data"
          } 
        }
      );

      setMessage({ type: "success", text: "Profile updated successfully! ✨" });
      
      // Clear file input
      setProfileImage(null);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Error updating profile:", err);
      
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const errors = {};
        err.response.data.errors.forEach(error => {
          errors[error.param] = error.msg;
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
    }
  };

  return (
    <Container className="my-5" style={{ maxWidth: "800px" }}>
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
            {/* Profile Image Section */}
            <div className="text-center mb-4">
              <div className="mb-3">
                {profileImagePreview ? (
                  <Image 
                    src={profileImagePreview} 
                    roundedCircle 
                    width={120} 
                    height={120}
                    style={{ objectFit: 'cover', border: '4px solid #6366f1' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center"
                    style={{ width: '120px', height: '120px' }}
                  >
                    <i className="bi bi-person-circle fs-1 text-primary"></i>
                  </div>
                )}
              </div>
              <Form.Group>
                <Form.Label className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-camera me-2"></i>
                  Change Profile Picture
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    hidden
                  />
                </Form.Label>
                <Form.Text className="d-block text-muted mt-2">
                  JPG, PNG or GIF, max 5MB
                </Form.Text>
              </Form.Group>
            </div>

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



            <div className="d-flex gap-3 justify-content-between">
              <div className="d-flex gap-2">
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
              
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-secondary"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading}
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
