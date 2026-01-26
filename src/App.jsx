import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import FeaturedCourses from "./components/featured-courses/FeaturedCourses";
import Hero from "./components/hero/Hero";
import TopNavBar from "./components/navbar/TopNavBar";
import Whyvle from "./components/why-studify/Whyvle";
import Stats from "./components/stats/Stats";
import HowItWorks from "./components/how-it-works/HowItWorks";
import Testimonials from "./components/testimonials/Testimonials";
import CallToAction from "./components/cta/CallToAction";
import Footer from "./components/footer/Footer";
import ScholarPage from "./pages/ScholarPage";
import CoursePage from "./pages/CoursePage";
import AboutUs from "./pages/about-us/AboutUs";
import Dashboard from "./pages/dashboard/dashboardUser";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ScholarDashboard from "./pages/dashboard/scholardashboard";
import AdminDashboard from "./pages/dashboard/adminDashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import BecomeScholar from "./pages/dashboard/becomeScholar";
import NewCourse from "./pages/dashboard/newCourse";
import LoginPage from "./pages/login/LoginPage";
import ForgotPassword from "./pages/login/ForgotPassword";
import ResetPassword from "./pages/login/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import { AuthProvider } from "./context/temp";
import RegisterPage from "./pages/RegUser.jsx";
import VideoUploadPage from "./pages/dashboard/VideoUploadPage.jsx";
import VideoPlaylist from "./pages/VideoPlaylist.jsx";
import WatchVideo from "./pages/WatchVideo.jsx";
import PlaylistPage from "./pages/PlayListPage.jsx";
import EditProfile from "./pages/dashboard/EditProfile.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import MyLibrary from "./pages/MyLibrary.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import { HomeSEO, ScholarsSEO, CoursesSEO, AboutSEO, LoginSEO, LibrarySEO } from "./components/SEO";

function App() {
  const location = useLocation();
  
  // Pages that handle their own top spacing (like homepage with Hero)
  const noWrapperPages = ["/", "/login"];
  const needsWrapper = !noWrapperPages.includes(location.pathname);

  return (
    <AuthProvider>
      <TopNavBar showLinks={location.pathname !== "/login"} />

      <div className={needsWrapper ? "main-content" : ""}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HomeSEO />
                <Hero />
                <Stats />
                <HowItWorks />
                <FeaturedCourses />
                <Testimonials />
                <CallToAction />
                <Footer />
              </>
            }
          />

          <Route path="/login" element={<><LoginSEO /><LoginPage /></>} />
          <Route path="/forgot-password" element={<><ForgotPassword /><Footer /></>} />
          <Route path="/reset-password" element={<><ResetPassword /><Footer /></>} />
          <Route path="/scholar" element={<><ScholarsSEO /><ScholarPage /><Footer /></>} />
          <Route path="/teacher" element={<><CoursesSEO /><CoursePage /><Footer /></>} />
          <Route path="/aboutUs" element={<><AboutSEO /><AboutUs /><Footer /></>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["Learner", "Scholar"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/scholar-dashboard"
            element={
              <ProtectedRoute roles={["Scholar"]}>
                <ScholarDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload-video"
            element={
              <ProtectedRoute roles={["Scholar"]}>
                <VideoUploadPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute roles={["Learner", "Scholar", "Admin"]}>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route 
            path="/superadmin-dashboard" 
            element={
              <ProtectedRoute roles={["SuperAdmin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/become-scholar" element={<><BecomeScholar /><Footer /></>} />
          <Route path="/create-course" element={<NewCourse />} />
          <Route path="register" element={<><RegisterPage /><Footer /></>} />
          <Route path="/all-videos" element={<><VideoPlaylist /><Footer /></>} />
          <Route path="/my-library" element={<><LibrarySEO /><MyLibrary /><Footer /></>} />
          <Route path="/course/:subjectId/:scholarId" element={<><CourseDetail /><Footer /></>} />
          <Route path="/course/:subjectId" element={<><CourseDetail /><Footer /></>} />
          <Route path="/watch/:id" element={<WatchVideo />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
