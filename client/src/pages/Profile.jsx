import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import MasonryGrid from '../components/MasonryGrid';
import PinDetail from './PinDetail';
import { getAvatarColor } from '../utils/avatar';
import { Loader2, Edit3, LogOut, Check, X, Camera, Plus, FolderPlus, MapPin, Globe } from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
);

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const activeUserId = userId || currentUser?._id;

  const [profileUser, setProfileUser] = useState(null);
  const [createdPins, setCreatedPins] = useState([]);
  const [userBoards, setUserBoards] = useState([]);
  const [savedPins, setSavedPins] = useState([]);
  const [activeTab, setActiveTab] = useState('created'); // 'created' or 'saved'
  const [loading, setLoading] = useState(true);
  const [selectedPinId, setSelectedPinId] = useState(null);

  // Edit Mode state
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editPinterest, setEditPinterest] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState('');
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState('');
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState('');

  // Follow states
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Create Board state
  const [boardModal, setBoardModal] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDesc, setBoardDesc] = useState('');
  const [boardSecret, setBoardSecret] = useState(false);
  const [creatingBoard, setCreatingBoard] = useState(false);

  const isOwnProfile = currentUser && currentUser._id === activeUserId;

  useEffect(() => {
    if (!activeUserId) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get(`/auth/profile/${activeUserId}`);
        const user = profileRes.data;
        setProfileUser(user);
        setEditUsername(user.username);
        setEditDisplayName(user.displayName || '');
        setEditBio(user.bio || '');
        setEditLocation(user.location || '');
        setEditWebsite(user.website || '');
        setEditInstagram(user.socialLinks?.instagram || '');
        setEditTwitter(user.socialLinks?.twitter || '');
        setEditPinterest(user.socialLinks?.pinterest || '');
        setEditPreview(user.profileImage ? `http://localhost:5000${user.profileImage}` : '');
        setEditCoverPreview(user.coverImage ? `http://localhost:5000${user.coverImage}` : '');
        setFollowersCount(user.followers?.length || 0);
        setIsFollowing(currentUser?.following?.includes(activeUserId) || user.followers?.includes(currentUser?._id) || false);

        // Fetch pins
        const createdRes = await api.get(`/pins/user/${activeUserId}`);
        setCreatedPins(createdRes.data);

        // Fetch boards
        const boardsRes = await api.get(`/boards/user/${activeUserId}`);
        setUserBoards(boardsRes.data);

        // Fetch saved pins
        const savedRes = await api.get(`/pins/saved/${activeUserId}`);
        setSavedPins(savedRes.data);
      } catch (err) {
        console.error('Error fetching profile data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [activeUserId, navigate, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/auth/follow/${activeUserId}`);
      setIsFollowing(res.data.followed);
      setFollowersCount(res.data.followersCount);
    } catch (err) {
      console.error('Error toggling follow', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFile(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditCoverFile(file);
      setEditCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editUsername.trim()) {
      setEditError('Username cannot be empty');
      return;
    }

    setUpdating(true);
    const formData = new FormData();
    formData.append('username', editUsername.trim());
    formData.append('displayName', editDisplayName.trim());
    formData.append('bio', editBio.trim());
    formData.append('location', editLocation.trim());
    formData.append('website', editWebsite.trim());
    formData.append('instagram', editInstagram.trim());
    formData.append('twitter', editTwitter.trim());
    formData.append('pinterest', editPinterest.trim());
    
    if (editFile) {
      formData.append('profileImage', editFile);
    }
    if (editCoverFile) {
      formData.append('coverImage', editCoverFile);
    }

    try {
      await updateProfile(formData);
      setEditMode(false);
      setEditFile(null);
      setEditCoverFile(null);
      window.location.reload();
    } catch (err) {
      setEditError(err.message || 'Profile update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateBoardSubmit = async (e) => {
    e.preventDefault();
    if (!boardName.trim()) return;
    setCreatingBoard(true);
    try {
      const res = await api.post('/boards', {
        name: boardName.trim(),
        description: boardDesc.trim(),
        isSecret: boardSecret
      });
      setUserBoards(prev => [...prev, res.data]);
      setBoardModal(false);
      setBoardName('');
      setBoardDesc('');
      setBoardSecret(false);
    } catch (err) {
      console.error('Error creating board', err);
    } finally {
      setCreatingBoard(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E60023]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      
      {/* Cover Banner */}
      <div className="w-full h-48 md:h-64 rounded-[32px] overflow-hidden relative bg-gradient-to-r from-red-100 to-amber-50 border border-gray-100 shadow-sm mb-6">
        {profileUser.coverImage ? (
          <img
            src={`http://localhost:5000${profileUser.coverImage}`}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-red-100 via-pink-100 to-amber-50 flex items-center justify-center text-red-300 font-semibold" />
        )}
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center text-center max-w-lg mx-auto mb-12 relative mt-[-70px]">
        {/* Avatar overlay */}
        <div className="relative group mb-4">
          {profileUser.profileImage ? (
            <img
              src={`http://localhost:5000${profileUser.profileImage}`}
              alt={profileUser.username}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-lg bg-white"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.username)}&background=random&color=fff&size=128`;
              }}
            />
          ) : (
            <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full ${getAvatarColor(profileUser.username)} text-white flex items-center justify-center text-4xl font-extrabold uppercase shadow-lg border-4 border-white`}>
              {profileUser.username.charAt(0)}
            </div>
          )}
        </div>

        {/* Display name and username */}
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center justify-center gap-1.5">
          <span>{profileUser.displayName || profileUser.username}</span>
          {profileUser.isVerified && (
            <span className="bg-blue-500 text-white rounded-full p-0.5 inline-flex items-center justify-center" title="Verified Creator">
              <Check size={10} className="stroke-[3.5]" />
            </span>
          )}
        </h1>
        <p className="text-gray-400 text-xs font-semibold mt-1">@{profileUser.username}</p>

        {/* Bio */}
        <p className="text-gray-600 text-sm mt-3 px-6 leading-relaxed">
          {profileUser.bio || 'This creator hasn\'t written a bio yet.'}
        </p>

        {/* Location & Website */}
        {(profileUser.location || profileUser.website) && (
          <div className="flex items-center justify-center flex-wrap gap-4 mt-2.5 text-xs text-gray-500">
            {profileUser.location && (
              <span className="flex items-center gap-1 font-semibold">
                <MapPin size={12} className="text-gray-400" />
                {profileUser.location}
              </span>
            )}
            {profileUser.website && (
              <a
                href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-bold text-gray-700 hover:text-[#E60023] hover:underline"
              >
                <Globe size={12} className="text-gray-400" />
                {profileUser.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        )}

        {/* Social media links */}
        {profileUser.socialLinks && (profileUser.socialLinks.instagram || profileUser.socialLinks.twitter || profileUser.socialLinks.pinterest) && (
          <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-400">
            {profileUser.socialLinks.instagram && (
              <a
                href={`https://instagram.com/${profileUser.socialLinks.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-pink-600 font-bold transition-all"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                {profileUser.socialLinks.instagram}
              </a>
            )}
            {profileUser.socialLinks.twitter && (
              <a
                href={`https://twitter.com/${profileUser.socialLinks.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-blue-500 font-bold transition-all"
              >
                <TwitterIcon className="w-3.5 h-3.5" />
                {profileUser.socialLinks.twitter}
              </a>
            )}
            {profileUser.socialLinks.pinterest && (
              <a
                href={`https://pinterest.com/${profileUser.socialLinks.pinterest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-red-500 font-bold transition-all"
              >
                <FolderPlus size={12} />
                {profileUser.socialLinks.pinterest}
              </a>
            )}
          </div>
        )}

        {/* Social stats */}
        <div className="flex items-center gap-4 mt-4 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-full">
          <span>{followersCount} followers</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>{profileUser.following?.length || 0} following</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          {isOwnProfile ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-bold text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border border-gray-200"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-[#E60023] rounded-full font-bold text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border border-red-100"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleFollowToggle}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-150 cursor-pointer ${
                isFollowing
                  ? 'bg-black text-white hover:bg-gray-900 shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 relative no-scrollbar">
            <button
              onClick={() => setEditMode(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-extrabold text-gray-800 mb-6 text-center">Edit Profile Settings</h3>
            
            {editError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                {editError}
              </div>
            )}
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              {/* Photo & Banner Selection */}
              <div className="flex flex-col md:flex-row items-center gap-6 justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer mb-1 bg-white rounded-full">
                    {editPreview ? (
                      <img src={editPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center text-xl font-bold uppercase border-2 border-gray-200">
                        {profileUser.username.charAt(0)}
                      </div>
                    )}
                    <label htmlFor="edit-avatar-file" className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera size={14} />
                    </label>
                  </div>
                  <input type="file" id="edit-avatar-file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Avatar</span>
                </div>

                <div className="flex flex-col items-center flex-1 w-full">
                  <div className="relative group cursor-pointer w-full h-16 rounded-xl bg-gray-200 overflow-hidden border border-gray-300">
                    {editCoverPreview ? (
                      <img src={editCoverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-red-100 to-amber-50" />
                    )}
                    <label htmlFor="edit-cover-file" className="absolute inset-0 bg-black/45 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera size={14} className="mr-1" />
                      <span className="text-xs font-semibold">Upload Cover Banner</span>
                    </label>
                  </div>
                  <input type="file" id="edit-cover-file" accept="image/*" onChange={handleCoverFileChange} className="hidden" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Cover Banner</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Username</label>
                <input type="text" required value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-xs transition-all rounded-xl" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Display Name</label>
                <input type="text" placeholder="e.g. John Doe" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-xs transition-all rounded-xl" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                <input type="text" placeholder="e.g. California, USA" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-xs transition-all rounded-xl" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Website</label>
                <input type="text" placeholder="e.g. myportfolio.com" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-xs transition-all rounded-xl" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Instagram</label>
                  <input type="text" placeholder="username" value={editInstagram} onChange={(e) => setEditInstagram(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-[11px] transition-all rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Twitter</label>
                  <input type="text" placeholder="username" value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-[11px] transition-all rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pinterest</label>
                  <input type="text" placeholder="username" value={editPinterest} onChange={(e) => setEditPinterest(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-[11px] transition-all rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bio</label>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={2} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-xs transition-all resize-none rounded-xl" placeholder="Tell people about yourself" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditMode(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 py-2.5 bg-[#E60023] hover:bg-[#AD0018] text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                  {updating ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex justify-center border-b border-gray-100 gap-8 mb-8">
        <button
          onClick={() => setActiveTab('created')}
          className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 relative ${
            activeTab === 'created'
              ? 'text-gray-800 border-black'
              : 'text-gray-400 border-transparent hover:text-gray-700'
          }`}
        >
          Created
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 relative ${
            activeTab === 'saved'
              ? 'text-gray-800 border-black'
              : 'text-gray-400 border-transparent hover:text-gray-700'
          }`}
        >
          Saved
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'created' && (
          <MasonryGrid pins={createdPins} onPinClick={(id) => setSelectedPinId(id)} />
        )}

        {activeTab === 'saved' && (
          <div className="space-y-6">
            {isOwnProfile && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setBoardModal(true)}
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus size={14} />
                  Create Board
                </button>
              </div>
            )}

            {/* Boards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Virtual Board Card for All Saved Pins */}
              <div
                onClick={() => setActiveTab('saved-pins')}
                className="group block cursor-pointer"
              >
                <div className="aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden grid grid-cols-3 gap-0.5 border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md relative">
                  <div className="col-span-2 h-full bg-gray-200">
                    {savedPins?.[0] ? (
                      <img src={`http://localhost:5000${savedPins[0].image}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-semibold">No cover</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 h-full">
                    <div className="flex-1 bg-gray-200 min-h-0">
                      {savedPins?.[1] && (
                        <img src={`http://localhost:5000${savedPins[1].image}`} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 bg-gray-200 min-h-0">
                      {savedPins?.[2] && (
                        <img src={`http://localhost:5000${savedPins[2].image}`} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-1">
                  <h3 className="font-bold text-gray-800 text-sm group-hover:underline truncate">All Saved Pins</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{savedPins?.length || 0} Pins</p>
                </div>
              </div>

              {/* Real Boards */}
              {userBoards.map(board => (
                <Link key={board._id} to={`/board/${board._id}`} className="group block cursor-pointer">
                  <div className="aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden grid grid-cols-3 gap-0.5 border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md relative">
                    <div className="col-span-2 h-full bg-gray-200">
                      {board.pins?.[0] ? (
                        <img src={`http://localhost:5000${board.pins[0].image}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-semibold">No cover</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 h-full">
                      <div className="flex-1 bg-gray-200 min-h-0">
                        {board.pins?.[1] && (
                          <img src={`http://localhost:5000${board.pins[1].image}`} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 bg-gray-200 min-h-0">
                        {board.pins?.[2] && (
                          <img src={`http://localhost:5000${board.pins[2].image}`} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 px-1">
                    <h3 className="font-bold text-gray-800 text-sm group-hover:underline truncate">{board.name}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{board.pins?.length || 0} Pins</p>
                  </div>
                </Link>
              ))}

              {userBoards.length === 0 && (
                <div className="col-span-full py-16 text-center animate-fadeIn">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                    <FolderPlus size={28} />
                  </div>
                  <p className="text-gray-500 text-sm font-semibold">No boards created yet.</p>
                  {isOwnProfile && <p className="text-gray-400 text-xs mt-1">Create your first board to organize ideas!</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved-pins' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setActiveTab('saved')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                ← Back to Boards
              </button>
              <h2 className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
                All Saved Pins ({savedPins?.length || 0})
              </h2>
            </div>
            {savedPins.length > 0 ? (
              <MasonryGrid pins={savedPins} onPinClick={(id) => setSelectedPinId(id)} />
            ) : (
              <div className="py-20 text-center animate-fadeIn">
                <p className="text-gray-400 text-sm italic">No saved pins found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {boardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setBoardModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-extrabold text-gray-800 mb-6 text-center">Create Board</h3>

            <form onSubmit={handleCreateBoardSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Board Name
                </label>
                <input
                  type="text"
                  required
                  placeholder='e.g., "Dream Home" or "Nature Art"'
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={boardDesc}
                  onChange={(e) => setBoardDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-xs transition-all resize-none"
                  placeholder="What's this board about?"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="board-secret"
                  checked={boardSecret}
                  onChange={(e) => setBoardSecret(e.target.checked)}
                  className="w-4 h-4 text-[#E60023] border-gray-300 rounded focus:ring-[#E60023]"
                />
                <label htmlFor="board-secret" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Make this board secret (private)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setBoardModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBoard || !boardName.trim()}
                  className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {creatingBoard ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pin Detail Overlay Modal for Profile page created pins */}
      {selectedPinId && (
        <PinDetail pinId={selectedPinId} onClose={() => setSelectedPinId(null)} />
      )}

    </div>
  );
}
