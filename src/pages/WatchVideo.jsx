// src/pages/WatchVideo.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, ListGroup, Card, Button, Alert, Badge } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/temp";

// Default bundle price (fallback)
const DEFAULT_BUNDLE_PRICE = 6.00;

function WatchVideo() {
  const { user } = useAuth();
  const { id } = useParams(); // video id
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [hasPurchasedBundle, setHasPurchasedBundle] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [bundlePrice, setBundlePrice] = useState(DEFAULT_BUNDLE_PRICE);
  const [savedProgress, setSavedProgress] = useState(0);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/all-videos`);
        const allVideos = res.data.videos || [];
        const current = allVideos.find(v => v.id === parseInt(id));
        setVideo(current);
        
        // Get bundle price from the video data
        if (current && current.bundle_price) {
          setBundlePrice(parseFloat(current.bundle_price));
        }

        // Create playlist: all videos by same subject + scholar
        const pl = allVideos.filter(v => 
          v.subject_name === current.subject_name && 
          v.scholar_fname === current.scholar_fname &&
          v.scholar_lname === current.scholar_lname
        ).sort((a, b) => a.sequence_index - b.sequence_index);
        setPlaylist(pl);
        
        // Find current video index in playlist
        const idx = pl.findIndex(v => v.id === parseInt(id));
        setCurrentVideoIndex(idx >= 0 ? idx : 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVideos();
  }, [id]);

  useEffect(() => {
    if (!user || !video) return;
    
    // Check if user has purchased the subject bundle
    const checkBundlePurchase = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/purchases/subject/check`,
          { 
            params: { 
              subjectId: video.subject_id, 
              scholarId: video.scholar_user_id 
            },
            headers: { Authorization: `Bearer ${user.token}` } 
          }
        );
        setHasPurchasedBundle(res.data.hasPurchased);
      } catch (err) {
        console.error("Error checking bundle purchase:", err);
      }
    };
    checkBundlePurchase();
  }, [user, video]);

  // Save progress function
  const saveProgress = useCallback(async (seconds) => {
    if (!user || !video) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/save-progress`,
        { videoId: parseInt(id), progressSeconds: Math.floor(seconds) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  }, [user, video, id]);

  // Load saved progress on mount
  useEffect(() => {
    if (!user || !video) return;
    
    const loadProgress = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/video-progress`,
          { 
            params: { videoId: parseInt(id) },
            headers: { Authorization: `Bearer ${user.token}` } 
          }
        );
        if (res.data.progressSeconds > 0) {
          setSavedProgress(res.data.progressSeconds);
        }
      } catch (err) {
        console.error("Error loading progress:", err);
      }
    };
    
    loadProgress();
  }, [user, video, id]);

  // Initialize Vimeo Player and track progress
  useEffect(() => {
    if (!user || !video || !iframeRef.current) return;
    
    // Can watch if first video (free) or has purchased bundle
    const canWatch = currentVideoIndex === 0 || hasPurchasedBundle;
    if (!canWatch) return;

    // Load Vimeo Player API
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    
    script.onload = () => {
      if (window.Vimeo && iframeRef.current) {
        const player = new window.Vimeo.Player(iframeRef.current);
        playerRef.current = player;

        // Resume from saved progress
        if (savedProgress > 0) {
          player.setCurrentTime(savedProgress).catch(console.error);
        }

        // Save progress every 10 seconds while playing
        player.on('play', () => {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = setInterval(async () => {
            const currentTime = await player.getCurrentTime();
            saveProgress(currentTime);
          }, 10000);
        });

        // Save progress on pause
        player.on('pause', async () => {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          const currentTime = await player.getCurrentTime();
          saveProgress(currentTime);
        });

        // Mark as watched when video ends
        player.on('ended', async () => {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/mark-watched`,
              { videoId: parseInt(id) },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
          } catch (err) {
            console.error("Error marking video as watched:", err);
          }
        });
      }
    };

    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (playerRef.current) {
        playerRef.current.getCurrentTime().then(time => {
          saveProgress(time);
        }).catch(() => {});
      }
      const existingScript = document.querySelector('script[src="https://player.vimeo.com/api/player.js"]');
      if (existingScript && existingScript.parentNode) {
        // Don't remove the script as it might be used by other videos
      }
    };
  }, [user, video, id, currentVideoIndex, hasPurchasedBundle, savedProgress, saveProgress]);

  if (!video) return <Container className="my-5">Loading...</Container>;

  // Can watch if first video (index 0) or has purchased bundle
  const canWatch = currentVideoIndex === 0 || (user && hasPurchasedBundle);
  const isFirstVideo = currentVideoIndex === 0;

  return (
    <Container className="my-5">
      <Row>
        <Col md={8}>
          {/* Show login prompt if not logged in and video is free */}
          {!user && video.is_free === 1 && (
            <Alert variant="success" className="mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <i className="bi bi-gift-fill me-2"></i>
                  <strong>This first video is FREE!</strong> Login to start watching now.
                </div>
                <Link to="/login">
                  <Button variant="success" size="sm">
                    Login Now
                  </Button>
                </Link>
              </div>
            </Alert>
          )}

          {/* Show video if user can watch */}
          {canWatch ? (
            <Card className="border-0 shadow-sm mb-3">
              {/* Vimeo Embed Player */}
              {video.video_url.includes('vimeo.com') ? (
                <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                  <iframe
                    ref={iframeRef}
                    src={`https://player.vimeo.com/video/${video.video_url.split('/').pop()}?badge=0&autopause=0&player_id=0&app_id=58479`}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '8px 8px 0 0'
                    }}
                    title={video.title}
                  ></iframe>
                  {/* Resume indicator */}
                  {savedProgress > 0 && (
                    <div 
                      className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded"
                      style={{ background: 'rgba(0,0,0,0.7)', zIndex: 10 }}
                    >
                      <small className="text-white">
                        <i className="bi bi-arrow-counterclockwise me-1"></i>
                        Resuming from {Math.floor(savedProgress / 60)}:{String(Math.floor(savedProgress % 60)).padStart(2, '0')}
                      </small>
                    </div>
                  )}
                </div>
              ) : (
                // Fallback for non-Vimeo videos
                <video 
                  controls 
                  width="100%" 
                  src={video.video_url}
                  style={{ borderRadius: '8px 8px 0 0' }}
                ></video>
              )}
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h3 className="fw-bold mb-1">{video.title}</h3>
                    {isFirstVideo && (
                      <Badge bg="success" className="mb-2">
                        <i className="bi bi-gift me-1"></i>
                        FREE Video
                      </Badge>
                    )}
                  </div>
                  {video.price > 0 && (
                    <Badge bg="primary" className="fs-6">
                      ${video.price}
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted">{video.description}</p>
                
                <hr />
                
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                    style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}
                  >
                    {video.scholar_fname?.[0]}{video.scholar_lname?.[0]}
                  </div>
                  <div>
                    <div className="fw-semibold">
                      {video.scholar_fname} {video.scholar_lname}
                    </div>
                    {video.scholar_university && video.scholar_degree && (
                      <>
                        <small className="text-muted d-block">
                          <i className="bi bi-mortarboard me-1"></i>
                          {video.scholar_degree}
                        </small>
                        <small className="text-muted d-block">
                          <i className="bi bi-building me-1"></i>
                          {video.scholar_university}
                        </small>
                      </>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm text-center py-5">
              <Card.Body>
                <div className="mb-4">
                  <i className="bi bi-lock-fill" style={{ fontSize: '4rem', color: '#dc3545' }}></i>
                </div>
                <h4 className="fw-bold mb-3">This Video is Locked</h4>
                <p className="text-muted mb-4">
                  {!user ? 
                    "Please login to purchase this course bundle." : 
                    "Purchase the full course bundle to unlock all videos."
                  }
                </p>
                
                {/* Bundle pricing info */}
                <div className="bg-light rounded p-3 mb-4 mx-auto" style={{ maxWidth: '300px' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Full Course Access</span>
                    <span className="fs-4 fw-bold text-success">€{bundlePrice.toFixed(2)}</span>
                  </div>
                  <small className="text-muted d-block mt-2">
                    Unlock all {playlist.length} videos in this course
                  </small>
                </div>

                {!user ? (
                  <Link to="/login">
                    <Button variant="primary" size="lg">
                      Login to Purchase
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="success" 
                    size="lg" 
                    onClick={() => navigate(`/course/${video.subject_id}/${video.scholar_user_id}`)}
                  >
                    <i className="bi bi-unlock-fill me-2"></i>
                    Unlock Full Course - €{bundlePrice.toFixed(2)}
                  </Button>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0 fw-bold">Course Playlist</h5>
                  <small className="text-muted">{video.subject_name}</small>
                </div>
                {hasPurchasedBundle && (
                  <Badge bg="success">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Purchased
                  </Badge>
                )}
              </div>
            </Card.Header>
            <ListGroup variant="flush">
              {playlist.map((v, idx) => {
                const isVideoLocked = idx > 0 && !hasPurchasedBundle;
                const isCurrentVideo = v.id === parseInt(id);
                const isFirst = idx === 0;
                
                return (
                  <ListGroup.Item 
                    key={v.id} 
                    action 
                    active={isCurrentVideo}
                    onClick={() => {
                      if (!isCurrentVideo) {
                        if (isVideoLocked && !user) {
                          navigate('/login');
                        } else if (isVideoLocked) {
                          // Show message or navigate to course page to purchase
                          navigate(`/course/${video.subject_id}/${video.scholar_user_id}`);
                        } else {
                          navigate(`/watch/${v.id}`);
                        }
                      }
                    }}
                    className={`d-flex justify-content-between align-items-start ${isVideoLocked && !isCurrentVideo ? "text-muted" : ""}`}
                  >
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <small className="me-2 text-muted">#{idx + 1}</small>
                        <div className="fw-semibold">{v.title}</div>
                      </div>
                      {isFirst ? (
                        <Badge bg="success" className="me-1" style={{ fontSize: '0.7rem' }}>
                          FREE PREVIEW
                        </Badge>
                      ) : hasPurchasedBundle ? (
                        <Badge bg="info" className="me-1" style={{ fontSize: '0.7rem' }}>
                          UNLOCKED
                        </Badge>
                      ) : (
                        <Badge bg="secondary" className="me-1" style={{ fontSize: '0.7rem' }}>
                          <i className="bi bi-lock-fill me-1"></i>
                          LOCKED
                        </Badge>
                      )}
                    </div>
                    <div className="ms-2">
                      {isCurrentVideo ? (
                        <i className="bi bi-play-circle-fill text-primary"></i>
                      ) : isVideoLocked ? (
                        <i className="bi bi-lock-fill"></i>
                      ) : (
                        <i className="bi bi-play-circle"></i>
                      )}
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default WatchVideo;
