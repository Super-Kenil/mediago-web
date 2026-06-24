import { useEffect } from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Navbar } from './components/Navbar';
import { FileDropzone } from './components/ui/FileDropzone';

type ConversionInfo = {
    from: string;
    to: string;
};

const parseConversionPath = (pathname: string): ConversionInfo | null => {
    const cleanPath = decodeURIComponent(pathname).toLowerCase();
    const match = 
        cleanPath.match(/^\/convert-([a-z0-9]+)-to-([a-z0-9]+)/) ||
        cleanPath.match(/^\/convert\/([a-z0-9]+)-to-([a-z0-9]+)/) ||
        cleanPath.match(/^\/([a-z0-9]+)-to-([a-z0-9]+)/);

    if (match) {
        return {
            from: match[1].toUpperCase(),
            to: match[2].toUpperCase(),
        };
    }
    return null;
};

function SEOManager() {
    const location = useLocation();

    useEffect(() => {
        const info = parseConversionPath(location.pathname);
        let title = 'MediaGo - Free & Private Browser Media Converter';
        let description = 'Seamlessly convert, optimize, and compress your visual assets securely and 100% privately in the browser using WebAssembly. No files ever leave your device.';
        const url = `https://mediago.app${location.pathname}`;

        if (info) {
            title = `Convert ${info.from} to ${info.to} Online - Free & Private | MediaGo`;
            description = `Convert ${info.from} files to ${info.to} format instantly and securely in your browser. MediaGo is 100% private, free, and runs entirely client-side.`;
        }

        document.title = title;

        const updateMeta = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let el = document.querySelector(`meta[${attr}="${name}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, name);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        updateMeta('description', description);
        updateMeta('keywords', info ? `convert ${info.from} to ${info.to}, convert ${info.from}, convert ${info.to}, media converter, private converter` : 'media converter, client-side converter, webassembly converter, secure video converter, secure image converter');
        
        updateMeta('og:title', title, true);
        updateMeta('og:description', description, true);
        updateMeta('og:type', 'website', true);
        updateMeta('og:url', url, true);
        updateMeta('og:image', 'https://mediago.app/og-image.png', true);

        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', title);
        updateMeta('twitter:description', description);
        updateMeta('twitter:image', 'https://mediago.app/og-image.png');

        let canonicalEl = document.querySelector('link[rel="canonical"]');
        if (!canonicalEl) {
            canonicalEl = document.createElement('link');
            canonicalEl.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalEl);
        }
        canonicalEl.setAttribute('href', url);

        let jsonLdEl = document.getElementById('mediago-jsonld');
        if (!jsonLdEl) {
            jsonLdEl = document.createElement('script');
            jsonLdEl.setAttribute('id', 'mediago-jsonld');
            jsonLdEl.setAttribute('type', 'application/ld+json');
            document.head.appendChild(jsonLdEl);
        }

        const jsonLdData = {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': 'MediaGo',
            'url': url,
            'description': description,
            'applicationCategory': 'MultimediaApplication',
            'operatingSystem': 'All',
            'browserRequirements': 'Requires JavaScript and WebAssembly support.',
            'featureList': [
                'Client-side conversion',
                'No file uploads',
                'High performance'
            ],
            'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD'
            }
        };

        jsonLdEl.textContent = JSON.stringify(jsonLdData);
    }, [location.pathname]);

    return null;
}

function Dashboard() {
    const location = useLocation();
    const info = parseConversionPath(location.pathname);

    return (
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-12">
            <div className="flex flex-col items-center justify-center text-center space-y-5">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {info ? `Convert ${info.from} to ${info.to}` : 'Media Management'}
                </h1>
                <p className="max-w-2xl text-lg sm:text-xl text-zinc-600 dark:text-zinc-400">
                    {info 
                        ? `Convert ${info.from} format files directly to ${info.to} in the browser securely and privately.` 
                        : 'Seamlessly convert, optimize, and compress your visual assets securely in the browser.'}
                </p>
            </div>
            <div className="w-full flex flex-col items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 sm:p-14 shadow-sm hover:shadow-md transition-shadow duration-300">
                <FileDropzone />
            </div>
        </main>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans flex flex-col transition-colors duration-300 text-zinc-900 dark:text-zinc-50">
                <Navbar />
                <SEOManager />
                <Routes>
                    <Route path="*" element={<Dashboard />} />
                </Routes>
            </div>
        </ThemeProvider>
    );
}
