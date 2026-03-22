import React, { useState } from 'react';
import { Search, ExternalLink, ShieldCheck, ChevronRight, HelpCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

const LokSahayak = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await api.post('/communication/generate/citizen-help', { user_query: query });
            setResult(res.data.message);
        } catch (err) {
            console.error('Helpdesk search failed:', err);
            setError('Unable to fetch advice at this moment. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const quickLinks = [
        { name: 'Aadhaar Card', query: 'Step by step guide to update Aadhaar address official website' },
        { name: 'Cyber Complaint', query: 'How to file a cyber crime complaint in India official portal' },
        { name: 'PAN Card', query: 'Apply for new PAN card or correction official NSDL portal' },
        { name: 'Passport', query: 'Register for new passport official Seva portal' }
    ];

    return (
        <div className="min-h-full bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#1B3A6F]/10 border border-[#1B3A6F]/20 text-[#1B3A6F] text-sm font-bold mb-2">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        AI-Verified Government Guide
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-[#1B3A6F] tracking-tight">
                        Lok<span className="text-[#FF9933]">Sahayak</span>
                    </h1>
                    <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
                        Your one-stop guide for official government services. Get verified links and direct procedures in seconds.
                    </p>
                </div>

                {/* Search Interface */}
                <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200 overflow-hidden transform transition-all">
                    <form onSubmit={handleSearch} className="p-2 sm:p-4 flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="E.g., How can I update my Aadhaar address?"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#1B3A6F] focus:ring-4 focus:ring-[#1B3A6F]/10 outline-none transition-all text-lg text-slate-700"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="bg-[#1B3A6F] hover:bg-[#152e5a] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Get Help'}
                        </button>
                    </form>

                    {/* Quick Shortcuts */}
                    {!result && !loading && (
                        <div className="px-6 pb-6 pt-2 border-t border-slate-50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Suggested Services</p>
                            <div className="flex flex-wrap gap-2">
                                {quickLinks.map((link) => (
                                    <button
                                        key={link.name}
                                        onClick={() => { setQuery(link.query); handleSearch(); }}
                                        className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-50 hover:bg-[#EEF2F7] text-slate-600 font-medium text-sm border border-slate-200 transition-all"
                                    >
                                        {link.name}
                                        <ChevronRight className="w-3 h-3 ml-1.5 opacity-50" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {loading && (
                    <div className="text-center py-12 animate-pulse">
                        <div className="w-16 h-16 bg-[#138808]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HelpCircle className="w-8 h-8 text-[#138808]" />
                        </div>
                        <p className="text-slate-500 font-medium">Consulting official resources...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 shrink-0">
                            <HelpCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/5 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-start justify-between">
                            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-[#138808]/10 text-[#138808] text-xs font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                                Official Sources Identified
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                                {result.split('\n').map((line, i) => {
                                    if (/portal/i.test(line) && !line.toLowerCase().includes('steps') && !line.match(/^\d\./)) {
                                        // Find any markdown link [Name](URL) or raw HTTP link
                                        const mdLinkMatch = line.match(/(?:\[(.*?)\])?\((https?:\/\/[^\s\)]+)\)/) || line.match(/(https?:\/\/[^\s\)]+)/);
                                        let portalUrl = '#';
                                        let portalName = 'Official Portal';
                                        
                                        if (mdLinkMatch) {
                                            portalUrl = mdLinkMatch[2] || mdLinkMatch[1]; // URL is group 2 in md link, group 1 in raw link
                                            
                                            // Extract name: either from markdown [Name], or clean up the line text
                                            if (mdLinkMatch[1] && mdLinkMatch[2]) {
                                                portalName = mdLinkMatch[1].replace(/\*\*/g, '').trim();
                                            } else {
                                                // Raw link fallback: remove the URL and 'Portal' words
                                                portalName = line.replace(portalUrl, '').replace(/[\(\)\[\]\*]/g, '').replace(/portal/ig, '').replace(/[:]/g, '').trim() || 'Official Portal';
                                            }
                                        } else {
                                             // If we didn't find a URL, just render it as raw text
                                             return <p key={i} className="mb-2 font-medium text-slate-700">{line}</p>;
                                        }
                                        
                                        // Fix case where AI puts the URL as the name too
                                        if (portalName.startsWith('http')) {
                                            const cleanedName = line.split(/portal/i)[1]?.replace(/[\(\)\[\]\*:]/g, '').replace(portalUrl, '').trim();
                                            if (cleanedName) portalName = cleanedName;
                                        }

                                        return (
                                            <a key={i} href={portalUrl} target="_blank" rel="noopener noreferrer" className="mb-4 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-100 flex items-center justify-between group transition-colors cursor-pointer block">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mr-4 shadow-lg shadow-blue-500/30 shrink-0">
                                                        <ExternalLink className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Target Resource</p>
                                                        <p className="text-blue-900 font-bold text-lg leading-tight truncate">{portalName || 'Government Portal'}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-6 h-6 text-blue-400 group-hover:translate-x-1 transition-transform shrink-0" />
                                            </a>
                                        );
                                    }
                                    if (line.match(/^\d\./)) {
                                        return (
                                            <div key={i} className="flex items-start mb-4 group">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mr-4 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                                    {line.split('.')[0]}
                                                </div>
                                                <p className="flex-1 text-slate-600 pt-1.5">{line.split('.').slice(1).join('.').trim()}</p>
                                            </div>
                                        );
                                    }
                                    if (/step/i.test(line) && /:/i.test(line) && !/portal/i.test(line)) {
                                        return (
                                            <div key={i} className="flex items-center mt-10 mb-6 border-b border-slate-100 pb-3">
                                                <div className="w-8 h-8 rounded-full bg-[#138808]/10 flex items-center justify-center mr-3">
                                                    <ShieldCheck className="w-4 h-4 text-[#138808]" />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Verified Resolution Steps</h3>
                                            </div>
                                        );
                                    }
                                    return <p key={i} className="mb-2 font-medium text-slate-700">{line}</p>;
                                })}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-slate-400 flex items-center">
                                <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                                Always verify information on official .gov.in domains.
                            </p>
                            <button 
                                onClick={() => { setQuery(''); setResult(null); }}
                                className="text-[#1B3A6F] font-bold text-sm hover:underline"
                            >
                                Start New Search
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Disclaimer */}
                <div className="text-center font-medium text-slate-400 text-xs py-10 max-w-lg mx-auto leading-relaxed italic">
                    LokSahayak is an AI assistant providing easy access to government links. 
                    Please ensure you are on a "gov.in" or "nic.in" website before sharing sensitive details.
                </div>
            </div>
        </div>
    );
};

export default LokSahayak;
