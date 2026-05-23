import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, Check, Loader2 } from 'lucide-react';

export default function BoardSelector({ pinId, onSaveComplete, onClose }) {
  const { user } = useContext(AuthContext);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [savingToBoard, setSavingToBoard] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchBoards = async () => {
      try {
        const res = await api.get(`/boards/user/${user._id}`);
        setBoards(res.data);
      } catch (err) {
        console.error('Error fetching boards', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, [user]);

  const handleSaveToBoard = async (boardId) => {
    setSavingToBoard(boardId);
    try {
      await api.post(`/boards/${boardId}/pin/${pinId}`);
      if (onSaveComplete) onSaveComplete(boardId);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error saving pin to board', err);
      alert(err.response?.data?.message || 'Failed to save to board');
    } finally {
      setSavingToBoard(null);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/boards', { name: newBoardName.trim() });
      setBoards(prev => [...prev, res.data]);
      setNewBoardName('');
      await handleSaveToBoard(res.data._id);
    } catch (err) {
      console.error('Error creating board', err);
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="p-3 text-center text-xs text-gray-500">
        Please log in to save ideas to boards.
      </div>
    );
  }

  return (
    <div className="p-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fadeIn text-left">
      <h4 className="text-xs font-bold text-gray-400 mb-2 px-1 uppercase tracking-wider">Save to Board</h4>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="animate-spin text-[#E60023]" size={16} />
        </div>
      ) : (
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1 no-scrollbar mb-3">
          {boards.length > 0 ? (
            boards.map((board) => {
              const hasPin = board.pins?.some(p => p._id === pinId);
              return (
                <button
                  key={board._id}
                  disabled={hasPin || savingToBoard === board._id}
                  onClick={() => handleSaveToBoard(board._id)}
                  className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-gray-50 rounded-xl transition-all text-xs font-semibold text-gray-700 text-left disabled:opacity-75 disabled:hover:bg-transparent"
                >
                  <span className="truncate">{board.name}</span>
                  {savingToBoard === board._id ? (
                    <Loader2 className="animate-spin text-[#E60023]" size={14} />
                  ) : hasPin ? (
                    <span className="text-green-600 flex items-center gap-0.5 text-[10px]">
                      <Check size={12} />
                      Saved
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 hover:text-red-500">Save</span>
                  )}
                </button>
              );
            })
          ) : (
            <p className="text-gray-400 text-xs italic px-1 py-2">No boards yet.</p>
          )}
        </div>
      )}

      <form onSubmit={handleCreateBoard} className="border-t border-gray-100 pt-3 flex gap-2">
        <input
          type="text"
          placeholder="New board name..."
          required
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 outline-none rounded-xl px-2.5 py-1.5 text-xs text-gray-800 focus:bg-white focus:border-[#E60023]"
        />
        <button
          type="submit"
          disabled={creating || !newBoardName.trim()}
          className="px-2.5 bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
        >
          {creating ? <Loader2 className="animate-spin" size={12} /> : <Plus size={14} />}
        </button>
      </form>
    </div>
  );
}
