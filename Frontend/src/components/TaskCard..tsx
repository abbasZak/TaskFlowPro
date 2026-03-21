import type { Task } from '../types/TaskManagement';
import { useDrag } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiEdit2, FiCalendar, FiPaperclip , FiMessageCircle, FiRepeat } from "react-icons/fi";




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

export default TaskCard;