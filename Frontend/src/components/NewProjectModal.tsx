import React from 'react';
import { motion } from 'framer-motion';

interface NewProjectModalProps {
    darkMode: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    formData: {
        name: string;
        description: string;
        dueDate: string;
        teamSize: string;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    selectedColor: string;
    onColorSelect: (color: string) => void;
    allAvailableColors: string[];
    loading: boolean;
}

const NewProjectModal: React.FC<NewProjectModalProps> = React.memo(({
    darkMode,
    onClose,
    onSubmit,
    formData,
    onInputChange,
    selectedColor,
    onColorSelect,
    allAvailableColors,
    loading
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Create New Project
                </h2>
                
                <form className="space-y-4" onSubmit={onSubmit}>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Project Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                            placeholder="Enter project name"
                            onChange={onInputChange}
                            value={formData.name}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description
                        </label>
                        <textarea
                            rows={3}
                            name="description"
                            onChange={onInputChange}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                            placeholder="Describe your project"
                            value={formData.description}
                            required
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
                            name="dueDate"
                            onChange={onInputChange}
                            value={formData.dueDate}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Team Members
                        </label>
                        <select
                            name="teamSize"
                            className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-[#6747ce]`}
                            value={formData.teamSize}
                            onChange={onInputChange}
                            required
                        >
                            <option value="">Select team size</option>
                            <option value="3">1-3 members</option>
                            <option value="6">4-6 members</option>
                            <option value="10">7+ members</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Project Color
                        </label>
                        <div className="flex gap-2">
                            {allAvailableColors.map((color, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} ${
                                        selectedColor === color ? 'ring-2 ring-offset-2 ring-[#6747ce]' : ''
                                    }`}
                                    onClick={() => onColorSelect(color)}
                                    aria-label={`Select color ${index + 1}`}
                                />
                            ))}
                        </div>
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
                            disabled={loading}
                            className={`flex-1 bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white py-2 rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2 ${
                                loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
                                        />
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Create Project'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
});

NewProjectModal.displayName = 'NewProjectModal';
export default NewProjectModal;