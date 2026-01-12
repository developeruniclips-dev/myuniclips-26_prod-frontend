import React, { useState, useEffect } from "react";
import { Container, Row, Col, ListGroup, Modal, Button } from "react-bootstrap";
import { useAuth } from "../context/temp";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function PlaylistPage() {
  const { user } = useAuth();
  const { playlistKey } = useParams();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [purchasedVideoIds, setPurchasedVideoIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // login / purchase
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/all-videos`);
        const allVideos = res.data.videos || [];
        const filtered = allVideos.filter(v => `${v.subject_name}-${v.scholar_fname}-${v.scholar_lname}` === playlistKey);
        filtered.sort((a, b) => a.sequence_index - b.sequence_index);
        setVideos(filtered);

        // First free video or first video
        const firstFree = filtered.find(v => v.is_free === 1) || filtered[0];
        setCurrentVideo(firstFree);
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    };
    fetchVideos();
  }, [playlistKey]);

  useEffect(() => {
    if (!user) return;
    const fetchPurchases = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/purchases/my-purchases`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPurchasedVideoIds(res.data.purchases.map(p => p.video_id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchPurchases();
  }, [user]);

  const handleVideoClick = (video) => {
    const locked = !video.is_free && (!user || !purchasedVideoIds.includes(video.id));
    if (locked) {
      setModalType(!user ? "login" : "purchase");
      setSelectedVideo(video);
      setShowModal(true);
    } else {
      setCurrentVideo(video);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
    setModalType("");
  };

  const handleLogin = () => {
    navigate("/login");
    handleCloseModal();
  };

  const handlePurchase = () => {
    if (selectedVideo) navigate(`/purchase/${selectedVideo.id}`);
    handleCloseModal();
  };

  return (
    <Container className="my-5">
      <Row>
        {/* Main Video */}
        <Col md={8}>
          {currentVideo ? (
            <>
              <h4>{currentVideo.title}</h4>
              <p className="text-muted">{currentVideo.scholar_fname} {currentVideo.scholar_lname} - {currentVideo.subject_name}</p>
              <video controls width="100%" src={currentVideo.video_url} className="rounded mb-3" />
              <p>{currentVideo.description}</p>
            </>
          ) : <p>No video available</p>}
        </Col>

        {/* Playlist Sidebar */}
        <Col md={4}>
          <h5>Playlist</h5>
          <ListGroup>
            {videos.map(video => {
              const locked = !video.is_free && (!user || !purchasedVideoIds.includes(video.id));
              return (
                <ListGroup.Item
                  key={video.id}
                  action
                  active={currentVideo?.id === video.id}
                  className={locked ? "text-muted" : ""}
                  onClick={() => handleVideoClick(video)}
                >
                  {video.title} {locked && "(Locked)"}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === "login" ? "Login Required" : "Purchase Required"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "login" 
            ? "You must login to view this video." 
            : `You need to purchase "${selectedVideo?.title}" to view this video.`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          {modalType === "login" 
            ? <Button variant="primary" onClick={handleLogin}>Login</Button>
            : <Button variant="success" onClick={handlePurchase}>Purchase</Button>
          }
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default PlaylistPage;
