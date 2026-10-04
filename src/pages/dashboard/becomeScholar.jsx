import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../context/temp';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './dashboard.css'

function BecomeScholar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const api = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const [formData, setFormData] = useState({ countryId: '', universityId: '', degree: '', year: '' });
    const [countries, setCountries] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [degreePrograms, setDegreePrograms] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [loadingUniversities, setLoadingUniversities] = useState(false);
    const [locationRetry, setLocationRetry] = useState(0);
    const [status, setStatus] = useState(null);
    const [statusError, setStatusError] = useState(false);
    const [statusRetry, setStatusRetry] = useState(0);
    useEffect(() => {
        let active = true; setStatus(null); setStatusError(false);
        if (user?.token) axios.get(`${api}/scholar-profile/status`, {headers:{Authorization:`Bearer ${user.token}`}})
            .then(r => { if(active) setStatus(r.data); })
            .catch(() => { if(active) setStatusError(true); });
        return () => { active = false; };
    }, [api, user?.token, statusRetry]);
    useEffect(() => {
        axios.get(`${api}/locations/countries?available=1`).then(r => { setCountries(r.data); setLocationError(''); })
            .catch(() => setLocationError('Unable to load countries. Please try again.'));
    }, [api, locationRetry]);
    useEffect(() => {
        let active = true;
        setUniversities([]); setLoadingUniversities(Boolean(formData.countryId));
        if (formData.countryId) axios.get(`${api}/locations/universities/by-country/${formData.countryId}?available=1`)
            .then(r => { if (active) {setUniversities(r.data); setLocationError('');} })
            .catch(() => { if (active) setLocationError('Unable to load universities.'); }).finally(() => {if(active) setLoadingUniversities(false);});
        return () => { active = false; };
    }, [api, formData.countryId, locationRetry]);
    useEffect(() => {
        let active = true;
        setDegreePrograms([]);
        setLoadingPrograms(Boolean(formData.universityId));
        if (formData.universityId) axios.get(`${api}/locations/programs/by-university/${formData.universityId}`)
            .then(r => { if (active) {setDegreePrograms(r.data); setLocationError('');} })
            .catch(() => { if (active) setLocationError('Unable to load programmes.'); })
            .finally(() => { if (active) setLoadingPrograms(false); });
        return () => { active = false; };
    }, [api, formData.universityId, locationRetry]);
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(previous => ({ ...previous, [name]: value,
            ...(name === 'countryId' ? { universityId: '', degree: '' } : {}),
            ...(name === 'universityId' ? { degree: '' } : {}) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user || !user.token) {
            alert('Please login or create an account to submit your scholar application');
            navigate('/login');
            return;
        }


        setLoading(true);
        setError('');

        try {
            const submitData = formData;

            await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth/become-scholar`,
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );


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
            {user && <Link to={user.roles?.includes('Scholar') ? '/scholar-dashboard' : '/dashboard'} className="btn btn-outline-primary mb-3">Dashboard</Link>}
            <h1 className="fw-bold mb-4 text-center" style={{ fontSize: '2.5rem' }}>Become a UniClips Scholar</h1>

            <p className="text-secondary text-center fs-5 mb-5">
                Share your expertise, help your peers, and earn from your course sales.
            </p>

            <p className="text-center"><a href="#scholar-application">Jump to application</a></p>
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
                                    Earn 70% of the course price for the first 100 sales of each course, then 50% thereafter.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Card 2 - Track Your Earnings */}
                    <div className="col-md-4">
                        <Card className="border-0 shadow-sm rounded-4 p-4 h-100 text-center" 
                              style={{ 
                                background: 'linear-gradient(135deg, #e9e5ff 0%, #f3f0ff 100%)',
                                transition: 'transform 0.3s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <Card.Body>
                                <h2 className="fw-bold mb-3" style={{ color: '#6366f1', fontSize: '2rem' }}>Track Your Earnings</h2>
                                <Card.Text className="text-dark" style={{ fontSize: '1rem' }}>
                                    See your course sales and earnings from your Scholar dashboard.
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
                                    Earn from course sales while helping students succeed.
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
                                    Build your academic reputation, gain recognition, and become a trusted UniClips Scholar.
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
                        <Card.Body className="p-3 p-sm-5" id="scholar-application" style={{scrollMarginTop:'110px'}}>
                            <h3 className="fw-bold mb-2 text-center">Scholar Application Form</h3>
                            <p className="text-muted text-center mb-4">Fill in your details to start your journey as a UniClips Scholar</p>
                            
                            {locationError && <p role="alert">{locationError} <button type="button" className="btn btn-link" onClick={()=>setLocationRetry(n=>n+1)}>Try Again</button></p>}
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {!user && <p className="text-center">You need a UniClips learner account to apply as a Scholar. <Link to="/login">Login</Link> or <Link to="/register">Create Account</Link>.</p>}
                            {user && !status && !statusError && <p role="status">Checking your application...</p>}
                            {statusError && <p role="alert">Unable to check your application. <button type="button" className="btn btn-link" onClick={() => setStatusRetry(n=>n+1)}>Try Again</button></p>}
                            {status?.isScholar && <div role="status"><h4>{status.approved ? 'Your Scholar application is approved' : 'Your application is awaiting review'}</h4><p>{status.approved ? 'Course approval and content review still apply before publication.' : 'You already have a Scholar application. We will notify you after review.'}</p><Link to={status.approved ? '/scholar-dashboard' : '/dashboard'} className="btn btn-primary">{status.approved ? 'Scholar Dashboard' : 'Learner Dashboard'}</Link></div>}
                            {(!user || (status && !status.isScholar)) && <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="scholar-country" className="form-label fw-semibold">Country *</label>
                                    <select id="scholar-country" name="countryId" className="form-select py-2" value={formData.countryId} onChange={handleChange} required>
                                        <option value="">Select your country</option>
                                        {countries.map(country => <option key={country.id} value={country.id}>{country.name}</option>)}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="scholar-university" className="form-label fw-semibold">University *</label>
                                    <select id="scholar-university" name="universityId" className="form-select py-2" value={formData.universityId} onChange={handleChange} required disabled={loadingUniversities || !formData.countryId || !universities.length}>
                                        <option value="">{loadingUniversities ? 'Loading universities...' : 'Select your university'}</option>
                                        {universities.map(university => <option key={university.id} value={university.id}>{university.name}{university.short_name ? ` (${university.short_name})` : ''}</option>)}
                                    </select>
                                </div>

                                {/* Degree Program - Dropdown from subjects table */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold" htmlFor="scholar-degree">Degree Program <span className="text-danger">*</span></label>
                                    <select 
                                        id="scholar-degree" name="degree"
                                        className="form-select py-2" 
                                        value={formData.degree}
                                        onChange={handleChange}
                                        required
                                        disabled={loadingPrograms || !formData.universityId}
                                    >
                                        <option value="">
                                            {loadingPrograms ? 'Loading programs...' : 'Select your degree program'}
                                        </option>
                                        {degreePrograms.map((program, index) => (
                                            <option key={index} value={program.program}>
                                                {program.program}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="scholar-year" className="form-label fw-semibold">Expected Graduation Year <span className="text-danger">*</span></label>
                                    <input 
                                        type="number" 
                                        id="scholar-year" name="year"
                                        className="form-control py-2" 
                                        placeholder="e.g., 2027"
                                        min="2024"
                                        max="2035"
                                        value={formData.year}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>

                                

                                <div className="mb-4">
                                    <div className="alert alert-info">
                                        <i className="bi bi-info-circle me-2"></i>
                                        <strong>Note:</strong> After Scholar approval, your course application and uploaded content must also be reviewed before publication.
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
                                    <small>We aim to review your application within 2-4 business days</small>
                                </p>
                            </form>}
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default BecomeScholar;
