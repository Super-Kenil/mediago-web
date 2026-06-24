import React, { useState } from 'react';
import { 
    FiMenu, 
    FiX, 
    FiBookOpen, 
    FiSettings, 
    FiZap, 
    FiSliders, 
    FiLayers, 
    FiCheckCircle 
} from 'react-icons/fi';

type SectionType = {
    id: string;
    title: string;
    icon: React.ReactNode;
};

export default function Docs() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sections: SectionType[] = [
        { id: 'introduction', title: 'Introduction', icon: <FiBookOpen className="w-5 h-5" /> },
        { id: 'how-to-use', title: 'How to Use', icon: <FiSettings className="w-5 h-5" /> },
        { id: 'format-mapping', title: 'Format Mapping', icon: <FiZap className="w-5 h-5" /> },
        { id: 'quality-control', title: 'Quality Control', icon: <FiSliders className="w-5 h-5" /> },
        { id: 'batch-processing', title: 'Batch Processing', icon: <FiLayers className="w-5 h-5" /> },
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setSidebarOpen(false);
        }
    };

    return (
        <div className="flex-1 flex max-w-7xl w-full mx-auto relative lg:overflow-hidden">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <aside
                className={`fixed lg:sticky top-0 lg:top-[64px] h-full lg:h-[calc(100vh-64px)] w-72 bg-white dark:bg-zinc-950/50 border-r border-zinc-200 dark:border-zinc-800 z-50 transform transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8 lg:hidden">
                        <span className="text-xl font-bold">Documentation</span>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="space-y-2">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className="flex items-center gap-3 w-full p-3 text-left rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all font-medium"
                            >
                                <span className="text-blue-600 dark:text-blue-500">{section.icon}</span>
                                <span className="text-sm">{section.title}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-12 overflow-y-auto lg:h-[calc(100vh-64px)]">
                <div className="lg:hidden mb-8 flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <FiMenu className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">Documentation</h1>
                </div>

                <div className="max-w-3xl space-y-20 pb-20 mx-auto text-left">
                    <section id="introduction" className="scroll-mt-32 space-y-6">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">Introduction</h1>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Welcome to the MediaGo documentation. MediaGo is an entirely browser-based, serverless media management tool that utilizes client-side FFmpeg WebAssembly to process, convert, and compress files directly on your device.
                            </p>
                        </div>
                        <div className="p-6 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2">
                                <FiBookOpen className="w-5 h-5" />
                                Core Capabilities
                            </h3>
                            <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                                <li className="flex gap-3">
                                    <FiCheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <span><strong>Privacy First:</strong> No files are uploaded to any server. All processing runs locally inside your browser sandbox.</span>
                                </li>
                                <li className="flex gap-3">
                                    <FiCheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <span><strong>Batch Downloads:</strong> Package your converted files into a single `.zip` file for quick downloading.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section id="how-to-use" className="scroll-mt-32 space-y-6">
                        <h2 className="text-3xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-4">How to Use Static MediaGo</h2>
                        <ol className="pl-0 space-y-4 text-zinc-700 dark:text-zinc-300">
                            <li className="flex gap-4 p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-sm font-bold text-zinc-900 dark:text-white">1</span>
                                <span className="mt-1">Drag and drop files into the Studio Upload box or click to browse.</span>
                            </li>
                            <li className="flex gap-4 p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-sm font-bold text-zinc-900 dark:text-white">2</span>
                                <span className="mt-1">Configure individual or batch options including quality compression and resizing.</span>
                            </li>
                            <li className="flex gap-4 p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-sm font-bold text-zinc-900 dark:text-white">3</span>
                                <span className="mt-1">Select the target format to run the client-side WebAssembly pipeline.</span>
                            </li>
                        </ol>
                    </section>

                    <section id="format-mapping" className="scroll-mt-32 space-y-6">
                        <h2 className="text-3xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-4">Format Mapping</h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            MediaGo uses FFmpeg WASM to map input files to optimized targets.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6 mt-6">
                            <div className="p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-4">
                                    <FiBookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-zinc-900 dark:text-white">Images</h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                                    JPG, JPEG, PNG, WEBP, SVG, and HEIC files can be resized and encoded into WebP, PNG, or JPEG formats.
                                </p>
                            </div>
                            <div className="p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-4">
                                    <FiZap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-zinc-900 dark:text-white">Videos & Audio</h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                                    Convert MP4, WEBM, MOV, and AVI files to animated GIFs or WebM. Extract high-quality MP3 audio tracks directly.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="quality-control" className="scroll-mt-32 space-y-6">
                        <h2 className="text-3xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-4">Quality Control</h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            Adjust compression parameters to optimize output size versus visual fidelity.
                        </p>
                        <div className="space-y-4 mt-6">
                            <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/30 flex gap-5 items-start">
                                <div className="mt-1 flex-shrink-0 w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                                <div>
                                    <strong className="block text-lg mb-1 text-zinc-900 dark:text-white">0% - 30% <span className="text-sm font-normal text-zinc-500 ml-2">(Aggressive)</span></strong>
                                    <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">Significant reduction in size. Suitable for draft assets and thumbnails.</span>
                                </div>
                            </div>
                            <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/30 flex gap-5 items-start">
                                <div className="mt-1 flex-shrink-0 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                <div>
                                    <strong className="block text-lg mb-1 text-zinc-900 dark:text-white">40% - 80% <span className="text-sm font-normal text-zinc-500 ml-2">(Balanced)</span></strong>
                                    <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">Recommended sweet spot. Optimizes size with near-invisible quality loss.</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="batch-processing" className="scroll-mt-32 space-y-6">
                        <h2 className="text-3xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-4">Batch Processing</h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            Upload multiple files simultaneously. MediaGo queues conversions sequentially to prevent browser crashes and preserve resources.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
