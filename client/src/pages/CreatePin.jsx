import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Upload, X, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Travel',
  'Food',
  'Art',
  'Home Decor',
  'Fashion',
  'DIY',
  'Quotes',
  'Photography',
  'Tech',
  'Nature',
  'Others'
];

export default function CreatePin() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [category, setCategory] = useState('Others');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [carouselFiles, setCarouselFiles] = useState([]);
  const [carouselPreviews, setCarouselPreviews] = useState([]);
  const [tags, setTags] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFile(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
      
      if (files.length > 1) {
        const secondary = files.slice(1);
        setCarouselFiles(secondary);
        setCarouselPreviews(secondary.map(file => URL.createObjectURL(file)));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      setImageFile(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
      
      if (files.length > 1) {
        const secondary = files.slice(1);
        setCarouselFiles(secondary);
        setCarouselPreviews(secondary.map(file => URL.createObjectURL(file)));
      }
    } else {
      setError('Please upload image files.');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setCarouselFiles([]);
    setCarouselPreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      setError('Please select or drop an image for the pin.');
      return;
    }
    if (!title.trim()) {
      setError('A title is required.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('destinationUrl', destinationUrl.trim());
    formData.append('category', category);
    formData.append('image', imageFile);

    carouselFiles.forEach(file => {
      formData.append('images', file);
    });

    const parsedTags = tags.split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);
    formData.append('tags', JSON.stringify(parsedTags));

    try {
      const res = await api.post('/pins', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate(`/pin/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create pin. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-gray-100 p-6 md:p-10">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 md:gap-12">
          
          {/* Left Column: Image Upload */}
          <div className="w-full md:w-1/2 flex flex-col">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
              Upload Pin Image / Slides
            </label>

            {imagePreview ? (
              <div className="flex flex-col">
                <div className="relative border border-gray-100 rounded-2xl overflow-hidden shadow-inner group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-[450px] object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <X size={18} />
                  </button>
                </div>
                {/* Carousel mini Previews */}
                {carouselPreviews.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Slides cover & pages</p>
                    <div className="flex flex-wrap gap-2 py-1 max-h-[70px] overflow-y-auto no-scrollbar">
                      <div className="relative w-12 h-12 rounded-lg border-2 border-[#E60023] overflow-hidden flex-shrink-0">
                        <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                      </div>
                      {carouselPreviews.map((url, index) => (
                        <div key={index} className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-200 hover:border-red-400 bg-gray-50 hover:bg-gray-100/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[400px]"
              >
                <input
                  type="file"
                  id="pin-file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="pin-file" className="cursor-pointer flex flex-col items-center">
                  <div className="w-14 h-14 bg-white hover:bg-gray-100 text-gray-500 rounded-full flex items-center justify-center shadow-md mb-4 transition-colors">
                    <Upload size={24} />
                  </div>
                  <p className="font-bold text-gray-700 text-sm">Choose files or drag them here</p>
                  <p className="text-gray-400 text-xs mt-2 max-w-[200px]">
                    Select multiple images to publish an image carousel pin.
                  </p>
                </label>
              </div>
            )}
          </div>

          {/* Right Column: Pin Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Add your title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Tell everyone what your Pin is about"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-sm transition-all duration-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. art, landscape, wallpaper"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Destination Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="Add a destination link (e.g. https://example.com)"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-gray-800 text-sm transition-all duration-200 cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#E60023] hover:bg-[#AD0018] disabled:bg-red-400 text-white rounded-2xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating Pin...
                </>
              ) : (
                'Publish Pin'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
