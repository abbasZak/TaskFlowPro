// TaskManagement.tsx
import React, { useEffect, useState } from 'react';
import { 
    FiPlus, FiSearch, FiFilter, FiMoreVertical, FiStar, 
    FiClock, FiCheckCircle, FiTrendingUp, FiUsers, 
    FiCalendar, FiMessageSquare, FiBell, FiUser,
    FiGrid, FiList, FiFolder, FiActivity, FiSettings,
    FiLogOut, FiSun, FiMoon, FiMenu, FiX, FiEdit2,
    FiTrash2, FiCopy, FiRepeat, FiTag, FiPaperclip,
    FiMessageCircle, FiEye, FiEyeOff, FiMail, FiUserPlus,
    FiUserMinus, FiUserX, FiRefreshCw, FiArchive, FiSend,
    FiDollarSign, FiTarget, FiBarChart2, FiPieChart,
    FiDownload, FiUpload, FiShare2, FiLock, FiUnlock,
    FiAlertCircle // Add this line
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useParams, useNavigate } from 'react-router-dom';


// Types
interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'urgent' | 'high' | 'medium' | 'low';
    assignee?: TeamMember;
    dueDate: string;
    tags: string[];
    attachments: number;
    comments: number;
    createdAt: string;
    completedAt?: string;
    recurring?: 'daily' | 'weekly' | 'monthly' | 'none';
    isTemplate?: boolean;
    estimatedHours?: number;
    actualHours?: number;
}

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

interface Project {
    id: string;
    name: string;
    description: string;
    owner: TeamMember;
    admins: TeamMember[];
    members: TeamMember[];
    budget?: number;
    spent?: number;
    timeline: {
        start: string;
        end: string;
        milestones: Milestone[];
    };
    goals: Goal[];
    status: 'active' | 'archived' | 'completed';
}

interface Milestone {
    id: string;
    title: string;
    date: string;
    completed: boolean;
}

interface Goal {
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
}

// Mock Data
const mockTeamMembers: TeamMember[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://i.pravatar.cc/150?img=1',
        role: 'Owner',
        status: 'active',
        performance: {
            tasksCompleted: 45,
            tasksAssigned: 52,
            onTimeRate: 92
        },
        joinedAt: '2026-01-15',
        lastActive: '2026-03-04'
    },
    {
        id: '2',
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        avatar: 'https://i.pravatar.cc/150?img=2',
        role: 'Admin',
        status: 'active',
        performance: {
            tasksCompleted: 38,
            tasksAssigned: 42,
            onTimeRate: 88
        },
        joinedAt: '2026-01-20',
        lastActive: '2026-03-04'
    },
    {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        avatar: 'https://i.pravatar.cc/150?img=3',
        role: 'Member',
        status: 'active',
        performance: {
            tasksCompleted: 23,
            tasksAssigned: 28,
            onTimeRate: 79
        },
        joinedAt: '2026-02-01',
        lastActive: '2026-03-03'
    },
    {
        id: '4',
        name: 'Emily Brown',
        email: 'emily@example.com',
        avatar: 'https://i.pravatar.cc/150?img=4',
        role: 'Member',
        status: 'inactive',
        performance: {
            tasksCompleted: 12,
            tasksAssigned: 15,
            onTimeRate: 65
        },
        joinedAt: '2026-02-10',
        lastActive: '2026-02-28'
    },
    {
        id: '5',
        name: 'David Wilson',
        email: 'david@example.com',
        avatar: 'https://i.pravatar.cc/150?img=5',
        role: 'Member',
        status: 'pending',
        performance: {
            tasksCompleted: 0,
            tasksAssigned: 0,
            onTimeRate: 0
        },
        joinedAt: '2026-03-01',
        lastActive: '2026-03-01'
    }
];

const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Design Homepage Mockup',
        description: 'Create high-fidelity mockups for the new homepage design',
        status: 'in-progress',
        priority: 'high',
        assignee: mockTeamMembers[1],
        dueDate: '2026-03-10',
        tags: ['design', 'frontend'],
        attachments: 3,
        comments: 5,
        createdAt: '2026-03-01',
        estimatedHours: 8,
        actualHours: 6
    },
    {
        id: '2',
        title: 'Implement Authentication',
        description: 'Set up JWT authentication for the API',
        status: 'todo',
        priority: 'urgent',
        assignee: mockTeamMembers[2],
        dueDate: '2026-03-08',
        tags: ['backend', 'security'],
        attachments: 1,
        comments: 2,
        createdAt: '2026-03-02',
        estimatedHours: 12,
        actualHours: 0
    },
    {
        id: '3',
        title: 'Write API Documentation',
        description: 'Document all API endpoints using Swagger',
        status: 'review',
        priority: 'medium',
        assignee: mockTeamMembers[0],
        dueDate: '2026-03-12',
        tags: ['documentation'],
        attachments: 0,
        comments: 8,
        createdAt: '2026-02-28',
        estimatedHours: 6,
        actualHours: 5
    },
    {
        id: '4',
        title: 'Fix Navigation Bug',
        description: 'Resolve issue with mobile navigation menu',
        status: 'done',
        priority: 'low',
        assignee: mockTeamMembers[3],
        dueDate: '2026-03-05',
        tags: ['bug', 'frontend'],
        attachments: 2,
        comments: 3,
        createdAt: '2026-03-03',
        completedAt: '2026-03-04',
        estimatedHours: 3,
        actualHours: 2
    },
    {
        id: '5',
        title: 'User Testing Session',
        description: 'Conduct usability testing with 5 users',
        status: 'todo',
        priority: 'medium',
        assignee: mockTeamMembers[4],
        dueDate: '2026-03-15',
        tags: ['testing', 'ux'],
        attachments: 0,
        comments: 1,
        createdAt: '2026-03-04',
        estimatedHours: 4,
        actualHours: 0,
        recurring: 'monthly'
    }
];

const mockProject: Project = {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design',
    owner: mockTeamMembers[0],
    admins: [mockTeamMembers[1]],
    members: mockTeamMembers,
    budget: 50000,
    spent: 32500,
    timeline: {
        start: '2026-03-01',
        end: '2026-05-30',
        milestones: [
            { id: '1', title: 'Design Approval', date: '2026-03-15', completed: false },
            { id: '2', title: 'Development Complete', date: '2026-04-30', completed: false },
            { id: '3', title: 'Testing Phase', date: '2026-05-15', completed: false },
            { id: '4', title: 'Launch', date: '2026-05-30', completed: false }
        ]
    },
    goals: [
        { id: '1', title: 'Page Load Time', target: 2, current: 2.5, unit: 's' },
        { id: '2', title: 'Mobile Score', target: 95, current: 87, unit: '%' },
        { id: '3', title: 'User Satisfaction', target: 90, current: 85, unit: '%' }
    ],
    status: 'active'
};

// Task Card Component - Fixed with type assertion
const TaskCard: React.FC<{ task: Task; onEdit: (task: Task) => void; onDelete: (id: string) => void }> = ({ task, onEdit, onDelete }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TASK',
        item: { id: task.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const priorityColors = {
        urgent: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        high: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        medium: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
        low: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
    };

     

    return (
        <motion.div
            ref={drag as any}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-3 cursor-move border-l-4 ${
                task.priority === 'urgent' ? 'border-red-500' :
                task.priority === 'high' ? 'border-orange-500' :
                task.priority === 'medium' ? 'border-yellow-500' :
                'border-green-500'
            } ${isDragging ? 'opacity-50' : ''}`}
            whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
        >
            {/* Rest of the component remains the same */}
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-800 dark:text-white">{task.title}</h4>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => onEdit(task)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                        <FiEdit2 size={14} className="text-gray-500" />
                    </button>
                    <button 
                        onClick={() => onDelete(task.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                        <FiTrash2 size={14} className="text-gray-500" />
                    </button>
                </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                {task.description}
            </p>
            
            <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
                {task.tags.map((tag, index) => (
                    <span key={index} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        #{tag}
                    </span>
                ))}
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {task.assignee && (
                        <img 
                            src={task.assignee.avatar} 
                            alt={task.assignee.name}
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                            title={task.assignee.name}
                        />
                    )}
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <FiCalendar size={12} />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                    {task.attachments > 0 && (
                        <span className="flex items-center gap-1">
                            <FiPaperclip size={12} />
                            {task.attachments}
                        </span>
                    )}
                    {task.comments > 0 && (
                        <span className="flex items-center gap-1">
                            <FiMessageCircle size={12} />
                            {task.comments}
                        </span>
                    )}
                    {task.recurring && task.recurring !== 'none' && (
                        <FiRepeat size={12} className="text-blue-500" />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Column Component - Fixed with type assertion
const Column: React.FC<{ 
    title: string; 
    status: Task['status']; 
    tasks: Task[];
    onTaskMove: (taskId: string, newStatus: Task['status']) => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
}> = ({ title, status, tasks, onTaskMove, onEditTask, onDeleteTask }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'TASK',
        drop: (item: { id: string }) => onTaskMove(item.id, status),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const columnColors = {
        todo: 'bg-gray-100 dark:bg-gray-800/50',
        'in-progress': 'bg-blue-50 dark:bg-blue-900/20',
        review: 'bg-yellow-50 dark:bg-yellow-900/20',
        done: 'bg-green-50 dark:bg-green-900/20'
    };

    const headerColors = {
        todo: 'text-gray-600 dark:text-gray-400',
        'in-progress': 'text-blue-600 dark:text-blue-400',
        review: 'text-yellow-600 dark:text-yellow-400',
        done: 'text-green-600 dark:text-green-400'
    };

    return (
        <div
            ref={drop as any}
            className={`flex-1 min-w-[280px] rounded-xl p-4 ${columnColors[status]} ${isOver ? 'ring-2 ring-[#6747ce]' : ''}`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${headerColors[status]}`}>
                    {title} ({tasks.length})
                </h3>
                <button className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded">
                    <FiMoreVertical size={16} className="text-gray-500" />
                </button>
            </div>
            
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                    {tasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                        />
                    ))}
                </AnimatePresence>
                
                {tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                        No tasks yet
                    </div>
                )}
            </div>
        </div>
    );
};

// Team Member Card Component
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

// Main Component
const TaskManagement: React.FC = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'tasks' | 'team' | 'analytics' | 'settings'>('tasks');
    const [selectedProject, setSelectedProject] = useState<Project>(mockProject);
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showBulkEditModal, setShowBulkEditModal] = useState(false);
    const [showTransferOwnershipModal, setShowTransferOwnershipModal] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [currentUserRole] = useState<'Owner' | 'Admin' | 'Member'>('Owner');

    // Task Management Functions
    const handleTaskMove = (taskId: string, newStatus: Task['status']) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId 
                ? { ...task, status: newStatus, completedAt: newStatus === 'done' ? new Date().toISOString() : undefined }
                : task
        ));
    };

    const handleCreateTask = (taskData: Partial<Task>) => {
        const newTask: Task = {
            id: Date.now().toString(),
            title: taskData.title || '',
            description: taskData.description || '',
            status: taskData.status || 'todo',
            priority: taskData.priority || 'medium',
            assignee: taskData.assignee,
            dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
            tags: taskData.tags || [],
            attachments: 0,
            comments: 0,
            createdAt: new Date().toISOString(),
            recurring: taskData.recurring || 'none',
            estimatedHours: taskData.estimatedHours,
            actualHours: 0
        };
        setTasks(prev => [newTask, ...prev]);
        setShowNewTaskModal(false);
    };

    const handleEditTask = (updatedTask: Task) => {
        setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
        setEditingTask(null);
    };

    const handleDeleteTask = (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setTasks(prev => prev.filter(task => task.id !== taskId));
        }
    };

    const handleBulkEdit = (updates: Partial<Task>) => {
        setTasks(prev => prev.map(task => 
            selectedTasks.includes(task.id) ? { ...task, ...updates } : task
        ));
        setSelectedTasks([]);
        setShowBulkEditModal(false);
    };

    const handleConvertToTemplate = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const templateTask: Task = {
                ...task,
                id: `template-${Date.now()}`,
                title: `[Template] ${task.title}`,
                isTemplate: true
            };
            setTasks(prev => [...prev, templateTask]);
        }
    };

    const handleSetRecurring = (taskId: string, recurring: Task['recurring']) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, recurring } : task
        ));
    };

    // Team Management Functions
    const handleInviteMember = (email: string, role: TeamMember['role']) => {
        const newMember: TeamMember = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email,
            avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            role,
            status: 'pending',
            performance: {
                tasksCompleted: 0,
                tasksAssigned: 0,
                onTimeRate: 0
            },
            joinedAt: new Date().toISOString().split('T')[0],
            lastActive: new Date().toISOString().split('T')[0]
        };
        setTeamMembers(prev => [...prev, newMember]);
        setShowInviteModal(false);
    };

    const handleRoleChange = (memberId: string, newRole: TeamMember['role']) => {
        setTeamMembers(prev => prev.map(member => 
            member.id === memberId ? { ...member, role: newRole } : member
        ));
    };

    const handleStatusToggle = (memberId: string) => {
        setTeamMembers(prev => prev.map(member => 
            member.id === memberId 
                ? { ...member, status: member.status === 'active' ? 'inactive' : 'active' }
                : member
        ));
    };

    const handleRemoveMember = (memberId: string) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            setTeamMembers(prev => prev.filter(member => member.id !== memberId));
        }
    };

    const handleResendInvite = (memberId: string) => {
        // In a real app, this would resend the invitation email
        alert('Invitation resent successfully!');
    };

    // Project Settings Functions
    const handleTransferOwnership = (newOwnerId: string) => {
        const newOwner = teamMembers.find(m => m.id === newOwnerId);
        if (newOwner) {
            setSelectedProject(prev => ({
                ...prev,
                owner: newOwner,
                admins: [...prev.admins, prev.owner]
            }));
            setTeamMembers(prev => prev.map(member => {
                if (member.id === newOwnerId) return { ...member, role: 'Owner' };
                if (member.id === selectedProject.owner.id) return { ...member, role: 'Admin' };
                return member;
            }));
            setShowTransferOwnershipModal(false);
        }
    };

    const handleArchiveProject = () => {
        setSelectedProject(prev => ({ ...prev, status: 'archived' }));
        setShowArchiveConfirm(false);
    };

    const handleDeleteProject = () => {
        // In a real app, this would delete the project
        alert('Project deleted successfully!');
        setShowDeleteConfirm(false);
    };

    const handleUpdateProject = (updates: Partial<Project>) => {
        setSelectedProject(prev => ({ ...prev, ...updates }));
    };

    // Filter tasks by column
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const reviewTasks = tasks.filter(t => t.status === 'review');
    const doneTasks = tasks.filter(t => t.status === 'done');

    // Filter team members
    const filteredMembers = teamMembers.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Analytics Calculations
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const tasksByPriority = {
        urgent: tasks.filter(t => t.priority === 'urgent').length,
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
    };
    
    const tasksByAssignee = teamMembers.map(member => ({
        name: member.name,
        assigned: tasks.filter(t => t.assignee?.id === member.id).length,
        completed: tasks.filter(t => t.assignee?.id === member.id && t.status === 'done').length
    }));
    
    const upcomingDeadlines = tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        const today = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0 && t.status !== 'done';
    }).length;
    
    const overdueTasks = tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        const today = new Date();
        return dueDate < today && t.status !== 'done';
    }).length;

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!id){
            navigate("/");     
            return;
        }
    }, [])

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
                {/* Header */}
                <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-20`}>
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {selectedProject.name}
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedProject.description}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    selectedProject.status === 'active' ? 'bg-green-100 text-green-600' :
                                    selectedProject.status === 'archived' ? 'bg-gray-100 text-gray-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                    {selectedProject.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Search */}
                                <div className="relative hidden md:block">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`pl-10 pr-4 py-2 rounded-lg border ${
                                            darkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-gray-50 border-gray-200 text-gray-800'
                                        } focus:outline-none focus:ring-2 focus:ring-[#6747ce] w-64`}
                                    />
                                </div>

                                {/* Theme Toggle */}
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                                </button>

                                {/* Project Actions */}
                                {(currentUserRole === 'Owner' || currentUserRole === 'Admin') && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowInviteModal(true)}
                                            className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                                        >
                                            <FiUserPlus size={20} />
                                        </button>
                                        <button
                                            onClick={() => setShowTransferOwnershipModal(true)}
                                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                                        >
                                            <FiSend size={20} />
                                        </button>
                                        <button
                                            onClick={() => setShowArchiveConfirm(true)}
                                            className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                        >
                                            <FiArchive size={20} />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    </div>
                                )}

                                {/* Profile */}
                                <button className="flex items-center gap-2">
                                    <img 
                                        src={selectedProject.owner.avatar}
                                        alt="Profile" 
                                        className="w-10 h-10 rounded-full border-2 border-[#6747ce]"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center gap-1 mt-4 border-b dark:border-gray-700">
                            {[
                                { id: 'tasks', label: 'Tasks', icon: FiCheckCircle },
                                { id: 'team', label: 'Team', icon: FiUsers },
                                { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
                                { id: 'settings', label: 'Settings', icon: FiSettings }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors relative ${
                                        activeTab === tab.id
                                            ? 'text-[#6747ce]'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6747ce]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="p-6">
                    {/* Tasks View */}
                    {activeTab === 'tasks' && (
                        <>
                            {/* Task Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Task Board
                                    </h2>
                                    
                                    {/* Bulk Selection */}
                                    {selectedTasks.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="text-sm text-[#6747ce] font-medium">
                                                {selectedTasks.length} selected
                                            </span>
                                            <button
                                                onClick={() => setShowBulkEditModal(true)}
                                                className="px-3 py-1 bg-[#6747ce] text-white text-sm rounded-lg hover:bg-[#5538b0]"
                                            >
                                                Bulk Edit
                                            </button>
                                            <button
                                                onClick={() => setSelectedTasks([])}
                                                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-lg"
                                            >
                                                Clear
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                                
                                <button
                                    onClick={() => setShowNewTaskModal(true)}
                                    className="bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg"
                                >
                                    <FiPlus size={18} />
                                    New Task
                                </button>
                            </div>

                            {/* Kanban Board */}
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                <Column 
                                    title="To Do" 
                                    status="todo"
                                    tasks={todoTasks}
                                    onTaskMove={handleTaskMove}
                                    onEditTask={setEditingTask}
                                    onDeleteTask={handleDeleteTask}
                                />
                                <Column 
                                    title="In Progress" 
                                    status="in-progress"
                                    tasks={inProgressTasks}
                                    onTaskMove={handleTaskMove}
                                    onEditTask={setEditingTask}
                                    onDeleteTask={handleDeleteTask}
                                />
                                <Column 
                                    title="Review" 
                                    status="review"
                                    tasks={reviewTasks}
                                    onTaskMove={handleTaskMove}
                                    onEditTask={setEditingTask}
                                    onDeleteTask={handleDeleteTask}
                                />
                                <Column 
                                    title="Done" 
                                    status="done"
                                    tasks={doneTasks}
                                    onTaskMove={handleTaskMove}
                                    onEditTask={setEditingTask}
                                    onDeleteTask={handleDeleteTask}
                                />
                            </div>
                        </>
                    )}

                    {/* Team View */}
                    {activeTab === 'team' && (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    Team Members ({teamMembers.length})
                                </h2>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                            <FiDownload size={18} />
                                        </button>
                                        <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                            <FiUpload size={18} />
                                        </button>
                                    </div>
                                    
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <FiUserPlus size={18} />
                                        Invite Member
                                    </button>
                                </div>
                            </div>

                            {/* Team Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <FiUsers className="text-2xl text-[#6747ce]" />
                                        <span className="text-sm text-green-500">+12%</span>
                                    </div>
                                    <h3 className="text-3xl font-bold dark:text-white">{teamMembers.length}</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Total Members</p>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <FiUser className="text-2xl text-green-500" />
                                        <span className="text-sm text-green-500">+8%</span>
                                    </div>
                                    <h3 className="text-3xl font-bold dark:text-white">
                                        {teamMembers.filter(m => m.status === 'active').length}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">Active</p>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <FiUserX className="text-2xl text-red-500" />
                                        <span className="text-sm text-red-500">-3%</span>
                                    </div>
                                    <h3 className="text-3xl font-bold dark:text-white">
                                        {teamMembers.filter(m => m.status === 'inactive').length}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">Inactive</p>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <FiClock className="text-2xl text-yellow-500" />
                                        <span className="text-sm text-yellow-500">2 pending</span>
                                    </div>
                                    <h3 className="text-3xl font-bold dark:text-white">
                                        {teamMembers.filter(m => m.status === 'pending').length}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">Pending</p>
                                </div>
                            </div>

                            {/* Team Members Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredMembers.map(member => (
                                    <TeamMemberCard
                                        key={member.id}
                                        member={member}
                                        currentUserRole={currentUserRole}
                                        onRoleChange={handleRoleChange}
                                        onStatusToggle={handleStatusToggle}
                                        onRemove={handleRemoveMember}
                                        onResendInvite={handleResendInvite}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Analytics View */}
                    {activeTab === 'analytics' && (
                        <>
                            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Project Analytics
                            </h2>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                            <FiCheckCircle className="text-2xl text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
                                            <h3 className="text-2xl font-bold dark:text-white">{completionRate}%</h3>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                            style={{ width: `${completionRate}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                            <FiTrendingUp className="text-2xl text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Budget Usage</p>
                                            <h3 className="text-2xl font-bold dark:text-white">
                                                {selectedProject.budget && selectedProject.spent 
                                                    ? Math.round((selectedProject.spent / selectedProject.budget) * 100)
                                                    : 0}%
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Spent: ${selectedProject.spent?.toLocaleString()}</span>
                                        <span className="text-gray-500">Budget: ${selectedProject.budget?.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                                            <FiClock className="text-2xl text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Deadlines</p>
                                            <h3 className="text-2xl font-bold dark:text-white">{upcomingDeadlines}</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">Next 7 days</p>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                            <FiAlertCircle className="text-2xl text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Overdue Tasks</p>
                                            <h3 className="text-2xl font-bold dark:text-white">{overdueTasks}</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-red-500">Requires immediate attention</p>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Tasks by Priority */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Tasks by Priority</h3>
                                    <div className="space-y-4">
                                        {Object.entries(tasksByPriority).map(([priority, count]) => {
                                            const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                                            const colors = {
                                                urgent: 'bg-red-500',
                                                high: 'bg-orange-500',
                                                medium: 'bg-yellow-500',
                                                low: 'bg-green-500'
                                            };
                                            return (
                                                <div key={priority}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="capitalize dark:text-gray-300">{priority}</span>
                                                        <span className="dark:text-gray-300">{count} tasks ({percentage.toFixed(1)}%)</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${colors[priority as keyof typeof colors]}`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Team Performance */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Team Performance</h3>
                                    <div className="space-y-4">
                                        {tasksByAssignee.slice(0, 5).map(member => (
                                            <div key={member.name}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="dark:text-gray-300">{member.name}</span>
                                                    <span className="dark:text-gray-300">
                                                        {member.completed}/{member.assigned} completed
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-[#6747ce] to-[#8b6fe0]"
                                                        style={{ width: `${member.assigned > 0 ? (member.completed / member.assigned) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Timeline & Goals */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Timeline */}
                                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Project Timeline</h3>
                                    <div className="space-y-4">
                                        {selectedProject.timeline.milestones.map((milestone, index) => (
                                            <div key={milestone.id} className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    milestone.completed 
                                                        ? 'bg-green-100 text-green-600' 
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                                }`}>
                                                    {milestone.completed ? <FiCheckCircle /> : <FiClock />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="font-medium dark:text-white">{milestone.title}</span>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(milestone.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-[#6747ce] to-[#8b6fe0]"
                                                            style={{ width: `${((index + 1) / selectedProject.timeline.milestones.length) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Goals */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Project Goals</h3>
                                    <div className="space-y-6">
                                        {selectedProject.goals.map(goal => {
                                            const percentage = (goal.current / goal.target) * 100;
                                            return (
                                                <div key={goal.id}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="dark:text-gray-300">{goal.title}</span>
                                                        <span className="dark:text-gray-300">
                                                            {goal.current}/{goal.target}{goal.unit}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${
                                                                percentage >= 100 ? 'bg-green-500' :
                                                                percentage >= 75 ? 'bg-blue-500' :
                                                                percentage >= 50 ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                            }`}
                                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {percentage >= 100 ? 'Goal achieved!' : `${Math.round(percentage)}% complete`}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Settings View */}
                    {activeTab === 'settings' && (
                        <>
                            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Project Settings
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* General Settings */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Project Info */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                        <h3 className="text-lg font-semibold mb-4 dark:text-white">General Information</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                                    Project Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedProject.name}
                                                    onChange={(e) => handleUpdateProject({ name: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        darkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-gray-50 border-gray-200 text-gray-800'
                                                    } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                                    Description
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={selectedProject.description}
                                                    onChange={(e) => handleUpdateProject({ description: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        darkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-gray-50 border-gray-200 text-gray-800'
                                                    } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Budget & Timeline */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Budget & Timeline</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                                    Budget ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={selectedProject.budget || ''}
                                                    onChange={(e) => handleUpdateProject({ budget: parseInt(e.target.value) })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        darkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-gray-50 border-gray-200 text-gray-800'
                                                    } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                                    Spent ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={selectedProject.spent || ''}
                                                    onChange={(e) => handleUpdateProject({ spent: parseInt(e.target.value) })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        darkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-gray-50 border-gray-200 text-gray-800'
                                                    } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={selectedProject.timeline.start}
                                                    onChange={(e) => handleUpdateProject({ 
                                                        timeline: { ...selectedProject.timeline, start: e.target.value }
                                                    })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        darkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-gray-50 border-gray-200 text-gray-800'
                                                    } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                                    End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={selectedProject.timeline.end}
                                                    onChange={(e) => handleUpdateProject({ 
                                                        timeline: { ...selectedProject.timeline, end: e.target.value }
                                                    })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        darkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-gray-50 border-gray-200 text-gray-800'
                                                    } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Goals */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold dark:text-white">Project Goals</h3>
                                            <button className="text-[#6747ce] hover:text-[#5538b0]">
                                                <FiPlus size={20} />
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {selectedProject.goals.map(goal => (
                                                <div key={goal.id} className="flex items-center gap-4">
                                                    <input
                                                        type="text"
                                                        value={goal.title}
                                                        onChange={() => {}}
                                                        className={`flex-1 px-3 py-2 rounded-lg border ${
                                                            darkMode 
                                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                                : 'bg-gray-50 border-gray-200 text-gray-800'
                                                        } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={goal.target}
                                                            onChange={() => {}}
                                                            className="w-20 px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                        <span className="text-gray-500">{goal.unit}</span>
                                                    </div>
                                                    <button className="text-red-500 hover:text-red-600">
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-red-200 dark:border-red-900/50">
                                        <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => setShowArchiveConfirm(true)}
                                                className="w-full px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                                            >
                                                Archive Project
                                            </button>
                                            <button
                                                onClick={() => setShowTransferOwnershipModal(true)}
                                                className="w-full px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                            >
                                                Transfer Ownership
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                Delete Project
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {/* New Task Modal */}
                    {showNewTaskModal && (
                        <TaskModal
                            darkMode={darkMode}
                            onClose={() => setShowNewTaskModal(false)}
                            onSave={handleCreateTask}
                            teamMembers={teamMembers}
                        />
                    )}

                    {/* Edit Task Modal */}
                    {editingTask && (
                        <TaskModal
                            darkMode={darkMode}
                            task={editingTask}
                            onClose={() => setEditingTask(null)}
                            onSave={handleEditTask}
                            teamMembers={teamMembers}
                        />
                    )}

                    {/* Invite Member Modal */}
                    {showInviteModal && (
                        <InviteModal
                            darkMode={darkMode}
                            onClose={() => setShowInviteModal(false)}
                            onInvite={handleInviteMember}
                        />
                    )}

                    {/* Bulk Edit Modal */}
                    {showBulkEditModal && (
                        <BulkEditModal
                            darkMode={darkMode}
                            selectedCount={selectedTasks.length}
                            onClose={() => setShowBulkEditModal(false)}
                            onSave={handleBulkEdit}
                            teamMembers={teamMembers}
                        />
                    )}

                    {/* Transfer Ownership Modal */}
                    {showTransferOwnershipModal && (
                        <TransferOwnershipModal
                            darkMode={darkMode}
                            teamMembers={teamMembers.filter(m => m.id !== selectedProject.owner.id && m.status === 'active')}
                            onClose={() => setShowTransferOwnershipModal(false)}
                            onTransfer={handleTransferOwnership}
                        />
                    )}

                    {/* Archive Confirmation Modal */}
                    {showArchiveConfirm && (
                        <ConfirmationModal
                            darkMode={darkMode}
                            title="Archive Project"
                            message="Are you sure you want to archive this project? You can restore it later."
                            confirmText="Archive"
                            onConfirm={handleArchiveProject}
                            onCancel={() => setShowArchiveConfirm(false)}
                        />
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteConfirm && (
                        <ConfirmationModal
                            darkMode={darkMode}
                            title="Delete Project"
                            message="Are you absolutely sure you want to delete this project? This action cannot be undone."
                            confirmText="Delete Permanently"
                            onConfirm={handleDeleteProject}
                            onCancel={() => setShowDeleteConfirm(false)}
                            isDanger
                        />
                    )}
                </AnimatePresence>
            </div>
        </DndProvider>
    );
};

// Modal Components
const TaskModal: React.FC<{
    darkMode: boolean;
    task?: Task;
    onClose: () => void;
    onSave: (task: any) => void;
    teamMembers: TeamMember[];
}> = ({ darkMode, task, onClose, onSave, teamMembers }) => {
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'todo',
        priority: task?.priority || 'medium',
        assigneeId: task?.assignee?.id || '',
        dueDate: task?.dueDate || new Date().toISOString().split('T')[0],
        tags: task?.tags?.join(', ') || '',
        recurring: task?.recurring || 'none',
        estimatedHours: task?.estimatedHours || '',
        isTemplate: task?.isTemplate || false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const assignee = teamMembers.find(m => m.id === formData.assigneeId);
        
        onSave({
            id: task?.id || Date.now().toString(),
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            assignee,
            dueDate: formData.dueDate,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            recurring: formData.recurring,
            estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
            actualHours: task?.actualHours || 0,
            attachments: task?.attachments || 0,
            comments: task?.comments || 0,
            createdAt: task?.createdAt || new Date().toISOString(),
            isTemplate: formData.isTemplate
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {task ? 'Edit Task' : 'Create New Task'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Title
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                        />
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-gray-50 border-gray-200 text-gray-800'
                                } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                            >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-gray-50 border-gray-200 text-gray-800'
                                } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                            >
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Assignee
                            </label>
                            <select
                                value={formData.assigneeId}
                                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-gray-50 border-gray-200 text-gray-800'
                                } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                            >
                                <option value="">Unassigned</option>
                                {teamMembers.filter(m => m.status === 'active').map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-gray-50 border-gray-200 text-gray-800'
                                } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="design, frontend, bug"
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Recurring
                            </label>
                            <select
                                value={formData.recurring}
                                onChange={(e) => setFormData({ ...formData, recurring: e.target.value as any })}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-gray-50 border-gray-200 text-gray-800'
                                } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                            >
                                <option value="none">None</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Est. Hours
                            </label>
                            <input
                                type="number"
                                value={formData.estimatedHours}
                                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-gray-50 border-gray-200 text-gray-800'
                                } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isTemplate"
                            checked={formData.isTemplate}
                            onChange={(e) => setFormData({ ...formData, isTemplate: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-[#6747ce]"
                        />
                        <label htmlFor="isTemplate" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Save as template
                        </label>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            } transition-colors`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white py-2 rounded-lg hover:shadow-lg"
                        >
                            {task ? 'Update' : 'Create'} Task
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const InviteModal: React.FC<{
    darkMode: boolean;
    onClose: () => void;
    onInvite: (email: string, role: TeamMember['role']) => void;
}> = ({ darkMode, onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<TeamMember['role']>('Member');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onInvite(email, role);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Invite Team Member
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                        />
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as TeamMember['role'])}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                        >
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                            An invitation message will be sent to this address. They'll be able to join the project after accepting.
                        </p>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            } transition-colors`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white py-2 rounded-lg hover:shadow-lg"
                        >
                            Send Invite
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const BulkEditModal: React.FC<{
    darkMode: boolean;
    selectedCount: number;
    onClose: () => void;
    onSave: (updates: Partial<Task>) => void;
    teamMembers: TeamMember[];
}> = ({ darkMode, selectedCount, onClose, onSave, teamMembers }) => {
    const [updates, setUpdates] = useState({
        priority: '',
        status: '',
        assigneeId: '',
        dueDate: '',
        tags: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatesToApply: any = {};
        
        if (updates.priority) updatesToApply.priority = updates.priority;
        if (updates.status) updatesToApply.status = updates.status;
        if (updates.assigneeId) {
            updatesToApply.assignee = teamMembers.find(m => m.id === updates.assigneeId);
        }
        if (updates.dueDate) updatesToApply.dueDate = updates.dueDate;
        if (updates.tags) updatesToApply.tags = updates.tags.split(',').map(t => t.trim());
        
        onSave(updatesToApply);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Bulk Edit Tasks
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    {selectedCount} tasks selected - changes will apply to all
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Change Priority
                        </label>
                        <select
                            value={updates.priority}
                            onChange={(e) => setUpdates({ ...updates, priority: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                        >
                            <option value="">No change</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Change Status
                        </label>
                        <select
                            value={updates.status}
                            onChange={(e) => setUpdates({ ...updates, status: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                        >
                            <option value="">No change</option>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Change Assignee
                        </label>
                        <select
                            value={updates.assigneeId}
                            onChange={(e) => setUpdates({ ...updates, assigneeId: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                        >
                            <option value="">No change</option>
                            {teamMembers.filter(m => m.status === 'active').map(member => (
                                <option key={member.id} value={member.id}>{member.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Change Due Date
                        </label>
                        <input
                            type="date"
                            value={updates.dueDate}
                            onChange={(e) => setUpdates({ ...updates, dueDate: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                        />
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Add Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            value={updates.tags}
                            onChange={(e) => setUpdates({ ...updates, tags: e.target.value })}
                            placeholder="design, frontend, bug"
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                        />
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            } transition-colors`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white py-2 rounded-lg hover:shadow-lg"
                        >
                            Apply Changes
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const TransferOwnershipModal: React.FC<{
    darkMode: boolean;
    teamMembers: TeamMember[];
    onClose: () => void;
    onTransfer: (newOwnerId: string) => void;
}> = ({ darkMode, teamMembers, onClose, onTransfer }) => {
    const [selectedOwnerId, setSelectedOwnerId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOwnerId) {
            onTransfer(selectedOwnerId);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Transfer Ownership
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Select a new owner for this project. You'll become an admin.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            New Owner
                        </label>
                        <select
                            required
                            value={selectedOwnerId}
                            onChange={(e) => setSelectedOwnerId(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                        >
                            <option value="">Select a member</option>
                            {teamMembers.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.name} ({member.email})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            This action cannot be undone. The new owner will have full control over the project.
                        </p>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            } transition-colors`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedOwnerId}
                            className="flex-1 bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white py-2 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Transfer
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const ConfirmationModal: React.FC<{
    darkMode: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
}> = ({ darkMode, title, message, confirmText, onConfirm, onCancel, isDanger }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {message}
                </p>
                
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className={`flex-1 py-2 rounded-lg border ${
                            darkMode 
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            } transition-colors`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2 rounded-lg text-white ${
                            isDanger 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] hover:shadow-lg'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TaskManagement;