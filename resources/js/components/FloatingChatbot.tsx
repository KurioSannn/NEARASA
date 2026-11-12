import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Link } from '@inertiajs/react';
import {
  ArrowRight,
  ArrowUp,
  Bot,
  Globe,
  MessageCircle,
  Mic,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  places?: Array<{
    slug: string;
    name: string;
    sub: string;
    photo: string;
    price: string;
  }>;
}

const PRESET_RESPONSES: Record<
  string,
  {
    reply: string;
    places?: Array<{
      slug: string;
      name: string;
      sub: string;
      photo: string;
      price: string;
    }>;
  }
> = {
  terdekat: {
    reply:
      'Berikut 3 rekomendasi gerai favorit terdekat yang sedang buka hari ini di Sidoarjo & Surabaya:',
    places: [
      {
        slug: 'dapur-griya',
        name: 'Dapur Griya',
        sub: 'Warung · Gedangan, Sidoarjo',
        photo: '/images/demo/places/dapur-griya.png',
        price: 'Mulai Rp 12.000',
      },
      {
        slug: 'roti-pagi',
        name: 'Roti Pagi',
        sub: 'Warung · Krian, Sidoarjo',
        photo: '/images/demo/toast.jpg',
        price: 'Mulai Rp 15.000',
      },
      {
        slug: 'burger-pos',
        name: 'Burger Pos',
        sub: 'Food Truck · Pos Gedangan',
        photo: '/images/demo/places/burger-pos.png',
        price: 'Mulai Rp 23.000',
      },
    ],
  },
  malam: {
    reply:
      'Untuk santap malam ini, gerai-gerai ini siap melayani hingga larut malam:',
    places: [
      {
        slug: 'dapur-bara',
        name: 'Dapur Bara',
        sub: 'Rombong · Krian (Buka s/d 23:00)',
        photo: '/images/demo/grill.jpg',
        price: 'Mulai Rp 22.000',
      },
      {
        slug: 'burger-pos',
        name: 'Burger Pos',
        sub: 'Pos Gedangan (Buka s/d 22:00)',
        photo: '/images/demo/places/burger-pos.png',
        price: 'Mulai Rp 23.000',
      },
      {
        slug: 'dapur-griya',
        name: 'Dapur Griya',
        sub: 'Gedangan (Buka s/d 22:00)',
        photo: '/images/demo/places/dapur-griya.png',
        price: 'Mulai Rp 12.000',
      },
    ],
  },
  pedas: {
    reply:
      'Pecinta rasa pedas gurih khas Jawa Timur wajib coba rekomendasi ini:',
    places: [
      {
        slug: 'dapur-bara',
        name: 'Dapur Bara',
        sub: 'Ayam Bakar Sambal Korek Mantap',
        photo: '/images/demo/grill.jpg',
        price: 'Mulai Rp 22.000',
      },
      {
        slug: 'dapur-griya',
        name: 'Dapur Griya',
        sub: 'Nasi Telur Balado Pedas Rempah',
        photo: '/images/demo/places/dapur-griya.png',
        price: 'Mulai Rp 12.000',
      },
    ],
  },
  hemat: {
    reply:
      'Pilihan menu lezat dan bersahabat di kantong (di bawah Rp 20.000):',
    places: [
      {
        slug: 'dapur-griya',
        name: 'Dapur Griya',
        sub: 'Nasi Telur Komplit',
        photo: '/images/demo/places/dapur-griya.png',
        price: 'Rp 12.000',
      },
      {
        slug: 'roti-pagi',
        name: 'Roti Pagi',
        sub: 'Roti Bakar Cokelat Keju',
        photo: '/images/demo/toast.jpg',
        price: 'Rp 15.000',
      },
      {
        slug: 'kopi-sudut',
        name: 'Kopi Sudut',
        sub: 'Americano & Kopi Susu Aren',
        photo: '/images/demo/coffee.jpg',
        price: 'Rp 12.000',
      },
    ],
  },
};

function formatCurrentTime(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Positions: Both use top-left viewport coordinates in pixels
  const [launcherPos, setLauncherPos] = useState<{ x: number; y: number }>({ x: 20, y: 600 });
  const [cardPos, setCardPos] = useState<{ x: number; y: number }>({ x: 20, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHeaderDragging, setIsHeaderDragging] = useState(false);

  const launcherDragInfo = useRef<{
    startX: number;
    startY: number;
    origLauncherX: number;
    origLauncherY: number;
    origCardX: number;
    origCardY: number;
    hasDragged: boolean;
  }>({
    startX: 0,
    startY: 0,
    origLauncherX: 20,
    origLauncherY: 600,
    origCardX: 20,
    origCardY: 50,
    hasDragged: false,
  });

  const headerDragInfo = useRef<{
    startX: number;
    startY: number;
    origCardX: number;
    origCardY: number;
    origLauncherX: number;
    origLauncherY: number;
    hasDragged: boolean;
  }>({
    startX: 0,
    startY: 0,
    origCardX: 20,
    origCardY: 50,
    origLauncherX: 20,
    origLauncherY: 600,
    hasDragged: false,
  });

  const bodyEndRef = useRef<HTMLDivElement>(null);

  const computeInitialCardPos = (lx: number, ly: number) => {
    const cardW = 360;
    const cardH = 540;
    const cx = Math.max(12, Math.min(window.innerWidth - cardW - 12, lx));
    let cy: number;
    if (ly > window.innerHeight / 2) {
      // Launcher in bottom half -> open card above launcher
      cy = Math.max(12, ly - cardH - 12);
    } else {
      // Launcher in top half -> open card below launcher
      cy = Math.min(window.innerHeight - cardH - 12, ly + 52 + 12);
      if (cy < 12) cy = 12;
    }
    return { x: cx, y: cy };
  };

  // Initialize position on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initLX = 20;
      const initLY = Math.max(12, window.innerHeight - 85);
      setLauncherPos({ x: initLX, y: initLY });
      setCardPos(computeInitialCardPos(initLX, initLY));
    }
  }, []);

  // Window resize handler: keep both within bounds
  useEffect(() => {
    const handleResize = () => {
      setLauncherPos(prev => ({
        x: Math.max(12, Math.min(window.innerWidth - 64, prev.x)),
        y: Math.max(12, Math.min(window.innerHeight - 64, prev.y)),
      }));
      setCardPos(prev => ({
        x: Math.max(12, Math.min(window.innerWidth - 372, prev.x)),
        y: Math.max(12, Math.min(window.innerHeight - 552, prev.y)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll chat body on new messages
  useEffect(() => {
    if (isOpen) {
      bodyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Robust Launcher Mouse Drag
  const handleLauncherMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;

    launcherDragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      origLauncherX: launcherPos.x,
      origLauncherY: launcherPos.y,
      origCardX: cardPos.x,
      origCardY: cardPos.y,
      hasDragged: false,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - launcherDragInfo.current.startX;
      const dy = moveEvent.clientY - launcherDragInfo.current.startY;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        launcherDragInfo.current.hasDragged = true;
        setIsDragging(true);

        const newLX = Math.max(12, Math.min(window.innerWidth - 64, launcherDragInfo.current.origLauncherX + dx));
        const newLY = Math.max(12, Math.min(window.innerHeight - 64, launcherDragInfo.current.origLauncherY + dy));
        setLauncherPos({ x: newLX, y: newLY });

        // If card is currently open, move card in sync:
        const cardW = 360;
        const cardH = 540;
        const newCX = Math.max(12, Math.min(window.innerWidth - cardW - 12, launcherDragInfo.current.origCardX + dx));
        const newCY = Math.max(12, Math.min(window.innerHeight - cardH - 12, launcherDragInfo.current.origCardY + dy));
        setCardPos({ x: newCX, y: newCY });
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setTimeout(() => {
        setIsDragging(false);
      }, 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Mobile Touch Launcher Drag
  const handleLauncherTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.touches[0];
    launcherDragInfo.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      origLauncherX: launcherPos.x,
      origLauncherY: launcherPos.y,
      origCardX: cardPos.x,
      origCardY: cardPos.y,
      hasDragged: false,
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const moveTouch = moveEvent.touches[0];
      const dx = moveTouch.clientX - launcherDragInfo.current.startX;
      const dy = moveTouch.clientY - launcherDragInfo.current.startY;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        launcherDragInfo.current.hasDragged = true;
        setIsDragging(true);

        const newLX = Math.max(12, Math.min(window.innerWidth - 64, launcherDragInfo.current.origLauncherX + dx));
        const newLY = Math.max(12, Math.min(window.innerHeight - 64, launcherDragInfo.current.origLauncherY + dy));
        setLauncherPos({ x: newLX, y: newLY });

        const cardW = 360;
        const cardH = 540;
        const newCX = Math.max(12, Math.min(window.innerWidth - cardW - 12, launcherDragInfo.current.origCardX + dx));
        const newCY = Math.max(12, Math.min(window.innerHeight - cardH - 12, launcherDragInfo.current.origCardY + dy));
        setCardPos({ x: newCX, y: newCY });
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      setTimeout(() => {
        setIsDragging(false);
      }, 50);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Card Header Drag (Mouse)
  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return;

    headerDragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      origCardX: cardPos.x,
      origCardY: cardPos.y,
      origLauncherX: launcherPos.x,
      origLauncherY: launcherPos.y,
      hasDragged: false,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - headerDragInfo.current.startX;
      const dy = moveEvent.clientY - headerDragInfo.current.startY;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        headerDragInfo.current.hasDragged = true;
        setIsHeaderDragging(true);

        const cardW = 360;
        const cardH = 540;
        const newCX = Math.max(12, Math.min(window.innerWidth - cardW - 12, headerDragInfo.current.origCardX + dx));
        const newCY = Math.max(12, Math.min(window.innerHeight - cardH - 12, headerDragInfo.current.origCardY + dy));
        setCardPos({ x: newCX, y: newCY });

        const newLX = Math.max(12, Math.min(window.innerWidth - 64, headerDragInfo.current.origLauncherX + dx));
        const newLY = Math.max(12, Math.min(window.innerHeight - 64, headerDragInfo.current.origLauncherY + dy));
        setLauncherPos({ x: newLX, y: newLY });
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setTimeout(() => {
        setIsHeaderDragging(false);
      }, 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Card Header Drag (Touch)
  const handleHeaderTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    headerDragInfo.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      origCardX: cardPos.x,
      origCardY: cardPos.y,
      origLauncherX: launcherPos.x,
      origLauncherY: launcherPos.y,
      hasDragged: false,
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const moveTouch = moveEvent.touches[0];
      const dx = moveTouch.clientX - headerDragInfo.current.startX;
      const dy = moveTouch.clientY - headerDragInfo.current.startY;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        headerDragInfo.current.hasDragged = true;
        setIsHeaderDragging(true);

        const cardW = 360;
        const cardH = 540;
        const newCX = Math.max(12, Math.min(window.innerWidth - cardW - 12, headerDragInfo.current.origCardX + dx));
        const newCY = Math.max(12, Math.min(window.innerHeight - cardH - 12, headerDragInfo.current.origCardY + dy));
        setCardPos({ x: newCX, y: newCY });

        const newLX = Math.max(12, Math.min(window.innerWidth - 64, headerDragInfo.current.origLauncherX + dx));
        const newLY = Math.max(12, Math.min(window.innerHeight - 64, headerDragInfo.current.origLauncherY + dy));
        setLauncherPos({ x: newLX, y: newLY });
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      setTimeout(() => {
        setIsHeaderDragging(false);
      }, 50);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  const openChat = () => {
    setIsClosing(false);
    setCardPos(computeInitialCardPos(launcherPos.x, launcherPos.y));
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 220);
  };

  // Clean Click handler: only triggers when not dragging!
  const handleLauncherClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (launcherDragInfo.current.hasDragged) {
      launcherDragInfo.current.hasDragged = false;
      return;
    }
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  const handleSendPrompt = (promptText: string, presetKey?: string) => {
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      time: formatCurrentTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let replyData = presetKey ? PRESET_RESPONSES[presetKey] : undefined;

      if (!replyData) {
        const lower = promptText.toLowerCase();
        if (lower.includes('malam') || lower.includes('larut') || lower.includes('buka')) {
          replyData = PRESET_RESPONSES.malam;
        } else if (lower.includes('pedas') || lower.includes('sambal') || lower.includes('ayam')) {
          replyData = PRESET_RESPONSES.pedas;
        } else if (lower.includes('hemat') || lower.includes('murah') || lower.includes('harga')) {
          replyData = PRESET_RESPONSES.hemat;
        } else {
          replyData = PRESET_RESPONSES.terdekat;
        }
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyData.reply,
        time: formatCurrentTime(),
        places: replyData.places,
      };

      setIsTyping(false);
      setMessages(prev => [...prev, assistantMsg]);
    }, 550);
  };

  const handleReset = () => {
    setMessages([]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Draggable Floating Launcher Trigger (Tahan Klik Kiri untuk Pindah, Klik Biasa untuk Buka) */}
      <button
        type="button"
        className={`nearasa-chatbot-trigger ${isDragging ? 'is-dragging' : ''} ${isOpen ? 'is-open' : ''}`}
        style={{
          left: `${launcherPos.x}px`,
          top: `${launcherPos.y}px`,
        }}
        onMouseDown={handleLauncherMouseDown}
        onTouchStart={handleLauncherTouchStart}
        onClick={handleLauncherClick}
        aria-label={isOpen ? 'Tutup Asisten NEARASA' : 'Buka Asisten NEARASA'}
        title="Klik untuk membuka chat, klik kiri tahan untuk memindahkan posisi"
      >
        <span className="trigger-icon-wrap">
          {isOpen ? <X size={22} className="trigger-icon" /> : <MessageCircle size={22} className="trigger-icon" />}
        </span>
        {!isOpen && <span className="trigger-badge-dot" aria-hidden="true" />}
      </button>

      {/* Floating Popup Modal (Faithful to Reference Image) */}
      {(isOpen || isClosing) && (
        <section
          className={`nearasa-chatbot-card ${isClosing ? 'is-closing' : 'is-opening'} ${isHeaderDragging ? 'is-header-dragging' : ''}`}
          style={{
            left: `${cardPos.x}px`,
            top: `${cardPos.y}px`,
          }}
          aria-label="Jendela Chat Asisten NEARASA"
        >
          {/* Card Header (Preserving Bot Profile & Draggable) */}
          <header
            className="chatbot-card-header"
            onMouseDown={handleHeaderMouseDown}
            onTouchStart={handleHeaderTouchStart}
            title="Klik kiri tahan untuk memindahkan jendela chat"
          >
            <div className="chatbot-header-identity">
              <div className="chatbot-avatar-mark">
                <Bot size={17} aria-hidden="true" />
              </div>
              <div className="chatbot-title-box">
                <div className="chatbot-name">Asisten NEARASA</div>
                <div className="chatbot-status-row">
                  <span className="chatbot-status-dot" aria-hidden="true" />
                  <span>Panduan Kuliner Lokal</span>
                </div>
              </div>
            </div>

            <div
              className="chatbot-header-actions"
              onMouseDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
            >
              {messages.length > 0 && (
                <button
                  type="button"
                  className="chatbot-icon-btn"
                  onClick={handleReset}
                  title="Mulai percakapan baru"
                  aria-label="Mulai percakapan baru"
                >
                  <RotateCcw size={15} />
                </button>
              )}
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={closeChat}
                title="Tutup asisten"
                aria-label="Tutup jendela chat"
              >
                <X size={17} />
              </button>
            </div>
          </header>

          {/* Card Body */}
          <div className="chatbot-card-body">
            {messages.length === 0 ? (
              /* Hero State with Warm Glowing Orb (Matches Reference Image) */
              <div className="chatbot-orb-hero">
                <div className="chatbot-orb-wrap" aria-hidden="true">
                  <div className="chatbot-orb" />
                </div>

                <p className="chatbot-orb-caption">
                  Mau cari rekomendasi kuliner apa hari ini? Tanyakan gerai terdekat atau menu favoritmu.
                </p>

                {/* Quick Action Prompt Chips */}
                <div className="chatbot-quick-chips" role="group" aria-label="Saran pertanyaan cepat">
                  <button
                    type="button"
                    className="chatbot-chip-btn"
                    onClick={() =>
                      handleSendPrompt('Cari rekomendasi kuliner terdekat yang sedang buka', 'terdekat')
                    }
                  >
                    📍 Terdekat
                  </button>
                  <button
                    type="button"
                    className="chatbot-chip-btn"
                    onClick={() =>
                      handleSendPrompt('Warung atau rombong yang buka malam ini', 'malam')
                    }
                  >
                    🌙 Buka Malam
                  </button>
                  <button
                    type="button"
                    className="chatbot-chip-btn"
                    onClick={() =>
                      handleSendPrompt('Rekomendasi kuliner pedas mantap', 'pedas')
                    }
                  >
                    🔥 Kuliner Pedas
                  </button>
                  <button
                    type="button"
                    className="chatbot-chip-btn"
                    onClick={() =>
                      handleSendPrompt('Pilihan menu hemat bersahabat kantong', 'hemat')
                    }
                  >
                    💰 Pilihan Hemat
                  </button>
                </div>
              </div>
            ) : (
              /* Conversation Messages Stream */
              <div className="chatbot-messages-list">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`chatbot-bubble ${msg.sender === 'user' ? 'is-user' : 'is-assistant'}`}
                  >
                    <p style={{ margin: 0 }}>{msg.text}</p>

                    {/* Interactive Place Cards */}
                    {msg.places && (
                      <div className="chatbot-place-cards">
                        {msg.places.map(place => (
                          <Link
                            key={place.slug}
                            href={`/usaha/${place.slug}`}
                            className="chatbot-place-card"
                            onClick={closeChat}
                          >
                            <img
                              src={place.photo}
                              alt={place.name}
                              className="chatbot-place-thumb"
                            />
                            <div className="chatbot-place-meta">
                              <div className="chatbot-place-name">{place.name}</div>
                              <div className="chatbot-place-sub">
                                {place.sub} · <strong>{place.price}</strong>
                              </div>
                            </div>
                            <span className="chatbot-place-action">
                              <ArrowRight size={13} aria-hidden="true" />
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="chatbot-bubble-time">{msg.time}</div>
                  </div>
                ))}

                {isTyping && (
                  <div className="chatbot-typing-bubble" aria-label="Asisten sedang mengetik...">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                )}
                <div ref={bodyEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Floating Input Card (Faithful to Reference Image) */}
          <footer className="chatbot-card-footer">
            <div className="chatbot-input-card">
              <textarea
                className="chatbot-input-textarea border-0 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 shadow-none focus:shadow-none"
                placeholder="Tanya rekomendasi kuliner terdekat..."
                rows={1}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt(inputVal);
                  }
                }}
              />

              <div className="chatbot-input-toolbar">
                <div className="toolbar-left">
                  <button
                    type="button"
                    className="toolbar-btn-icon"
                    title="Tambah opsi"
                    onClick={() => handleSendPrompt('Tampilkan warung terdekat')}
                  >
                    <Plus size={15} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-pill-btn"
                    onClick={() => handleSendPrompt('Jelajahi seluruh kuliner')}
                  >
                    <Globe size={12} />
                    <span>Jelajah</span>
                  </button>
                </div>

                <div className="toolbar-right">
                  <button
                    type="button"
                    className="toolbar-btn-icon"
                    title="Suara"
                    onClick={() => handleSendPrompt('Rekomendasi terpopuler hari ini')}
                  >
                    <Mic size={15} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn-send"
                    disabled={!inputVal.trim() || isTyping}
                    onClick={() => handleSendPrompt(inputVal)}
                    aria-label="Kirim"
                  >
                    <ArrowUp size={15} />
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </section>
      )}
    </>
  );
}
