import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import MasonryGrid from '../components/MasonryGrid';
import { getAvatarColor } from '../utils/avatar';
import BoardSelector from '../components/BoardSelector';
import { Heart, Download, Trash2, ArrowLeft, Send, ArrowUpRight, Share2, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function PinDetail({ pinId, onClose }) {
  const { id: routeId } = useParams();
  const id = pinId || routeId;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [pin, setPin] = useState(null);
  const [relatedPins, setRelatedPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyTexts, setReplyTexts] = useState({});
  const [activeReplyInput, setActiveReplyInput] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    const text = replyTexts[commentId];
    if (!text || !text.trim()) return;
    try {
      const res = await api.post(`/pins/${id}/comment/${commentId}/reply`, { text });
      setPin(prev => ({ ...prev, comments: res.data }));
      setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
      setActiveReplyInput(null);
    } catch (err) {
      console.error('Error replying to comment', err);
    }
  };

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Board Selector Popover State
  const [showBoardSelector, setShowBoardSelector] = useState(false);

  // Share link copied toast state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPin = async () => {
      try {
        const res = await api.get(`/pins/${id}`);
        const pinData = res.data.pin;
        setPin(pinData);
        setRelatedPins(res.data.relatedPins || []);
        
        setIsLiked(pinData.likes?.includes(user?._id) || false);
        setIsSaved(user?.savedPins?.includes(pinData._id) || false);
        
        // Follow state
        setIsFollowing(user?.following?.includes(pinData.user?._id) || pinData.user?.followers?.includes(user?._id) || false);
        setFollowersCount(pinData.user?.followers?.length || 0);
      } catch (err) {
        console.error('Error fetching pin details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPin();
  }, [id, user]);

  const handleSaveToggle = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowBoardSelector(!showBoardSelector);
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/pins/${id}/like`);
      setIsLiked(res.data.liked);
      setPin(prev => ({
        ...prev,
        likes: res.data.liked 
          ? [...prev.likes, user._id] 
          : prev.likes.filter(uid => uid !== user._id)
      }));
    } catch (err) {
      console.error('Error liking pin', err);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/auth/follow/${pin.user._id}`);
      setIsFollowing(res.data.followed);
      setFollowersCount(res.data.followersCount);
    } catch (err) {
      console.error('Error toggling follow', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmittingComment(true);
    try {
      const res = await api.post(`/pins/${id}/comment`, { text: commentText });
      setPin(prev => ({ ...prev, comments: res.data }));
      setCommentText('');
    } catch (err) {
      console.error('Error commenting', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      const res = await api.delete(`/pins/${id}/comment/${commentId}`);
      setPin(prev => ({ ...prev, comments: res.data }));
    } catch (err) {
      console.error('Error deleting comment', err);
    }
  };

  const handleDeletePin = async () => {
    if (window.confirm('Are you sure you want to delete this pin?')) {
      try {
        await api.delete(`/pins/${id}`);
        if (onClose) {
          onClose();
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Error deleting pin', err);
      }
    }
  };

  const handleDownload = () => {
    if (!pin) return;
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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/pin/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDomain = (url) => {
    if (!url) return '';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };

  const isModal = !!pinId;

  if (loading) {
    return (
      <div className={isModal ? "p-20 flex items-center justify-center" : "min-h-[80vh] flex items-center justify-center"}>
        <div className="animate-spin text-[#E60023] rounded-full h-12 w-12 border-4 border-t-transparent border-red-500"></div>
      </div>
    );
  }

  if (!pin) {
    return (
      <div className={isModal ? "p-12 text-center" : "min-h-[80vh] flex flex-col items-center justify-center text-center px-4"}>
        <h2 className="text-2xl font-bold text-gray-800">Pin not found</h2>
        <p className="text-gray-500 mt-2">The pin you are looking for does not exist or has been deleted.</p>
        {!isModal && (
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-[#E60023] text-white rounded-full font-semibold text-sm hover:bg-[#AD0018]">
            Back to Home
          </button>
        )}
      </div>
    );
  }

  const isOwner = user && pin.user && user._id === pin.user._id;
  const allImages = [pin.image, ...(pin.images || [])].filter(Boolean);

  const mainContent = (
    <div className={isModal ? "p-2 md:p-6" : ""}>
      {/* Back Button */}
      {!isModal && (
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 hover:bg-gray-100 py-2 px-4 rounded-full text-gray-700 font-semibold transition-all text-sm cursor-pointer border border-transparent hover:border-gray-200"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      )}

      {/* Main card */}
      <div className={`bg-white rounded-[32px] overflow-visible ${isModal ? 'shadow-none border-0' : 'shadow-xl border border-gray-100 mb-16'} flex flex-col md:flex-row min-h-[600px] transition-all`}>
        
        {/* Left Side: Pin Image or Carousel */}
        <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 rounded-t-[32px] md:rounded-l-[32px] md:rounded-tr-none">
          <div className="relative rounded-2xl overflow-hidden shadow-md max-h-[75vh] w-full flex justify-center bg-white group">
            {allImages.length > 1 ? (
              <>
                <img
                  src={`http://localhost:5000${allImages[activeSlide]}`}
                  alt={pin.title}
                  className="max-h-[75vh] w-auto object-contain rounded-2xl transition-all duration-300"
                />
                <button
                  onClick={() => setActiveSlide(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setActiveSlide(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${activeSlide === idx ? 'bg-white scale-125' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <img
                src={`http://localhost:5000${pin.image}`}
                alt={pin.title}
                className="max-h-[75vh] w-auto object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
            )}
          </div>
        </div>

        {/* Right Side: Pin Details & Comments */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between overflow-visible">
          <div>
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6 relative">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="w-11 h-11 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Download Image"
                >
                  <Download size={20} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-11 h-11 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative cursor-pointer"
                  title="Copy Link"
                >
                  {copied ? <Check size={20} className="text-green-600 animate-scaleIn" /> : <Share2 size={20} />}
                  {copied && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md">
                      Link copied!
                    </span>
                  )}
                </button>

                {isOwner && (
                  <button
                    onClick={handleDeletePin}
                    className="w-11 h-11 bg-red-50 hover:bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Delete Pin"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              {/* Save/Saved Button & Board Selector */}
              <div className="relative">
                <button
                  onClick={handleSaveToggle}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer text-sm ${
                    isSaved
                      ? 'bg-black text-white'
                      : 'bg-[#E60023] hover:bg-[#AD0018] text-white shadow-md'
                  }`}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                {showBoardSelector && (
                  <div className="absolute right-0 top-14 z-30">
                    <BoardSelector
                      pinId={pin._id}
                      onSaveComplete={() => {
                        setIsSaved(true);
                        setShowBoardSelector(false);
                      }}
                      onClose={() => setShowBoardSelector(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Destination URL */}
            {pin.destinationUrl && (
              <a
                href={pin.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 underline hover:text-[#E60023] mb-4 hover:scale-105 transition-transform"
              >
                <span>{getDomain(pin.destinationUrl)}</span>
                <ArrowUpRight size={14} />
              </a>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight leading-tight">
              {pin.title}
            </h1>

            {/* Description */}
            <p className="text-gray-600 mt-4 text-sm md:text-base leading-relaxed">
              {pin.description || 'No description provided.'}
            </p>

            {/* View count and Category */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                {pin.category}
              </span>
              <span className="text-xs text-gray-400 font-semibold">
                {pin.views || 0} views
              </span>
            </div>

            {/* Tags rendering */}
            {pin.tags && pin.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {pin.tags.map((tag, index) => (
                  <span key={index} className="text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Creator Profile */}
            {pin.user && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-6 gap-4">
                <Link to={`/profile/${pin.user._id}`} className="flex items-center gap-3 group">
                  {pin.user.profileImage ? (
                    <img
                      src={`http://localhost:5000${pin.user.profileImage}`}
                      alt={pin.user.username}
                      className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pin.user.username)}&background=random&color=fff`;
                      }}
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(pin.user.username)} text-white flex items-center justify-center text-lg font-semibold uppercase shadow-sm`}>
                      {pin.user.username.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm group-hover:underline leading-none">
                      {pin.user.displayName || pin.user.username}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1.5">
                      {followersCount} followers
                    </p>
                  </div>
                </Link>

                {/* Follow & Like Buttons */}
                <div className="flex items-center gap-2">
                  {!isOwner && (
                    <button
                      onClick={handleFollowToggle}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
                        isFollowing
                          ? 'bg-black text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}

                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer text-xs font-bold hover:scale-105 active:scale-95 ${
                      isLiked
                        ? 'bg-red-50 border-red-200 text-[#E60023]'
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                    <span>{pin.likes?.length || 0}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comments Panel */}
          <div className="border-t border-gray-100 pt-6 mt-8 flex-1 flex flex-col justify-between min-h-[250px]">
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <span>Comments</span>
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {pin.comments?.length || 0}
                </span>
              </h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {pin.comments && pin.comments.length > 0 ? (
                  pin.comments.map((comment) => {
                    const isCommentWriter = user && comment.user && user._id === comment.user._id;
                    const canDelete = isCommentWriter || isOwner;
                    const isReplying = activeReplyInput === comment._id;

                    return (
                      <div key={comment._id} className="flex flex-col gap-1.5 border-b border-gray-50 pb-2.5 last:border-0">
                        <div className="flex gap-3 text-sm group animate-fadeIn">
                          <Link to={`/profile/${comment.user?._id}`} className="flex-shrink-0">
                            {comment.user?.profileImage ? (
                              <img
                                src={`http://localhost:5000${comment.user.profileImage}`}
                                alt={comment.user.username}
                                className="w-8 h-8 rounded-full object-cover border border-gray-100"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.username || 'user')}&background=random&color=fff`;
                                }}
                              />
                            ) : (
                              <div className={`w-8 h-8 rounded-full ${getAvatarColor(comment.user?.username)} text-white flex items-center justify-center text-xs font-semibold uppercase`}>
                                {comment.user?.username?.charAt(0) || 'U'}
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5">
                            <div className="flex items-center justify-between">
                              <Link to={`/profile/${comment.user?._id}`} className="font-bold text-xs text-gray-800 hover:underline">
                                {comment.user?.displayName || comment.user?.username}
                              </Link>
                              <span className="text-[10px] text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 text-xs mt-1 leading-relaxed">
                              {comment.text}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 items-center self-center">
                            {canDelete && (
                              <button
                                onClick={() => handleCommentDelete(comment._id)}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Delete Comment"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                            {user && (
                              <button
                                onClick={() => setActiveReplyInput(isReplying ? null : comment._id)}
                                className="text-[10px] font-bold text-gray-400 hover:text-[#E60023] cursor-pointer"
                              >
                                Reply
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="pl-11 space-y-3 mt-1.5 border-l border-gray-100 ml-4">
                            {comment.replies.map((reply) => {
                              return (
                                <div key={reply._id} className="flex gap-2.5 text-xs animate-fadeIn">
                                  <Link to={`/profile/${reply.user?._id}`} className="flex-shrink-0">
                                    {reply.user?.profileImage ? (
                                      <img
                                        src={`http://localhost:5000${reply.user.profileImage}`}
                                        alt={reply.user.username}
                                        className="w-6 h-6 rounded-full object-cover"
                                        onError={(e) => {
                                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user?.username || 'user')}&background=random&color=fff`;
                                        }}
                                      />
                                    ) : (
                                      <div className={`w-6 h-6 rounded-full ${getAvatarColor(reply.user?.username)} text-white flex items-center justify-center text-[10px] font-semibold uppercase`}>
                                        {reply.user?.username?.charAt(0) || 'U'}
                                      </div>
                                    )}
                                  </Link>
                                  <div className="flex-1 bg-gray-50/50 rounded-xl px-3 py-2">
                                    <div className="flex items-center justify-between">
                                      <Link to={`/profile/${reply.user?._id}`} className="font-bold text-[10px] text-gray-800 hover:underline">
                                        {reply.user?.displayName || reply.user?.username}
                                      </Link>
                                      <span className="text-[9px] text-gray-400">
                                        {new Date(reply.createdAt).toLocaleDateString(undefined, {
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-gray-600 text-xs mt-0.5">
                                      {reply.text}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reply Input Form */}
                        {isReplying && (
                          <form
                            onSubmit={(e) => handleReplySubmit(e, comment._id)}
                            className="pl-11 mt-2 flex items-center gap-2"
                          >
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={replyTexts[comment._id] || ''}
                              onChange={(e) => setReplyTexts(prev => ({ ...prev, [comment._id]: e.target.value }))}
                              className="flex-1 bg-gray-50 focus:bg-white border border-gray-100 rounded-full py-1.5 px-3.5 text-xs text-gray-800 focus:outline-none focus:border-[#E60023]"
                              required
                            />
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-[#E60023] hover:bg-[#AD0018] text-white rounded-full text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Send
                            </button>
                          </form>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm italic py-4">No comments yet. Share your thoughts!</p>
                )}
              </div>
            </div>

            <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center gap-3">
              {user ? (
                user.profileImage ? (
                  <img
                    src={`http://localhost:5000${user.profileImage}`}
                    alt={user.username}
                    className="w-9 h-9 rounded-full object-cover border border-gray-100 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-semibold uppercase flex-shrink-0">
                    {user.username.charAt(0)}
                  </div>
                )
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
              )}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={user ? "Add a comment..." : "Log in to add a comment"}
                  disabled={!user || submittingComment}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-[#E9E9E9] focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-full py-2.5 pl-4 pr-10 text-xs text-gray-800 transition-all"
                />
                <button
                  type="submit"
                  disabled={!user || !commentText.trim() || submittingComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E60023] disabled:text-gray-300 transition-colors cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* "More like this" Section */}
      {relatedPins.length > 0 && (
        <div className="border-t border-gray-100 pt-10">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-800 text-center mb-8">
            More like this
          </h2>
          <MasonryGrid pins={relatedPins} />
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-[32px] max-w-5xl w-full max-h-[92vh] overflow-y-auto relative no-scrollbar shadow-2xl animate-scaleIn"
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-40 bg-white/95 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-md border border-gray-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
          {mainContent}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {mainContent}
    </div>
  );
}
