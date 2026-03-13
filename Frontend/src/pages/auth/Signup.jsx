import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Briefcase, BarChart3, AlertCircle } from 'lucide-react';

const Signup = () => {
    const [role, setRole] = useState('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Additional generic fields assuming mock/demo cities/wards since no endpoints to fetch them were specified
    const [cityId, setCityId] = useState(1);
    const [wardId, setWardId] = useState(1);
    const [civicBodyId, setCivicBodyId] = useState(1);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { signup } = useAuth();
    const navigate = useNavigate();

    const roleConfig = {
        'user': { endpoint: '/auth/user/register', icon: <User className="w-5 h-5"/>, label: "Citizen" },
        'ward_staff': { endpoint: '/auth/ward/register', icon: <Briefcase className="w-5 h-5"/>, label: "Ward Staff" },
        'admin': { endpoint: '/auth/admin/register', icon: <BarChart3 className="w-5 h-5"/>, label: "Admin" }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        let data = { password };
        if (role === 'user') {
            data.email = email;
        } else {
            data.gov_email = email;
            data.city_id = cityId;
            if (role === 'ward_staff') {
                data.ward_id = wardId;
                data.civic_body_id = civicBodyId;
            }
        }

        const endpoint = roleConfig[role].endpoint;
        const result = await signup(endpoint, data);

        if (result.success) {
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex-1 bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 -right-48 w-96 h-96 bg-emerald-600 rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-blob"></div>

            <div className="w-full max-w-md space-y-8 z-10 relative">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-black text-white tracking-tight">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Join LokaYuktai to improve your city
                    </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-md px-8 py-10 shadow-2xl rounded-3xl border border-white/10">
                    
                    <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl mb-8">
                        {Object.entries(roleConfig).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setRole(key)}
                                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm font-medium rounded-lg transition-all ${
                                    role === key 
                                    ? 'bg-emerald-500 text-white shadow-md' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                            >
                                {config.icon}
                                <span className="hidden sm:inline">{config.label}</span>
                            </button>
                        ))}
                    </div>

                    <form className="space-y-4" onSubmit={handleSignup}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <span className="text-sm text-red-200">{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                <span className="text-sm text-emerald-200 font-medium">{success}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                {role === 'user' ? 'Email Address' : 'Gov Email (.gov.in)'}
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="text-white bg-slate-950/50 appearance-none relative block w-full px-4 py-3 border border-white/10 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="text-white bg-slate-950/50 appearance-none relative block w-full px-4 py-3 border border-white/10 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            />
                        </div>

                        {/* Additional fields for specific roles */}
                        {(role === 'admin' || role === 'ward_staff') && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">City ID (Demo: 1 for Mumbai)</label>
                                <input
                                    type="number"
                                    required
                                    value={cityId}
                                    onChange={(e) => setCityId(Number(e.target.value))}
                                    className="text-white bg-slate-950/50 appearance-none relative block w-full px-4 py-3 border border-white/10 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                />
                            </div>
                        )}

                        {role === 'ward_staff' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Ward ID (Demo: 1 for Delhi Test Polygon)</label>
                                    <input
                                        type="number"
                                        required
                                        value={wardId}
                                        onChange={(e) => setWardId(Number(e.target.value))}
                                        className="text-white bg-slate-950/50 appearance-none relative block w-full px-4 py-3 border border-white/10 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Civic Body/Dept ID (1=PWD, 2=Water...)</label>
                                    <input
                                        type="number"
                                        required
                                        value={civicBodyId}
                                        onChange={(e) => setCivicBodyId(Number(e.target.value))}
                                        className="text-white bg-slate-950/50 appearance-none relative block w-full px-4 py-3 border border-white/10 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                            </>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Registering...' : 'Complete Registration'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-sm text-slate-400">Already have an account? </span>
                        <Link to="/login" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                            Sign in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
