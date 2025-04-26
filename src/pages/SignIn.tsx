import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, FacebookAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                setError('Please verify your email before logging in.');
                await auth.signOut(); // Sign out the user if email is not verified
                setLoading(false);
                return;
            }
            console.log('Logged in successfully!');
            
            // Show success pop-up and redirect after a few seconds
            setShowSuccessPopup(true);
            setTimeout(() => {
                setShowSuccessPopup(false);
                navigate("/") // Redirect to homepage (or any other page)
            }, 3000); // Show pop-up for 3 seconds
        } catch (err) {
            setError('Invalid email or password');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            setLoading(true);
            await signInWithPopup(auth, provider);
            console.log('Logged in with Google successfully!');
            
            // Show success pop-up and redirect after a few seconds
            setShowSuccessPopup(true);
            setTimeout(() => {
                setShowSuccessPopup(false);
                navigate("/"); // Redirect to homepage (or any other page)
            }, 3000); // Show pop-up for 3 seconds
        } catch (err) {
            setError('Failed to sign in with Google');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookSignIn = async () => {
        const provider = new FacebookAuthProvider();
        try {
            setLoading(true);
            await signInWithPopup(auth, provider);
            console.log('Logged in with Facebook successfully!');
            
            // Show success pop-up and redirect after a few seconds
            setShowSuccessPopup(true);
            setTimeout(() => {
                setShowSuccessPopup(false);
                navigate("/"); // Redirect to homepage (or any other page)
            }, 3000); // Show pop-up for 3 seconds
        } catch (err) {
            setError('Failed to sign in with Facebook');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <h1 className="text-2xl font-bold mb-6">Sign In</h1>
            <div className="w-96 p-6 bg-white rounded-lg shadow-lg">
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065C64]"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password:
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065C64]"
                            required
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="remember-me"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="mr-2"
                        />
                        <label htmlFor="remember-me" className="text-sm font-medium text-gray-700">
                            Remember Me
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#065C64] text-white py-2 rounded-lg hover:bg-[#044E4F]"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <a href="/forgot-password" className="text-sm text-blue-500 hover:underline">
                        Forgot password?
                    </a>
                </form>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="my-4 flex items-center">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="mx-2 text-sm text-gray-500">OR</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>
                <div className="flex gap-4">

                    <button
                        onClick={handleFacebookSignIn}
                        className="w-1/2 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
                        disabled={loading}
                    >
                        <i className="fab fa-facebook-f"></i> Facebook
                    </button>

                    <button
                        onClick={handleGoogleSignIn}
                        className="w-1/2 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600"
                        disabled={loading}
                    >
                        <i className="fab fa-google"></i> Google
                    </button>
                </div>
            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
                    <div className="p-6 bg-white rounded-lg shadow-lg text-center">
                        <p className="text-green-500 font-bold">Successfully Logged In!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignIn;