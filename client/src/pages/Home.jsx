import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import CategoryChips from '../components/CategoryChips';
import MasonryGrid from '../components/MasonryGrid';
import { Loader2 } from 'lucide-react';
import PinDetail from './PinDetail';

export default function Home() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('All');
  const [selectedPinId, setSelectedPinId] = useState(null);

  // Redirect to landing page if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const observer = useRef();
  
  const lastPinElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Reset list when filters/search changes
  useEffect(() => {
    setPins([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery, category]);

  useEffect(() => {
    const fetchPins = async () => {
      setLoading(true);
      try {
        const res = await api.get('/pins', {
          params: {
            search: searchQuery,
            category: category === 'All' ? '' : category,
            page,
            limit: 15
          }
        });
        
        setPins((prevPins) => {
          if (page === 1) {
            return res.data.pins;
          } else {
            const existingIds = new Set(prevPins.map(p => p._id));
            const newPins = res.data.pins.filter(p => !existingIds.has(p._id));
            return [...prevPins, ...newPins];
          }
        });
        
        setHasMore(res.data.hasMore);
      } catch (err) {
        console.error('Error fetching pins', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPins();
  }, [searchQuery, category, page]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E60023]" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 min-h-screen">
      {/* Category Selection */}
      <CategoryChips activeCategory={category} onSelectCategory={setCategory} />

      {/* Main Grid */}
      <div className="mt-6">
        <MasonryGrid pins={pins} onPinClick={(id) => setSelectedPinId(id)} />
      </div>

      {/* Loading & Infinite Scroll Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-[#E60023]" size={32} />
        </div>
      )}

      {/* Invisible anchor element for intersection observer */}
      {!loading && hasMore && pins.length > 0 && (
        <div ref={lastPinElementRef} className="h-10 w-full" />
      )}

      {/* Detail Overlay Modal */}
      {selectedPinId && (
        <PinDetail pinId={selectedPinId} onClose={() => setSelectedPinId(null)} />
      )}
    </div>
  );
}
