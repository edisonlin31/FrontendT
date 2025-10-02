import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError } from '../store/slices/authSlice';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    dispatch(clearError());
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-slide-up items-center">
          <div className="flex justify-center mb-4">
            <Logo height="h-8 " />
          </div>
          <p className="text-gray-600">Welcome back! Please sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up">
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Sign In</h2>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="pl-10"
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className="pl-10"
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-red-800 font-medium">{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#FF8800] to-[#FF8800]/80 hover:from-[#FF8800]/90 hover:to-[#FF8800]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8800] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign in to your account
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Demo Accounts Section */}
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-[#FF8800]/10 border-t border-gray-100">
            <div className="text-center mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 text-[#FF8800]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
                Demo Accounts
              </h3>
              <p className="text-xs text-gray-600 mb-4">Click on any account below to auto-fill credentials</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => {
                  setValue('email', 'l1@helpdesk.com');
                  setValue('password', 'password123');
                }}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <div className="text-xs font-medium text-green-700">L1 Agent</div>
                </div>
                <div className="text-xs text-gray-600 font-mono">l1@helpdesk.com</div>
                <div className="text-xs text-gray-500 mt-1">Create & manage tickets</div>
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  setValue('email', 'l2@helpdesk.com');
                  setValue('password', 'password123');
                }}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <div className="text-xs font-medium text-orange-700">L2 Tech</div>
                </div>
                <div className="text-xs text-gray-600 font-mono">l2@helpdesk.com</div>
                <div className="text-xs text-gray-500 mt-1">Handle escalations</div>
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  setValue('email', 'l3@helpdesk.com');
                  setValue('password', 'password123');
                }}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <div className="text-xs font-medium text-purple-700">L3 Expert</div>
                </div>
                <div className="text-xs text-gray-600 font-mono">l3@helpdesk.com</div>
                <div className="text-xs text-gray-500 mt-1">Critical issue resolution</div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}