import { useState, useRef, useEffect, memo } from 'react';
import { Play, Pause } from 'lucide-react';

const VoiceIntroCard = memo(function VoiceIntroCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const onAudioEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    };

    // Initialize duration if already loaded
    if (audio.readyState > 0) {
      setAudioData();
    }

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onAudioEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onAudioEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      // Need a promise catch in case play is interrupted
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => console.log('Audio playback prevented:', err));
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    const progressContainer = progressRef.current;
    if (!progressContainer || !audioRef.current || !duration) return;
    
    const clickX = e.clientX - progressContainer.getBoundingClientRect().left;
    const width = progressContainer.clientWidth;
    const newProgress = Math.max(0, Math.min(1, clickX / width));
    
    audioRef.current.currentTime = newProgress * duration;
    setProgress(newProgress * 100);
  };

  const audioSrc = `${import.meta.env.BASE_URL}multi-speaker.mp3`;

  return (
    <div className="mt-2.5 bg-[#101610] border border-lime-400/15 rounded-[3px] p-4 hover:border-lime-400/30 hover:shadow-[0_4px_20px_rgba(163,255,18,0.04)] transition-all duration-300 group">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      
      {/* Top Label */}
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-[5px] h-[5px] rounded-full bg-lime-400 shrink-0" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/55">Voice Introduction</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button 
          onClick={togglePlayPause}
          className="shrink-0 w-11 h-11 rounded-full border border-lime-400/25 flex items-center justify-center bg-lime-400/5 hover:bg-lime-400/15 hover:border-lime-400/50 transition-all duration-300 outline-none"
        >
          {isPlaying ? (
            <Pause size={16} className="text-lime-400 fill-lime-400" />
          ) : (
            <Play size={16} className="text-lime-400 fill-lime-400 ml-0.5" />
          )}
        </button>

        {/* Info & Progress */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-white truncate">Listen to my introduction</span>
            <span className="font-mono text-[10px] text-lime-400/80 tabular-nums shrink-0 ml-3">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          {/* Progress bar */}
          <div 
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-1.5 w-full bg-[#171817] border border-lime-400/10 rounded-full overflow-hidden cursor-pointer relative group-hover:border-lime-400/20 transition-colors"
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-lime-400/70 to-lime-400 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(163,255,18,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default VoiceIntroCard;
