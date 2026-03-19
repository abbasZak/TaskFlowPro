// Types
export interface Task {
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

export interface TeamMember {
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

export interface Project {
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

export interface Milestone {
    id: string;
    title: string;
    date: string;
    completed: boolean;
}

export interface Goal {
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
}
