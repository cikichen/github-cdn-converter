"use client";

import { useState, useEffect } from 'react';
import "./page.css";

const CDN_TEMPLATES = [
    'https://cdn.jsdelivr.net/gh/{user}/{repo}@{branch}/{path}',
    'https://rawcdn.githack.com/{user}/{repo}/{commit}/{path}',
    'https://cdn.statically.io/gh/{user}/{repo}/{branch}/{path}',
    'https://mirror.ghproxy.com/raw.githubusercontent.com/{user}/{repo}/{branch}/{path}',
    'https://ghproxy.net/https://raw.githubusercontent.com/{user}/{repo}/{branch}/{path}',
    'https://fastly.jsdelivr.net/gh/{user}/{repo}@{branch}/{path}'
];

const GITHUB_REGEX = /https:\/\/(raw\.githubusercontent|github)\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/;

export default function Home() {
    const [githubLink, setGithubLink] = useState('');
    const [customCDNs, setCustomCDNs] = useState([]);
    const [newCDN, setNewCDN] = useState('');
    const [result, setResult] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const [cdnError, setCDNError] = useState('');
    const [tooltipContent, setTooltipContent] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const savedCDNs = localStorage.getItem('customCDNs');
        if (savedCDNs) {
            setCustomCDNs(JSON.parse(savedCDNs));
        }
    }, []);

    useEffect(() => {
        if (githubLink) {
            generateCDNLinks();
        } else {
            setResult([]);
            setError('');
        }
    }, [githubLink, customCDNs]);

    useEffect(() => {
        if (customCDNs.length > 0) {
            localStorage.setItem('customCDNs', JSON.stringify(customCDNs));
        }
    }, [customCDNs]);

    const validateGithubLink = (link) => GITHUB_REGEX.test(link);

    const generateCDNLinks = () => {
        setLoading(true);

        if (!validateGithubLink(githubLink)) {
            setError('Invalid GitHub link');
            setResult([]);
            setLoading(false);
            return;
        }

        setError('');
        const match = githubLink.match(GITHUB_REGEX);
        const user = match[2];
        const repo = match[3];
        const branch = match[4];
        const path = match[5];

        const cdnTemplates = [...CDN_TEMPLATES, ...customCDNs];
        const results = cdnTemplates.map(template =>
            template.replace('{user}', user).replace('{repo}', repo).replace('{branch}', branch).replace('{path}', path).replace('{commit}', branch)
        );

        setResult(results);
        setLoading(false);
    };

    const addCustomCDN = () => {
        if (newCDN.trim() && !customCDNs.includes(newCDN.trim())) {
            setCustomCDNs([...customCDNs, newCDN.trim()]);
            setNewCDN('');
            setCDNError('');
        } else {
            setCDNError('Custom CDN link already exists or is empty');
        }
    };

    const removeCustomCDN = (index) => {
        const newCDNs = customCDNs.filter((_, i) => i !== index);
        setCustomCDNs(newCDNs);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('Copied to clipboard');
            setTimeout(() => setCopySuccess(''), 2000);
        }, err => {
            console.error('Failed to copy: ', err);
        });
    };

    const handleMouseEnter = (content, event) => {
        if (content.length > 20) { // Adjust the threshold as needed
            setTooltipContent(content);
            setShowTooltip(true);

            // Calculate the tooltip position
            const tooltipWidth = 150; // approximate width of the tooltip
            const tooltipHeight = 40; // approximate height of the tooltip
            const { clientX: x, clientY: y } = event;

            let adjustedX = x;
            let adjustedY = y + 20;

            if (x + tooltipWidth > window.innerWidth) {
                adjustedX = window.innerWidth - tooltipWidth - 10; // 10px padding
            }

            if (y + tooltipHeight > window.innerHeight) {
                adjustedY = y - tooltipHeight - 10; // 10px padding
            }

            setTooltipPosition({ x: adjustedX, y: adjustedY });
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    const renderTooltip = () => (
        showTooltip && (
            <div className="fixed z-10 bg-gray-800 text-white py-1 px-3 rounded-md shadow-md" style={{ top: tooltipPosition.y, left: tooltipPosition.x }}>
                {tooltipContent}
            </div>
        )
    );

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">GitHub Raw Link to CDN Converter</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your GitHub raw link and generate different CDN addresses.
                    </p>
                </div>
                <div className="container mx-auto mb-5">
                    <div className="highlighted-form input-gradient-border relative">
                        <input
                            type="text"
                            className="bg-white focus:outline-none rounded-lg py-3 px-5 block w-full appearance-none leading-normal shadow-lg focus:shadow-xl text-center text-lg"
                            id="github-link"
                            name="githubLink"
                            placeholder="https://raw.githubusercontent.com/:user/:repo/:branch/:file"
                            title="Paste a raw file URL from repository here!"
                            value={githubLink}
                            onChange={(e) => setGithubLink(e.target.value)}
                            onMouseEnter={(e) => handleMouseEnter(githubLink, e)}
                            onMouseLeave={handleMouseLeave}
                        />
                        {renderTooltip()}
                    </div>
                    {error && <p className="mt-2 text-red-500 text-center text-sm">{error}</p>}
                </div>
                <div className="container mx-auto mb-5">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="custom-cdns">Custom CDN Templates</label>
                    <div className="flex mt-2">
                        <input
                            type="text"
                            id="custom-cdns"
                            name="customCDNs"
                            className="bg-white focus:outline-none border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal shadow-lg focus:shadow-xl relative"
                            placeholder="https://yough.com/raw.githubusercontent.com/{user}/{repo}/{branch}/{path}"
                            value={newCDN}
                            onChange={(e) => setNewCDN(e.target.value)}
                            onMouseEnter={(e) => handleMouseEnter(newCDN, e)}
                            onMouseLeave={handleMouseLeave}
                        />
                        {renderTooltip()}
                        <button
                            onClick={addCustomCDN}
                            className="ml-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Add
                        </button>
                    </div>
                    {cdnError && <p className="mt-2 text-red-500 text-center text-sm">{cdnError}</p>}
                </div>
                {customCDNs.length > 0 && (
                    <div className="container mx-auto mb-5">
                        <h3 className="block text-sm font-medium text-gray-700">Current Custom CDN Templates</h3>
                        <div className="space-y-2">
                            {customCDNs.map((cdn, index) => (
                                <div key={index} className="cdn-link flex items-center relative">
                                    <input
                                        type="text"
                                        value={cdn}
                                        readOnly
                                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        onMouseEnter={(e) => handleMouseEnter(cdn, e)}
                                        onMouseLeave={handleMouseLeave}
                                    />
                                    {renderTooltip()}
                                    <button
                                        onClick={() => removeCustomCDN(index)}
                                        className="ml-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="text-center text-gray-500">Generating links...</div>
                ) : (
                    <div className="result mt-4 space-y-2">
                        {result.map((cdnLink, index) => (
                            <div key={index} className="cdn-link flex items-center relative">
                                <input
                                    type="text"
                                    value={cdnLink}
                                    readOnly
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    onMouseEnter={(e) => handleMouseEnter(cdnLink, e)}
                                    onMouseLeave={handleMouseLeave}
                                />
                                {renderTooltip()}
                                <button
                                    onClick={() => copyToClipboard(cdnLink)}
                                    className="ml-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Copy
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {copySuccess && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-md shadow-lg transition-opacity duration-300">
                        {copySuccess}
                    </div>
                )}
            </div>
        </div>
    );
}
