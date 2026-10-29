'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, 
  Share2, Shield, Users, Send, CheckCircle2, Clock, 
  Maximize2, Minimize2, AlertCircle, Sparkles
} from 'lucide-react';

interface TelehealthRoomProps {
  roomId: string;
  currentUser: {
    id: string;
    name: string;
    role: 'VETERINARIAN' | 'CUSTOMER' | 'ADMIN' | 'RECEPTIONIST';
  };
  patientInfo?: {
    petName: string;
    species?: string;
    ownerName?: string;
  };
  onEndCall?: () => void;
}

interface ChatMsg {
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  timestamp: string;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function TelehealthRoom({
  roomId,
  currentUser,
  patientInfo,
  onEndCall
}: TelehealthRoomProps) {
  // Media states
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  // Connection & Room states
  const [wsConnected, setWsConnected] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [remotePeerInfo, setRemotePeerInfo] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Chat & UI states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Helper to send WS messages
  const sendWsMessage = (msg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  // Initialize WebRTC PeerConnection
  const initPeerConnection = useCallback((stream: MediaStream) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Add local tracks to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Remote stream received
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setPeerConnected(true);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      }
    };

    // Send local ICE candidates to remote peer via WebSocket
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWsMessage({
          type: 'ICE_CANDIDATE',
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setPeerConnected(true);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setPeerConnected(false);
      }
    };

    return pc;
  }, []);

  // Create WebRTC Offer
  const makeOffer = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendWsMessage({
        type: 'OFFER',
        sdp: offer,
      });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  }, []);

  // Create WebRTC Answer
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendWsMessage({
        type: 'ANSWER',
        sdp: answer,
      });
    } catch (err) {
      console.error('Error answering offer:', err);
    }
  }, []);

  // Setup Local Media (with camera/mic fallback)
  useEffect(() => {
    let mounted = true;
    let stream: MediaStream | null = null;

    async function setupMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (err: any) {
        console.warn('Failed to access camera/mic, falling back to dummy media stream:', err);
        setDeviceError('Không tìm thấy thiết bị Camera/Mic hoặc chưa cấp quyền. Đang chạy chế độ mô phỏng trực quan.');
        
        // Create canvas stream fallback for test/dev environments without webcams
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, 640, 480);
          ctx.font = '24px sans-serif';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(currentUser.name, 40, 240);
        }
        const canvasStream = canvas.captureStream ? canvas.captureStream(10) : new MediaStream();
        
        // Audio fallback
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const dst = osc.connect(audioCtx.createMediaStreamDestination());
          osc.start();
          const audioTrack = (dst as any).stream.getAudioTracks()[0];
          if (audioTrack) canvasStream.addTrack(audioTrack);
        } catch {
          // ignore
        }
        stream = canvasStream;
      }

      if (!mounted) return;
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = initPeerConnection(stream);

      // Connect to WebSocket signaling
      const wsHost = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8001/api/v1/ws';
      const encodedName = encodeURIComponent(currentUser.name);
      const wsUrl = `${wsHost}/telehealth/${roomId}?user_id=${currentUser.id}&name=${encodedName}&role=${currentUser.role}`;
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setWsConnected(true);
      };

      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'ROOM_STATE') {
            if (data.peers && data.peers.length > 0) {
              setRemotePeerInfo(data.peers[0]);
              // There's already someone in room: initiate the call
              await makeOffer();
            }
          } else if (data.type === 'PEER_JOINED') {
            setRemotePeerInfo(data.peer);
            // Peer just joined: make offer
            await makeOffer();
          } else if (data.type === 'OFFER') {
            await handleOffer(data.sdp);
          } else if (data.type === 'ANSWER') {
            if (pc.currentRemoteDescription === null) {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
          } else if (data.type === 'ICE_CANDIDATE') {
            if (data.candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              } catch (e) {
                console.error('Error adding ICE candidate', e);
              }
            }
          } else if (data.type === 'CHAT_MESSAGE') {
            setChatMessages((prev) => [...prev, data]);
            if (!chatOpen) {
              setUnreadCount((prev) => prev + 1);
            }
          } else if (data.type === 'PEER_LEFT') {
            setRemotePeerInfo(null);
            setPeerConnected(false);
            setRemoteStream(null);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
          }
        } catch (err) {
          console.error('Error processing websocket message:', err);
        }
      };

      socket.onclose = () => {
        setWsConnected(false);
      };
    }

    setupMedia();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId, currentUser.id, currentUser.name, currentUser.role, initPeerConnection, makeOffer, handleOffer]);

  // Scroll chat down
  useEffect(() => {
    if (chatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  // Toggle Mic
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setMicActive(!micActive);
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setCameraActive(!cameraActive);
    }
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (!pcRef.current) return;

    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        const sender = pcRef.current.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.warn('Screen share canceled or not supported:', err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    if (!pcRef.current || !localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    const sender = pcRef.current.getSenders().find((s) => s.track && s.track.kind === 'video');
    if (sender && videoTrack) {
      await sender.replaceTrack(videoTrack);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    setIsScreenSharing(false);
  };

  // Send Chat Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    sendWsMessage({
      type: 'CHAT_MESSAGE',
      message: inputMessage.trim(),
    });
    setInputMessage('');
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const openChat = () => {
    setChatOpen(!chatOpen);
    if (!chatOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col h-[740px] w-full bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 select-none"
    >
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-semibold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>HD TeleHealth</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium bg-slate-800/60 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/50">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatTime(callDuration)}</span>
          </div>

          {patientInfo && (
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-800/60 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/50">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Bệnh nhân: <strong>{patientInfo.petName}</strong> {patientInfo.ownerName ? `(${patientInfo.ownerName})` : ''}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Peer connection indicator */}
          <div className="flex items-center gap-2 text-xs bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/60">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {peerConnected 
                ? (remotePeerInfo?.name || 'Đã kết nối trực tiếp') 
                : wsConnected 
                ? 'Đang chờ người tham gia...' 
                : 'Đang kết nối tín hiệu...'}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition cursor-pointer"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video Presentation Grid */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Remote Video Container (Primary Large View) */}
        <div className="relative flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${peerConnected ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Placeholder when remote peer is not yet connected */}
          {!peerConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-radial from-slate-800 to-slate-950">
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
                <Video className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-200">
                {currentUser.role === 'VETERINARIAN' ? 'Đang đợi Khách hàng kết nối...' : 'Đang đợi Bác sĩ kết nối...'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Đường truyền WebRTC đã sẵn sàng và được mã hóa đầu cuối. Video sẽ tự động hiển thị ngay khi đối tác tham gia.
              </p>

              {deviceError && (
                <div className="mt-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 max-w-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{deviceError}</span>
                </div>
              )}
            </div>
          )}

          {/* Remote Peer Name Label Overlay */}
          {peerConnected && (
            <div className="absolute bottom-24 left-6 z-10 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-xl text-xs font-semibold text-slate-200 border border-slate-700/50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{remotePeerInfo?.name || (currentUser.role === 'VETERINARIAN' ? 'Khách hàng' : 'Bác sĩ Thú Y')}</span>
            </div>
          )}

          {/* Local Video Pip (Picture-in-Picture) */}
          <div className="absolute bottom-24 right-6 z-10 w-48 sm:w-56 h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80 bg-slate-800 group transition hover:scale-105">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs rounded-md text-[10px] font-bold text-white">
              Bạn ({currentUser.name})
            </div>
            {!cameraActive && (
              <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center text-xs text-slate-400">
                Camera Tắt
              </div>
            )}
          </div>
        </div>

        {/* Live Chat Panel (Slide in) */}
        {chatOpen && (
          <div className="w-80 border-l border-slate-800 bg-slate-900/95 backdrop-blur-xl flex flex-col z-20 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Tin Nhắn Tư Vấn
              </h4>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  Chưa có tin nhắn nào trong cuộc gọi.
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isMe = msg.sender_id === currentUser.id;
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-300">{msg.sender_name}</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div 
                        className={`px-3 py-2 rounded-2xl max-w-[85%] leading-relaxed ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-br-xs' 
                            : 'bg-slate-800 text-slate-200 rounded-bl-xs border border-slate-700/60'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-hidden border border-slate-700 focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-40 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center p-4 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 p-2 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl pointer-events-auto">
          {/* Mic Button */}
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition cursor-pointer ${
              micActive 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}
            title={micActive ? 'Tắt Micro' : 'Bật Micro'}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera Button */}
          <button
            onClick={toggleCamera}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition cursor-pointer ${
              cameraActive 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}
            title={cameraActive ? 'Tắt Camera' : 'Bật Camera'}
          >
            {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition cursor-pointer ${
              isScreenSharing 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Chia sẻ màn hình / Hồ sơ bệnh án"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Chat Toggle Button */}
          <button
            onClick={openChat}
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition cursor-pointer ${
              chatOpen 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Nhắn tin"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="w-px h-6 bg-slate-800 mx-1"></div>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="px-5 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2 transition shadow-lg shadow-red-600/30 cursor-pointer text-sm"
            title="Kết thúc cuộc gọi"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Kết thúc</span>
          </button>
        </div>
      </div>
    </div>
  );
}
