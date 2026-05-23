import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, LogOut, Plus, X } from 'lucide-react';
import { getAvatarColor } from '../utils/avatar';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const debounceRef = useRef(null);

  // Sync search input with URL on route change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('search') || '');
  }, [location.pathname]); // only sync when path changes, not on every search param update

  // Live debounced search — navigates after 400ms of no typing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        navigate(`/feed?search=${encodeURIComponent(value.trim())}`, { replace: true });
      } else {
        navigate('/feed', { replace: true });
      }
    }, 400);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchTerm.trim()) {
      navigate(`/feed?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/feed');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate('/feed', { replace: true });
  };

  const handleScrollTo = (e, elementId) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${elementId}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 py-3 px-4 md:px-6 flex items-center justify-between gap-3 md:gap-6 shadow-sm">
      
      {/* Left side: Logo & Navigation Links */}
      <div className="flex items-center gap-3">
        <Link to={user ? "/feed" : "/"} className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 bg-[#E60023] rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md">
            <span className="text-white font-bold text-xl font-serif">P</span>
          </div>
        </Link>

        {/* Navigation Links for Authenticated Users */}
        {user && (
          <div className="hidden sm:flex items-center gap-1">
            <Link
              to="/feed"
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                location.pathname === '/feed' && !location.search.includes('saved')
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              Home
            </Link>
            <Link
              to="/create"
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                location.pathname === '/create'
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              Create
            </Link>
          </div>
        )}

        {/* Navigation Links for Guest Users */}
        {!user && (
          <div className="hidden md:flex items-center gap-1">
            <a
              href="#explore-section"
              onClick={(e) => handleScrollTo(e, 'explore-section')}
              className="px-4 py-2.5 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Explore
            </a>
            <a
              href="#watch-section"
              onClick={(e) => handleScrollTo(e, 'watch-section')}
              className="px-4 py-2.5 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Watch
            </a>
          </div>
        )}
      </div>

      {/* Center: Search Bar (Only shown to Logged In users) */}
      {user ? (
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-3xl">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors pointer-events-none" size={18} />
            <input
              type="text"
              placeholder="Search for ideas, categories, creators..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-[#E9E9E9] hover:bg-[#E1E1E1] focus:bg-white focus:ring-4 focus:ring-red-100 border-none outline-none py-2.5 pl-12 pr-10 rounded-full text-sm text-gray-800 transition-all duration-200 shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </form>
      ) : (
        /* Spacer when not logged in to push links/buttons to sides */
        <div className="flex-grow" />
      )}

      {/* Right side Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {!user && (
          <div className="hidden lg:flex items-center gap-1 mr-2">
            <a
              href="#about-section"
              onClick={(e) => handleScrollTo(e, 'about-section')}
              className="px-3 py-2 rounded-full text-sm font-semibold text-gray-700 hover:text-black transition-colors"
            >
              About
            </a>
            <a
              href="#business-section"
              onClick={(e) => handleScrollTo(e, 'business-section')}
              className="px-3 py-2 rounded-full text-sm font-semibold text-gray-700 hover:text-black transition-colors"
            >
              Business
            </a>
            <a
              href="#blog-section"
              onClick={(e) => handleScrollTo(e, 'blog-section')}
              className="px-3 py-2 rounded-full text-sm font-semibold text-gray-700 hover:text-black transition-colors"
            >
              Blog
            </a>
          </div>
        )}

        {user ? (
          <>
            <Link
              to="/create"
              className="sm:hidden w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 text-gray-800"
            >
              <Plus size={20} />
            </Link>
            <Link
              to={`/profile/${user._id}`}
              className="flex items-center gap-1.5 p-0.5 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              {user.profileImage ? (
                <img
                  src={`http://localhost:5000${user.profileImage}`}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff`;
                  }}
                />
              ) : (
                <div className={`w-9 h-9 rounded-full ${getAvatarColor(user.username)} text-white flex items-center justify-center text-sm font-semibold uppercase`}>
                  {user.username.charAt(0)}
                </div>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="w-9 h-9 hover:bg-red-50 text-gray-600 hover:text-[#E60023] rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="?modal=login"
              className="px-4 py-2.5 rounded-full text-sm font-bold bg-[#E60023] hover:bg-[#AD0018] text-white transition-all duration-200 shadow-sm hover:shadow active:scale-95 cursor-pointer"
            >
              Log in
            </Link>
            <Link
              to="?modal=signup"
              className="px-4 py-2.5 rounded-full text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

    </nav>
  );
}
