import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { 
    FiPlus, FiSearch, FiFilter, FiMoreVertical, FiStar, 
    FiClock, FiCheckCircle, FiTrendingUp, FiUsers, 
    FiCalendar, FiMessageSquare, FiBell, FiUser,
    FiGrid, FiList, FiFolder, FiActivity, FiSettings,
    FiLogOut, FiSun, FiMoon, FiMenu, FiX, FiInbox
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useDebounce } from 'use-debounce';
import { Grid, List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import 'react-virtualized/styles.css';

// Lazy load heavy components
const NewProjectModal = lazy(() => import('./NewProjectModal'));

// Types
interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on-hold';
    progress: number;
    dueDate: string;
    teamSize: number;
    tasksCount: number;
    completedTasks: number;
    colorCode: string;
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

// Cache for cell measurements
const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 350,
});

// Memoized Loading Screen Component
const LoadingScreen = React.memo<{ darkMode: boolean }>(({ darkMode }) => (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-24 h-24 bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
                <span className="text-white font-bold text-4xl">T</span>
            </motion.div>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}
            >
                Loading your workspace...
            </motion.h2>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center"
            >
                <div className="w-16 h-16 border-4 border-[#6747ce] border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
        </div>
    </div>
));

LoadingScreen.displayName = 'LoadingScreen';

// Memoized No Projects Component
const NoProjectsState = React.memo<{ darkMode: boolean; onCreateClick: () => void }>(({ darkMode, onCreateClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="col-span-full flex flex-col items-center justify-center py-16 px-4"
    >
        <div className={`w-32 h-32 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl flex items-center justify-center mb-6`}>
            <FiInbox className={`text-6xl ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
        <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            No projects yet
        </h3>
        <p className={`text-center mb-8 max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Get started by creating your first project. You can organize tasks, collaborate with team members, and track progress all in one place.
        </p>
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            onClick={onCreateClick}
            className="bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-shadow font-medium"
        >
            <FiPlus size={20} />
            Create Your First Project
        </motion.button>
    </motion.div>
));

NoProjectsState.displayName = 'NoProjectsState';

// Memoized Project Card Component
const ProjectCard = React.memo<{ project: Project; darkMode: boolean; index: number; onClick: () => void }>(({ 
    project, darkMode, index, onClick 
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.03, duration: 0.2 }}
        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group h-full`}
        onClick={onClick}
    >
        <div className={`h-2 bg-gradient-to-r ${project.colorCode}`}></div>
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

            <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="font-semibold dark:text-white">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className={`h-full bg-gradient-to-r ${project.colorCode}`}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <FiUsers size={16} />
                        <span>{project.teamSize}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <FiCheckCircle size={16} />
                        <span>{project.completedTasks}/{project.tasksCount}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <FiCalendar size={16} />
                    <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
            </div>

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
));

ProjectCard.displayName = 'ProjectCard';

// Memoized Stats Card Component
const StatsCard = React.memo<{ 
    stat: { 
        title: string; 
        value: string | number; 
        change: string; 
        icon: React.ElementType; 
        color: string; 
        bgColor: string;
    }; 
    index: number;
    darkMode: boolean;
}>(({ stat, index, darkMode }) => {
    const Icon = stat.icon;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`text-2xl bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
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
    );
});

StatsCard.displayName = 'StatsCard';

// Virtualized Grid Cell Renderer
const GridCell = React.memo<{
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
    data: {
        projects: Project[];
        darkMode: boolean;
        onProjectClick: (id: string) => void;
        columnCount: number;
    };
}>(({ columnIndex, rowIndex, style, data }) => {
    const { projects, darkMode, onProjectClick, columnCount } = data;
    const index = rowIndex * columnCount + columnIndex;
    const project = projects[index];
    
    if (!project) return null;
    
    return (
        <div style={style} className="p-2">
            <ProjectCard
                project={project}
                darkMode={darkMode}
                index={index}
                onClick={() => onProjectClick(project.id)}
            />
        </div>
    );
});

GridCell.displayName = 'GridCell';

// Virtualized List Row Renderer
const ListRow = React.memo<{
    index: number;
    style: React.CSSProperties;
    data: {
        projects: Project[];
        darkMode: boolean;
        onProjectClick: (id: string) => void;
    };
}>(({ index, style, data }) => {
    const { projects, darkMode, onProjectClick } = data;
    const project = projects[index];
    
    if (!project) return null;
    
    return (
        <div style={style} className="p-2">
            <div 
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => onProjectClick(project.id)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold dark:text-white">{project.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                        <div className="flex items-center gap-2">
                            <FiUsers className="text-gray-400" size={16} />
                            <span className="text-sm dark:text-white">{project.teamSize}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status === 'active' ? 'bg-green-100 text-green-600' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                            'bg-yellow-100 text-yellow-600'
                        }`}>
                            {project.status}
                        </span>
                    </div>
                </div>
                <div className="mt-2 flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full bg-gradient-to-r ${project.colorCode}`}
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                            <span className="text-sm dark:text-white">{project.progress}%</span>
                        </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
});

ListRow.displayName = 'ListRow';

// Activity Feed Component
const ActivityFeed = React.memo<{ activities: Activity[]; darkMode: boolean }>(({ activities, darkMode }) => {
    if (!activities.length) return null;
    
    return (
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
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4"
                    >
                        <img 
                            src={activity.avatar} 
                            alt={activity.user}
                            className="w-10 h-10 rounded-full"
                            loading="lazy"
                            decoding="async"
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
    );
});

ActivityFeed.displayName = 'ActivityFeed';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        dueDate: "",
        teamSize: ""
    });
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activities] = useState<Activity[]>([
        { id: '1', user: 'John Doe', action: 'completed task', target: 'Homepage design', time: '5 min ago', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: '2', user: 'Sarah Smith', action: 'added new comment on', target: 'API documentation', time: '15 min ago', avatar: 'https://i.pravatar.cc/150?img=2' },
        { id: '3', user: 'Mike Johnson', action: 'created new project', target: 'Mobile App', time: '1 hour ago', avatar: 'https://i.pravatar.cc/150?img=3' },
    ]);
    const [selectedColor, setSelectedColor] = useState("from-blue-500 to-cyan-500");
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);

    const { enqueueSnackbar } = useSnackbar();

    const allAvailableColors = useMemo(() => [
        'from-blue-500 to-cyan-500', 
        'from-purple-500 to-pink-500', 
        'from-green-500 to-emerald-500', 
        'from-orange-500 to-red-500', 
        'from-yellow-500 to-amber-500'
    ], []);

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

    // Memoized stats
    const stats = useMemo(() => [
        { 
            title: 'Total Projects', 
            value: projects.length, 
            change: '+12%', 
            icon: FiFolder, 
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20'
        },
        { 
            title: 'Active Projects', 
            value: projects.filter(p => p.status === 'active').length, 
            change: '+5%', 
            icon: FiActivity, 
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-100 dark:bg-green-900/20'
        },
        { 
            title: 'Tasks Completed', 
            value: tasks.length > 0 ? `${tasks.filter(t => t.completed).length}/${tasks.length}` : '0/0', 
            change: tasks.length > 0 ? `${Math.round((tasks.filter(t => t.completed).length/tasks.length)*100)}%` : '0%', 
            icon: FiCheckCircle, 
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20'
        },
        { 
            title: 'Upcoming Deadlines', 
            value: projects.filter(p => {
                const dueDate = new Date(p.dueDate);
                const today = new Date();
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7 && diffDays >= 0 && p.status !== 'completed';
            }).length, 
            change: 'next 7 days', 
            icon: FiClock, 
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20'
        },
    ], [projects, tasks]);

    // Memoized filtered projects
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                                 project.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
            
            if (selectedFilter === 'all') return matchesSearch;
            if (selectedFilter === 'starred') return matchesSearch && project.starred;
            if (selectedFilter === 'active') return matchesSearch && project.status === 'active';
            if (selectedFilter === 'completed') return matchesSearch && project.status === 'completed';
            
            return matchesSearch;
        });
    }, [projects, debouncedSearchQuery, selectedFilter]);

    // Memoized callback functions
    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [navigate]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSelectColor = useCallback((color: string) => {
        setSelectedColor(color);
    }, []);

    const handleProjectClick = useCallback((projectId: string) => {
        navigate(`/projectPage/${projectId}`);
    }, [navigate]);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        
        const user = auth.currentUser;
        if (!user) {
            enqueueSnackbar('You must be logged in to create a project', { variant: 'error' });
            setLoading(false);
            return;
        }

        if (!formData.name || !formData.description || !formData.dueDate || !formData.teamSize) {
            enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
            setLoading(false);
            return;
        }

        const firebaseUserId = await user.getIdToken();

        const projectData = {
            name: formData.name,
            description: formData.description,
            dueDate: formData.dueDate,
            teamSize: formData.teamSize,
            colorCode: selectedColor,
        };

        try {
            const token = await user.getIdToken();
            
            const response = await axios.post(
                `${apiUrl}/api/project/create-project`,
                projectData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data && response.data.success) {
                enqueueSnackbar(response.data.message || 'Project created successfully!', { 
                    variant: 'success' 
                });
                setShowNewProjectModal(false);
                
                setFormData({
                    name: "",
                    description: "",
                    dueDate: "",
                    teamSize: "",
                });
                setSelectedColor("from-blue-500 to-cyan-500");
                
                const newProject: Project = {
                    id: response.data.projectId,
                    name: formData.name,
                    description: formData.description,
                    status: 'active',
                    progress: 0,
                    dueDate: formData.dueDate,
                    teamSize: parseInt(formData.teamSize) || 1,
                    tasksCount: 0,
                    completedTasks: 0,
                    colorCode: selectedColor,
                    starred: false
                };
                
                setProjects(prev => [newProject, ...prev]);
            }
        } catch(err: any) {
            console.error('Error creating project:', err);
            
            let errorMessage = 'Failed to create project';
            
            if (err.response) {
                errorMessage = err.response.data?.message || 
                              err.response.data?.error || 
                              `Server error: ${err.response.status}`;
            } else if (err.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                errorMessage = err.message || 'An unexpected error occurred';
            }
            
            enqueueSnackbar(errorMessage, { variant: "error" });
        } finally {
            setLoading(false);
        }
    }, [formData, selectedColor, enqueueSnackbar, apiUrl]);

    const loadMoreProjects = useCallback(async () => {
        if (!user || !hasMore || projectsLoading) return;
        
        setProjectsLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await axios.get(
                `${apiUrl}/api/project/get-user-project`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        limit: 10,
                        lastDoc: lastDoc ? JSON.stringify(lastDoc) : undefined
                    }
                }
            );
            
            if (response.data.projects.length > 0) {
                setProjects(prev => [...prev, ...response.data.projects]);
                setLastDoc(response.data.lastDoc);
                setHasMore(response.data.hasMore);
                cache.clearAll();
            } else {
                setHasMore(false);
            }
        } catch (err: any) {
            console.error(err);
            enqueueSnackbar(
                err.response?.data?.message || "Failed to fetch projects",
                { variant: "error" }
            );
        } finally {
            setProjectsLoading(false);
        }
    }, [user, hasMore, projectsLoading, apiUrl, enqueueSnackbar, lastDoc]);

    // Auth effect with cleanup
    useEffect(() => {
        auth.currentUser?.getIdToken().then((token) => console.log(token)); 
        

        let isMounted = true;
        
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (isMounted) {
                setUser(user);
                setAuthLoading(false);
                
                if (!user) {
                    navigate('/login');
                }
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [navigate]);

    // Fetch projects effect
    useEffect(() => {
        const getAllProjects = async () => {
            if (!user) return;
            
            setProjectsLoading(true);
            try {
                const token = await user.getIdToken();
                const response = await axios.get(
                    `${apiUrl}/api/project/get-user-project`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { limit: 10 }
                    }
                );
                
                setProjects(response.data.projects);
                setLastDoc(response.data.lastDoc);
                setHasMore(response.data.hasMore);
                cache.clearAll();
            } catch (err: any) {
                console.error(err);
                enqueueSnackbar(
                    err.response?.data?.message || "Failed to fetch projects",
                    { variant: "error" }
                );
            } finally {
                setProjectsLoading(false);
            }
        };

        getAllProjects();
    }, [user, apiUrl, enqueueSnackbar]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !projectsLoading) {
                    loadMoreProjects();
                }
            },
            { threshold: 0.5 }
        );

        const sentinel = document.getElementById('scroll-sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        };
    }, [hasMore, projectsLoading, loadMoreProjects]);

    if (authLoading) {
        return <LoadingScreen darkMode={darkMode} />;
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            {/* Sidebar */}
            <motion.aside 
                initial={{ x: -300 }}
                animate={{ x: sidebarOpen ? 0 : -300 }}
                transition={{ duration: 0.2 }}
                className={`fixed top-0 left-0 h-full w-72 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl z-30 overflow-y-auto`}
            >
                <div className="p-6">
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

                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
                        <div className="flex items-center gap-3">
                            <img 
                                src="https://i.pravatar.cc/150?img=7" 
                                alt="Profile" 
                                className="w-12 h-12 rounded-full border-2 border-[#6747ce]"
                                loading="lazy"
                                decoding="async"
                            />
                            <div>
                                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {auth.currentUser?.displayName}
                                </h3>
                                <p className="text-sm text-gray-500">{auth.currentUser?.email}</p>
                            </div>
                        </div>
                    </div>

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
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.1 }}
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

                    <motion.button
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.1 }}
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
            <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-72' : ''}`}>
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
                                    Welcome back, {auth.currentUser?.displayName}! 👋
                                </h2>
                            </div>

                            <div className="flex items-center gap-4">
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

                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                                </button>

                                <button className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                    <FiBell size={20} className="text-gray-600 dark:text-gray-300" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                <button className="flex items-center gap-2">
                                    <img 
                                        src="https://i.pravatar.cc/150?img=7" 
                                        alt="Profile" 
                                        className="w-10 h-10 rounded-full border-2 border-[#6747ce]"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-6">
                    {/* Stats Cards */}
                    {projects.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <StatsCard 
                                    key={stat.title}
                                    stat={stat}
                                    index={index}
                                    darkMode={darkMode}
                                />
                            ))}
                        </div>
                    )}

                    {/* Projects Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Projects
                            </h2>
                            <div className="flex items-center gap-4">
                                {projects.length > 0 && (
                                    <>
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
                                    </>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.1 }}
                                    onClick={() => setShowNewProjectModal(true)}
                                    className="bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-shadow"
                                >
                                    <FiPlus size={20} />
                                    New Project
                                </motion.button>
                            </div>
                        </div>

                        {/* Projects Grid/List with Virtualization */}
                        {projectsLoading && projects.length === 0 ? (
                            <div className="flex justify-center items-center py-16">
                                <div className="w-12 h-12 border-4 border-[#6747ce] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : filteredProjects.length > 0 ? (
                            viewMode === 'grid' ? (
                                <div style={{ height: '800px', width: '100%' }}>
                                    <AutoSizer>
                                        {({ height, width }) => {
                                            const columnCount = Math.floor(width / 400) || 1;
                                            const rowCount = Math.ceil(filteredProjects.length / columnCount);
                                            
                                            return (
                                                <Grid
                                                    cellRenderer={(props) => (
                                                        <GridCell
                                                            {...props}
                                                            data={{
                                                                projects: filteredProjects,
                                                                darkMode,
                                                                onProjectClick: handleProjectClick,
                                                                columnCount
                                                            }}
                                                        />
                                                    )}
                                                    columnCount={columnCount}
                                                    columnWidth={width / columnCount}
                                                    height={height}
                                                    rowCount={rowCount}
                                                    rowHeight={350}
                                                    width={width}
                                                    overscanRowCount={2}
                                                />
                                            );
                                        }}
                                    </AutoSizer>
                                </div>
                            ) : (
                                <div style={{ height: '800px', width: '100%' }}>
                                    <AutoSizer>
                                        {({ height, width }) => (
                                            <List
                                                height={height}
                                                rowCount={filteredProjects.length}
                                                rowHeight={120}
                                                rowRenderer={(props) => (
                                                    <ListRow
                                                        {...props}
                                                        data={{
                                                            projects: filteredProjects,
                                                            darkMode,
                                                            onProjectClick: handleProjectClick
                                                        }}
                                                    />
                                                )}
                                                width={width}
                                                overscanRowCount={5}
                                            />
                                        )}
                                    </AutoSizer>
                                </div>
                            )
                        ) : (
                            <NoProjectsState 
                                darkMode={darkMode} 
                                onCreateClick={() => setShowNewProjectModal(true)} 
                            />
                        )}
                        
                        {/* Infinite scroll sentinel */}
                        {hasMore && filteredProjects.length > 0 && (
                            <div id="scroll-sentinel" className="h-10 w-full" />
                        )}
                        {projectsLoading && projects.length > 0 && (
                            <div className="flex justify-center py-4">
                                <div className="w-8 h-8 border-4 border-[#6747ce] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity & Tasks */}
                    {projects.length > 0 && (
                        <Suspense fallback={<div>Loading...</div>}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <ActivityFeed 
                                    activities={activities}
                                    darkMode={darkMode}
                                />
                                {/* Tasks component */}
                                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                            Today's Tasks
                                        </h2>
                                        <button className="text-[#6747ce] hover:underline text-sm">View All</button>
                                    </div>
                                    <div className="space-y-4">
                                        {tasks.length > 0 ? (
                                            tasks.slice(0, 4).map((task, index) => (
                                                <motion.div
                                                    key={task.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
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
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    No tasks for today
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Suspense>
                    )}
                </div>
            </div>

            {/* New Project Modal */}
            <AnimatePresence>
                {showNewProjectModal && (
                    <Suspense fallback={<div>Loading...</div>}>
                        <NewProjectModal
                            darkMode={darkMode}
                            onClose={() => setShowNewProjectModal(false)}
                            onSubmit={handleSubmit}
                            formData={formData}
                            onInputChange={handleInputChange}
                            selectedColor={selectedColor}
                            onColorSelect={handleSelectColor}
                            allAvailableColors={allAvailableColors}
                            loading={loading}
                        />
                    </Suspense>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;