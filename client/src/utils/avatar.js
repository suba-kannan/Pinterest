/**
 * Generates a stable, beautiful background color class based on a username hash
 * @param {string} username 
 * @returns {string} Tailwind CSS class name
 */
export const getAvatarColor = (username) => {
  const colors = [
    'bg-amber-600',
    'bg-orange-600',
    'bg-emerald-600',
    'bg-teal-600',
    'bg-blue-600',
    'bg-indigo-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-rose-600',
    'bg-cyan-600',
    'bg-violet-600',
    'bg-fuchsia-600'
  ];
  if (!username) return 'bg-red-500';
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
