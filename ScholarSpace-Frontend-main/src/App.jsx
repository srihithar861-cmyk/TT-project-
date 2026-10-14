import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const emptyProfile = {
  annualIncome: "",
  category: "General",
  cgpa: "",
  college: "",
  course: "",
  gender: "Female",
  location: "",
  year: "3",
};

function getDeadlineStatus(deadline) {
  if (!deadline) {
    return {
      label: "Deadline Not Available",
      className: "deadline-unavailable",
    };
  }

  const deadlineDate = new Date(deadline);

  if (Number.isNaN(deadlineDate.getTime())) {
    return {
      label: "Deadline Not Available",
      className: "deadline-unavailable",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const daysRemaining = Math.round(
    (deadlineDate - today) / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining < 0) {
    return {
      label: "Expired",
      className: "deadline-expired",
    };
  }

  if (daysRemaining <= 7) {
    return {
      label: "Closing Soon",
      className: "deadline-closing",
    };
  }

  return {
    label: "Open",
    className: "deadline-open",
  };
}

function getEligibilityReasons(student, scholarship) {
  const criteria = [];

  const addCriterion = (label, meets, explanation) => {
    criteria.push({ label, meets, explanation });
  };

  // CGPA
  const minCgpa = scholarship.minCgpa;
  const cgpa = Number(student.cgpa);

  if (minCgpa == null || minCgpa === "") {
    addCriterion("CGPA", true, "No minimum CGPA specified.");
  } else {
    const meets =
      student.cgpa !== "" &&
      student.cgpa != null &&
      Number.isFinite(cgpa) &&
      cgpa >= Number(minCgpa);

    addCriterion(
      "CGPA",
      meets,
      `Your CGPA is ${
        student.cgpa !== "" && student.cgpa != null
          ? student.cgpa
          : "Not specified"
      }; minimum required is ${minCgpa}.`
    );
  }

  // Annual income
  const maxIncome = scholarship.maxIncome;
  const income = Number(student.annualIncome);

  if (maxIncome == null || maxIncome === "") {
    addCriterion(
      "Annual Income",
      true,
      "No maximum income limit specified."
    );
  } else {
    const meets =
      student.annualIncome !== "" &&
      student.annualIncome != null &&
      Number.isFinite(income) &&
      income <= Number(maxIncome);

    addCriterion(
      "Annual Income",
      meets,
      `Your annual income is ${
        student.annualIncome !== "" && student.annualIncome != null
          ? `₹${income.toLocaleString("en-IN")}`
          : "Not specified"
      }; maximum allowed is ₹${Number(maxIncome).toLocaleString("en-IN")}.`
    );
  }

  // Category
  const category = (scholarship.category || "").trim();
  const studentCategory = (student.category || "").trim();

  const categoryMatches =
    !category ||
    ["any", "all"].includes(category.toLowerCase()) ||
    category.toLowerCase() === studentCategory.toLowerCase();

  addCriterion(
    "Category",
    categoryMatches,
    categoryMatches
      ? `Your category (${studentCategory || "Not specified"}) meets the criterion.`
      : `Your category is ${studentCategory || "Not specified"}; scholarship specifies ${category}.`
  );

  // Gender
  const gender = (scholarship.gender || "").trim();
  const studentGender = (student.gender || "").trim();

  const genderMatches =
    !gender ||
    ["any", "all"].includes(gender.toLowerCase()) ||
    gender.toLowerCase() === studentGender.toLowerCase();

  addCriterion(
    "Gender",
    genderMatches,
    genderMatches
      ? `Your gender (${studentGender || "Not specified"}) meets the criterion.`
      : `Your gender is ${studentGender || "Not specified"}; scholarship specifies ${gender}.`
  );

  // Course
  const course = (scholarship.course || "").trim();
  const studentCourse = (student.course || "").trim();

  const courseMatches =
    !course ||
    ["any", "all"].includes(course.toLowerCase()) ||
    (studentCourse !== "" &&
      (studentCourse.toLowerCase().includes(course.toLowerCase()) ||
        course.toLowerCase().includes(studentCourse.toLowerCase())));

  addCriterion(
    "Course",
    courseMatches,
    courseMatches
      ? `Your course (${studentCourse || "Not specified"}) meets the criterion.`
      : `Your course is ${studentCourse || "Not specified"}; scholarship specifies ${course}.`
  );

  // Location
  const location = (scholarship.location || "").trim();
  const studentLocation = (student.location || "").trim();

  const locationMatches =
    !location ||
    ["any", "all"].includes(location.toLowerCase()) ||
    (studentLocation !== "" &&
      (studentLocation.toLowerCase().includes(location.toLowerCase()) ||
        location.toLowerCase().includes(studentLocation.toLowerCase())));

  addCriterion(
    "Location",
    locationMatches,
    locationMatches
      ? `Your location (${studentLocation || "Not specified"}) meets the criterion.`
      : `Your location is ${studentLocation || "Not specified"}; scholarship specifies ${location}.`
  );

  return criteria;
}
function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("login");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [formData, setFormData] = useState(emptyProfile);
  const [studentId, setStudentId] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [deadlineFilter, setDeadlineFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("highest");

  // Search, filter, and sort scholarships.
  // IMPORTANT: This belongs inside App(), not getDeadlineStatus().
  const filteredScholarships = scholarships
    .filter((item) => {
      const scholarship = item.scholarship;
      if (!scholarship) return false;

      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        (scholarship.name || "").toLowerCase().includes(search) ||
        (scholarship.provider || "").toLowerCase().includes(search);

      if (!matchesSearch) return false;

      const status = getDeadlineStatus(scholarship.deadline);

      if (
        deadlineFilter !== "All" &&
        status.label !== deadlineFilter
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const scoreA = Number(a.matchScore) || 0;
      const scoreB = Number(b.matchScore) || 0;

      return sortOrder === "highest"
        ? scoreB - scoreA
        : scoreA - scoreB;
    });

  const matchingCount = scholarships.length;

  const upcomingScholarships = scholarships.filter((item) => {
    const deadline = item.scholarship?.deadline;
    if (!deadline) return false;

    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    const daysRemaining =
      (deadlineDate - today) / (1000 * 60 * 60 * 24);

    return daysRemaining >= 0 && daysRemaining < 30;
  }).length;

  // Load the saved student profile and scholarship matches.
  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    async function loadStudentProfile() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/students/user/${user.id}`
        );

        if (response.status === 404) return;

        if (!response.ok) {
          throw new Error("Unable to load your saved profile.");
        }

        const student = await response.json();

        if (cancelled || !student?.id) return;

        setStudentId(student.id);

        setFormData({
          annualIncome: String(student.annualIncome ?? ""),
          category: student.category ?? "General",
          cgpa: String(student.cgpa ?? ""),
          college: student.college ?? "",
          course: student.course ?? "",
          gender: student.gender ?? "Female",
          location: student.location ?? "",
          year: String(student.year ?? "3"),
        });

        const matchingResponse = await fetch(`${API_BASE_URL}/api/matching/${student.id}`
        );

        if (!matchingResponse.ok) {
          throw new Error("Unable to load scholarship matches.");
        }

        const matchingData = await matchingResponse.json();

        if (!cancelled) {
          setScholarships(
            Array.isArray(matchingData)
              ? [...matchingData].sort(
                  (a, b) => b.matchScore - a.matchScore
                )
              : []
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Profile loading error:", error);
        }
      }
    }

    loadStudentProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Register a student account.
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...registrationData,
          role: "STUDENT",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          data.message || "Registration failed. Please try again."
        );
        setMessageType("error");
        return;
      }

      setLoginData({
        email: registrationData.email,
        password: "",
      });

      setRegistrationData({
        name: "",
        email: "",
        password: "",
      });

      setAuthMode("login");
      setMessage("Registration successful! Please log in.");
      setMessageType("success");
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Unable to connect to the backend.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Log in a student.
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.message || "Invalid email or password.");
        setMessageType("error");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));

      setFormData(emptyProfile);
      setStudentId(null);
      setScholarships([]);
      setUser(data);

      setMessage(`Welcome, ${data.name}!`);
      setMessageType("success");
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        "Unable to connect to the backend. Check that it is running."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Log out.
  const handleLogout = () => {
    localStorage.removeItem("user");

    setUser(null);
    setAuthMode("login");
    setLoginData({ email: "", password: "" });
    setRegistrationData({ name: "", email: "", password: "" });
    setFormData(emptyProfile);
    setStudentId(null);
    setScholarships([]);
    setSelectedScholarship(null);
    setMessage("");
    setMessageType("");
  };

  // Update profile form fields.
  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Save or update profile and retrieve matching scholarships.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
    !formData.college.trim() ||
    !formData.course.trim() ||
    !formData.location.trim()
  ) {
    setMessage("Please fill in all required text fields.");
    setMessageType("error");
    return;
  }

  const income = Number(formData.annualIncome);
  const cgpa = Number(formData.cgpa);

  if (
    formData.annualIncome === "" ||
    !Number.isFinite(income) ||
    income < 0
  ) {
    setMessage("Please enter a valid, non-negative annual income.");
    setMessageType("error");
    return;
  }

  if (
    formData.cgpa === "" ||
    !Number.isFinite(cgpa) ||
    cgpa < 0 ||
    cgpa > 10
  ) {
    setMessage("Please enter a CGPA between 0 and 10.");
    setMessageType("error");
    return;
  }

    setMessage("");
    setMessageType("");
    setLoading(true);
    setScholarships([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: Number(user.id),
          annualIncome: Number(formData.annualIncome),
          cgpa: Number(formData.cgpa),
          year: Number(formData.year),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Profile save failed: HTTP ${response.status}`
        );
      }

      const student = await response.json();
      setStudentId(student.id);

      const matchingResponse = await fetch(`${API_BASE_URL}/api/matching/${student.id}`
);

if (!matchingResponse.ok) {
  setMessage(
    "Your profile was saved, but scholarship matching failed. Please try again."
  );
  setMessageType("error");
  return;
}

      const matchingData = await matchingResponse.json();

      setScholarships(
        Array.isArray(matchingData)
          ? [...matchingData].sort(
              (a, b) => b.matchScore - a.matchScore
            )
          : []
      );

      setMessage("Profile saved successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Profile submission error:", error);
      setMessage(error.message || "Something went wrong.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Login and registration screens.
  if (!user) {
    return (
      <main className="app-container auth-page">
  <div className="auth-shell">

    <section className="auth-showcase">
      <div className="auth-brand">
        <span className="auth-brand-icon">S</span>
        <div>
          <h1>ScholarSpace</h1>
          <p>STUDENT PORTAL</p>
        </div>
      </div>

      <div className="auth-hero">
        <span className="auth-orb auth-orb-one"></span>
        <span className="auth-orb auth-orb-two"></span>

        <div className="auth-cap">🎓</div>

        <p className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
        <h2>
          Your future
          <br />
          <span>starts here.</span>
        </h2>

        <p className="auth-description">
          Discover scholarships that move your ambitions forward.
          Find opportunities that match your profile and goals.
        </p>
      </div>

      <div className="auth-benefits">
        <div>
          <span>✦</span>
          <strong>Personalized matches</strong>
        </div>
        <div>
          <span>✓</span>
          <strong>Eligibility insights</strong>
        </div>
        <div>
          <span>⌁</span>
          <strong>One student profile</strong>
        </div>
      </div>

      <p className="auth-footer-note">
        Every opportunity begins with a single step.
      </p>
    </section>

    <section className="profile-card auth-form-panel">
          {authMode === "login" ? (
            <>
              <h2>Student Login</h2>

              <form onSubmit={handleLogin}>
                <label>
                  Email
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        email: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        password: e.target.value,
                      })
                    }
                  />
                </label>

                <button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p>
                New to the Scholarship Platform?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setAuthMode("register");
                    setMessage("");
                    setMessageType("");
                  }}
                >
                  Create an account
                </button>
              </p>
            </>
          ) : (
            <>
              <h2>Create Student Account</h2>

              <form onSubmit={handleRegister}>
                <label>
                  Full Name
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={registrationData.name}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        name: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={registrationData.email}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        email: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={registrationData.password}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        password: e.target.value,
                      })
                    }
                  />
                </label>

                <button type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Register"}
                </button>
              </form>

              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setAuthMode("login");
                    setMessage("");
                    setMessageType("");
                  }}
                >
                  Login
                </button>
              </p>
            </>
          )}

          {message && (
            <p role="status" className={`message ${messageType}`}>
              {message}
            </p>
          )}
        </section>
        </div>
      </main>
    );
  }
  

 
      // Student dashboard.

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <a href="#dashboard" className="brand">
          <span className="brand-icon">S</span>
          <span>
            ScholarSpace
            <small>STUDENT PORTAL</small>
          </span>
        </a>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#dashboard">
            <span>⌂</span> Dashboard
          </a>
          <a className="nav-link" href="#profile">
            <span>◎</span> My Profile
          </a>
          <a className="nav-link" href="#scholarships">
            <span>✧</span> Find Scholarships
          </a>
        </nav>

        <div className="sidebar-help">
          <span className="help-icon">✦</span>
          <strong>Your next opportunity awaits.</strong>
          <p>Keep your profile updated to discover relevant scholarships.</p>
          <a href="#profile">Update profile →</a>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          ↗ Log out
        </button>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-topbar" id="dashboard">
          <div>
            <p className="eyebrow">YOUR STUDENT SPACE</p>
            <h1>Welcome back, {user.name}!</h1>
            <p className="welcome-subtitle">
              Discover opportunities that support your future.
            </p>
          </div>

          <div className="student-chip">
            <span className="student-avatar">
              {(user.name || "S").charAt(0).toUpperCase()}
            </span>
            <span>
              <strong>{user.name}</strong>
              <small>Student account</small>
            </span>
          </div>
        </header>

        {/* Keep your existing dashboard cards, profile form,
            scholarship results, and details popup below this line. */}
      

      <section className="dashboard-summary">
        <article className="summary-card">
          <h3>Matching Scholarships</h3>
          <p>{matchingCount}</p>
          <small>Based on your profile</small>
        </article>

        <article className="summary-card">
          <h3>Upcoming Deadlines</h3>
          <p>{upcomingScholarships}</p>
          <small>Within the next 30 days</small>
        </article>

        <article className="summary-card">
          <h3>Profile Status</h3>
          <p>{studentId ? "Saved" : "Pending"}</p>
          <small>
            {studentId
              ? "Your profile is saved"
              : "Complete your profile below"}
          </small>
        </article>
      </section>

      <section className="profile-card" id="profile">
        <h2>Student Profile</h2>
        <p>
          Enter your details to find scholarships you are eligible for.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Annual Income (₹)
            <input
              type="number"
              min="0"
              required
              name="annualIncome"
              value={formData.annualIncome}
              onChange={handleProfileChange}
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={formData.category}
              onChange={handleProfileChange}
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </label>

          <label>
            CGPA
            <input
              type="number"
              min="0"
              max="10"
              step="0.01"
              required
              name="cgpa"
              value={formData.cgpa}
              onChange={handleProfileChange}
            />
          </label>

          <label>
            College
            <input
              type="text"
              required
              name="college"
              value={formData.college}
              onChange={handleProfileChange}
            />
          </label>

          <label>
            Course
            <input
              type="text"
              required
              name="course"
              value={formData.course}
              onChange={handleProfileChange}
            />
          </label>

          <label>
            Gender
            <select
              name="gender"
              value={formData.gender}
              onChange={handleProfileChange}
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Location
            <input
              type="text"
              required
              name="location"
              value={formData.location}
              onChange={handleProfileChange}
              placeholder="e.g. Hyderabad, Telangana"
            />
          </label>

          <label>
            Year of Study
            <select
              name="year"
              value={formData.year}
              onChange={handleProfileChange}
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </label>

          <button type="submit" disabled={loading}>
            {loading
              ? "Processing..."
              : studentId
                ? "Update Profile & Find Scholarships"
                : "Save Profile & Find Scholarships"}
          </button>
        </form>

        {message && (
          <p role="status" className={`message ${messageType}`}>
            {message}
          </p>
        )}
      </section>

      <section className="scholarships-section" id="scholarships">
        <h2>Recommended Scholarships 🎓</h2>

        <div className="scholarship-controls">
          <input
            type="search"
            className="scholarship-search"
            placeholder="Search by scholarship name or provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search scholarships"
          />

          <select
            className="scholarship-filter"
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
            aria-label="Filter by deadline status"
          >
            <option value="All">All Deadline Statuses</option>
            <option value="Open">Open</option>
            <option value="Closing Soon">Closing Soon</option>
            <option value="Expired">Expired</option>
          </select>

          <select
            className="scholarship-filter"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sort by match score"
          >
            <option value="highest">Highest Match Score</option>
            <option value="lowest">Lowest Match Score</option>
          </select>
        </div>

        <p className="results-count">
          Showing {filteredScholarships.length} of {scholarships.length} scholarships
        </p>

        {scholarships.length === 0 ? (
          <p>
            No matching scholarships to display yet. Save your profile
            to check eligibility.
          </p>
        ) : filteredScholarships.length === 0 ? (
          <p>No scholarships match your search or selected filter.</p>
        ) : (
          filteredScholarships.map((item) => {
            const scholarship = item.scholarship;
            if (!scholarship) return null;

            const status = getDeadlineStatus(scholarship.deadline);

            return (
              <article
                className="scholarship-card"
                key={scholarship.id}
              >
                <h3>{scholarship.name}</h3>
                
                
                <p>
                  <strong>Provider:</strong>{" "}
                  {scholarship.provider || "Not specified"}
                </p>

                <p>
                  <strong>Description:</strong>{" "}
                  {scholarship.description || "No description available"}
                </p>

                <div className="scholarship-eligibility-grid">
  <div className="eligibility-field">
    <span>Minimum CGPA</span>
    <strong>{scholarship.minCgpa ?? "Not specified"}</strong>
  </div>

  <div className="eligibility-field">
    <span>Maximum Income</span>
    <strong>
      {scholarship.maxIncome != null
        ? `₹${Number(scholarship.maxIncome).toLocaleString("en-IN")}`
        : "Not specified"}
    </strong>
  </div>

  <div className="eligibility-field">
    <span>Category</span>
    <strong>{scholarship.category || "Any"}</strong>
  </div>

  <div className="eligibility-field">
    <span>Gender</span>
    <strong>{scholarship.gender || "Any"}</strong>
  </div>

  <div className="eligibility-field">
    <span>Location</span>
    <strong>{scholarship.location || "Any"}</strong>
  </div>

  <div className="eligibility-field">
    <span>Course</span>
    <strong>{scholarship.course || "Any"}</strong>
  </div>
</div>

                <div className="deadline-section">
                  <p>
                    <strong>Deadline:</strong>{" "}
                    {scholarship.deadline || "Not specified"}
                  </p>
                  <span className={`deadline-badge ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="match-score">
                  <strong>Match Score</strong>
                  <span>{item.matchScore}%</span>
                </div>

                <button
                  type="button"
                  className="view-details-button"
                  onClick={() => setSelectedScholarship(item)}
                >
                  View Details
                </button>
              </article>
            );
          })
        )}
      </section>

      {selectedScholarship?.scholarship && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedScholarship(null)}
        >
          <section
            className="scholarship-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scholarship-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close scholarship details"
              onClick={() => setSelectedScholarship(null)}
            >
              &times;
            </button>

            <h2 id="scholarship-modal-title">
              {selectedScholarship.scholarship.name}
            </h2>

            <p>
              <strong>Provider:</strong>{" "}
              {selectedScholarship.scholarship.provider || "Not specified"}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {selectedScholarship.scholarship.description ||
                "No description available"}
            </p>

            <h3>Eligibility Criteria</h3>
            <ul>
  <li>
    Minimum CGPA: {selectedScholarship.scholarship.minCgpa ?? "Not specified"}
  </li>
  <li>
  Maximum Annual Income:{" "}
  {selectedScholarship.scholarship.maxIncome != null
    ? `₹${Number(
        selectedScholarship.scholarship.maxIncome
      ).toLocaleString("en-IN")}`
    : "Not specified"}
</li>
  <li>
    Category: {selectedScholarship.scholarship.category || "All categories"}
  </li>
  <li>
    Gender: {selectedScholarship.scholarship.gender || "All genders"}
  </li>
  <li>
    Course: {selectedScholarship.scholarship.course || "All courses"}
  </li>
  <li>
    Location: {selectedScholarship.scholarship.location || "All locations"}
  </li>
</ul>
           
<div className="eligibility-summary">
  {getEligibilityReasons(
    formData,
    selectedScholarship.scholarship
  ).map((criterion) => (
    <p key={criterion.label}>
      <strong>{criterion.label}:</strong>{" "}
      <span
        className={
          criterion.meets ? "status-pass" : "status-fail"
        }
      >
        {criterion.meets ? "✓ Meets requirement" : "✗ Does not meet requirement"}
      </span>
      <br />
      <span>{criterion.explanation}</span>
    </p>
  ))}
</div>

            <div className="modal-match-score">
  <div className="match-score-header">
    <strong>Match Score</strong>
    <span>{selectedScholarship.matchScore}%</span>
  </div>

  <div className="match-progress-track">
    <div
      className="match-progress-fill"
      style={{
        width: `${Math.min(
          100,
          Math.max(0, Number(selectedScholarship.matchScore) || 0)
        )}%`,
      }}
    />
  </div>

  <p>
    {selectedScholarship.matchScore >= 80
      ? "Excellent match for your profile!"
      : selectedScholarship.matchScore >= 50
      ? "Good match. Review the eligibility criteria."
      : "Check the eligibility criteria carefully."}
  </p>
</div>

            <button
              type="button"
              className="modal-done-button"
              onClick={() => setSelectedScholarship(null)}
            >
              Close Details
            </button>
          </section>
        </div>
      )}
          </div>
    </main>
  );
}



export default App;