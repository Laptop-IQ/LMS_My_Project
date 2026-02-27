import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { navbarStyles } from "../assets/dummyStyles";
import logo from "../assets/logo.png";
import {
  BookMarked,
  BookOpen,
  Contact,
  Home,
  Users,
  LogOut,
  User,
  BookOpenText,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { TOKEN_KEY } from "@/constants/auth";

const baseNav = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Courses", icon: BookOpen, href: "/courses" },
  { name: "About", icon: BookMarked, href: "/about" },
  { name: "Faculty", icon: Users, href: "/faculty" },
  { name: "Contact", icon: Contact, href: "/contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem(TOKEN_KEY);
  const user = JSON.parse(localStorage.getItem("user"));
  const isSignedIn = !!token;

  const navItems = isSignedIn
    ? [
        ...baseNav,
        { name: "My Courses", icon: BookOpenText, href: "/mycourses" },
      ]
    : baseNav;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
    setMobileOpen(false);
  };

  const desktopLinkClass = (isActive) =>
    `${navbarStyles.desktopNavItem} ${isActive ? navbarStyles.desktopNavItemActive : ""}`;

  const mobileLinkClass = (isActive) =>
    `block px-4 py-2 rounded hover:bg-sky-100 ${
      isActive ? "bg-sky-200 font-semibold" : ""
    }`;

  return (
    <nav
      className={`${navbarStyles.navbar} ${
        isScrolled ? navbarStyles.navbarScrolled : navbarStyles.navbarDefault
      }`}
    >
      <div className={navbarStyles.container}>
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 select-none">
            <img src={logo} alt="Logo" className="w-12 h-12" />
            <div className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-sky-700 to-cyan-600 font-serif">
              SkillForge
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) => desktopLinkClass(isActive)}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={navbarStyles.desktopNavIcon} />
                    <span className={navbarStyles.desktopNavText}>
                      {item.name}
                    </span>
                  </div>
                </NavLink>
              );
            })}

            {token ? (
              <div
                onClick={logoutHandler}
                className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-600 font-semibold ml-4"
              >
                <LogOut size={18} />
                Logout
              </div>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  desktopLinkClass(isActive) + " ml-4"
                }
              >
                <div className="flex items-center gap-2">
                  <User size={18} />
                  Login
                </div>
              </NavLink>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-2 bg-white shadow rounded-md p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) => mobileLinkClass(isActive)}
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} />
                    {item.name}
                  </div>
                </NavLink>
              );
            })}

            <div className="mt-2 border-t pt-2">
              {token ? (
                <div
                  onClick={logoutHandler}
                  className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-600 font-semibold px-4 py-2 rounded"
                >
                  <LogOut size={18} /> Logout
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) => mobileLinkClass(isActive)}
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <User size={18} /> Login
                  </div>
                </NavLink>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
