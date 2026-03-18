import { FiUsers } from 'react-icons/fi';

function Presence({ users, currentUser }) {
  // Generate a consistent color based on username
  const getColor = (name) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <FiUsers />
        <span>{users.length} {users.length === 1 ? 'user' : 'users'} online</span>
      </div>
      
      <div className="flex items-center -space-x-2">
        {users.slice(0, 5).map((user) => (
          <div 
            key={user.id}
            title={user.username + (user.username === currentUser ? ' (You)' : '')}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#1a1d27] z-10 ${getColor(user.username)} hover:z-20 transform hover:scale-110 transition-all cursor-default shadow-md`}
          >
            {getInitials(user.username)}
          </div>
        ))}
        
        {users.length > 5 && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#1a1d27] bg-[#2e3345] z-0">
            +{users.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}

export default Presence;
