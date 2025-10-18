interface TaskData {
    title: string;
    description?: string;
    column_id: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

export const createTask = async (taskData: TaskData): Promise<any> => {
    // This is a mock API call.
    // In a real application, you would send a request to your backend here.
    console.log("Creating task with data:", taskData);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const newId = `task-${Math.random().toString(36).substr(2, 9)}`;
    
    const newTask = {
        id: newId,
        ...taskData
    };

    return newTask;
};