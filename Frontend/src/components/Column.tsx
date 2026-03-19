import type { Task } from "../types/TaskManagement";
import { FiMoreVertical } from 'react-icons/fi';
import { useDrop } from "react-dnd";
import { AnimatePresence } from 'framer-motion';
import TaskCard from "./TaskCard.";


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

export default Column;