import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import toast from 'react-hot-toast';
import {
  Play, Pause, SpeakerHigh, SpeakerX, ArrowsOut,
  ArrowCounterClockwise, ArrowClockwise,
} from '@phosphor-icons/react';
import styles from './VideoPlayer.module.css';

interface VideoSource {
  m3u8: string;
  serverName: string;
}

interface VideoPlayerProps {
  sources: VideoSource[];
  poster?: string;
  title: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function VideoPlayer({
  sources,
  poster,
  title,
  initialTime = 0,
  onTimeUpdate,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressSaveRef = useRef<number>(0);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [serverIdx, setServerIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const currentSource = sources[serverIdx];

  // Load HLS source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentSource) return;

    setError(null);
    setLoading(true);

    const tryNextServer = () => {
      if (serverIdx < sources.length - 1) {
        toast.loading(`Đang chuyển sang ${sources[serverIdx + 1].serverName}...`, { duration: 2000 });
        setServerIdx((i) => i + 1);
      } else {
        setError('Không thể tải phim. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    if (Hls.isSupported()) {
      hlsRef.current?.destroy();
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(currentSource.m3u8);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        if (initialTime > 5) {
          video.currentTime = initialTime;
        }
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
          tryNextServer();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = currentSource.m3u8;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        if (initialTime > 5) video.currentTime = initialTime;
        video.play().catch(() => {});
      });
      video.addEventListener('error', tryNextServer);
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverIdx, currentSource?.m3u8]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeupdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      // Save progress every 5s
      if (video.currentTime - progressSaveRef.current >= 5) {
        progressSaveRef.current = video.currentTime;
        onTimeUpdate?.(video.currentTime, video.duration || 0);
      }
      // Buffered
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onEnded = () => { setIsPlaying(false); onEnded?.(); };
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeupdate);
    video.addEventListener('ended', onEnded);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeupdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [onTimeUpdate, onEnded]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const video = videoRef.current;
      if (!video) return;
      switch (e.key) {
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); video.currentTime -= 10; break;
        case 'ArrowRight': e.preventDefault(); video.currentTime += 10; break;
        case 'ArrowUp': e.preventDefault(); video.volume = Math.min(1, video.volume + 0.1); break;
        case 'ArrowDown': e.preventDefault(); video.volume = Math.max(0, video.volume - 0.1); break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 'm': case 'M': toggleMute(); break;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  // Auto-hide controls
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 2500);
  }, []);

  // Fullscreen change
  useEffect(() => {
    const onFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      
      if (isFs) {
        // Lock to landscape on mobile when entering fullscreen
        if (window.innerWidth < 1024 && screen.orientation && (screen.orientation as any).lock) {
          (screen.orientation as any).lock('landscape').catch(() => {
            // Ignore errors (some devices/browsers don't support locking)
          });
        }
      } else {
        // Unlock orientation when exiting fullscreen
        if (screen.orientation && screen.orientation.unlock) {
          try {
            screen.orientation.unlock();
          } catch {
            // Ignore
          }
        }
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    isPlaying ? v.pause() : v.play();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
    setCurrentTime(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const vol = Number(e.target.value);
    v.volume = vol;
    v.muted = vol === 0;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  if (error) {
    return (
      <div className={styles.error}>
        <span>⚠️</span>
        <p>{error}</p>
        <button onClick={() => setServerIdx(0)} className={styles.retryBtn}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${showControls ? styles.showControls : ''}`}
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
      onDoubleClick={toggleFullscreen}
      onClick={() => {
        if (window.matchMedia('(pointer: fine)').matches) {
          togglePlay();
        }
      }}
    >
      <video
        ref={videoRef}
        className={styles.video}
        poster={poster}
        playsInline
        crossOrigin="anonymous"
        aria-label={title}
      />

      {/* Loading spinner */}
      {loading && (
        <div className={styles.spinnerWrap} onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          <div className={styles.spinner} aria-label="Đang tải..." />
        </div>
      )}

      {/* Controls */}
      <div
        className={styles.controls}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className={styles.progressWrap}>
          <div className={styles.progressTrack}>
            <div className={styles.bufferedBar} style={{ width: `${bufferedPercent}%` }} />
            <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
          </div>
          <input
            type="range"
            className={styles.progressInput}
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Thanh tiến trình"
          />
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.leftControls}>
            {/* Play/Pause */}
            <button className={styles.iconBtn} onClick={togglePlay} aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}>
              {isPlaying ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
            </button>

            {/* Rewind / Forward */}
            <button className={styles.iconBtn} onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} aria-label="Tua lại 10s">
              <ArrowCounterClockwise size={18} weight="bold" />
            </button>
            <button className={styles.iconBtn} onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} aria-label="Tua tới 10s">
              <ArrowClockwise size={18} weight="bold" />
            </button>

            {/* Volume */}
            <button className={styles.iconBtn} onClick={toggleMute} aria-label={isMuted ? 'Bật âm' : 'Tắt âm'}>
              {isMuted ? <SpeakerX size={20} /> : <SpeakerHigh size={20} />}
            </button>
            <input
              type="range"
              className={styles.volumeInput}
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Âm lượng"
            />

            {/* Time */}
            <span className={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className={styles.rightControls}>
            {/* Server switch */}
            {sources.length > 1 && (
              <select
                className={styles.serverSelect}
                value={serverIdx}
                onChange={(e) => setServerIdx(Number(e.target.value))}
                aria-label="Chọn máy chủ"
                onClick={(e) => e.stopPropagation()}
              >
                {sources.map((s, i) => (
                  <option key={i} value={i}>{s.serverName}</option>
                ))}
              </select>
            )}

            {/* Fullscreen */}
            <button className={styles.iconBtn} onClick={toggleFullscreen} aria-label="Toàn màn hình">
              <ArrowsOut size={18} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Title overlay */}
      <div className={styles.titleBar}>{title}</div>
    </div>
  );
}
