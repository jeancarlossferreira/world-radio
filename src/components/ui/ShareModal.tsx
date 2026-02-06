import { useEffect, useRef, useState } from 'react';
import { X, Link, Share, Mail, MessageCircle, Send } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import type { Station } from '@/types/station';

interface ShareModalProps {
  station: Station;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ station, isOpen, onClose }: ShareModalProps) {
  const { t, locale } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/?station=${station.stationuuid}&lang=${locale}`;
  const shareText = `${station.name} — ${station.country}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: station.name,
        text: shareText,
        url: shareUrl,
      });
      onClose();
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(station.name);
    const body = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    onClose();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    onClose();
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    onClose();
  };

  const handleShareDiscord = () => {
    // Discord doesn't have a direct share URL, copy to clipboard and inform user
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    window.open('https://discord.com/channels/@me', '_blank');
    onClose();
  };

  const handleShareGoogleChat = () => {
    // Google Chat doesn't have a direct share URL, copy to clipboard and open
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    window.open('https://chat.google.com', '_blank');
    onClose();
  };

  const shareOptions = [
    { icon: Link, label: t('action.copyLink'), onClick: handleCopyLink, highlight: copied },
    { icon: Mail, label: t('action.shareEmail'), onClick: handleShareEmail },
    { icon: MessageCircle, label: t('action.shareWhatsApp'), onClick: handleShareWhatsApp, color: 'text-green-500' },
    { icon: Send, label: t('action.shareTelegram'), onClick: handleShareTelegram, color: 'text-blue-500' },
    { icon: DiscordIcon, label: t('action.shareDiscord'), onClick: handleShareDiscord, color: 'text-indigo-500' },
    { icon: GoogleChatIcon, label: t('action.shareGoogleChat'), onClick: handleShareGoogleChat, color: 'text-green-600' },
  ];

  // Add native share if supported
  if ('share' in navigator) {
    shareOptions.splice(1, 0, {
      icon: Share,
      label: t('action.shareNative'),
      onClick: handleNativeShare,
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
    >
      <div className="modal-box max-w-sm">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <h3 className="font-bold text-lg mb-4">{t('action.share')}</h3>

        {/* Station preview */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-base-200 rounded-lg">
          {station.favicon && (
            <img
              src={station.favicon}
              alt=""
              className="w-10 h-10 rounded-lg object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{station.name}</div>
            <div className="text-xs text-base-content/60 truncate">{station.country}</div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-4 p-4 bg-base-200 rounded-lg">
          <img
            src={qrCodeUrl}
            alt="QR Code"
            className="w-32 h-32 rounded-lg bg-white p-1"
          />
          <span className="text-xs text-base-content/60 mt-2">{t('action.qrCode')}</span>
        </div>

        {/* Share options grid */}
        <div className="grid grid-cols-3 gap-2">
          {shareOptions.map((option, idx) => (
            <button
              key={idx}
              className={`btn btn-ghost flex-col h-auto py-3 gap-1 ${option.highlight ? 'btn-success' : ''}`}
              onClick={option.onClick}
            >
              <option.icon size={24} className={option.color || ''} />
              <span className="text-xs">{option.highlight ? '✓' : option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}

// Custom Discord icon
function DiscordIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

// Custom Google Chat icon
function GoogleChatIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.568 14.656c0 .86-.698 1.558-1.558 1.558H7.99c-.86 0-1.558-.698-1.558-1.558V9.344c0-.86.698-1.558 1.558-1.558h8.02c.86 0 1.558.698 1.558 1.558v5.312z"/>
    </svg>
  );
}
