import React from 'react';
import { Bell, Tag, ShieldCheck, MessageCircle, X } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'offer':
        return <Tag className="w-4 h-4 text-brand-emerald" />;
      case 'price_drop':
        return <Tag className="w-4 h-4 text-brand-amber" />;
      case 'chat':
        return <MessageCircle className="w-4 h-4 text-blue-400" />;
      case 'system':
      default:
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-sm h-full bg-dark-card border-l border-dark-border shadow-2xl flex flex-col justify-between"
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between p-4 border-b border-dark-border">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-emerald/10 text-brand-emerald">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-dark-text text-base">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-brand-amber/20 text-brand-amber border border-brand-amber/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-brand-emerald hover:underline font-semibold"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-dark-muted hover:text-dark-text rounded-lg hover:bg-dark-cardElevated transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-dark-border max-h-[calc(100vh-80px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-dark-muted">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectNotification?.(item)}
                  className={`p-4 flex gap-3 cursor-pointer hover:bg-dark-cardElevated/60 transition-colors ${
                    !item.isRead ? 'bg-brand-emerald/5' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-dark-cardElevated shrink-0 h-fit mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="text-sm font-semibold text-dark-text truncate">{item.title}</h4>
                      <span className="text-[10px] text-dark-muted shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-dark-muted line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-dark-cardElevated/40 border-t border-dark-border text-center">
          <p className="text-[11px] text-dark-muted">
            Instant alerts on verified price drops & seller offers
          </p>
        </div>
      </div>
    </div>
  );
};

