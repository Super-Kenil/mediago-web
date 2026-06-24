import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useFFmpeg, type ImageOptions, type VideoOptions } from '../../hooks/useFFmpeg';
import JSZip from 'jszip';
import { 
    FiImage, 
    FiRefreshCw, 
    FiLayers, 
    FiTrash2, 
    FiCheckCircle, 
    FiUploadCloud, 
    FiDownload 
} from 'react-icons/fi';

type CustomSelectProps = {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    hasError?: boolean;
};

function CustomSelect({
    label,
    value,
    onChange,
    options,
    placeholder,
    hasError,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="flex flex-col relative w-full" ref={containerRef}>
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between text-sm font-bold px-4 py-3.5 rounded-xl border focus:ring-2 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 cursor-pointer outline-none transition-all ${hasError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-300 dark:border-zinc-600 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
            >
                <span className={selectedOption ? '' : 'text-zinc-400 dark:text-zinc-500 font-medium'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg className={`w-4 h-4 transition-transform duration-200 text-zinc-400 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 z-[9999] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden py-1">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-zinc-500 text-center font-medium">No options available</div>
                    ) : (
                        options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${value === opt.value ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'}`}
                            >
                                {opt.label}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export function FileDropzone() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isConverting, setIsConverting] = useState(false);
    const [isBatchConverting, setIsBatchConverting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string>('image');
    const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentFile: string } | null>(null);
    const [convertedHistory, setConvertedHistory] = useState<{ name: string, blob: Blob }[]>([]);

    const [quality, setQuality] = useState<number>(80);
    const [resizeWidth, setResizeWidth] = useState<string>('original');
    const [fps, setFps] = useState<number>(10);
    const [scaleWidth, setScaleWidth] = useState<string>('320');

    const { 
        isLoaded, 
        isLoading: isFfmpegLoading, 
        convertImage, 
        convertWebpToGif, 
        convertVideoToGif, 
        convertVideoToWebm,
        convertGifToVideo,
        extractAudioFromVideo,
        convertSvgToPng 
    } = useFFmpeg();

    const getAvailableFormats = (fileExtension: string) => {
        const ext = fileExtension.toLowerCase();
        const images = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
        const videos = ['.mp4', '.avi', '.mov', '.webm'];
        if (images.includes(ext)) return ['webp', 'png', 'jpeg', 'gif'];
        if (ext === '.svg') return ['png', 'webp'];
        if (ext === '.gif') return ['mp4', 'webm', 'png', 'jpeg'];
        if (videos.includes(ext)) return ['gif', 'webm', 'mp3'];
        return [];
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileList = Array.from(e.target.files);
            if (fileList.length === 1) {
                setFile(fileList[0]);
                setFiles([]);
            } else {
                setFile(null);
                setFiles(fileList);
            }
            setPreviewUrl(null);
        }
    }, []);

    const onDropMultiple = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const fileList = Array.from(e.dataTransfer.files);
            if (fileList.length === 1) {
                setFile(fileList[0]);
                setFiles([]);
            } else {
                setFile(null);
                setFiles(fileList);
            }
            setPreviewUrl(null);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleConvert = async (type: 'png' | 'webp' | 'jpeg' | 'gif' | 'mp4' | 'webm' | 'mp3') => {
        if (!file || isConverting || !isLoaded) return;

        setIsConverting(true);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        try {
            let resultBlob: Blob | null = null;
            const inputExt = `.${file.name.toLowerCase().split('.').pop()}`;

            const imageOpts: ImageOptions = {};
            if (quality) imageOpts.quality = quality;
            if (resizeWidth !== 'original') imageOpts.resizeWidth = Number(resizeWidth);

            const videoOpts: VideoOptions = {};
            if (quality) videoOpts.quality = quality;
            if (fps) videoOpts.fps = fps;
            if (scaleWidth !== 'original') videoOpts.scaleWidth = Number(scaleWidth);

            if (inputExt === '.svg') {
                if (type === 'png') {
                    resultBlob = await convertSvgToPng(file, imageOpts);
                } else if (type === 'webp') {
                    const pngBlob = await convertSvgToPng(file, imageOpts);
                    const pngFile = new File([pngBlob], 'temp.png', { type: 'image/png' });
                    resultBlob = await convertImage(pngFile, 'webp', imageOpts);
                }
            } else if (type === 'mp3') {
                resultBlob = await extractAudioFromVideo(file);
            } else if (type === 'webm') {
                resultBlob = await convertVideoToWebm(file, videoOpts);
            } else if (type === 'mp4') {
                resultBlob = await convertGifToVideo(file, videoOpts);
            } else if (type === 'gif') {
                if (file.type.includes('video') || inputExt === '.mov' || inputExt === '.avi') {
                    resultBlob = await convertVideoToGif(file, videoOpts);
                } else if (file.type === 'image/webp' || inputExt === '.webp') {
                    resultBlob = await convertWebpToGif(file, videoOpts);
                } else {
                    resultBlob = await convertImage(file, 'webp', imageOpts);
                    const tempFile = new File([resultBlob], 'temp.webp', { type: 'image/webp' });
                    resultBlob = await convertWebpToGif(tempFile, videoOpts);
                }
            } else if (type === 'png' || type === 'webp' || type === 'jpeg') {
                if (inputExt === '.gif') {
                    resultBlob = await convertImage(file, type, imageOpts);
                } else {
                    resultBlob = await convertImage(file, type, imageOpts);
                }
            }

            if (resultBlob) {
                const url = URL.createObjectURL(resultBlob);
                setPreviewUrl(url);
                setPreviewType(type === 'mp4' || type === 'webm' ? 'video' : type === 'mp3' ? 'audio' : 'image');
                
                const finalExt = type === 'jpeg' ? 'jpg' : type;
                setConvertedHistory(prev => [...prev, { 
                    name: `converted_${file.name.split('.')[0]}.${finalExt}`, 
                    blob: resultBlob! 
                }]);
            }
        } catch (error) {
            console.error(error);
            alert("Conversion failed.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleBatchConvert = async (type: 'png' | 'webp' | 'jpeg') => {
        if (files.length === 0 || !isLoaded || isBatchConverting) return;

        setIsBatchConverting(true);
        setBatchProgress({ current: 0, total: files.length, currentFile: '' });

        const imageOpts: ImageOptions = {};
        if (quality) imageOpts.quality = quality;
        if (resizeWidth !== 'original') imageOpts.resizeWidth = Number(resizeWidth);

        try {
            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                setBatchProgress({ current: i + 1, total: files.length, currentFile: f.name });

                const inputExt = `.${f.name.toLowerCase().split('.').pop()}`;
                let resultBlob: Blob | null = null;

                try {
                    if (inputExt === '.svg') {
                        if (type === 'png') {
                            resultBlob = await convertSvgToPng(f, imageOpts);
                        } else if (type === 'webp') {
                            const pngBlob = await convertSvgToPng(f, imageOpts);
                            const pngFile = new File([pngBlob], 'temp.png', { type: 'image/png' });
                            resultBlob = await convertImage(pngFile, 'webp', imageOpts);
                        }
                    } else {
                        resultBlob = await convertImage(f, type, imageOpts);
                    }

                    if (resultBlob) {
                        const finalExt = type === 'jpeg' ? 'jpg' : type;
                        setConvertedHistory(prev => [...prev, { 
                            name: `converted_${f.name.split('.')[0]}.${finalExt}`, 
                            blob: resultBlob! 
                        }]);
                    }
                } catch (fileError) {
                    console.error(fileError);
                }
            }
        } catch (error) {
            console.error(error);
            alert("Batch conversion finished with some warnings.");
        } finally {
            setIsBatchConverting(false);
            setBatchProgress(null);
        }
    };

    const handleDownloadZip = async () => {
        if (convertedHistory.length === 0) return;
        const zip = new JSZip();

        convertedHistory.forEach((item) => {
            zip.file(item.name, item.blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Converted_Media.zip';
        a.click();
        URL.revokeObjectURL(url);
    };

    const isVideoOrGifInput = file && (
        file.type.includes('video') || 
        file.name.toLowerCase().endsWith('.gif') || 
        file.name.toLowerCase().endsWith('.webp') ||
        file.name.toLowerCase().endsWith('.mp4') || 
        file.name.toLowerCase().endsWith('.webm') || 
        file.name.toLowerCase().endsWith('.mov') || 
        file.name.toLowerCase().endsWith('.avi')
    );

    const isImageInput = file && (
        file.type.includes('image') || 
        file.name.toLowerCase().endsWith('.heic') || 
        file.name.toLowerCase().endsWith('.heif') ||
        file.name.toLowerCase().endsWith('.svg') ||
        file.name.toLowerCase().endsWith('.jpg') ||
        file.name.toLowerCase().endsWith('.jpeg') ||
        file.name.toLowerCase().endsWith('.png')
    );

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-12">
            {!isLoaded && isFfmpegLoading && (
                <div className="flex items-center justify-center p-5 bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-2xl backdrop-blur-lg border border-indigo-100 dark:border-indigo-500/20 shadow-lg shadow-indigo-500/5 animate-pulse">
                    <FiRefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold tracking-wide text-sm uppercase">Booting Media Engine...</span>
                </div>
            )}

            <section className="relative flex flex-col items-center w-full">
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDropMultiple}
                    className={`relative group flex flex-col items-center justify-center w-full h-80 rounded-[2.5rem] transition-all duration-300 ease-out cursor-pointer overflow-hidden backdrop-blur-xl border-dashed border-2 ${isDragging
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/20 scale-[1.02] shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white/40 dark:bg-zinc-900/40 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10'
                        }`}
                >
                    <input
                        type="file"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={onChange}
                        disabled={isConverting || isBatchConverting}
                    />

                    <div className="flex flex-col items-center justify-center space-y-6 p-6 text-center z-0 relative pointer-events-none">
                        <div className={`p-6 rounded-3xl transition-transform duration-500 ${isDragging
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-110 shadow-lg shadow-indigo-500/30'
                            : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shadow-xl shadow-black/5 group-hover:-translate-y-2 group-hover:scale-105 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                            }`}>
                            <FiUploadCloud className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                                <span className="text-indigo-600 dark:text-indigo-400">Click to browse</span> or drag & drop
                            </h3>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                MP4, WEBP, PNG, JPG, SVG, GIF, HEIC supported natively
                            </p>
                        </div>
                    </div>
                </div>

                {file && (
                    <div className="w-full mt-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 transition-all">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center space-x-4 overflow-hidden">
                                <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white shrink-0">
                                    <FiImage className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="text-base font-bold text-zinc-900 dark:text-white truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for processing
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setPreviewUrl(null);
                                }}
                                disabled={isConverting}
                                className="p-3 rounded-2xl text-zinc-400 bg-zinc-50 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all disabled:opacity-50"
                                title="Remove file"
                            >
                                <FiTrash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
                            <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800">
                                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Conversion Controls</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {isImageInput && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex justify-between">
                                                    Image Quality <span>{quality}%</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    min="5"
                                                    max="100"
                                                    value={quality}
                                                    onChange={(e) => setQuality(Number(e.target.value))}
                                                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <CustomSelect
                                                    label="Resize (Width)"
                                                    value={resizeWidth}
                                                    onChange={setResizeWidth}
                                                    placeholder="Original Width"
                                                    options={[
                                                        { value: 'original', label: 'Original size' },
                                                        { value: '1920', label: 'Full HD (1920px)' },
                                                        { value: '1280', label: 'HD (1280px)' },
                                                        { value: '800', label: 'Medium (800px)' },
                                                        { value: '640', label: 'Mobile (640px)' },
                                                        { value: '320', label: 'Thumbnail (320px)' }
                                                    ]}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {isVideoOrGifInput && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex justify-between">
                                                    Frame Rate (FPS) <span>{fps} fps</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    min="5"
                                                    max="30"
                                                    value={fps}
                                                    onChange={(e) => setFps(Number(e.target.value))}
                                                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <CustomSelect
                                                    label="Output Scale Width"
                                                    value={scaleWidth}
                                                    onChange={setScaleWidth}
                                                    placeholder="Default"
                                                    options={[
                                                        { value: 'original', label: 'Original' },
                                                        { value: '1080', label: '1080px' },
                                                        { value: '720', label: '720px' },
                                                        { value: '480', label: '480px' },
                                                        { value: '320', label: '320px' },
                                                        { value: '240', label: '240px' }
                                                    ]}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Export Target</h4>
                                <div className="flex flex-wrap gap-3">
                                    {getAvailableFormats(`.${file.name.split('.').pop()}`).map((format) => (
                                        <button
                                            key={format}
                                            onClick={() => handleConvert(format as any)}
                                            disabled={!isLoaded || isConverting}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-sm hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed ${format === 'gif'
                                                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:shadow-purple-500/20 dark:bg-purple-500/20 dark:text-purple-300 dark:hover:bg-purple-500/30'
                                                : format === 'png'
                                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30'
                                                    : format === 'mp4' || format === 'webm'
                                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:shadow-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300 dark:hover:bg-amber-500/30'
                                                        : format === 'mp3'
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-red-500/20 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30'
                                                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:shadow-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30'
                                                }`}
                                        >
                                            {format.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {isConverting && (
                            <div className="mt-5 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center space-x-3 border border-zinc-100 dark:border-zinc-800">
                                <FiRefreshCw className="animate-spin h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                                    Rendering pixels locally...
                                </span>
                            </div>
                        )}

                        {previewUrl && !isConverting && (
                            <div className="mt-6 flex flex-col items-center bg-zinc-50 dark:bg-zinc-800/30 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 self-start mb-4 flex items-center">
                                    <FiCheckCircle className="w-5 h-5 mr-2" />
                                    Conversion Completed!
                                </p>
                                <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-200/50 dark:bg-black/40 flex justify-center p-6 shadow-inner">
                                    {previewType === 'video' ? (
                                        <video src={previewUrl} controls className="max-h-64 object-contain rounded-lg" />
                                    ) : previewType === 'audio' ? (
                                        <audio src={previewUrl} controls className="w-full max-w-md my-4" />
                                    ) : (
                                        <img src={previewUrl} alt="Converted output" className="max-h-64 object-contain drop-shadow-2xl rounded-lg" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {files.length > 0 && (
                    <div className="w-full mt-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 transition-all">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center space-x-4">
                                <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white shrink-0">
                                    <FiLayers className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-base font-bold text-zinc-900 dark:text-white">
                                        {files.length} files selected
                                    </p>
                                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Ready for batch processing
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setFiles([]);
                                    setFile(null);
                                }}
                                disabled={isBatchConverting}
                                className="p-3 rounded-2xl text-zinc-400 bg-zinc-50 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all disabled:opacity-50"
                                title="Clear all"
                            >
                                <FiTrash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4 max-h-40 overflow-y-auto space-y-2 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                            {files.slice(0, 5).map((f, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="truncate text-zinc-700 dark:text-zinc-300 max-w-[70%]">{f.name}</span>
                                    <span className="text-zinc-400 dark:text-zinc-500">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                            ))}
                            {files.length > 5 && (
                                <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                                    +{files.length - 5} more files
                                </div>
                            )}
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800 mb-6">
                            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Batch Controls</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex justify-between">
                                        Batch Quality <span>{quality}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="5"
                                        max="100"
                                        value={quality}
                                        onChange={(e) => setQuality(Number(e.target.value))}
                                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <CustomSelect
                                        label="Resize (Width)"
                                        value={resizeWidth}
                                        onChange={setResizeWidth}
                                        placeholder="Original Width"
                                        options={[
                                            { value: 'original', label: 'Original size' },
                                            { value: '1920', label: 'Full HD (1920px)' },
                                            { value: '1280', label: 'HD (1280px)' },
                                            { value: '800', label: 'Medium (800px)' },
                                            { value: '640', label: 'Mobile (640px)' },
                                            { value: '320', label: 'Thumbnail (320px)' }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Convert All To</h4>
                            <div className="flex flex-wrap gap-3">
                                {['png', 'webp', 'jpeg'].map((format) => (
                                    <button
                                        key={format}
                                        onClick={() => handleBatchConvert(format as any)}
                                        disabled={!isLoaded || isBatchConverting}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-sm hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed ${format === 'png'
                                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30'
                                            : format === 'webp'
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:shadow-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30'
                                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200 hover:shadow-orange-500/20 dark:bg-orange-500/20 dark:text-orange-300 dark:hover:bg-orange-500/30'
                                            }`}
                                    >
                                        {format.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isBatchConverting && batchProgress && (
                            <div className="mt-5 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                        Converting {batchProgress.current} of {batchProgress.total}
                                    </span>
                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                        {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-indigo-200 dark:bg-indigo-500/30 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300"
                                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 truncate">
                                    {batchProgress.currentFile}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {convertedHistory.length > 0 && (
                    <div className="w-full mt-6 flex flex-col sm:flex-row items-center justify-between p-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl shadow-xl shadow-emerald-500/20">
                        <div className="flex items-center text-white mb-4 sm:mb-0">
                            <div className="p-2.5 bg-white/20 rounded-xl mr-4 backdrop-blur-sm">
                                <FiDownload className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg leading-tight">Batch Archive Ready</h4>
                                <span className="text-sm font-medium text-emerald-100">{convertedHistory.length} files successfully converted</span>
                            </div>
                        </div>
                        <button
                            onClick={handleDownloadZip}
                            className="w-full sm:w-auto px-6 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-2xl text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shrink-0"
                        >
                            Download All (ZIP)
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
