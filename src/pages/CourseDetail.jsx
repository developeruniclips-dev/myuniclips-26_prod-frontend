// src/pages/CourseDetail.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/temp";

// Default bundle price (used as fallback)
const DEFAULT_BUNDLE_PRICE = 6.00;

// Helper function to extract Vimeo video ID from URL
const getVimeoId = (url) => {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};

// Helper function to get Vimeo thumbnail URL
const getVimeoThumbnail = (videoId) => {
  return `https://vumbnail.com/${videoId}.jpg`;
};

// Checkout Component for Subject Bundle - Uses Stripe Checkout Session
function BundleCheckoutForm({ subjectId, scholarId, subjectName, bundlePrice, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Create Stripe Checkout Session
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/purchases/create-checkout-session`,
        { subjectId, scholarId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to create checkout session");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <Card.Body className="p-4">
        <div className="text-center mb-4">
          <div className="mb-3">
            <i className="bi bi-collection-play-fill text-primary" style={{ fontSize: '3rem' }}></i>
          </div>
          <h4 className="fw-bold mb-2">Unlock Full Course</h4>
          <p className="text-muted mb-0">{subjectName}</p>
        </div>
        
        <div className="bg-light rounded p-3 mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <span>Course Bundle Price</span>
            <span className="fs-4 fw-bold text-success">€{bundlePrice.toFixed(2)}</span>
          </div>
          <small className="text-muted d-block mt-2">
            <i className="bi bi-check-circle-fill text-success me-1"></i>
            Access to all videos in this course
          </small>
          <small className="text-muted d-block">
            <i className="bi bi-check-circle-fill text-success me-1"></i>
            Lifetime access, no expiration
          </small>
          <small className="text-muted d-block">
            <i className="bi bi-check-circle-fill text-success me-1"></i>
            Secure payment via Stripe
          </small>
        </div>

        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        <div className="d-grid gap-2">
          <Button 
            variant="success" 
            size="lg" 
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Redirecting to checkout...
              </>
            ) : (
              <>
                <i className="bi bi-credit-card me-2"></i>
                Proceed to Checkout - €{bundlePrice.toFixed(2)}
              </>
            )}
          </Button>
          <Button variant="outline-secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

function CourseDetail() {
  const { subjectId, scholarId: urlScholarId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [scholarInfo, setScholarInfo] = useState(null);
  const [hasPurchasedBundle, setHasPurchasedBundle] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inLibrary, setInLibrary] = useState(false);
  const [addingToLibrary, setAddingToLibrary] = useState(false);
  const [bundlePrice, setBundlePrice] = useState(DEFAULT_BUNDLE_PRICE);
  const [playingVideo, setPlayingVideo] = useState(null); // Video playing in-page
  const [savedProgress, setSavedProgress] = useState(0);
  const [scholarId, setScholarId] = useState(urlScholarId); // Track actual scholarId
  const [paymentMessage, setPaymentMessage] = useState(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const hasSeekRef = useRef(false); // Track if we've already seeked to saved position

  // Handle Stripe Checkout return
  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    
    if (payment === 'success' && sessionId && user) {
      // Confirm the purchase with our backend
      const confirmPurchase = async () => {
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/purchases/checkout-success`,
            { sessionId },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          setHasPurchasedBundle(true);
          setPaymentMessage({ type: 'success', text: '🎉 Payment successful! You now have access to all videos in this course.' });
          // Clear URL params
          navigate(`/course/${subjectId}/${urlScholarId}`, { replace: true });
        } catch (err) {
          console.error('Error confirming purchase:', err);
          setPaymentMessage({ type: 'danger', text: 'Payment was received but there was an issue. Please contact support.' });
        }
      };
      confirmPurchase();
    } else if (payment === 'cancelled') {
      setPaymentMessage({ type: 'warning', text: 'Payment was cancelled. You can try again when ready.' });
      navigate(`/course/${subjectId}/${urlScholarId}`, { replace: true });
    }
  }, [searchParams, user, subjectId, urlScholarId, navigate]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch all videos
        const videosRes = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/all-videos`
        );
        
        const allVideos = videosRes.data.videos || [];
        
        // Filter videos for this subject and scholar (if scholarId provided)
        let subjectVideos = allVideos.filter(
          v => v.subject_id === parseInt(subjectId) && v.approved === 1
        );
        
        // If scholarId is provided, filter by scholar too
        if (urlScholarId) {
          subjectVideos = subjectVideos.filter(
            v => v.scholar_user_id === parseInt(urlScholarId)
          );
        }
        
        subjectVideos.sort((a, b) => a.sequence_index - b.sequence_index);
        
        setVideos(subjectVideos);

        if (subjectVideos.length > 0) {
          const firstVideo = subjectVideos[0];
          
          // If no scholarId in URL, redirect to the proper URL with scholarId
          if (!urlScholarId) {
            navigate(`/course/${subjectId}/${firstVideo.scholar_user_id}`, { replace: true });
            return;
          }
          
          // Set the scholarId state
          setScholarId(firstVideo.scholar_user_id);
          
          // Get bundle price from the video data (comes from subjects table)
          const price = firstVideo.bundle_price ? parseFloat(firstVideo.bundle_price) : DEFAULT_BUNDLE_PRICE;
          setBundlePrice(price);
          
          setCourse({
            subject_id: firstVideo.subject_id,
            subject_name: firstVideo.subject_name,
            degree_programme: firstVideo.degree_programme,
            description: firstVideo.description,
            bundle_price: price,
          });
          
          setScholarInfo({
            id: firstVideo.scholar_user_id,
            fname: firstVideo.scholar_fname,
            lname: firstVideo.scholar_lname,
            university: firstVideo.scholar_university || "Not specified",
            degree: firstVideo.scholar_degree || "Not specified",
          });
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [subjectId, urlScholarId, navigate]);

  useEffect(() => {
    if (!user || !scholarId) return;
    
    // Check if user has purchased this subject bundle
    const checkBundlePurchase = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/purchases/subject/check`,
          { 
            params: { subjectId, scholarId },
            headers: { Authorization: `Bearer ${user.token}` } 
          }
        );
        setHasPurchasedBundle(res.data.hasPurchased);
      } catch (err) {
        console.error("Error checking bundle purchase:", err);
      }
    };
    checkBundlePurchase();

    // Check if course is in library
    const checkLibrary = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/check`,
          { 
            params: { subjectId, scholarId },
            headers: { Authorization: `Bearer ${user.token}` } 
          }
        );
        setInLibrary(res.data.inLibrary);
      } catch (err) {
        console.error("Error checking library:", err);
      }
    };
    checkLibrary();
  }, [user, subjectId, scholarId]);

  // Load saved progress when video changes
  useEffect(() => {
    if (!user || !playingVideo) {
      setSavedProgress(0);
      return;
    }
    
    const loadProgress = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/video-progress`,
          { 
            params: { videoId: playingVideo.id },
            headers: { Authorization: `Bearer ${user.token}` } 
          }
        );
        if (res.data.progressSeconds > 0) {
          setSavedProgress(res.data.progressSeconds);
        } else {
          setSavedProgress(0);
        }
      } catch (err) {
        console.error("Error loading progress:", err);
        setSavedProgress(0);
      }
    };
    
    loadProgress();
  }, [user, playingVideo]);

  // Reset seek flag when video changes
  useEffect(() => {
    hasSeekRef.current = false;
  }, [playingVideo]);

  // Seek to saved progress when it loads
  useEffect(() => {
    if (playerRef.current && savedProgress > 0 && !hasSeekRef.current) {
      playerRef.current.setCurrentTime(savedProgress).catch(console.error);
      hasSeekRef.current = true;
    }
  }, [savedProgress]);

  // Initialize Vimeo Player and track progress
  useEffect(() => {
    if (!user || !playingVideo || !iframeRef.current) return;

    const initializePlayer = () => {
      if (window.Vimeo && iframeRef.current) {
        const player = new window.Vimeo.Player(iframeRef.current);
        playerRef.current = player;

        // Save progress every 10 seconds while playing
        player.on('play', () => {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = setInterval(async () => {
            try {
              const currentTime = await player.getCurrentTime();
              if (user && playingVideo) {
                await axios.post(
                  `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/save-progress`,
                  { videoId: playingVideo.id, progressSeconds: Math.floor(currentTime) },
                  { headers: { Authorization: `Bearer ${user.token}` } }
                );
              }
            } catch (err) {
              console.error("Error saving progress:", err);
            }
          }, 10000);
        });

        // Save progress on pause
        player.on('pause', async () => {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          try {
            const currentTime = await player.getCurrentTime();
            if (user && playingVideo) {
              await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/save-progress`,
                { videoId: playingVideo.id, progressSeconds: Math.floor(currentTime) },
                { headers: { Authorization: `Bearer ${user.token}` } }
              );
            }
          } catch (err) {
            console.error("Error saving progress:", err);
          }
        });

        // Mark as watched when video ends
        player.on('ended', async () => {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/mark-watched`,
              { videoId: playingVideo.id },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
          } catch (err) {
            console.error("Error marking video as watched:", err);
          }
        });
      }
    };

    // Load Vimeo Player API
    if (!window.Vimeo) {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      script.onload = initializePlayer;
      document.body.appendChild(script);
    } else {
      initializePlayer();
    }

    // Cleanup
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (playerRef.current) {
        const currentVideoId = playingVideo?.id;
        playerRef.current.getCurrentTime().then(time => {
          if (user && currentVideoId) {
            axios.post(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/save-progress`,
              { videoId: currentVideoId, progressSeconds: Math.floor(time) },
              { headers: { Authorization: `Bearer ${user.token}` } }
            ).catch(() => {});
          }
        }).catch(() => {});
        playerRef.current = null;
      }
    };
  }, [user, playingVideo]);

  const handleAddToLibrary = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAddingToLibrary(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/add`,
        { subjectId: parseInt(subjectId), scholarId: parseInt(scholarId) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setInLibrary(true);
    } catch (err) {
      console.error("Error adding to library:", err);
    } finally {
      setAddingToLibrary(false);
    }
  };

  const handleRemoveFromLibrary = async () => {
    setAddingToLibrary(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/remove`,
        { subjectId: parseInt(subjectId), scholarId: parseInt(scholarId) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setInLibrary(false);
    } catch (err) {
      console.error("Error removing from library:", err);
    } finally {
      setAddingToLibrary(false);
    }
  };

  const handlePurchaseSuccess = () => {
    setShowCheckout(false);
    setHasPurchasedBundle(true);
    // Start playing the first video in-page
    if (videos.length > 0) {
      setPlayingVideo(videos[0]);
    }
  };

  // Can watch if: first video (free) OR has purchased the bundle
  const canWatchVideo = (video, index) => {
    return index === 0 || hasPurchasedBundle;
  };

  const handleVideoClick = (video, index) => {
    if (canWatchVideo(video, index)) {
      // Play video in-page instead of navigating
      setPlayingVideo(video);
    } else if (!user) {
      navigate('/login');
    } else {
      // Show checkout for the bundle
      setShowCheckout(true);
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!course || videos.length === 0) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          <h5>Course Not Found</h5>
          <p>This course doesn't exist or has no available videos.</p>
          <Link to="/all-videos">
            <Button variant="primary">Browse All Courses</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  const totalVideos = videos.length;
  const freeVideos = 1; // First video is always free
  const paidVideos = totalVideos - freeVideos;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Payment Status Message */}
      {paymentMessage && (
        <Alert 
          variant={paymentMessage.type} 
          className="mb-0 text-center rounded-0"
          dismissible
          onClose={() => setPaymentMessage(null)}
        >
          {paymentMessage.text}
        </Alert>
      )}
      
      {/* Course Hero Section */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          padding: '60px 0',
          color: 'white'
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <Badge bg="light" text="dark" className="mb-3 px-3 py-2">
                {course.degree_programme || 'Course'}
              </Badge>
              <h1 className="display-5 fw-bold mb-3">{course.subject_name}</h1>
              <p className="fs-5 opacity-90 mb-4">
                {course.description || 'Learn from expert scholars with comprehensive video lessons.'}
              </p>
              
              {/* Scholar Info */}
              <div className="d-flex align-items-center mb-4">
                <div 
                  className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-3"
                  style={{ width: '60px', height: '60px', fontSize: '1.5rem', fontWeight: 'bold' }}
                >
                  {scholarInfo?.fname?.[0]}{scholarInfo?.lname?.[0]}
                </div>
                <div>
                  <h5 className="mb-0">{scholarInfo?.fname} {scholarInfo?.lname}</h5>
                  <small className="opacity-75">
                    <i className="bi bi-mortarboard me-1"></i>
                    {scholarInfo?.degree} • {scholarInfo?.university}
                  </small>
                </div>
              </div>

              {/* Stats */}
              <div className="d-flex gap-4 flex-wrap">
                <div>
                  <i className="bi bi-play-circle me-2"></i>
                  <strong>{totalVideos}</strong> Videos
                </div>
                <div>
                  <i className="bi bi-gift me-2"></i>
                  <strong>1st Video</strong> Free
                </div>
                <div>
                  <i className="bi bi-currency-euro me-2"></i>
                  <strong>€{bundlePrice.toFixed(2)}</strong> Full Course
                </div>
              </div>
            </Col>
            
            <Col lg={4} className="mt-4 mt-lg-0">
              {/* Preview Card */}
              <Card className="border-0 shadow-lg">
                <div 
                  className="position-relative"
                  style={{ 
                    height: '180px', 
                    borderRadius: '8px 8px 0 0',
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src={getVimeoThumbnail(getVimeoId(videos[0]?.video_url))}
                    alt={videos[0]?.title || 'Course Preview'}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';
                    }}
                  />
                  <div 
                    className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ top: 0, left: 0, background: 'rgba(0,0,0,0.3)' }}
                  >
                    <i className="bi bi-play-circle-fill text-white" style={{ fontSize: '4rem', opacity: 0.9 }}></i>
                  </div>
                  <Badge bg="success" className="position-absolute top-0 end-0 m-3">
                    First Video FREE
                  </Badge>
                </div>
                <Card.Body className="p-4">
                  {/* Show different buttons based on purchase status */}
                  {hasPurchasedBundle ? (
                    <>
                      <div className="text-center mb-3">
                        <Badge bg="success" className="px-3 py-2">
                          <i className="bi bi-check-circle-fill me-2"></i>
                          Course Purchased
                        </Badge>
                      </div>
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-100 mb-2"
                        onClick={() => handleVideoClick(videos[0], 0)}
                      >
                        <i className="bi bi-play-fill me-2"></i>
                        Continue Learning
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline-primary" 
                        size="lg" 
                        className="w-100 mb-2"
                        onClick={() => handleVideoClick(videos[0], 0)}
                      >
                        <i className="bi bi-play-fill me-2"></i>
                        Watch Free Preview
                      </Button>
                      {user ? (
                        <Button 
                          variant="success" 
                          size="lg" 
                          className="w-100 mb-2"
                          onClick={() => setShowCheckout(true)}
                        >
                          <i className="bi bi-unlock-fill me-2"></i>
                          Unlock Full Course - €{bundlePrice.toFixed(2)}
                        </Button>
                      ) : (
                        <Button 
                          variant="success" 
                          size="lg" 
                          className="w-100 mb-2"
                          onClick={() => navigate('/login')}
                        >
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Login to Purchase
                        </Button>
                      )}
                    </>
                  )}
                  
                  {/* Add to Library Button */}
                  {user ? (
                    inLibrary ? (
                      <Button 
                        variant="outline-success" 
                        className="w-100 mb-3"
                        onClick={handleRemoveFromLibrary}
                        disabled={addingToLibrary}
                      >
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {addingToLibrary ? 'Updating...' : 'In Your Library'}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline-primary" 
                        className="w-100 mb-3"
                        onClick={handleAddToLibrary}
                        disabled={addingToLibrary}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        {addingToLibrary ? 'Adding...' : 'Add to Library'}
                      </Button>
                    )
                  ) : (
                    <Button 
                      variant="outline-primary" 
                      className="w-100 mb-3"
                      onClick={() => navigate('/login')}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Login to Add to Library
                    </Button>
                  )}
                  
                  <p className="text-muted text-center mb-0 small">
                    <i className="bi bi-shield-check me-1"></i>
                    First video free • €{bundlePrice.toFixed(2)} for full access
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Course Content */}
      <Container className="py-5">
        <Row>
          <Col lg={8}>
            {/* In-Page Video Player */}
            {playingVideo && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-primary text-white py-3 d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-play-circle-fill me-2"></i>
                    <strong>Now Playing:</strong> {playingVideo.title}
                    {savedProgress > 0 && (
                      <Badge bg="light" text="dark" className="ms-2">
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Resuming from {Math.floor(savedProgress / 60)}:{String(Math.floor(savedProgress % 60)).padStart(2, '0')}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="link" 
                    className="text-white p-0" 
                    onClick={() => setPlayingVideo(null)}
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                </Card.Header>
                <Card.Body className="p-0">
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe
                      ref={iframeRef}
                      src={`https://player.vimeo.com/video/${getVimeoId(playingVideo.video_url)}?autoplay=1`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                      allow="autoplay; fullscreen; picture-in-picture"
                      title={playingVideo.title}
                    />
                  </div>
                </Card.Body>
              </Card>
            )}

            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-0 py-3">
                <h4 className="mb-0">
                  <i className="bi bi-collection-play me-2 text-primary"></i>
                  Course Videos ({totalVideos})
                </h4>
              </Card.Header>
              <ListGroup variant="flush">
                {videos.map((video, index) => {
                  const canWatch = canWatchVideo(video, index);
                  const isFirstVideo = index === 0;
                  const isPlaying = playingVideo && playingVideo.id === video.id;
                  
                  return (
                    <ListGroup.Item 
                      key={video.id}
                      className={`d-flex align-items-center py-3 px-4 ${isPlaying ? 'bg-primary bg-opacity-10 border-primary' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleVideoClick(video, index)}
                    >
                      <div 
                        className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${isPlaying ? 'bg-success' : canWatch ? 'bg-primary' : 'bg-secondary'}`}
                        style={{ width: '40px', height: '40px', minWidth: '40px' }}
                      >
                        {isPlaying ? (
                          <i className="bi bi-volume-up-fill text-white"></i>
                        ) : canWatch ? (
                          <i className="bi bi-play-fill text-white"></i>
                        ) : (
                          <i className="bi bi-lock-fill text-white"></i>
                        )}
                      </div>
                      
                      <div className="flex-grow-1">
                        <h6 className="mb-1">
                          {index + 1}. {video.title}
                        </h6>
                        <small className="text-muted">
                          {isFirstVideo ? (
                            <Badge bg="success" className="me-2">FREE PREVIEW</Badge>
                          ) : hasPurchasedBundle ? (
                            <Badge bg="info" className="me-2">UNLOCKED</Badge>
                          ) : (
                            <Badge bg="secondary" className="me-2">
                              <i className="bi bi-lock-fill me-1"></i>
                              Requires Bundle
                            </Badge>
                          )}
                        </small>
                      </div>
                      
                      <Button 
                        variant={isPlaying ? 'success' : canWatch ? 'primary' : 'outline-primary'} 
                        size="sm"
                      >
                        {isPlaying ? (
                          <>
                            <i className="bi bi-volume-up-fill me-1"></i>
                            Playing
                          </>
                        ) : canWatch ? 'Watch' : (
                          <>
                            <i className="bi bi-unlock-fill me-1"></i>
                            Unlock
                          </>
                        )}
                      </Button>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Scholar Card */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="text-center p-4">
                <div 
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    fontSize: '2.5rem',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {scholarInfo?.fname?.[0]}{scholarInfo?.lname?.[0]}
                </div>
                <h5 className="mb-1">{scholarInfo?.fname} {scholarInfo?.lname}</h5>
                <p className="text-muted mb-3">Expert Scholar</p>
                
                <div className="text-start bg-light rounded p-3">
                  <div className="mb-2">
                    <small className="text-muted">
                      <i className="bi bi-building me-2"></i>University
                    </small>
                    <p className="mb-0 fw-semibold">{scholarInfo?.university}</p>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      <i className="bi bi-mortarboard me-2"></i>Degree Programme
                    </small>
                    <p className="mb-0 fw-semibold">{course?.degree_programme || 'Not specified'}</p>
                  </div>
                  <div>
                    <small className="text-muted">
                      <i className="bi bi-collection-play me-2"></i>Videos in this Course
                    </small>
                    <p className="mb-0 fw-semibold">{totalVideos} Videos</p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Course Info */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h6 className="mb-3">
                  <i className="bi bi-info-circle me-2 text-primary"></i>
                  Course Includes
                </h6>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    {totalVideos} on-demand video lessons
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    First video always free
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Full lifetime access
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Access on mobile and desktop
                  </li>
                  <li className="mb-0">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Expert scholar instructor
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Checkout Modal for Bundle */}
      {showCheckout && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          onClick={() => setShowCheckout(false)}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', width: '90%' }}>
            <BundleCheckoutForm 
              subjectId={parseInt(subjectId)}
              scholarId={parseInt(scholarId)}
              subjectName={course?.subject_name}
              bundlePrice={bundlePrice}
              onSuccess={handlePurchaseSuccess}
              onCancel={() => setShowCheckout(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetail;
