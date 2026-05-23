import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Download, ArrowUpRight, Heart } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { getAvatarColor } from '../utils/avatar';

export default function PinCard({ pin, onSaveToggle, onClick }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(user?.savedPins?.includes(pin._id) || false);
  const [isLiked, setIsLiked] = useState(pin.likes?.includes(user?._id) || false);
  const [likesCount, setLikesCount] = useState(pin.likes?.length || 0);

  const handleCardClick = () => {
    if (onClick) {
      onClick(pin._id);
    } else {
      navigate(`/pin/${pin._id}`);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/pins/${pin._id}/save`);
      setIsSaved(res.data.saved);
      if (onSaveToggle) onSaveToggle(pin._id, res.data.saved);
    } catch (err) {
      console.error('Error saving pin', err);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/pins/${pin._id}/like`);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      console.error('Error liking pin', err);
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const imageUrl = `http://localhost:5000${pin.image}`;
    const filename = pin.title.replace(/\s+/g, '-').toLowerCase() + '.jpg';
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.error('Error downloading image', err));
  };

  const getDomain = (url) => {
    if (!url) return '';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="break-inside-avoid mb-4 group cursor-pointer w-full inline-block"
    >
      {/* Image container */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md">
        <img
          src={`http://localhost:5000${pin.image}`}
          alt={pin.title}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover overlay */}
        {hovered && (
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-3 z-10 transition-opacity duration-200">
            {/* Top row */}
            <div className="flex justify-between items-center w-full">
              <span className="text-white text-xs bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-full font-medium">
                {pin.category}
              </span>
              <button
                onClick={handleSave}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 transform hover:scale-105 active:scale-95 ${
                  isSaved
                    ? 'bg-black text-white'
                    : 'bg-[#E60023] hover:bg-[#AD0018] text-white shadow-sm'
                }`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-center w-full gap-2">
              {pin.destinationUrl ? (
                <a
                  href={pin.destinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 max-w-[60%] text-xs font-semibold bg-white/90 hover:bg-white text-gray-800 py-1.5 px-3 rounded-full transition-all"
                >
                  <ArrowUpRight size={14} className="flex-shrink-0" />
                  <span className="truncate">{getDomain(pin.destinationUrl)}</span>
                </a>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleLike}
                  className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="Like Pin"
                >
                  <Heart
                    size={16}
                    className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-800'}
                  />
                </button>
                <button
                  onClick={handleDownload}
                  className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="Download Image"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info below image */}
      <div className="mt-2 px-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
          {pin.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5 gap-2">
          {pin.user && (
            <Link
              to={`/profile/${pin.user._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 hover:underline"
            >
              {pin.user.profileImage ? (
                <img
                  src={`http://localhost:5000${pin.user.profileImage}`}
                  alt={pin.user.username}
                  className="w-6 h-6 rounded-full object-cover border border-gray-100"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pin.user.username)}&background=random&color=fff`;
                  }}
                />
              ) : (
                <div className={`w-6 h-6 rounded-full ${getAvatarColor(pin.user.username)} text-white flex items-center justify-center text-xs font-semibold uppercase`}>
                  {user && user._id === pin.user._id ? user.username.charAt(0) : pin.user.username.charAt(0)}
                </div>
              )}
              <span className="text-xs text-gray-600 font-medium truncate max-w-[100px]">
                {pin.user.username}
              </span>
            </Link>
          )}

          {likesCount > 0 && (
            <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
              <Heart size={12} className="fill-red-500 text-red-500" />
              <span>{likesCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
