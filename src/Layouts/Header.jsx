import React, { useState, useEffect, useRef, useCallback } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "../assets/AloLogo/alo-logo.png";
import LogoutModal from "../Logout/LogoutModal";
import {
  getUserId,
  getNotification,
  updateNotification,
} from "../api/serviceapi";
import { FaUserCircle } from "react-icons/fa";
import {
  FiCalendar,
  FiCheckSquare,
  FiLogOut,
  FiBell,
  FiFileText,
  FiAward,
  FiMessageSquare,
  // FiShield,
  FiSend,
  FiX,
} from "react-icons/fi";

/* Single source of truth for the top navigation. Adding a menu item
   means adding one entry here — the desktop bar and the mobile drawer
   both render from this list. */
const NAV_ITEMS = [
  { label: "Attendance", path: "dashboard", icon: FiCalendar },
  { label: "Daily Tasks", path: "daily-tasks", icon: FiCheckSquare },
  { label: "Leave", path: "leave-management", icon: FiSend },
  { label: "Academics", path: "academics", icon: FiAward },
  { label: "Complaint", path: "complaint", icon: FiMessageSquare },
  // { label: "Harassment", path: "harassment", icon: FiShield },
  { label: "Policies", path: "policies", icon: FiFileText },
];

const Header = ({ handleLogout }) => {
  const userId = localStorage.getItem("userId");
  const courseStatus = sessionStorage.getItem("courseStatus");
    const navItems =
    courseStatus === "completed"
      ? NAV_ITEMS.filter((item) => item.path === "academics")
      : NAV_ITEMS;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [notifi, setNotifi] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const notifyWrapRef = useRef(null);

  // Fetch notifications
  const fetchNotification = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await getNotification(userId);
      const data = response.data?.data?.data || [];
      setNotifi(data);
    } catch (err) {
      console.error(err.message);
    }
  }, [userId]);

  // Fetch user profile
  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getUserId(userId);
      const profileData = res.data?.data?.data?.[0] || res.data?.data;
      setUserProfile(profileData);
    } catch (err) {
      console.error(err.message);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
    fetchNotification();
    const interval = setInterval(fetchNotification, 30000);
    return () => clearInterval(interval);
  }, [fetchUser, fetchNotification]);

  // Close dropdown if clicked outside. The wrapper holds both the bell
  // and the panel, so one ref covers the whole interactive area.
  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (event) => {
      if (
        notifyWrapRef.current &&
        !notifyWrapRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  // Close dropdown & drawer on route change
  useEffect(() => {
    setShowNotifications(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const confirmLogout = () => {
    if (typeof handleLogout === "function") handleLogout();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("studentId");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("studentId");
    navigate("/login", { replace: true });
  };

  const handleBellClick = async () => {
    setShowNotifications((prev) => !prev);
    const unread = notifi.filter((n) => !n.isRead);
    if (unread.length) {
      try {
        await Promise.all(unread.map((n) => updateNotification(n._id, true)));
        setNotifi((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  const handleNavClick = (path) => {
    const courseStatus = sessionStorage.getItem("courseStatus");
    
    // If course is completed, only allow academics route
    if (courseStatus === "completed" && path !== "academics") {
      return;
    }
    
    navigate(`/${path}/${userId}`, { replace: false });
    setIsMobileMenuOpen(false);
  };

  const unreadCount = notifi.filter((n) => !n.isRead).length;
  const isActive = (path) => location.pathname.includes(`/${path}`);

  const avatar = userProfile?.profileURL ? (
    <img
      src={userProfile.profileURL}
      alt={userProfile?.name || "User"}
      className={styles.profilePic}
    />
  ) : (
    <FaUserCircle className={styles.profileFallback} />
  );

  return (
    <>
      <header className={styles.headerContainer}>
        {/* Logo */}
        <div
          className={styles.logoWrapper}
          onClick={() => {
            const courseStatus = sessionStorage.getItem("courseStatus");
            const targetPath = courseStatus === "completed" ? "academics" : "dashboard";
            if (location.pathname.includes(`/${targetPath}`)) return;
            navigate(`/${targetPath}/${userId}`, { replace: false });
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const courseStatus = sessionStorage.getItem("courseStatus");
              const targetPath = courseStatus === "completed" ? "academics" : "dashboard";
              if (!location.pathname.includes(`/${targetPath}`)) {
                navigate(`/${targetPath}/${userId}`, { replace: false });
              }
            }
          }}
        >
          <img src={logo} alt="ALO School" className={styles.logo} />
        </div>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Main">
          {navItems.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              className={`${styles.linkBtn} ${
                isActive(path) ? styles.activeLink : ""
              }`}
              onClick={() => handleNavClick(path)}
            >
              <Icon className={styles.linkIcon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className={styles.rightSection}>
          <div className={styles.notificationWrapper} ref={notifyWrapRef}>
            <button
              className={styles.iconBtn}
              onClick={handleBellClick}
              aria-label={`Notifications${
                unreadCount ? `, ${unreadCount} unread` : ""
              }`}
            >
              <FiBell />
              {unreadCount > 0 && (
                <span className={styles.badge}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeaderWrapper}>
                  <h3 className={styles.dropdownHeader}>Notifications</h3>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close notifications"
                  >
                    <FiX />
                  </button>
                </div>

                <div className={styles.dropdownBody}>
                  {notifi.length === 0 ? (
                    <p className={styles.noNotifications}>
                      You’re all caught up 🎉
                    </p>
                  ) : (
                    notifi.map((n) => {
                      const dateObj = new Date(n.date);
                      return (
                        <div
                          key={n._id}
                          className={`${styles.notificationItem} ${
                            n.isRead ? "" : styles.unread
                          }`}
                        >
                          <div className={styles.textBlock}>
                            <h4>{n.message}</h4>
                            {n.subMessage && <p>{n.subMessage}</p>}
                          </div>
                          <div className={styles.dateBlock}>
                            <span className={styles.day}>
                              {dateObj.getDate()}
                            </span>
                            <span className={styles.monthYear}>
                              {dateObj.toLocaleString("default", {
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.profile}>
            {avatar}
            <div className={styles.profileInfo}>
              <h4>{userProfile?.name || "User"}</h4>
              <p>{userProfile?.courseDetails?.courseName || "Loading…"}</p>
            </div>
          </div>

          <button
            className={`${styles.iconBtn} ${styles.logoutBtn}`}
            onClick={() => setShowLogoutModal(true)}
            aria-label="Log out"
          >
            <FiLogOut />
          </button>

          {/* Hamburger — only visible on compact screens */}
          <button
            className={styles.hamburger}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span
              className={`${styles.bar} ${isMobileMenuOpen ? styles.open : ""}`}
            />
            <span
              className={`${styles.bar} ${isMobileMenuOpen ? styles.open : ""}`}
            />
            <span
              className={`${styles.bar} ${isMobileMenuOpen ? styles.open : ""}`}
            />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`${styles.scrim} ${isMobileMenuOpen ? styles.scrimOpen : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`${styles.drawer} ${
          isMobileMenuOpen ? styles.drawerOpen : ""
        }`}
      >
        <div className={styles.drawerProfile}>
          {avatar}
          <div className={styles.profileInfo}>
            <h4>{userProfile?.name || "User"}</h4>
            <p>{userProfile?.courseDetails?.courseName || "Loading…"}</p>
          </div>
        </div>

        <nav className={styles.drawerNav} aria-label="Mobile">
          {navItems.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              className={`${styles.drawerLink} ${
                isActive(path) ? styles.drawerLinkActive : ""
              }`}
              onClick={() => handleNavClick(path)}
            >
              <Icon className={styles.drawerIcon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button
          className={styles.drawerLogout}
          onClick={() => {
            setIsMobileMenuOpen(false);
            setShowLogoutModal(true);
          }}
        >
          <FiLogOut /> Log out
        </button>
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal
          closeModal={() => setShowLogoutModal(false)}
          onConfirmLogout={confirmLogout}
        />
      )}
    </>
  );
};

export default Header;
