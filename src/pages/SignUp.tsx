import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth, firestore } from '../lib/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('player');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Trimite email de verificare
            await sendEmailVerification(user);

            // Salvează user-ul în Firestore
            await setDoc(doc(firestore, 'users', user.uid), {
                name,
                email,
                role,
                createdAt: new Date(),
            });

            // Deconectează utilizatorul
            await auth.signOut();

            // Afișează pop-up de succes
            setShowSuccessPopup(true);

            setTimeout(() => {
                setShowSuccessPopup(false);
                navigate('/signIn');
            }, 3000);

        } catch (err) {
            setError('Failed to sign up. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        const provider = new GoogleAuthProvider();
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            await setDoc(doc(firestore, 'users', user.uid), {
                name: user.displayName,
                email: user.email,
                role,
                createdAt: new Date(),
            });

            setShowSuccessPopup(true);

            setTimeout(() => {
                setShowSuccessPopup(false);
                navigate('/');
            }, 3000);

        } catch (err) {
            setError('Failed to sign up with Google');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookSignUp = async () => {
        const provider = new FacebookAuthProvider();
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            await setDoc(doc(firestore, 'users', user.uid), {
                name: user.displayName,
                email: user.email,
                role,
                createdAt: new Date(),
            });

            setShowSuccessPopup(true);

            setTimeout(() => {
                setShowSuccessPopup(false);
                navigate('/');
            }, 3000);

        } catch (err) {
            setError('Failed to sign up with Facebook');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
            <div className="w-96 p-6 bg-white rounded-lg shadow-lg">
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            * Name:
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065C64]"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            * Email:
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
                            * Password:
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
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                            * Re-type password:
                        </label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065C64]"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role:
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065C64]"
                        >
                            <option value="owner">Owner</option>
                            <option value="player">Player</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mr-2"
                            required
                        />
                        <label htmlFor="terms" className="text-sm font-medium text-gray-700">
                            I agree to the{' '}
                            <a href="/terms" className="text-blue-500 hover:underline">
                                Terms of Use
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className="text-blue-500 hover:underline">
                                Privacy Policy
                            </a>
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#065C64] text-white py-2 rounded-lg hover:bg-[#044E4F]"
                        disabled={loading}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                {/* Success Modal */}
                {showSuccessPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
                            <p className="font-bold text-lg text-green-700 mb-2">Sign Up Successful!</p>
                            <p className="text-green-600 mb-2">
                                Please check your email to verify your account before signing in.
                            </p>
                            <p className="text-gray-600 text-sm">Redirecting to Sign In...</p>
                            <button
                                onClick={() => setShowSuccessPopup(false)}
                                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                <div className="my-4 flex items-center">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="mx-2 text-sm text-gray-500">OR</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleFacebookSignUp}
                        className="w-1/2 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
                        disabled={loading}
                    >
                        <i className="fab fa-facebook-f"></i> Facebook
                    </button>
                    <button
                        onClick={handleGoogleSignUp}
                        className="w-1/2 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600"
                        disabled={loading}
                    >
                        <i className="fab fa-google"></i> Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
