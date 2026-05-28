"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CountdownCircle, TimeInput, useCountdown } from "@/features/countdown";
import {
  formatDateTimeWithZoneLabel,
  formatTargetDisplay,
  formatTimeZoneLabel,
  getLocalTimeZoneName,
  isSameTimeZone,
} from "@/features/countdown/utils/time";
import { LocaleContext, getMessages, type Locale } from "@/features/i18n";
import { SettingsPanel, useSettings } from "@/features/settings";
import {
  ProposalComposer,
  ProposalHistory,
  ShareBar,
  createInitialProposalState,
  formatProposalHash,
  getUserTimeZone,
  parseProposalFromHash,
  useProposalState,
  type ProposalState,
} from "@/features/proposal";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("count23_locale");
  if (saved === "fr" || saved === "en") return saved;
  return navigator.language.startsWith("fr") ? "fr" : "en";
}

interface ProposalWorkspaceProps {
  initialProposal: ProposalState;
  locale: Locale;
  showMilliseconds: boolean;
}

function ProposalWorkspace({ initialProposal, locale, showMilliseconds }: ProposalWorkspaceProps) {
  const { t } = useMemo(() => ({ t: getMessages(locale) }), [locale]);
  const [showEdit, setShowEdit] = useState(false);
  const [showTitle, setShowTitle] = useState(Boolean(initialProposal.title));
  const { proposal, derived, appendPropose, appendConfirm, updateTitle } = useProposalState(initialProposal);

  const localTz = useMemo(() => getLocalTimeZoneName(), []);
  const sameZoneAsOrganizer = isSameTimeZone(localTz, proposal.baseTimeZone);
  const organizerZoneLabel = useMemo(
    () => formatTimeZoneLabel(proposal.baseTimeZone, locale),
    [proposal.baseTimeZone, locale],
  );

  useEffect(() => {
    window.history.replaceState(null, "", formatProposalHash(proposal));
  }, [proposal]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const absolute = new URL(window.location.href);
    absolute.hash = formatProposalHash(proposal);
    return absolute.toString();
  }, [proposal]);

  const targetTime = derived.effectiveTimeUtc ? new Date(derived.effectiveTimeUtc) : null;
  const referenceStart = useMemo(() => {
    const latest = [...proposal.events]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .at(-1);
    return latest ? new Date(latest.createdAt).getTime() : Date.now();
  }, [proposal.events]);
  const totalDuration = targetTime ? Math.max(targetTime.getTime() - referenceStart, 1) : 0;
  const countdownState = useCountdown({ targetTime, totalDuration });
  const progressPercent = Math.round(countdownState.progress * 100);

  const historyItems = useMemo(
    () =>
      [...proposal.events]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((event) => ({
          id: event.id,
          action: event.type === "confirm" ? t.proposal.historyConfirm : t.proposal.historyPropose,
          byline: `${event.actorLabel || t.proposal.someone} · ${event.actorTimeZone}`,
          proposedLocal: formatDateTimeWithZoneLabel(new Date(event.proposedTimeUtc), locale, localTz),
          at: formatDateTimeWithZoneLabel(new Date(event.createdAt), locale, localTz),
        })),
    [proposal.events, t, locale, localTz],
  );

  const showHistory = proposal.events.length > 1;

  if (!targetTime) return null;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <div className="glass-card glow-blue w-full p-5 sm:p-8">
        {proposal.title && (
          <p className="mb-3 text-center text-sm font-medium ui-text-strong">{proposal.title}</p>
        )}

        <CountdownCircle
          state={countdownState}
          labels={{
            day: t.timer.day,
            days: t.timer.days,
            hours: t.timer.hours,
            minutes: t.timer.minutes,
            seconds: t.timer.seconds,
          }}
          showMilliseconds={showMilliseconds}
          progressPercent={progressPercent}
          targetLabel={t.timer.targetLabel}
          targetDisplay={formatTargetDisplay(targetTime, locale)}
        />
      </div>

      {!sameZoneAsOrganizer && (
        <div className="w-full max-w-md space-y-1 px-1 text-center text-xs">
          <p className="ui-text-body">
            <span className="ui-text-muted">{t.proposal.yourTime}: </span>
            <span className="font-mono">{formatDateTimeWithZoneLabel(targetTime, locale, localTz)}</span>
          </p>
          <p className="ui-text-muted">
            {t.proposal.organizerTime} ({organizerZoneLabel}):{" "}
            <span className="font-mono ui-text-body">
              {formatDateTimeWithZoneLabel(targetTime, locale, proposal.baseTimeZone)}
            </span>
          </p>
        </div>
      )}

      <ShareBar
        shareUrl={shareUrl}
        copyLabel={t.proposal.copyLink}
        copiedLabel={t.proposal.copied}
        nativeShareLabel={t.proposal.shareNative}
      />

      <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-2">
        {!showTitle && !proposal.title && (
          <button
            type="button"
            onClick={() => setShowTitle(true)}
            className="text-xs ui-text-muted transition-colors hover:ui-text-body"
          >
            {t.proposal.addTitle}
          </button>
        )}
        {(showTitle || proposal.title) && (
          <input
            value={proposal.title || ""}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder={t.proposal.titlePlaceholder}
            className="w-full max-w-xs rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-xs ui-text-strong outline-none placeholder:ui-text-dim focus:border-blue-400/60"
          />
        )}
        <button
          type="button"
          onClick={() => setShowEdit((prev) => !prev)}
          className="text-xs ui-text-muted transition-colors hover:ui-text-body"
        >
          {showEdit ? t.proposal.closeEditor : t.proposal.suggestEdit}
        </button>
        {derived.hasPendingSuggestion && (
          <button
            type="button"
            onClick={() => appendConfirm(getUserTimeZone())}
            className="rounded-lg bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            {t.proposal.confirmTime}
          </button>
        )}
      </div>

      {showEdit && (
        <div className="glass-card w-full max-w-md p-4">
          <ProposalComposer
            titleLabel={t.proposal.titleLabel}
            titlePlaceholder={t.proposal.titlePlaceholder}
            actorLabelText={t.proposal.actorLabel}
            actorPlaceholder={t.proposal.actorPlaceholder}
            timeLabel={t.proposal.timeLabel}
            submitLabel={t.proposal.sendSuggestion}
            futureErrorLabel={t.timer.errorPast}
            initialTitle={proposal.title}
            initialTarget={targetTime}
            onSubmit={({ title, actorLabel, targetTime: nextTarget }) => {
              appendPropose(nextTarget.toISOString(), getUserTimeZone(), actorLabel);
              if (title !== proposal.title) {
                updateTitle(title || "");
              }
              setShowEdit(false);
            }}
          />
        </div>
      )}

      {showHistory && (
        <ProposalHistory
          title={t.proposal.history}
          showLabel={t.proposal.showHistory}
          hideLabel={t.proposal.hideHistory}
          items={historyItems}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [proposalFromUrl, setProposalFromUrl] = useState<ProposalState | null>(null);
  const t = useMemo(() => getMessages(locale), [locale]);
  const { setTheme, settings, setShowMilliseconds } = useSettings();

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("count23_locale", l);
  }, []);

  useEffect(() => {
    const parse = () => {
      setProposalFromUrl(parseProposalFromHash(window.location.hash));
    };
    setLocaleState(getInitialLocale());
    setMounted(true);
    parse();
    window.addEventListener("hashchange", parse);
    return () => window.removeEventListener("hashchange", parse);
  }, []);

  if (!mounted) return null;

  return (
    <LocaleContext value={{ locale, setLocale, t }}>
      <div className="flex min-h-dvh min-h-[100dvh] flex-col overflow-x-hidden touch-pan-y">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4 shrink-0">
          <h1 className="text-lg font-bold text-gradient sm:text-xl md:text-2xl">Count23</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.08] px-3 py-1.5 text-xs font-medium ui-text-strong hover:bg-white/[0.14]"
            >
              <span className="ui-ios-icon text-[11px]">⚙</span>
              {t.settings.open}
            </button>
            <LocaleSwitcher />
          </div>
        </header>

        <main
          className={`mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-8 ${
            proposalFromUrl ? "justify-start pt-6" : "justify-center"
          }`}
        >
          {!proposalFromUrl ? (
            <div className="glass-card glow-blue flex w-full max-w-lg flex-col items-center p-8 sm:p-10">
              <TimeInput
                onStart={(targetTime) => {
                  const created = createInitialProposalState({
                    proposedTimeUtc: targetTime.toISOString(),
                    actorTimeZone: getUserTimeZone(),
                  });
                  window.history.replaceState(null, "", formatProposalHash(created));
                  setProposalFromUrl(created);
                }}
              />
            </div>
          ) : (
            <ProposalWorkspace
              key={proposalFromUrl.meetingId}
              initialProposal={proposalFromUrl}
              locale={locale}
              showMilliseconds={settings.showMilliseconds}
            />
          )}
        </main>

        <footer className="pb-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-[10px] text-slate-600 shrink-0">
          Count23 &middot; {new Date().getFullYear()}
        </footer>

        <SettingsPanel
          open={showSettings}
          settings={settings}
          labels={{
            title: t.settings.title,
            close: t.settings.close,
            theme: t.settings.theme,
            showMilliseconds: t.settings.showMilliseconds,
            themes: {
              midnight: t.settings.themeMidnight,
              ocean: t.settings.themeOcean,
              sunset: t.settings.themeSunset,
              forest: t.settings.themeForest,
            },
          }}
          onClose={() => setShowSettings(false)}
          onThemeChange={setTheme}
          onShowMillisecondsChange={setShowMilliseconds}
        />
      </div>
    </LocaleContext>
  );
}
