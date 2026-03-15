import React from 'react';
import { motion } from 'framer-motion';

interface Activity {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    avatar: string;
}

interface ActivityFeedProps {
    activities: Activity[];
    darkMode: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = React.memo(({ activities, darkMode }) => {
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
export default ActivityFeed;