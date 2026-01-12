// import ScholarNavBar from "./components/navBar";
import ScholarTabs from "./components/tabs";
import './scholarDashboard.css'

function ScholarDashboard() {
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