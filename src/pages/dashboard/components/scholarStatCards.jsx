import Card from "react-bootstrap/Card";

function ScholarStatsCard({ title, value, icon, iconClass }) {
    return (
        <Card className="shadow-sm border-0 rounded-4 dashboard-stat-card p-3">
            <div className="d-flex align-items-center gap-3">
                <div className={`stat-icon ${iconClass}`}>
                    <i className={`bi ${icon} fs-4`}></i>
                </div>
                <div>
                    <h6 className="text-secondary m-0">{title}</h6>
                    <h3 className="fw-bold m-0">{value}</h3>
                </div>
            </div>
        </Card>
    );
}

export default ScholarStatsCard;
