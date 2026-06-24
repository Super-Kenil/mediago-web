import { useState, useRef, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export type ImageOptions = {
    quality?: number;
    resizeWidth?: number;
};

export type VideoOptions = {
    quality?: number;
    fps?: number;
    scaleWidth?: number;
};

export function useFFmpeg() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    const load = useCallback(async () => {
        if (ffmpegRef.current) return;
        setIsLoading(true);
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });

        try {
            const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setIsLoaded(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const safeDeleteFile = async (ffmpeg: FFmpeg, fileName: string) => {
        try {
            await ffmpeg.deleteFile(fileName);
        } catch {
          
        }
    };

    const buildSafeBaseName = (rawName: string) => {
        const sanitized = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).slice(2, 8);
        return `${timestamp}_${random}_${sanitized}`;
    };

    const runFfmpegAndRead = async (ffmpeg: FFmpeg, args: string[], outputName: string) => {
        const exitCode = await ffmpeg.exec(args);
        if (exitCode !== 0) {
            throw new Error(`FFmpeg failed with exit code ${exitCode}`);
        }
        return ffmpeg.readFile(outputName);
    };

    const convertSvgToPng = async (file: File, options?: ImageOptions): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Canvas context not available'));
                        return;
                    }
                    let w = img.width;
                    let h = img.height;
                    if (options?.resizeWidth) {
                        const ratio = options.resizeWidth / w;
                        w = options.resizeWidth;
                        h = h * ratio;
                    }
                    canvas.width = w;
                    canvas.height = h;
                    ctx.drawImage(img, 0, 0, w, h);
                    const quality = options?.quality !== undefined ? options.quality / 100 : 0.92;
                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Canvas to blob conversion failed'));
                        },
                        'image/png',
                        quality
                    );
                };
                img.onerror = () => reject(new Error('Failed to load SVG image'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Failed to read SVG file'));
            reader.readAsDataURL(file);
        });
    };

    const convertHeicWithBrowserDecoder = async (file: File, toFormat: 'png' | 'jpeg' | 'webp', options?: ImageOptions): Promise<Blob> => {
        const heic2anyModule = await import('heic2any');
        const heic2any = heic2anyModule.default;

        const directType = toFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
        const quality = options?.quality !== undefined ? options.quality / 100 : 0.95;
        const decoded = await heic2any({
            blob: file,
            toType: directType,
            quality: quality,
        });

        const normalized = Array.isArray(decoded) ? decoded[0] : decoded;
        if (!(normalized instanceof Blob)) {
            throw new Error('Failed to decode HEIC file');
        }

        if (toFormat !== 'webp') {
            return normalized;
        }

        const ffmpeg = ffmpegRef.current;
        if (!ffmpeg || !isLoaded) throw new Error("FFmpeg is not loaded");

        const baseName = buildSafeBaseName(file.name);
        const decodedInputName = `decoded_${baseName}.png`;
        const outputName = `output_${baseName}.webp`;

        try {
            await safeDeleteFile(ffmpeg, decodedInputName);
            await safeDeleteFile(ffmpeg, outputName);
            await ffmpeg.writeFile(decodedInputName, await fetchFile(normalized));
            
            const args = ['-i', decodedInputName];
            if (options?.quality !== undefined) {
                args.push('-q:v', String(options.quality));
            }
            if (options?.resizeWidth) {
                args.push('-vf', `scale=${options.resizeWidth}:-1`);
            }
            args.push(outputName);

            const data = await runFfmpegAndRead(ffmpeg, args, outputName);
            return new Blob([data as BlobPart], { type: 'image/webp' });
        } finally {
            await safeDeleteFile(ffmpeg, decodedInputName);
            await safeDeleteFile(ffmpeg, outputName);
        }
    };

    const convertImage = async (file: File, toFormat: 'png' | 'jpeg' | 'webp', options?: ImageOptions): Promise<Blob> => {
        const ffmpeg = ffmpegRef.current;
        if (!ffmpeg || !isLoaded) throw new Error("FFmpeg is not loaded");

        const inputExt = file.name.toLowerCase().split('.').pop();
        const isHeic = inputExt === 'heic' || inputExt === 'heif';
        if (isHeic) {
            return convertHeicWithBrowserDecoder(file, toFormat, options);
        }

        const baseName = buildSafeBaseName(file.name);
        const inputName = `input_${baseName}`;
        const outputName = `output_${baseName}.${toFormat}`;

        try {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, outputName);
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            const args = ['-i', inputName];
            if (toFormat === 'webp' && options?.quality !== undefined) {
                args.push('-q:v', String(options.quality));
            } else if (toFormat === 'jpeg' && options?.quality !== undefined) {
                const qscale = Math.max(1, Math.min(31, Math.floor(31 - (options.quality * 30 / 100))));
                args.push('-qscale:v', String(qscale));
            }
            if (options?.resizeWidth) {
                args.push('-vf', `scale=${options.resizeWidth}:-1`);
            }
            args.push(outputName);

            const data = await runFfmpegAndRead(ffmpeg, args, outputName);
            return new Blob([data as BlobPart], { type: `image/${toFormat}` });
        } finally {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, outputName);
        }
    };

    const convertWebpToGif = async (file: File, options?: VideoOptions): Promise<Blob> => {
        const ffmpeg = ffmpegRef.current;
        if (!ffmpeg || !isLoaded) throw new Error("FFmpeg is not loaded");

        const baseName = buildSafeBaseName(file.name);
        const inputName = `input_${baseName}`;
        const tempVideo = `temp_${baseName}.mp4`;
        const outputName = `output_${baseName}.gif`;

        try {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, tempVideo);
            await safeDeleteFile(ffmpeg, outputName);
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            await ffmpeg.exec([
                '-i', inputName,
                '-movflags', 'faststart',
                '-pix_fmt', 'yuv420p',
                tempVideo
            ]);

            const fps = options?.fps || 10;
            const width = options?.scaleWidth || 320;
            const data = await runFfmpegAndRead(ffmpeg, [
                '-i', tempVideo, 
                '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, 
                '-loop', '0', 
                outputName
            ], outputName);

            return new Blob([data as BlobPart], { type: 'image/gif' });
        } finally {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, tempVideo);
            await safeDeleteFile(ffmpeg, outputName);
        }
    };

    const convertVideoToGif = async (file: File, options?: VideoOptions): Promise<Blob> => {
        const ffmpeg = ffmpegRef.current;
        if (!ffmpeg || !isLoaded) throw new Error("FFmpeg is not loaded");

        const baseName = buildSafeBaseName(file.name);
        const inputName = `input_${baseName}`;
        const outputName = `output_${baseName}.gif`;

        try {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, outputName);
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            const fps = options?.fps || 10;
            const width = options?.scaleWidth || 320;
            const data = await runFfmpegAndRead(ffmpeg, [
                '-i', inputName, 
                '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, 
                '-loop', '0', 
                outputName
            ], outputName);

            return new Blob([data as BlobPart], { type: 'image/gif' });
        } finally {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, outputName);
        }
    };

    const convertVideoToWebm = async (file: File, options?: VideoOptions): Promise<Blob> => {
        const ffmpeg = ffmpegRef.current;
        if (!ffmpeg || !isLoaded) throw new Error("FFmpeg is not loaded");

        const baseName = buildSafeBaseName(file.name);
        const inputName = `input_${baseName}`;
        const outputName = `output_${baseName}.webm`;

        try {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, outputName);
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            const args = ['-i', inputName];
            const filterParts = [];
            if (options?.fps) {
                filterParts.push(`fps=${options.fps}`);
            }
            if (options?.scaleWidth) {
                filterParts.push(`scale=${options.scaleWidth}:-1`);
            }
            if (filterParts.length > 0) {
                args.push('-vf', filterParts.join(','));
            }
            args.push(outputName);

            const data = await runFfmpegAndRead(ffmpeg, args, outputName);
            return new Blob([data as BlobPart], { type: 'video/webm' });
        } finally {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, outputName);
        }
    };

    const convertGifToVideo = async (file: File, options?: VideoOptions): Promise<Blob> => {
        const ffmpeg = ffmpegRef.current;
        if (!ffmpeg || !isLoaded) throw new Error("FFmpeg is not loaded");

        const baseName = buildSafeBaseName(file.name);
        const inputName = `input_${baseName}`;
        const outputName = `output_${baseName}.mp4`;

        try {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, outputName);
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            const args = ['-i', inputName, '-movflags', 'faststart', '-pix_fmt', 'yuv420p'];
            const filterParts = [];
            if (options?.fps) {
                filterParts.push(`fps=${options.fps}`);
            }
            filterParts.push('scale=trunc(iw/2)*2:trunc(ih/2)*2');
            if (options?.scaleWidth) {
                filterParts.unshift(`scale=${options.scaleWidth}:-1`);
            }
            args.push('-vf', filterParts.join(','));
            args.push(outputName);

            const data = await runFfmpegAndRead(ffmpeg, args, outputName);
            return new Blob([data as BlobPart], { type: 'video/mp4' });
        } finally {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, outputName);
        }
    };

    const extractAudioFromVideo = async (file: File): Promise<Blob> => {
        const ffmpeg = ffmpegRef.current;
        if (!ffmpeg || !isLoaded) throw new Error("FFmpeg is not loaded");

        const baseName = buildSafeBaseName(file.name);
        const inputName = `input_${baseName}`;
        const outputName = `output_${baseName}.mp3`;

        try {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, outputName);
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            const data = await runFfmpegAndRead(ffmpeg, [
                '-i', inputName,
                '-vn',
                '-acodec', 'libmp3lame',
                '-ab', '192k',
                outputName
            ], outputName);

            return new Blob([data as BlobPart], { type: 'audio/mp3' });
        } finally {
            await safeDeleteFile(ffmpeg, inputName);
            await safeDeleteFile(ffmpeg, outputName);
        }
    };

    return {
        isLoaded,
        isLoading,
        convertImage,
        convertWebpToGif,
        convertVideoToGif,
        convertVideoToWebm,
        convertGifToVideo,
        extractAudioFromVideo,
        convertSvgToPng,
    };
}
