import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, ShieldQuestion, ShieldX, Clock, ExternalLink } from 'lucide-react';
import api from '../utils/api';

const NewsVerification = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [manualQuery, setManualQuery] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [manualResult, setManualResult] = useState(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const res = await api.get('/news');
            setNews(res.data);
        } catch (err) {
            console.error("Failed to fetch news:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        if (!manualQuery.trim()) return;

        setVerifying(true);
        setManualResult(null);
        try {
            const isUrl = manualQuery.startsWith('http');
            const payload = isUrl ? { url: manualQuery } : { text: manualQuery };
            
            const res = await api.post('/news/verify', payload);
            setManualResult(res.data.verification);
            
            // Refresh feed to show custom submission
            fetchNews();
        } catch (err) {
            console.error("Manual verification failed", err);
            alert("Verification failed. Please try again later.");
        } finally {
            setVerifying(false);
        }
    };

    const VerificationBadge = ({ verdict, confidence }) => {
        let style = 'bg-slate-800 text-slate-400 border-slate-700';
        let icon = <ShieldQuestion className="w-4 h-4 mr-1.5" />;
        
        if (verdict === 'Verified') {
            style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            icon = <CheckCircle className="w-4 h-4 mr-1.5" />;
        } else if (verdict === 'Misleading') {
            style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            icon = <ShieldAlert className="w-4 h-4 mr-1.5" />;
        } else if (verdict === 'Fake') {
            style = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
            icon = <ShieldX className="w-4 h-4 mr-1.5" />;
        }

        return (
            <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold tracking-wider uppercase flex items-center ${style}`}>
                {icon}
                {verdict} • {Math.round(confidence * 100)}% Match
            </div>
        );
    };

    const NewsCard = ({ item }) => (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 border border-white/5 shadow-sm space-y-3 hover:border-indigo-500/30 transition">
            <div className="flex justify-between items-start">
                <VerificationBadge verdict={item.verdict} confidence={item.confidence} />
                <span className="text-xs text-slate-500 flex items-center bg-slate-800/50 px-2 py-1 rounded">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
            
            <h3 className="text-slate-100 font-bold leading-tight pt-1">
                {item.title}
            </h3>
            
            <p className="text-sm text-slate-400 line-clamp-2">
                {item.description}
            </p>

            {item.explanation && (
                <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-3 text-sm text-indigo-300/80 italic">
                    <span className="font-semibold text-slate-500 not-italic mr-1 text-xs uppercase">AI REASONING:</span> 
                    {item.explanation}
                </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-xs font-semibold text-indigo-400">{item.source}</span>
                {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition">
                        Read Source <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-indigo-900/40 to-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-indigo-500/20 shadow-lg mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Verified Public News Portal</h1>
                    <p className="text-indigo-200/70 mt-1.5 font-medium">AI-powered fact verification for Indian demographics</p>
                </div>
                <div className="mt-4 md:mt-0 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-300 font-semibold text-sm flex items-center shadow-inner">
                    <ShieldAlert className="w-5 h-5 mr-2 text-indigo-400" />
                    Fighting Misinformation
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Validation Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-xl sticky top-24">
                        <h2 className="text-lg font-bold text-white flex items-center mb-1">
                            Verify Any News
                        </h2>
                        <p className="text-xs text-slate-400 mb-5">Paste a URL or news snippet below to check its credibility.</p>
                        
                        <form onSubmit={handleVerifySubmit} className="space-y-4">
                            <textarea
                                value={manualQuery}
                                onChange={(e) => setManualQuery(e.target.value)}
                                placeholder="E.g., https://timesofindia.com/article... or 'Scientists discover new cure...'"
                                className="w-full h-32 bg-slate-950 border border-slate-700/50 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition resize-none"
                            ></textarea>
                            
                            <button
                                type="submit"
                                disabled={verifying || !manualQuery.trim()}
                                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center transition shadow-lg ${verifying || !manualQuery.trim() ? 'bg-indigo-900/50 text-indigo-300/50 cursor-not-allowed border border-indigo-500/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}`}
                            >
                                {verifying ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Analyzing Sources...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5 mr-2" />
                                        Verify News Fact
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Recent Verification Result */}
                        {manualResult && (
                            <div className="mt-6 pt-6 border-t border-white/5 animate-fadeIn">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Verification Result</h3>
                                <NewsCard item={manualResult} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Feed List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-lg font-bold text-white flex items-center">
                            Live News Feed 
                            <span className="flex h-2 w-2 ml-3">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                        </h2>
                        <span className="text-xs text-slate-400 font-medium bg-slate-900 px-3 py-1 rounded-full border border-white/5">Auto-updates every 15m</span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-48 bg-slate-900/40 animate-pulse rounded-xl border border-white/5"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {news.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-slate-500">
                                    No news items have been processed yet.
                                </div>
                            ) : (
                                news.map(item => (
                                    <NewsCard key={item.id} item={item} />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsVerification;
