# API Client Documentation

This directory contains the API client setup for integrating with the Arkana backend.

## Setup

1. Add the API URL to your `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8082
```

For production, set it to your production backend URL.

## Usage

### Using React Query Hooks (Recommended)

The easiest way to use the API is with the provided React Query hooks:

```tsx
'use client';

import { useLogin, useCurrentUser, useLogout } from '@/lib/api';

export function LoginForm() {
  const login = useLogin();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await login.mutateAsync({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });
      // Success! User is now logged in
    } catch (error) {
      // Handle error
      console.error('Login failed:', error);
    }
  };

  if (user) {
    return (
      <div>
        <p>Welcome, {user.username}!</p>
        <button onClick={() => logout.mutate()}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Available Hooks

#### Authentication Hooks

- `useCurrentUser()` - Get current authenticated user
- `useLogin()` - Login mutation
- `useSignup()` - Signup mutation
- `useLogout()` - Logout mutation
- `useGoogleAuth()` - Google OAuth authentication
- `useRefreshToken()` - Refresh access token

#### User Hooks

- `useUser(id)` - Get user by ID
- `useCreateUser()` - Create new user mutation

### Using Services Directly

You can also use the services directly if you need more control:

```tsx
import { authService } from '@/lib/api';

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123',
});

// Get current user
const user = await authService.getCurrentUser();

// Check if authenticated
if (authService.isAuthenticated()) {
  // User is logged in
}
```

## Features

### Automatic Token Management

- Tokens are automatically stored in `localStorage`
- Access tokens are automatically added to request headers
- Automatic token refresh on 401 errors
- Tokens are cleared on logout

### Error Handling

The API client includes automatic error handling:

- 401 errors trigger automatic token refresh
- Failed refresh clears tokens and rejects the request
- All errors are properly typed with TypeScript

### TypeScript Support

All API responses and requests are fully typed:

```tsx
import type { User, AuthResponse, LoginRequest } from '@/lib/api';

const login = async (data: LoginRequest): Promise<AuthResponse> => {
  return authService.login(data);
};
```

## API Endpoints

The client supports all backend endpoints:

### Auth Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/google/token` - Google OAuth (if configured)

### User Endpoints

- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user

## Static Export Compatibility

Since the frontend uses static export (`output: "export"`), all API calls must be made client-side. The React Query hooks are perfect for this as they:

- Only run in the browser
- Handle loading and error states
- Provide caching and refetching
- Work seamlessly with static sites

## Example: Complete Auth Flow

```tsx
'use client';

import { useLogin, useSignup, useCurrentUser, useLogout } from '@/lib/api';
import { useState } from 'react';

export function AuthExample() {
  const [isSignup, setIsSignup] = useState(false);
  const login = useLogin();
  const signup = useSignup();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      if (isSignup) {
        await signup.mutateAsync({
          ...data,
          username: formData.get('username') as string,
        });
      } else {
        await login.mutateAsync(data);
      }
    } catch (error) {
      console.error('Auth failed:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <div>
        <h2>Welcome, {user.username}!</h2>
        <p>Email: {user.email}</p>
        <button onClick={() => logout.mutate()}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {isSignup && (
        <input name="username" placeholder="Username" required />
      )}
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">
        {isSignup ? 'Sign Up' : 'Login'}
      </button>
      <button type="button" onClick={() => setIsSignup(!isSignup)}>
        Switch to {isSignup ? 'Login' : 'Sign Up'}
      </button>
    </form>
  );
}
```
