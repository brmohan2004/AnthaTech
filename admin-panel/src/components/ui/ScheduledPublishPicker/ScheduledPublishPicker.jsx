import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, FileText, Info } from 'lucide-react';
import './ScheduledPublishPicker.css';

// ── Exported utility — used by table views too ────────────────────────────────
export function getCountdown(publishAt) {
  if (!publishAt) return null;
  const target = new Date(publishAt);
  const now    = new Date();
  const diff   = target - now;
  if (isNaN(diff)) return null;
  if (diff <= 0)   return 'Ready to publish';

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0)  return `Goes live in ${days}d ${hours}h`;
  if (hours > 0) return `Goes live in ${hours}h ${mins}m`;
  return `Goes live in ${mins} minute${mins !== 1 ? 's' : ''}`;
}

// ── Format publishAt ISO string from date + time parts ────────────────────────
export function buildPublishAt(date, time) {
  if (!date || !time) return null;
  return `${date}T${time}:00`;
}

// ── Today's date as yyyy-mm-dd (default min for date picker) ─────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScheduledPublishPicker({
  status        = 'Draft',
  scheduledDate = '',
  scheduledTime = '09:00',
  onChange,
}) {
  const [tick, setTick] = useState(0);

  // Refresh countdown every minute while scheduled
  useEffect(() => {
    if (status !== 'Scheduled') return;
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, [status]);

  const publishAt  = buildPublishAt(scheduledDate, scheduledTime);
  const countdown  = status === 'Scheduled' ? getCountdown(publishAt) : null;
  const isPast     = countdown === 'Ready to publish';

  function fire(patch) {
    onChange && onChange({ status, scheduledDate, scheduledTime, ...patch });
  }

  const OPTIONS = [
    { value: 'Published', icon: CheckCircle2, label: 'Published',  sub: 'Live immediately on save',     color: 'spp-green'  },
    { value: 'Draft',     icon: FileText,     label: 'Draft',      sub: 'Not visible to public',         color: 'spp-grey'   },
    { value: 'Scheduled', icon: Clock,        label: 'Scheduled 🕐', sub: 'Publish at a future date',   color: 'spp-blue'   },
  ];

  return (
    <div className="spp-wrap">
      <div className="spp-options">
        {OPTIONS.map(opt => {
          const Icon = opt.icon;
          const active = status === opt.value;
          return (
            <label
              key={opt.value}
              className={`spp-option ${active ? `spp-option-active ${opt.color}` : ''}`}
            >
              <input
                type="radio"
                name="spp-status"
                value={opt.value}
                checked={active}
                onChange={() => fire({ status: opt.value })}
                className="spp-radio"
              />
              <Icon size={15} className={`spp-opt-icon ${active ? opt.color : ''}`} />
              <span className="spp-opt-text">
                <span className="spp-opt-label">{opt.label}</span>
                <span className="spp-opt-sub">{opt.sub}</span>
              </span>
            </label>
          );
        })}
      </div>

      {status === 'Scheduled' && (
        <div className="spp-datetime-block">
          <div className="spp-field-row">
            <div className="spp-field">
              <label className="spp-field-label">
                <Calendar size={12} /> Publish date
              </label>
              <input
                type="date"
                className="spp-input"
                value={scheduledDate}
                min={todayStr()}
                onChange={e => fire({ scheduledDate: e.target.value })}
              />
            </div>
            <div className="spp-field">
              <label className="spp-field-label">
                <Clock size={12} /> Time (IST)
              </label>
              <input
                type="time"
                className="spp-input"
                value={scheduledTime}
                onChange={e => fire({ scheduledTime: e.target.value })}
              />
            </div>
          </div>

          {countdown && (
            <div className={`spp-countdown ${isPast ? 'spp-countdown-ready' : ''}`}>
              <Info size={13} />
              <span>{countdown}</span>
              {scheduledDate && scheduledTime && (
                <span className="spp-countdown-dt">
                  — {new Date(`${scheduledDate}T${scheduledTime}:00`).toLocaleString('en-IN', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: 'numeric', minute: '2-digit', hour12: true,
                  })}
                </span>
              )}
            </div>
          )}

          {!scheduledDate && (
            <div className="spp-hint">Pick a date and time above to schedule.</div>
          )}
        </div>
      )}
    </div>
  );
}
