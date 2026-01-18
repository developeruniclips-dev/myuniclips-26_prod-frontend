// import ScholarNavBar from "./components/navBar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/temp";
import ScholarTabs from "./components/tabs";
import './scholarDashboard.css'

function ScholarDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect non-scholars to learner dashboard
        if (user && !user.roles?.includes("Scholar")) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, navigate]);

    // Don't render if not a scholar
    if (!user || !user.roles?.includes("Scholar")) {
        return null;
    }

    return(
        <>
            {/* <ScholarNavBar /> */}
            <div className="scholar-dashboard-page">
                <div className="dashboard-scroll">
                    <ScholarTabs />
                </div>
            </div>
        </>
    )
}

export default ScholarDashboard;