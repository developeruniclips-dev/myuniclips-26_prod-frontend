import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ContactUs from "./components/contactUs";
import Description from "./components/description";
import Faq from "./components/faq";
import Mission from "./components/mission";

function AboutUs() {
    const location = useLocation();

    // Scroll to section based on hash in URL
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location]);

    return(
        <>
            <Description />
            <Mission />
            <div id="contact">
                <ContactUs />
            </div>
            <div id="faq">
                <Faq />
            </div>
        </>
    )
}

export default AboutUs;