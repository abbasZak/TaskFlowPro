import React, { useState, useEffect } from 'react';
import { 
    FiPlus, FiSearch, FiFilter, FiMoreVertical, FiStar, 
    FiClock, FiCheckCircle, FiTrendingUp, FiUsers, 
    FiCalendar, FiMessageSquare, FiBell, FiUser,
    FiGrid, FiList, FiFolder, FiActivity, FiSettings,
    FiLogOut, FiSun, FiMoon, FiMenu, FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on-hold';
    progress: number;
    dueDate: string;
    members: number;
    tasks: number;
    completedTasks: number;
    color: string;
    starred: boolean;
}

interface Task {
    id: string;
    title: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
    projectId: string;
}

interface Activity {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    avatar: string;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [projects, setProjects] = useState<Project[]>([
        {
            id: '1',
            name: 'Website Redesign',
            description: 'Complete overhaul of company website with modern design',
            status: 'active',
            progress: 75,
            dueDate: '2026-03-15',
            members: 5,
            tasks: 24,
            completedTasks: 18,
            color: 'from-blue-500 to-cyan-500',
            starred: true
        },
        {
            id: '2',
            name: 'Mobile App Development',
            description: 'Create cross-platform mobile app for TaskFlow',
            status: 'active',
            progress: 45,
            dueDate: '2026-04-20',
            members: 8,
            tasks: 32,
            completedTasks: 14,
            color: 'from-purple-500 to-pink-500',
            starred: false
        },
        {
            id: '3',
            name: 'Marketing Campaign',
            description: 'Q2 digital marketing strategy and execution',
            status: 'on-hold',
            progress: 30,
            dueDate: '2026-05-01',
            members: 3,
            tasks: 15,
            completedTasks: 5,
            color: 'from-orange-500 to-red-500',
            starred: false
        },
        {
            id: '4',
            name: 'Database Migration',
            description: 'Migrate legacy database to new architecture',
            status: 'completed',
            progress: 100,
            dueDate: '2026-02-28',
            members: 4,
            tasks: 18,
            completedTasks: 18,
            color: 'from-green-500 to-emerald-500',
            starred: false
        },
        {
            id: '5',
            name: 'User Testing',
            description: 'Conduct usability testing for new features',
            status: 'active',
            progress: 60,
            dueDate: '2026-03-10',
            members: 6,
            tasks: 12,
            completedTasks: 7,
            color: 'from-yellow-500 to-amber-500',
            starred: true
        },
        {
            id: '6',
            name: 'Documentation Update',
            description: 'Update API documentation and user guides',
            status: 'active',
            progress: 25,
            dueDate: '2026-03-25',
            members: 2,
            tasks: 8,
            completedTasks: 2,
            color: 'from-indigo-500 to-purple-500',
            starred: false
        }
    ]);

    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Design homepage mockup', completed: true, priority: 'high', dueDate: '2026-02-25', projectId: '1' },
        { id: '2', title: 'Implement authentication', completed: false, priority: 'high', dueDate: '2026-02-28', projectId: '1' },
        { id: '3', title: 'Create API endpoints', completed: false, priority: 'medium', dueDate: '2026-03-05', projectId: '2' },
        { id: '4', title: 'Write test cases', completed: true, priority: 'low', dueDate: '2026-02-26', projectId: '2' },
        { id: '5', title: 'Design social media assets', completed: false, priority: 'medium', dueDate: '2026-03-02', projectId: '3' },
    ]);

    const [activities, setActivities] = useState<Activity[]>([
        { id: '1', user: 'John Doe', action: 'completed task', target: 'Homepage design', time: '5 min ago', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: '2', user: 'Sarah Smith', action: 'added new comment on', target: 'API documentation', time: '15 min ago', avatar: 'https://i.pravatar.cc/150?img=2' },
        { id: '3', user: 'Mike Johnson', action: 'created new project', target: 'Mobile App', time: '1 hour ago', avatar: 'https://i.pravatar.cc/150?img=3' },
        { id: '4', user: 'Emily Brown', action: 'assigned task to', target: 'Database setup', time: '2 hours ago', avatar: 'https://i.pravatar.cc/150?img=4' },
        { id: '5', user: 'David Wilson', action: 'uploaded file to', target: 'Marketing assets', time: '3 hours ago', avatar: 'https://i.pravatar.cc/150?img=5' },
    ]);

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Filter projects based on search and filter
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             project.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (selectedFilter === 'all') return matchesSearch;
        if (selectedFilter === 'starred') return matchesSearch && project.starred;
        if (selectedFilter === 'active') return matchesSearch && project.status === 'active';
        if (selectedFilter === 'completed') return matchesSearch && project.status === 'completed';
        
        return matchesSearch;
    });

    // Stats calculations
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const upcomingDeadlines = projects.filter(p => {
        const dueDate = new Date(p.dueDate);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0 && p.status !== 'completed';
    }).length;

    return (
        <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            {/* Sidebar */}
            <motion.aside 
                initial={{ x: -300 }}
                animate={{ x: sidebarOpen ? 0 : -300 }}
                className={`fixed top-0 left-0 h-full w-72 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl z-30 overflow-y-auto`}
            >
                <div className="p-6">
                    {/* Logo */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">T</span>
                            </div>
                            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                TaskFlow<span className="text-[#6747ce]">Pro</span>
                            </h1>
                        </div>
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
                        <div className="flex items-center gap-3">
                            <img 
                                src="https://i.pravatar.cc/150?img=7" 
                                alt="Profile" 
                                className="w-12 h-12 rounded-full border-2 border-[#6747ce]"
                            />
                            <div>
                                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    John Doe
                                </h3>
                                <p className="text-sm text-gray-500">john.doe@example.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        {[
                            { icon: FiGrid, label: 'Dashboard', active: true },
                            { icon: FiFolder, label: 'Projects', active: false },
                            { icon: FiCheckCircle, label: 'Tasks', active: false },
                            { icon: FiCalendar, label: 'Calendar', active: false },
                            { icon: FiMessageSquare, label: 'Messages', active: false },
                            { icon: FiUsers, label: 'Team', active: false },
                            { icon: FiActivity, label: 'Analytics', active: false },
                            { icon: FiSettings, label: 'Settings', active: false },
                        ].map((item, index) => (
                            <motion.a
                                key={index}
                                href="#"
                                whileHover={{ x: 5 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    item.active 
                                        ? 'bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white' 
                                        : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                                }`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                                {item.label === 'Messages' && (
                                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                                )}
                            </motion.a>
                        ))}
                    </nav>

                    {/* Logout */}
                    <motion.button
                        whileHover={{ x: 5 }}
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full mt-8 ${
                            darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <FiLogOut size={20} />
                        <span>Logout</span>
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : ''}`}>
                {/* Top Bar */}
                <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-20`}>
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FiMenu size={24} />
                                </button>
                                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    Welcome back, John! 👋
                                </h2>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Search */}
                                <div className="relative hidden md:block">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search projects, tasks..."
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

                                {/* Notifications */}
                                <button className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                    <FiBell size={20} className="text-gray-600 dark:text-gray-300" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* Profile */}
                                <button className="flex items-center gap-2">
                                    <img 
                                        src="https://i.pravatar.cc/150?img=7" 
                                        alt="Profile" 
                                        className="w-10 h-10 rounded-full border-2 border-[#6747ce]"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { 
                                title: 'Total Projects', 
                                value: totalProjects, 
                                change: '+12%', 
                                icon: FiFolder, 
                                color: 'from-blue-500 to-cyan-500',
                                bgColor: 'bg-blue-100 dark:bg-blue-900/20'
                            },
                            { 
                                title: 'Active Projects', 
                                value: activeProjects, 
                                change: '+5%', 
                                icon: FiActivity, 
                                color: 'from-green-500 to-emerald-500',
                                bgColor: 'bg-green-100 dark:bg-green-900/20'
                            },
                            { 
                                title: 'Tasks Completed', 
                                value: `${completedTasks}/${totalTasks}`, 
                                change: `${Math.round((completedTasks/totalTasks)*100)}%`, 
                                icon: FiCheckCircle, 
                                color: 'from-purple-500 to-pink-500',
                                bgColor: 'bg-purple-100 dark:bg-purple-900/20'
                            },
                            { 
                                title: 'Upcoming Deadlines', 
                                value: upcomingDeadlines, 
                                change: 'next 7 days', 
                                icon: FiClock, 
                                color: 'from-orange-500 to-red-500',
                                bgColor: 'bg-orange-100 dark:bg-orange-900/20'
                            },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                        <stat.icon className={`text-2xl bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                                    </div>
                                    <span className={`text-sm font-medium ${
                                        stat.change.includes('+') ? 'text-green-500' : 'text-gray-500'
                                    }`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold mb-1 dark:text-white">{stat.value}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{stat.title}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Projects Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Projects
                            </h2>
                            <div className="flex items-center gap-4">
                                {/* Filters */}
                                <div className="flex items-center gap-2">
                                    {['all', 'starred', 'active', 'completed'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setSelectedFilter(filter)}
                                            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                                                selectedFilter === filter
                                                    ? 'bg-[#6747ce] text-white'
                                                    : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200 dark:hover:bg-gray-600`
                                            }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>

                                {/* View Toggle */}
                                <div className="flex items-center gap-2 border-l pl-4 dark:border-gray-700">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg ${
                                            viewMode === 'grid'
                                                ? 'bg-[#6747ce] text-white'
                                                : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
                                        }`}
                                    >
                                        <FiGrid size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg ${
                                            viewMode === 'list'
                                                ? 'bg-[#6747ce] text-white'
                                                : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
                                        }`}
                                    >
                                        <FiList size={20} />
                                    </button>
                                </div>

                                {/* New Project Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowNewProjectModal(true)}
                                    className="bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-shadow"
                                >
                                    <FiPlus size={20} />
                                    New Project
                                </motion.button>
                            </div>
                        </div>

                        {/* Projects Grid/List */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {filteredProjects.map((project, index) => (
                                        <motion.div
                                            key={project.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group`}
                                        >
                                            <div className={`h-2 bg-gradient-to-r ${project.color}`}></div>
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-semibold mb-2 dark:text-white group-hover:text-[#6747ce] transition-colors">
                                                            {project.name}
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                                            {project.description}
                                                        </p>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-yellow-400 transition-colors">
                                                        <FiStar className={project.starred ? 'fill-yellow-400 text-yellow-400' : ''} />
                                                    </button>
                                                </div>

                                                {/* Progress */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="text-gray-500 dark:text-gray-400">Progress</span>
                                                        <span className="font-semibold dark:text-white">{project.progress}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${project.progress}%` }}
                                                            transition={{ duration: 1, delay: index * 0.1 }}
                                                            className={`h-full bg-gradient-to-r ${project.color}`}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Project Meta */}
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                            <FiUsers size={16} />
                                                            <span>{project.members}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                            <FiCheckCircle size={16} />
                                                            <span>{project.completedTasks}/{project.tasks}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                        <FiCalendar size={16} />
                                                        <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        project.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                                        project.status === 'completed' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                                        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                    }`}>
                                                        {project.status}
                                                    </span>
                                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                        <FiMoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
                                <table className="w-full">
                                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white">Project</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white">Progress</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white">Due Date</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white">Team</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {filteredProjects.map((project) => (
                                            <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <h4 className="font-semibold dark:text-white">{project.name}</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        project.status === 'active' ? 'bg-green-100 text-green-600' :
                                                        project.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-yellow-100 text-yellow-600'
                                                    }`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full bg-gradient-to-r ${project.color}`}
                                                                style={{ width: `${project.progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm dark:text-white">{project.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 dark:text-white">{new Date(project.dueDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <FiUsers className="text-gray-400" size={16} />
                                                        <span className="dark:text-white">{project.members}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <FiMoreVertical size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity & Tasks */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Activity */}
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 lg:col-span-2`}>
                            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Recent Activity
                            </h2>
                            <div className="space-y-4">
                                {activities.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-4"
                                    >
                                        <img 
                                            src={activity.avatar} 
                                            alt={activity.user}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <p className="dark:text-white">
                                                <span className="font-semibold">{activity.user}</span>
                                                {' '}{activity.action}{' '}
                                                <span className="text-[#6747ce] font-medium">{activity.target}</span>
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Tasks */}
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    Today's Tasks
                                </h2>
                                <button className="text-[#6747ce] hover:underline text-sm">View All</button>
                            </div>
                            <div className="space-y-4">
                                {tasks.slice(0, 4).map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={task.completed}
                                            onChange={() => {}}
                                            className="w-5 h-5 rounded border-gray-300 text-[#6747ce] focus:ring-[#6747ce]"
                                        />
                                        <div className="flex-1">
                                            <p className={`dark:text-white ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                    {task.priority}
                                                </span>
                                                <span className="text-xs text-gray-500">{task.dueDate}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Project Modal */}
            <AnimatePresence>
                {showNewProjectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowNewProjectModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Create New Project
                            </h2>
                            
                            <form className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full px-4 py-2 rounded-lg border ${
                                            darkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-gray-50 border-gray-200 text-gray-800'
                                        } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                                        placeholder="Enter project name"
                                    />
                                </div>
                                
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        className={`w-full px-4 py-2 rounded-lg border ${
                                            darkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-gray-50 border-gray-200 text-gray-800'
                                        } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                                        placeholder="Describe your project"
                                    />
                                </div>
                                
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        className={`w-full px-4 py-2 rounded-lg border ${
                                            darkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-gray-50 border-gray-200 text-gray-800'
                                        } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                                    />
                                </div>
                                
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Team Members
                                    </label>
                                    <select
                                        className={`w-full px-4 py-2 rounded-lg border ${
                                            darkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-gray-50 border-gray-200 text-gray-800'
                                        } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                                    >
                                        <option>Select team size</option>
                                        <option>1-3 members</option>
                                        <option>4-6 members</option>
                                        <option>7+ members</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Project Color
                                    </label>
                                    <div className="flex gap-2">
                                        {['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-green-500 to-emerald-500', 'from-orange-500 to-red-500', 'from-yellow-500 to-amber-500'].map((color, index) => (
                                            <button
                                                key={index}
                                                className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} ${
                                                    index === 0 ? 'ring-2 ring-offset-2 ring-[#6747ce]' : ''
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewProjectModal(false)}
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
                                        className="flex-1 bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;