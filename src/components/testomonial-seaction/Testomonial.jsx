import { Container } from "react-bootstrap";

function Testomonial() {
    return (
        <Container className="my-5 text-center">
        <blockquote className="blockquote">
            <p>
            <span className="fs-1 text-info">❝</span> 
            Studify has been a game changer in my studies. 
            The video content is easy to follow and makes tough topics simple.
            </p>
            <footer className="blockquote-footer">Emil Hollihen</footer>
        </blockquote>
        </Container>
    );
}

export default Testomonial;