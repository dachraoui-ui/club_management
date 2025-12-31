# Frontend Integration Guide

This guide explains how to connect the React frontend to the backend API.

## Setup

### 1. Environment Variables

Create a `.env` file in the frontend root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Axios (if not already installed)

```bash
npm install axios
```

## API Service Layer

Create an API service file to handle all API calls:

### `src/services/api.js`

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## Authentication Service

### `src/services/authService.js`

```javascript
import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return { user, accessToken, refreshToken };
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  },

  async logout() {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.patch('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  getToken() {
    return localStorage.getItem('accessToken');
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },
};
```

## Example: Using React Query

### Update Login Component

```typescript
// src/pages/Login.tsx
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // Show error toast
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    loginMutation.mutate({
      email: formData.get('email'),
      password: formData.get('password'),
    });
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
    </form>
  );
}
```

### Fetch Members

```typescript
// src/hooks/useMembers.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export const useMembers = (filters = {}) => {
  return useQuery({
    queryKey: ['members', filters],
    queryFn: async () => {
      const response = await api.get('/members', { params: filters });
      return response.data.data;
    },
  });
};
```

### Create Member

```typescript
// src/hooks/useCreateMember.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberData) => api.post('/members', memberData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
```

## Protected Routes

### `src/components/ProtectedRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

### Update App.tsx

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

// In your routes:
<Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
  <Route path="/dashboard" element={<Dashboard />} />
  {/* Other protected routes */}
</Route>
```

## Example: Members Page Integration

```typescript
// src/pages/Members.tsx
import { useMembers } from '@/hooks/useMembers';
import { useCreateMember } from '@/hooks/useCreateMember';

export default function Members() {
  const [filters, setFilters] = useState({});
  const { data, isLoading } = useMembers(filters);
  const createMember = useCreateMember();

  const handleCreateMember = async (memberData) => {
    try {
      await createMember.mutateAsync(memberData);
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map((member) => (
        <div key={member.id}>{member.firstName}</div>
      ))}
    </div>
  );
}
```

## Error Handling

Create an error handler utility:

```typescript
// src/utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    const { message, errors } = error.response.data;
    return {
      message: message || 'An error occurred',
      errors: errors || [],
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'Network error. Please check your connection.',
      errors: [],
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      errors: [],
    };
  }
};
```

## TypeScript Types

Create types matching your API responses:

```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // ... other fields
}
```

## Testing the Connection

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
npm run dev
```

3. Test login with default credentials:
   - Email: `admin@sportclub.com`
   - Password: `admin123`

4. Check browser console for any CORS or connection errors.

## CORS Configuration

If you encounter CORS issues, ensure the backend `.env` has the correct frontend URL:

```env
FRONTEND_URL=http://localhost:5173
```

## Next Steps

1. Replace all mock data imports with API calls
2. Update all components to use React Query hooks
3. Add loading and error states
4. Implement proper error handling and user feedback
5. Add form validation using react-hook-form with API validation

