interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'Owner' | 'Admin' | 'Member';
    status: 'active' | 'inactive' | 'pending';
    performance: {
        tasksCompleted: number;
        tasksAssigned: number;
        onTimeRate: number;
    };
    joinedAt: string;
    lastActive: string;
}

import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiMoreVertical
} from 'react-icons/fi';

const TeamMemberCard: React.FC<{ 
    member: TeamMember; 
    currentUserRole: string;
    onRoleChange: (memberId: string, newRole: TeamMember['role']) => void;
    onStatusToggle: (memberId: string) => void;
    onRemove: (memberId: string) => void;
    onResendInvite: (memberId: string) => void;
}> = ({ member, currentUserRole, onRoleChange, onStatusToggle, onRemove, onResendInvite }) => {
    const [showActions, setShowActions] = useState(false);
    
    const roleColors = {
        Owner: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        Admin: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        Member: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
    };
    
    const statusColors = {
        active: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        inactive: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        pending: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-16 h-16 rounded-full border-4 border-[#6747ce]/20"
                    />
                    <div>
                        <h3 className="text-lg font-semibold dark:text-white">{member.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${roleColors[member.role]}`}>
                                {member.role}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[member.status]}`}>
                                {member.status}
                            </span>
                        </div>
                    </div>
                </div>
                
                {(currentUserRole === 'Owner' || currentUserRole === 'Admin') && (
                    <div className="relative">
                        <button 
                            onClick={() => setShowActions(!showActions)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <FiMoreVertical size={18} className="text-gray-500" />
                        </button>
                        
                        <AnimatePresence>
                            {showActions && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-10"
                                >
                                    <div className="py-1">
                                        {currentUserRole === 'Owner' && (
                                            <>
                                                <button
                                                    onClick={() => onRoleChange(member.id, 'Admin')}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                                                >
                                                    Make Admin
                                                </button>
                                                <button
                                                    onClick={() => onRoleChange(member.id, 'Member')}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                                                >
                                                    Make Member
                                                </button>
                                            </>
                                        )}
                                        
                                        <button
                                            onClick={() => onStatusToggle(member.id)}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                                        >
                                            {member.status === 'active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                        
                                        {member.status === 'pending' && (
                                            <button
                                                onClick={() => onResendInvite(member.id)}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                                            >
                                                Resend Invite
                                            </button>
                                        )}
                                        
                                        {(currentUserRole === 'Owner' || member.role !== 'Owner') && (
                                            <button
                                                onClick={() => onRemove(member.id)}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Remove Member
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-[#6747ce]">{member.performance.tasksCompleted}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-[#6747ce]">{member.performance.tasksAssigned}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Assigned</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-[#6747ce]">{member.performance.onTimeRate}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">On Time</p>
                </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
                <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                <span>Last active {new Date(member.lastActive).toLocaleDateString()}</span>
            </div>
        </motion.div>
    );
};

export default TeamMemberCard;