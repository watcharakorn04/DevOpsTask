import { User, Project, Task } from './types';

export const INITIAL_CURRENT_USER: User = {
  id: 'u1',
  name: 'Sarah Johnson',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
  role: 'Project Manager'
};

export const INITIAL_TEAM_MEMBERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    role: 'Project Manager'
  },
  {
    id: 'u2',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    role: 'Frontend Developer'
  },
  {
    id: 'u3',
    name: 'Emily Carter',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
    role: 'UI/UX Designer'
  },
  {
    id: 'u4',
    name: 'James Wilson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    role: 'QA Engineer'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    description: 'Marketing website refresh with focus on conversion rate optimization and modern layout styles.',
    progress: 72
  },
  {
    id: 'p2',
    name: 'Mobile App',
    description: 'Customer mobile experience buildout for iOS and Android platforms using React Native.',
    progress: 35
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Design homepage',
    description: 'Create high-fidelity homepage mockups matching the modern minimalist aesthetic.',
    projectId: 'p1',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-07-10',
    assigneeId: 'u3',
    labels: ['Design', 'UI'],
    comments: [
      {
        id: 'c1',
        authorId: 'u1',
        message: 'Please use the updated branding colors.',
        timestamp: '2026-07-01T09:00:00Z'
      }
    ]
  },
  {
    id: 't2',
    title: 'Implement navigation',
    description: 'Build responsive navigation layout with collapsible sidebar and slide-over panels.',
    projectId: 'p1',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '2026-07-08',
    assigneeId: 'u2',
    labels: ['Frontend'],
    comments: []
  },
  {
    id: 't3',
    title: 'QA testing',
    description: 'Perform cross-browser testing on Chrome, Safari, and Firefox.',
    projectId: 'p2',
    status: 'Review',
    priority: 'High',
    dueDate: '2026-07-14',
    assigneeId: 'u4',
    labels: ['QA'],
    comments: [
      {
        id: 'c2',
        authorId: 'u3',
        message: 'Chrome testing completed with minor issues fixed.',
        timestamp: '2026-07-01T11:15:00Z'
      }
    ]
  }
];
