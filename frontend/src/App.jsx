import React, { useContext, useEffect } from "react";
import "./App.css";
import { Context } from "./main";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import Jobs from "./components/Job/Jobs";
import JobDetails from "./components/Job/JobDetails";
import Application from "./components/Application/Application";
import MyApplications from "./components/Application/MyApplications";
import PostJob from "./components/Job/PostJob";
import MyJobs from "./components/Job/MyJobs";
import SavedJobs from "./components/Job/SavedJobs";
import Profile from "./components/Candidate/Profile";
import NotFound from "./components/NotFound/NotFound";

const App = () => {
  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/v1/user/getuser", {
          withCredentials: true,
        });
        if (response.data && response.data.user) {
          setUser(response.data.user);
          setIsAuthorized(true);
        }
      } catch (error) {
        setIsAuthorized(false);
      }
    };
    fetchUser();
  }, [isAuthorized, setIsAuthorized, setUser]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/job/getall" element={<Jobs />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/application/:id" element={<Application />} />
            <Route path="/applications/me" element={<MyApplications />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/job/post" element={<PostJob />} />
            <Route path="/job/me" element={<MyJobs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#1e293b",
              color: "#fff",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
