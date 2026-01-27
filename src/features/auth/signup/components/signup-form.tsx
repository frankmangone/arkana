'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignup } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

interface SignupFormProps {
  lang: string;
  dictionary: {
    signup: {
      title: string;
      description: string;
      email: string;
      username: string;
      password: string;
      confirmPassword: string;
      submit: string;
      signingUp: string;
      hasAccount: string;
      signIn: string;
      errors: {
        emailExists: string;
        passwordTooShort: string;
        usernameTooShort: string;
        passwordsDontMatch: string;
      };
    };
    login: {
      errors: {
        required: string;
        invalidEmail: string;
      };
    };
  };
}

export function SignupForm({ lang, dictionary }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const signup = useSignup();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = dictionary.login.errors.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = dictionary.login.errors.invalidEmail;
    }

    if (!password) {
      newErrors.password = dictionary.login.errors.required;
    } else if (password.length < 8) {
      newErrors.password = dictionary.signup.errors.passwordTooShort;
    }

    if (!username) {
      newErrors.username = dictionary.login.errors.required;
    } else if (username.length < 3) {
      newErrors.username = dictionary.signup.errors.usernameTooShort;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = dictionary.signup.errors.passwordsDontMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await signup.mutateAsync({
        email,
        username,
        password,
      });
      toast.success('Account created successfully!');
      
      // Redirect to home page
      router.push(`/${lang}`);
      router.refresh();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || 'Failed to create account';
      toast.error(errorMessage);
    }
  };

  const isLoading = signup.isPending;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {dictionary.signup.title}
        </CardTitle>
        <CardDescription>
          {dictionary.signup.description}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {dictionary.signup.username}
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((prev) => ({ ...prev, username: '' }));
              }}
              placeholder="johndoe"
              className={errors.username ? 'border-destructive' : ''}
              disabled={isLoading}
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {dictionary.signup.email}
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="you@example.com"
              className={errors.email ? 'border-destructive' : ''}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {dictionary.signup.password}
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="••••••••"
              className={errors.password ? 'border-destructive' : ''}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {dictionary.signup.confirmPassword}
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              placeholder="••••••••"
              className={errors.confirmPassword ? 'border-destructive' : ''}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? dictionary.signup.signingUp : dictionary.signup.submit}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            {dictionary.signup.hasAccount}{' '}
            <Link
              href={`/${lang}/login`}
              className="text-primary hover:underline"
            >
              {dictionary.signup.signIn}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
