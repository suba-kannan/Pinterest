import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, ChevronDown, Check, Users, Image as ImageIcon, Camera, Globe, ArrowUpRight } from 'lucide-react';

const HERO_IMAGES_COLUMN_1 = [
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop&q=80', // decor
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&auto=format&fit=crop&q=80', // fashion
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80'  // food
];

const HERO_IMAGES_COLUMN_2 = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80', // travel
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80', // art
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&auto=format&fit=crop&q=80'  // nature
];

const HERO_IMAGES_COLUMN_3 = [
  'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=300&auto=format&fit=crop&q=80', // camera
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300&auto=format&fit=crop&q=80', // forest
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=300&auto=format&fit=crop&q=80'  // cat
];

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect to feed if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/feed');
    }
  }, [user, authLoading, navigate]);

  // Handle URL hash routing and smooth scroll
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location]);

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    navigate(`?modal=signup&email=${encodeURIComponent(email)}`);
  };

  const scrollToFeatures = () => {
    document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white min-h-screen text-gray-800">
      
      {/* 1. Hero Block */}
      <section className="relative overflow-hidden pt-12 pb-24 md:py-32 px-4 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
        
        {/* Left Side: Copy */}
        <div className="flex-1 text-center md:text-left space-y-6 md:space-y-8 z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#111111] leading-tight tracking-tight max-w-xl">
            Create the life you love on <span className="text-[#E60023] hover:underline cursor-pointer">Pinterest</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
            Search for a recipe, home styling guides, style inspiration, or creative projects to build your ideas bank.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <button
              onClick={() => navigate('?modal=signup')}
              className="w-full sm:w-auto px-8 py-4 bg-[#E60023] hover:bg-[#AD0018] text-white rounded-full font-bold text-base shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Join Pinterest for free
            </button>
            <button
              onClick={scrollToFeatures}
              className="w-full sm:w-auto px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-bold text-base border border-gray-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Explore features
            </button>
          </div>
        </div>

        {/* Right Side: Staggered Floating Grid */}
        <div className="flex-1 w-full max-w-xl flex gap-4 md:gap-6 justify-center overflow-visible select-none pointer-events-none md:h-[500px]">
          {/* Column 1 */}
          <div className="flex flex-col gap-4 md:gap-6 animate-float-slow">
            {HERO_IMAGES_COLUMN_1.map((url, idx) => (
              <div key={idx} className="rounded-3xl overflow-hidden shadow-md border border-gray-100 transform hover:scale-[1.03] transition-all duration-300">
                <img src={url} alt="" className="w-full object-cover rounded-3xl" />
              </div>
            ))}
          </div>
          {/* Column 2 */}
          <div className="flex flex-col gap-4 md:gap-6 mt-12 animate-float-medium">
            {HERO_IMAGES_COLUMN_2.map((url, idx) => (
              <div key={idx} className="rounded-3xl overflow-hidden shadow-md border border-gray-100 transform hover:scale-[1.03] transition-all duration-300">
                <img src={url} alt="" className="w-full object-cover rounded-3xl" />
              </div>
            ))}
          </div>
          {/* Column 3 */}
          <div className="flex flex-col gap-4 md:gap-6 mt-[-32px] animate-float-fast">
            {HERO_IMAGES_COLUMN_3.map((url, idx) => (
              <div key={idx} className="rounded-3xl overflow-hidden shadow-md border border-gray-100 transform hover:scale-[1.03] transition-all duration-300">
                <img src={url} alt="" className="w-full object-cover rounded-3xl" />
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Down Chevron Trigger */}
      <div className="flex justify-center pb-12">
        <button
          onClick={scrollToFeatures}
          className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronDown className="animate-bounce" size={20} />
        </button>
      </div>

      {/* 2. Interactive Feature Columns */}
      <section id="explore-section" className="bg-gray-50 py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-32">
          
          {/* Feature 1: Skin Tone Ranges */}
          <div id="about-section" className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 space-y-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E60023] uppercase tracking-wider bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                <Search size={12} />
                Inclusivity Engine
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#111111] leading-tight">
                Find beauty and style ideas tailored directly to you
              </h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                Explore makeup tutorials, hair styling guides, and skincare routines customized to match your preferences and style profile.
              </p>
              <div className="flex gap-2">
                {['#f9ebd4', '#ebd2b2', '#cfa17b', '#906443', '#492f1b'].map((color, idx) => (
                  <button
                    key={idx}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title="Skin tone range filter selection mockup"
                  />
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full flex justify-center">
              <div className="relative max-w-sm w-full bg-white rounded-3xl p-4 shadow-xl border border-gray-100/50">
                <img
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=450&auto=format&fit=crop&q=80"
                  alt="Beauty and styling results mockup page"
                  className="w-full h-80 object-cover rounded-2xl shadow-inner"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-lg border border-gray-100 max-w-[200px] animate-pulse">
                  <p className="text-xs font-bold text-[#111111]">Filtered Search</p>
                  <p className="text-[10px] text-gray-500 mt-1">Showing 1,250 results matching your selections.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Collaborate Group Boards */}
          <div id="business-section" className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
            <div className="flex-1 space-y-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                <Users size={12} />
                Group Collaboration
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#111111] leading-tight">
                Collaborate with friends on group boards
              </h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                Planning a trip, preparing a birthday event, or designing a room? Group boards let you share ideas, comment on pins, and organize inspiration together.
              </p>
            </div>
            
            <div className="flex-1 w-full flex justify-center">
              <div className="max-w-md w-full bg-white rounded-[32px] p-6 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h3 className="font-extrabold text-gray-800 text-sm">🏡 Cozy Living Room Redesign</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Collaborative Board</p>
                  </div>
                  <div className="flex -space-x-2">
                    {['A', 'B', 'C'].map((char, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm ${
                        i === 0 ? 'bg-red-400' : i === 1 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&auto=format&fit=crop&q=80" alt="" className="rounded-xl aspect-[4/5] object-cover" />
                  <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=150&auto=format&fit=crop&q=80" alt="" className="rounded-xl aspect-[4/5] object-cover" />
                  <img src="https://images.unsplash.com/photo-1540518614846-7eed4335639b?w=150&auto=format&fit=crop&q=80" alt="" className="rounded-xl aspect-[4/5] object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Smart Visual Search */}
          <div id="watch-section" className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 space-y-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 uppercase tracking-wider bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                <Camera size={12} />
                Visual Search Lens
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#111111] leading-tight">
                Search visually with smart image matching
              </h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                See something you like in a photograph? Tap the camera lens selector on any photo to pinpoint specific items and view matching products or links.
              </p>
            </div>
            
            <div className="flex-1 w-full flex justify-center">
              <div className="relative max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=450&auto=format&fit=crop&q=80"
                  alt="Smart search mockup"
                  className="w-full h-80 object-cover"
                />
                {/* Simulated visual lens points */}
                <div className="absolute top-1/4 left-1/3 w-6 h-6 rounded-full border-2 border-white bg-[#E60023] shadow-md flex items-center justify-center animate-ping" />
                <div className="absolute top-1/4 left-1/3 w-6 h-6 rounded-full border-2 border-white bg-[#E60023]/80 shadow-md flex items-center justify-center" />

                <div className="absolute top-2/3 right-1/4 w-6 h-6 rounded-full border-2 border-white bg-white/70 shadow-md flex items-center justify-center" />
                
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl py-2 px-3 shadow-md text-xs font-bold border border-gray-100 flex items-center gap-1">
                  <span>Visual Match: Linen Dress</span>
                  <ArrowUpRight size={14} className="text-[#E60023]" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Pinterest Blog Highlights */}
          <div id="blog-section" className="border-t border-gray-200 pt-32 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                <Globe size={12} />
                Pinterest Newsroom & Blog
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#111111] leading-tight">
                Stay updated with the Pinterest Blog
              </h2>
              <p className="text-gray-500 font-medium">
                Stories, design systems, technical breakthroughs, and lifestyle tips written directly by the Pinterest team.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Blog Card 1 */}
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80" alt="Cooking Blog" className="w-full h-48 object-cover" />
                <div className="p-6 space-y-3">
                  <span className="text-[10px] font-bold text-red-500 uppercase">Recipes & Kitchen</span>
                  <h3 className="font-extrabold text-gray-800 text-base leading-snug">
                    10 Quick Summer Recipes Trending Globally on Pinterest
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    From cold noodle cups to custom juice pairings, discover what creators are preparing this summer.
                  </p>
                </div>
              </div>

              {/* Blog Card 2 */}
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
                <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80" alt="Home Decor Blog" className="w-full h-48 object-cover" />
                <div className="p-6 space-y-3">
                  <span className="text-[10px] font-bold text-blue-500 uppercase">Interior Design</span>
                  <h3 className="font-extrabold text-gray-800 text-base leading-snug">
                    Making Small Spaces Feel Grand: Minimalist Styling Guides
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Cozy bedroom redesigns and functional modular furniture systems trending on board collections.
                  </p>
                </div>
              </div>

              {/* Blog Card 3 */}
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
                <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80" alt="Tech Blog" className="w-full h-48 object-cover" />
                <div className="p-6 space-y-3">
                  <span className="text-[10px] font-bold text-green-500 uppercase">Engineering & Tech</span>
                  <h3 className="font-extrabold text-gray-800 text-base leading-snug">
                    How Pinterest Scales Visual Search Matching Using Vector DBs
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Deep dive into visual index searches matching pixels to catalog shopping products dynamically.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Conversion Sign up Section */}
      <section className="relative py-28 overflow-hidden flex items-center justify-center bg-[#111111]">
        
        {/* Background Grid Image Cover Overlay */}
        <div className="absolute inset-0 opacity-15 select-none pointer-events-none grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-4">
          {Array.from({ length: 24 }).map((_, idx) => (
            <div key={idx} className="aspect-[3/4] bg-gray-500 rounded-xl" />
          ))}
        </div>

        {/* Signup Container Card */}
        <div className="relative bg-white rounded-[32px] p-8 md:p-12 max-w-lg w-full mx-4 shadow-2xl border border-gray-100 flex flex-col items-center text-center z-10">
          <div className="w-12 h-12 bg-[#E60023] rounded-full flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.17-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.993 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
            </svg>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-gray-800 leading-tight">
            Sign up to find new ideas
          </h2>
          <p className="text-gray-500 text-xs font-semibold mt-2.5 max-w-xs">
            Save cooking recipes, style inspirations, DIY ideas and other visuals to try.
          </p>

          <form onSubmit={handleSignupSubmit} className="w-full mt-8 space-y-3">
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-xs font-medium text-gray-800 transition-all rounded-xl"
            />
            <input
              type="password"
              placeholder="Create a password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-xs font-medium text-gray-800 transition-all rounded-xl"
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#E60023] hover:bg-[#AD0018] text-white rounded-xl text-xs font-bold transition-all shadow-md hover:scale-[1.01] active:scale-95 cursor-pointer mt-2"
            >
              Continue
            </button>
          </form>

          <div className="w-full flex items-center justify-center gap-3 my-6">
            <span className="h-[1px] bg-gray-100 flex-1" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">or</span>
            <span className="h-[1px] bg-gray-100 flex-1" />
          </div>

          <button
            onClick={() => navigate('?modal=login')}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all border border-gray-200 cursor-pointer"
          >
            Log in to existing account
          </button>
        </div>

      </section>

      {/* 4. Polished Footer Section */}
      <footer className="bg-black text-gray-400 py-16 px-4 md:px-12 border-t border-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold">
              <svg className="w-6 h-6 text-[#E60023]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.17-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.993 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
              </svg>
              <span>Pinterest</span>
            </div>
            <p className="text-xs text-gray-500 max-w-xs">
              Pinterest-inspired full stack application. Designed for visual discovery, curation, and sharing.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Discover</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Recipes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Home Decor</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fashion Styling</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Engineering</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Guidelines</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-900 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-600">
          <span>&copy; {new Date().getFullYear()} Pinterest, Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400">English</a>
            <a href="#" className="hover:text-gray-400">Terms</a>
            <a href="#" className="hover:text-gray-400">Privacy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
