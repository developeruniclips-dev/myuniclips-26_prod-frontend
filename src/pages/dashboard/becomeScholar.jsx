import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../context/temp';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './dashboard.css'

function BecomeScholar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        country: '',
        university: '',
        degree: '',
        year: ''
    });
    // TASK CARD FEATURE - Uncomment when ready to enable
    // const [taskCard, setTaskCard] = useState(null);
    // const [taskCardPreview, setTaskCardPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Cascading dropdown data
    const [countries, setCountries] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [degreePrograms, setDegreePrograms] = useState([]);
    
    // Loading states
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingUniversities, setLoadingUniversities] = useState(false);
    const [loadingPrograms, setLoadingPrograms] = useState(false);

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/locations/countries`
                );
                setCountries(response.data);
            } catch (err) {
                console.error('Error fetching countries:', err);
            } finally {
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch universities when country changes
    useEffect(() => {
        if (formData.country) {
            setLoadingUniversities(true);
            setUniversities([]);
            setFormData(prev => ({ ...prev, university: '', degree: '' }));
            
            const fetchUniversities = async () => {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/locations/universities/by-country/${formData.country}`
                    );
                    setUniversities(response.data);
                } catch (err) {
                    console.error('Error fetching universities:', err);
                } finally {
                    setLoadingUniversities(false);
                }
            };
            fetchUniversities();
        } else {
            setUniversities([]);
        }
    }, [formData.country]);

    // Fetch degree programs when university changes
    useEffect(() => {
        if (formData.university) {
            setLoadingPrograms(true);
            setFormData(prev => ({ ...prev, degree: '' }));
            
            const fetchPrograms = async () => {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/locations/programs/by-university/${formData.university}`
                    );
                    setDegreePrograms(response.data);
                } catch (err) {
                    console.error('Error fetching degree programs:', err);
                } finally {
                    setLoadingPrograms(false);
                }
            };
            fetchPrograms();
        } else {
            setDegreePrograms([]);
        }
    }, [formData.university]);

    // Don't redirect if not logged in - allow them to see the page
    // They'll be prompted to login when they try to submit

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // TASK CARD FEATURE - Uncomment when ready to enable
    // const handleTaskCardChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         // Validate file type
    //         const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    //         if (!allowedTypes.includes(file.type)) {
    //             setError('Please upload a valid image (JPG, PNG) or PDF file');
    //             return;
    //         }
    //         // Validate file size (max 5MB)
    //         if (file.size > 5 * 1024 * 1024) {
    //             setError('File size must be less than 5MB');
    //             return;
    //         }
    //         setTaskCard(file);
    //         // Create preview for images
    //         if (file.type.startsWith('image/')) {
    //             setTaskCardPreview(URL.createObjectURL(file));
    //         } else {
    //             setTaskCardPreview(null);
    //         }
    //         setError('');
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if user is logged in when they try to submit
        if (!user || !user.token) {
            alert('Please login or create an account to submit your scholar application');
            navigate('/login');
            return;
        }

        // TASK CARD FEATURE - Uncomment when ready to enable
        // if (!taskCard) {
        //     setError('Please upload your student ID card (task card) to verify your student status');
        //     return;
        // }

        setLoading(true);
        setError('');

        try {
            // Find the selected university name from the universities array
            const selectedUniversity = universities.find(u => u.id.toString() === formData.university);
            const universityName = selectedUniversity ? selectedUniversity.name : formData.university;

            // Submit with university name (not ID) for backwards compatibility
            const submitData = {
                university: universityName,
                degree: formData.degree,
                year: formData.year
            };

            await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth/become-scholar`,
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            // TASK CARD FEATURE - Uncomment when ready to enable FormData submission
            // const submitFormData = new FormData();
            // submitFormData.append('university', universityName);
            // submitFormData.append('degree', formData.degree);
            // submitFormData.append('year', formData.year);
            // submitFormData.append('taskCard', taskCard);
            // await axios.post(
            //     `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth/become-scholar`,
            //     submitFormData,
            //     {
            //         headers: {
            //             Authorization: `Bearer ${user.token}`,
            //             'Content-Type': 'multipart/form-data'
            //         }
            //     }
            // );

            alert('Application submitted successfully! We will review your application and notify you.');
            navigate('/dashboard');
        } catch (err) {
            console.error('Error submitting application:', err);
            setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
            setLoading(false);
        }
    };
    return (
        <div className="container py-5">
            <h1 className="fw-bold mb-4 text-center" style={{ fontSize: '2.5rem' }}>Become a UniClips Scholar</h1>

            <p className="text-secondary text-center fs-5 mb-5">
                Share your expertise, help your peers, and earn significant revenue from your course sales.
            </p>

            <Container className="py-4">
                <Row className="g-4 justify-content-center">

                    {/* Card 1 - 70% Share */}
                    <div className="col-md-4">
                        <Card className="border-0 shadow-sm rounded-4 p-4 h-100 text-center" 
                              style={{ 
                                background: 'linear-gradient(135deg, #e9e5ff 0%, #f3f0ff 100%)',
                                transition: 'transform 0.3s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <Card.Body>
                                <h2 className="fw-bold mb-3" style={{ color: '#6366f1', fontSize: '2rem' }}>70% Share</h2>
                                <Card.Text className="text-dark" style={{ fontSize: '1rem' }}>
                                    Revenue share on your first 100 sales.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Card 2 - Fast Payouts */}
                    <div className="col-md-4">
                        <Card className="border-0 shadow-sm rounded-4 p-4 h-100 text-center" 
                              style={{ 
                                background: 'linear-gradient(135deg, #e9e5ff 0%, #f3f0ff 100%)',
                                transition: 'transform 0.3s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <Card.Body>
                                <h2 className="fw-bold mb-3" style={{ color: '#6366f1', fontSize: '2rem' }}>Fast Payouts</h2>
                                <Card.Text className="text-dark" style={{ fontSize: '1rem' }}>
                                    Track and receive your earnings monthly.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Card 3 - Expert Visibility */}
                    <div className="col-md-4">
                        <Card className="border-0 shadow-sm rounded-4 p-4 h-100 text-center" 
                              style={{ 
                                background: 'linear-gradient(135deg, #e9e5ff 0%, #f3f0ff 100%)',
                                transition: 'transform 0.3s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <Card.Body>
                                <h2 className="fw-bold mb-3" style={{ color: '#6366f1', fontSize: '2rem' }}>Expert Visibility</h2>
                                <Card.Text className="text-dark" style={{ fontSize: '1rem' }}>
                                    Build your profile as an academic expert.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>

                </Row>
            </Container>

            <Container className="py-5">
                <Row className="g-4 justify-content-center">

                    {/* Card 1 */}
                    <div className="col-md-4">
                        <Card className="border-0 shadow-sm rounded-4 p-4 h-100 gradient-card-1 hover-card">
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="p-3 rounded-4 icon-soft-bg-1">
                                        <i className="bi bi-mortarboard-fill fs-3 text-primary-emphasis"></i>
                                    </div>
                                </div>
                                <Card.Title className="fw-bold text-primary-emphasis">Share Your Knowledge</Card.Title>
                                <Card.Text className="text-dark opacity-75">
                                    Help students by sharing your expertise and high-quality course materials.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Card 2 */}
                    <div className="col-md-4">
                        <Card className="border-0 shadow-sm rounded-4 p-4 h-100 gradient-card-2 hover-card">
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="p-3 rounded-4 icon-soft-bg-2">
                                        <i className="bi bi-cash-stack fs-3 text-success-emphasis"></i>
                                    </div>
                                </div>
                                <Card.Title className="fw-bold text-success-emphasis">Earn While Helping</Card.Title>
                                <Card.Text className="text-dark opacity-75">
                                    Generate consistent revenue from your course sales and uploaded materials.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Card 3 */}
                    <div className="col-md-4">
                        <Card className="border-0 shadow-sm rounded-4 p-4 h-100 gradient-card-3 hover-card">
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="p-3 rounded-4 icon-soft-bg-3">
                                        <i className="bi bi-people-fill fs-3 text-warning-emphasis"></i>
                                    </div>
                                </div>
                                <Card.Title className="fw-bold text-warning-emphasis">Grow Your Impact</Card.Title>
                                <Card.Text className="text-dark opacity-75">
                                    Build a following, gain recognition, and become a trusted UniClips scholar.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>

                </Row>
            </Container>

            {/* Application Form */}
            <div className="row justify-content-center mt-5">
                <div className="col-md-8">
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-5">
                            <h3 className="fw-bold mb-2 text-center">Scholar Application Form</h3>
                            <p className="text-muted text-center mb-4">Fill in your details to start your journey as a UniClips Scholar</p>
                            
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Country Dropdown */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Country <span className="text-danger">*</span></label>
                                    <select 
                                        name="country"
                                        className="form-select py-2" 
                                        value={formData.country}
                                        onChange={handleChange}
                                        required
                                        disabled={loadingCountries}
                                    >
                                        <option value="">
                                            {loadingCountries ? 'Loading countries...' : 'Select your country'}
                                        </option>
                                        {countries.map((country) => (
                                            <option key={country.id} value={country.id}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* University Dropdown - depends on Country */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">University <span className="text-danger">*</span></label>
                                    <select 
                                        name="university"
                                        className="form-select py-2" 
                                        value={formData.university}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.country || loadingUniversities}
                                    >
                                        <option value="">
                                            {!formData.country 
                                                ? 'Select a country first' 
                                                : loadingUniversities 
                                                    ? 'Loading universities...' 
                                                    : 'Select your university'}
                                        </option>
                                        {universities.map((uni) => (
                                            <option key={uni.id} value={uni.id}>
                                                {uni.name} {uni.short_name ? `(${uni.short_name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.country && universities.length === 0 && !loadingUniversities && (
                                        <small className="text-muted">
                                            No universities listed for this country yet. Please contact admin if your university is missing.
                                        </small>
                                    )}
                                </div>

                                {/* Degree Program Dropdown - depends on University */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Degree Program <span className="text-danger">*</span></label>
                                    <select 
                                        name="degree"
                                        className="form-select py-2" 
                                        value={formData.degree}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.university || loadingPrograms}
                                    >
                                        <option value="">
                                            {!formData.university 
                                                ? 'Select a university first' 
                                                : loadingPrograms 
                                                    ? 'Loading programs...' 
                                                    : 'Select your degree program'}
                                        </option>
                                        {degreePrograms.map((program, index) => (
                                            <option key={index} value={program.program}>
                                                {program.program}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Expected Graduation Year <span className="text-danger">*</span></label>
                                    <input 
                                        type="number" 
                                        name="year"
                                        className="form-control py-2" 
                                        placeholder="e.g., 2027"
                                        min="2024"
                                        max="2035"
                                        value={formData.year}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>

                                {/* TASK CARD FEATURE - Uncomment when ready to enable
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Student ID Card (Task Card) <span className="text-danger">*</span>
                                    </label>
                                    <p className="text-muted small mb-2">
                                        Upload a photo of your student ID to verify your student status
                                    </p>
                                    <div 
                                        className="border border-2 border-dashed rounded-3 p-4 text-center"
                                        style={{ 
                                            borderColor: taskCard ? '#10b981' : '#dee2e6',
                                            backgroundColor: taskCard ? '#f0fdf4' : '#f8f9fa',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => document.getElementById('taskCardInput').click()}
                                    >
                                        <input 
                                            type="file" 
                                            id="taskCardInput"
                                            accept="image/*,.pdf"
                                            onChange={handleTaskCardChange}
                                            style={{ display: 'none' }}
                                        />
                                        {taskCardPreview ? (
                                            <div>
                                                <img 
                                                    src={taskCardPreview} 
                                                    alt="Task Card Preview" 
                                                    style={{ maxHeight: '150px', borderRadius: '8px' }}
                                                />
                                                <p className="text-success mt-2 mb-0">
                                                    <i className="bi bi-check-circle me-1"></i>
                                                    {taskCard.name}
                                                </p>
                                            </div>
                                        ) : taskCard ? (
                                            <div>
                                                <i className="bi bi-file-earmark-pdf text-danger fs-1"></i>
                                                <p className="text-success mt-2 mb-0">
                                                    <i className="bi bi-check-circle me-1"></i>
                                                    {taskCard.name}
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <i className="bi bi-cloud-arrow-up text-primary fs-1"></i>
                                                <p className="mb-1 mt-2">
                                                    <strong>Click to upload</strong> your student ID
                                                </p>
                                                <p className="text-muted small mb-0">
                                                    JPG, PNG or PDF (max 5MB)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                */}

                                <div className="mb-4">
                                    <div className="alert alert-info">
                                        <i className="bi bi-info-circle me-2"></i>
                                        <strong>Note:</strong> After submitting this application, an admin will review it. Once approved, you'll be able to select subjects you want to teach and upload course videos.
                                    </div>
                                </div>

                                <div className="d-grid">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary btn-lg py-3 fw-semibold"
                                        style={{ borderRadius: '10px' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Application 🚀'}
                                    </button>
                                </div>

                                <p className="text-center text-muted mt-3 mb-0">
                                    <small>We'll review your application within 2-3 business days</small>
                                </p>
                            </form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default BecomeScholar;