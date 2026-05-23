import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import MasonryGrid from '../components/MasonryGrid';
import { ArrowLeft, Trash2, Loader2, Lock, Eye } from 'lucide-react';

export default function BoardDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await api.get(`/boards/${id}`);
        setBoard(res.data);
      } catch (err) {
        console.error('Error fetching board details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [id]);

  const handleDeleteBoard = async () => {
    if (window.confirm('Are you sure you want to delete this board? This will not delete the pins themselves, only the board.')) {
      setDeleting(true);
      try {
        await api.delete(`/boards/${id}`);
        navigate('/profile');
      } catch (err) {
        console.error('Error deleting board', err);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleRemovePin = async (pinId) => {
    try {
      await api.delete(`/boards/${id}/pin/${pinId}`);
      setBoard(prev => ({
        ...prev,
        pins: prev.pins.filter(pin => pin._id !== pinId)
      }));
    } catch (err) {
      console.error('Error removing pin from board', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E60023]" size={32} />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800">Board not found</h2>
        <p className="text-gray-500 mt-2">The board may be private or has been deleted.</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-[#E60023] text-white rounded-full font-semibold text-sm hover:bg-[#AD0018]">
          Back to Home
        </button>
      </div>
    );
  }

  const isOwner = user && board.user && user._id === board.user._id;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 hover:bg-gray-100 py-2 px-4 rounded-full text-gray-700 font-semibold transition-all text-sm cursor-pointer border border-transparent hover:border-gray-200"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Board Info Header */}
      <div className="flex flex-col items-center text-center max-w-lg mx-auto mb-10">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight leading-tight">
            {board.name}
          </h1>
          {board.isSecret ? (
            <Lock size={18} className="text-gray-400" title="Secret board" />
          ) : (
            <Eye size={18} className="text-gray-400" title="Public board" />
          )}
        </div>

        {board.description && (
          <p className="text-gray-500 text-sm mt-1 px-4">
            {board.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3 font-semibold">
          <span>Created by</span>
          <Link to={`/profile/${board.user?._id}`} className="text-gray-800 hover:underline">
            {board.user?.username}
          </Link>
          <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
          <span>{board.pins?.length || 0} Pins</span>
        </div>

        {isOwner && (
          <button
            onClick={handleDeleteBoard}
            disabled={deleting}
            className="mt-6 px-4 py-2 bg-red-50 hover:bg-red-100 text-[#E60023] rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={14} />}
            Delete Board
          </button>
        )}
      </div>

      {/* Board Pins Grid */}
      <div className="border-t border-gray-100 pt-8">
        {board.pins && board.pins.length > 0 ? (
          <MasonryGrid
            pins={board.pins}
            onSaveToggle={(pinId) => isOwner && handleRemovePin(pinId)}
          />
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm italic">No pins saved in this board yet.</p>
            {isOwner && (
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-2.5 bg-[#E60023] hover:bg-[#AD0018] text-white rounded-full font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Browse Pins to Save
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
