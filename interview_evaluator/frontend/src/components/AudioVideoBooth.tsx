import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Volume2, AlertTriangle, Play, Pause, RefreshCw, CheckCircle2 } from 'lucide-react';

interface AudioVideoBoothProps {
  onAppendTranscript: (text: string) => void;
  currentAnswerLength: number;
}

export const AudioVideoBooth: React.FC<AudioVideoBoothProps> = ({
  onAppendTranscript,
  currentAnswerLength
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [interimTranscript, setInterimTranscript] = useState<string>('');

  // 1. Initialize Media Stream (Webcam & Microphone)
  useEffect(() => {
    let mounted = true;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true
        });

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        setHasPermission(true);
        setPermissionError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Initialize Web Audio API Level Meter
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;

          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateMeter = () => {
            if (!mounted) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            // Normalize to 0-100 range
            const normalized = Math.min(100, Math.round((avg / 128) * 100));
            setAudioLevel(normalized);
            animationFrameRef.current = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        } catch (audioErr) {
          console.warn('[AudioVideoBooth] Web Audio API visualizer warning:', audioErr);
        }
      } catch (err: any) {
        if (!mounted) return;
        console.error('[AudioVideoBooth] Media access error:', err);
        setHasPermission(false);
        setPermissionError(
          err.name === 'NotAllowedError'
            ? 'Camera and microphone access was denied. Please allow browser permissions in your address bar.'
            : 'No camera or microphone device found. You can still type your answer manually.'
        );
      }
    }

    initMedia();

    // 2. Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript + ' ';
          } else {
            interimChunk += transcript;
          }
        }

        if (finalChunk) {
          onAppendTranscript(finalChunk);
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimChunk);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[AudioVideoBooth] Speech recognition warning:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Auto restart if still in listening mode
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }

    // Session Timer
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Toggle Camera
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  // Toggle Mic
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  // Toggle Speech-to-Text Dictation
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Speech start error:', e);
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl space-y-4">
      {/* Booth Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
            Live Interview Booth
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            WebRTC & STT
          </span>
        </div>

        {/* Timer */}
        <div className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700">
          ⏱️ {formatTimer(sessionSeconds)}
        </div>
      </div>

      {/* Main Video Screen & Audio Meter */}
      <div className="relative aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
        {hasPermission === false ? (
          <div className="p-6 text-center max-w-sm space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <div className="text-sm font-bold text-slate-200">Camera / Mic Access Needed</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {permissionError || 'Please enable browser camera and microphone permissions to use video interview mode.'}
            </p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                isCameraOn ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {!isCameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-500 space-y-2">
                <VideoOff className="w-10 h-10" />
                <span className="text-xs font-semibold">Camera is Turned Off</span>
              </div>
            )}

            {/* Video Overlay Indicators */}
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>HD LIVE</span>
              </span>
              {isListening && (
                <span className="px-2 py-1 rounded-md bg-indigo-900/80 backdrop-blur text-[10px] font-bold text-indigo-200 border border-indigo-500/40 flex items-center space-x-1 animate-pulse">
                  <span>🎙️ TRANSCRIBING</span>
                </span>
              )}
            </div>

            {/* Audio Wave Level Meter Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-2 rounded-xl bg-black/60 backdrop-blur border border-white/10">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-semibold text-slate-300">Voice Input Level:</span>
              </div>
              
              {/* Dynamic Equalizer Bars */}
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
                  const threshold = bar * 12;
                  const active = isMicOn && audioLevel >= threshold;
                  return (
                    <div
                      key={bar}
                      className={`w-1.5 rounded-full transition-all duration-75 ${
                        active
                          ? bar > 6 ? 'bg-rose-500 h-4' : bar > 4 ? 'bg-amber-400 h-3.5' : 'bg-emerald-400 h-3'
                          : 'bg-slate-700 h-1.5'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Live Interim Transcript Display */}
      {interimTranscript && (
        <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-200 italic animate-pulse">
          <span className="font-bold text-indigo-300 not-italic mr-1.5">Hearing:</span>
          "{interimTranscript}..."
        </div>
      )}

      {/* Media Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
        <div className="flex items-center space-x-2">
          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
              isCameraOn
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-rose-950/80 border-rose-800 text-rose-300 hover:bg-rose-900'
            }`}
          >
            {isCameraOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-rose-400" />}
            <span>{isCameraOn ? 'Camera On' : 'Camera Off'}</span>
          </button>

          {/* Mic Toggle */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
              isMicOn
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-rose-950/80 border-rose-800 text-rose-300 hover:bg-rose-900'
            }`}
          >
            {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-rose-400" />}
            <span>{isMicOn ? 'Mic On' : 'Muted'}</span>
          </button>
        </div>

        {/* Speech Dictation Button */}
        <div>
          {speechSupported ? (
            <button
              type="button"
              onClick={toggleListening}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-sm transition ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Live Speech-to-Text</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Speaking (Dictate Answer)</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 italic">
              Speech dictation not supported in this browser. Please type below.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
