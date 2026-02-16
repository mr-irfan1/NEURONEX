import { User, UserRole, NotebookEntry } from './types';

export const APP_NAME = "NeuroNex";

export const MOCK_USER: User = {
  id: 'u_12345',
  name: 'Alex Carter',
  email: 'alex.carter@example.com',
  role: UserRole.PRO,
  learningLevel: 'Intermediate',
  streak: 12
};

export const INITIAL_NOTEBOOKS: NotebookEntry[] = [
  {
    id: 'n_1',
    title: 'Advanced React Patterns',
    content: 'React Hooks provide a powerful way to manage state logic...',
    tags: ['React', 'Frontend'],
    lastModified: new Date()
  },
  {
    id: 'n_2',
    title: 'Python Data Structures',
    content: 'Lists are mutable sequences, typically used to store collections of homogeneous items.',
    tags: ['Python', 'CS101'],
    lastModified: new Date(Date.now() - 86400000)
  }
];

export const SAMPLE_CODE_PYTHON = `def fibonacci(n):
    """Calculates the nth Fibonacci number."""
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Calculate the 10th number
result = fibonacci(10)
print(f"The 10th Fibonacci number is: {result}")
`;

export const SAMPLE_CODE_JS = `function fibonacci(n) {
  // Calculates the nth Fibonacci number
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th number
console.log("The 10th Fibonacci number is:", fibonacci(10));`;

export const SAMPLE_CODE_TS = `function fibonacci(n: number): number {
  // Calculates the nth Fibonacci number
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th number
console.log("The 10th Fibonacci number is:", fibonacci(10));`;

export const THEME = {
  colors: {
    primary: '#F5F500',
    secondary: '#8A5CF6',
    bg: '#0B0B0F',
    surface: '#141419'
  }
};
