'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioTrack {
  id: string;
  title: string;
  url: string;
  duration: number;
  type: 'vocabulary' | 'dialogue' | 'exercise' | 'pronunciation';
  transcript?: string;
  translations?: { [key: string]: string };
}

interface AudioSystemProps {
  tracks: AudioTrack[];
  currentTrackId?: string;
  autoPlay?: boolean;
  showTranscript?: boolean;
  onTrackEnd?: (trackId: string) => void;
  onProgress?: (trackId: string, progress: number) => void;
}

export default function AudioSystem({ 
  tracks, 
  currentTrackId, 
  autoPlay = false, 
  showTranscript = true,
  onTrackEnd,
  onProgress 
}: AudioSystemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [activeTrackId, setActiveTrackId] = useState(currentTrackId || tracks[0]?.id);
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const activeTrack = tracks.find(track => track.id === activeTrackId);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;

    audio.src = activeTrack.url;
    audio.load();

    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onProgress) {
        onProgress(activeTrackId, (audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onTrackEnd) {
        onTrackEnd(activeTrackId);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeTrackId, activeTrack, autoPlay, onProgress, onTrackEnd]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    if (!progressBar || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seekTo(newTime);
  };

  const changeVolume = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const changePlaybackRate = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skipForward = () => {
    seekTo(Math.min(currentTime + 10, duration));
  };

  const skipBackward = () => {
    seekTo(Math.max(currentTime - 10, 0));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTrackTypeIcon = (type: string) => {
    const icons = {
      vocabulary: '📚',
      dialogue: '💬',
      exercise: '🎯',
      pronunciation: '🗣️',
    };
    return icons[type as keyof typeof icons] || '🎵';
  };

  const renderTranscript = () => {
    if (!activeTrack?.transcript) return null;

    const words = activeTrack.transcript.split(' ');
    
    return (
      <div className="p-4 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
        <h4 className="font-semibold text-gray-800 mb-2">Transcript:</h4>
        <div className="text-sm leading-relaxed">
          {words.map((word, index) => (
            <span
              key={index}
              className={`cursor-pointer hover:bg-yellow-200 px-1 rounded transition-colors ${
                highlightedWord === word ? 'bg-yellow-300' : ''
              }`}
              onClick={() => setHighlightedWord(word)}
            >
              {word}{' '}
            </span>
          ))}
        </div>
        {activeTrack.translations && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h5 className="font-medium text-gray-700 mb-1">Translation:</h5>
            <p className="text-sm text-gray-600 italic">
              {activeTrack.translations.en || activeTrack.translations.english}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!activeTrack) {
    return (
      <div className="text-center p-8 text-gray-500">
        No audio tracks available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <audio ref={audioRef} preload="metadata" />
      
      {/* Track Info */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getTrackTypeIcon(activeTrack.type)}</span>
            <div>
              <h3 className="font-semibold text-gray-800">{activeTrack.title}</h3>
              <p className="text-sm text-gray-600 capitalize">{activeTrack.type}</p>
            </div>
          </div>
          <button
            onClick={() => setShowControls(!showControls)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showControls ? '🔽' : '🔼'}
          </button>
        </div>
      </div>

      {/* Main Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4"
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <div
                ref={progressRef}
                className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-100"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-md"
                  style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={skipBackward}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Skip back 10s"
              >
                ⏪
              </button>
              
              <button
                onClick={togglePlayPause}
                className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <button
                onClick={skipForward}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Skip forward 10s"
              >
                ⏩
              </button>
            </div>

            {/* Advanced Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-8">{Math.round(volume * 100)}%</span>
              </div>

              {/* Speed Control */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">⚡</span>
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                  className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>

              {/* Transcript Toggle */}
              {showTranscript && activeTrack.transcript && (
                <button
                  onClick={() => setShowTranscriptPanel(!showTranscriptPanel)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                >
                  📝 Transcript
                </button>
              )}
            </div>

            {/* Track Selection */}
            {tracks.length > 1 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Other Tracks:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tracks.filter(track => track.id !== activeTrackId).map((track) => (
                    <button
                      key={track.id}
                      onClick={() => setActiveTrackId(track.id)}
                      className="text-left p-2 bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{getTrackTypeIcon(track.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {track.title}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {track.type} • {formatTime(track.duration)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript Panel */}
      <AnimatePresence>
        {showTranscriptPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200"
          >
            {renderTranscript()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
