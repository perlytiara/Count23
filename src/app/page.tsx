"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CountdownCircle, CountdownDisplay, TimeInput, useCountdown } from "@/features/countdown";
import {
  formatDateTimeWithZoneLabel,
  getLocalTimeZoneName,
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
  fromSharedLink: boolean;
  onPromoteToShareable: (proposal: ProposalState) => void;
}

function ProposalWorkspace({
  initialProposal,
  locale,
  showMilliseconds,
  fromSharedLink,
  onPromoteToShareable,
}: ProposalWorkspaceProps) {
  const { t } = useMemo(() => ({ t: getMessages(locale) }), [locale]);
  const [showEdit, setShowEdit] = useState(false);
  const { proposal, derived, appendPropose, appendConfirm, updateTitle } = useProposalState(initialProposal);

  const localTz = useMemo(() => getLocalTimeZoneName(), []);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const absolute = new URL(window.location.href);
    absolute.hash = formatProposalHash(proposal);
    return absolute.toString();
  }, [proposal]);

  const targetTime = derived.effectiveTimeUtc ? new Date(derived.effectiveTimeUtc) : null;
  const referenceStart = useMemo(() => {
    const latest = [...proposal.events].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).at(-1);
    return latest ? new Date(latest.createdAt).getTime() : Date.now();
  }, [proposal.events]);
  const totalDuration = targetTime ? Math.max(targetTime.getTime() - referenceStart, 1) : 0;
  const countdownState = useCountdown({ targetTime, totalDuration });

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

  if (!targetTime) return null;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="glass-card glow-blue w-full max-w-xl p-6 sm:p-10">
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
        />
      </div>

      <CountdownDisplay
        targetTime={targetTime}
        state={countdownState}
        totalDuration={totalDuration}
      />

      <div className="glass-card w-full max-w-2xl p-4">
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/20 bg-white/[0.08] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider ui-text-muted">{t.proposal.yourTime}</p>
            <p className="font-mono text-sm ui-text-strong">{formatDateTimeWithZoneLabel(targetTime, locale, localTz)}</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/[0.08] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider ui-text-muted">{t.proposal.originTime}</p>
            <p className="font-mono text-sm ui-text-strong">
              {formatDateTimeWithZoneLabel(targetTime, locale, proposal.baseTimeZone)}
            </p>
          </div>
        </div>

        <label className="mb-1 block text-[10px] uppercase tracking-wider ui-text-muted">{t.proposal.titleLabel}</label>
        <input
          value={proposal.title || ""}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder={t.proposal.titlePlaceholder}
          className="mb-3 w-full rounded-xl border border-white/20 bg-white/[0.08] px-3 py-2 text-sm ui-text-strong outline-none focus:border-blue-400"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEdit((prev) => !prev)}
            className="rounded-lg border border-white/20 bg-white/[0.08] px-3 py-2 text-xs font-semibold ui-text-body hover:bg-white/[0.14]"
          >
            {showEdit ? t.proposal.closeEditor : t.proposal.suggestEdit}
          </button>
          <button
            type="button"
            onClick={() => {
              onPromoteToShareable(proposal);
            }}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            {fromSharedLink ? t.proposal.updateLink : t.proposal.createButton}
          </button>
          <button
            type="button"
            onClick={() => appendConfirm(getUserTimeZone())}
            className="rounded-lg border border-white/20 bg-white/[0.08] px-3 py-2 text-xs font-semibold ui-text-body hover:bg-white/[0.14]"
          >
            {t.proposal.confirmTime}
          </button>
        </div>
      </div>

      {showEdit && (
        <div className="glass-card w-full p-4">
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

      <ShareBar
        shareUrl={shareUrl}
        copyLabel={t.proposal.copyLink}
        copiedLabel={t.proposal.copied}
        nativeShareLabel={t.proposal.shareNative}
      />

      <ProposalHistory
        title={t.proposal.history}
        showLabel={t.proposal.showHistory}
        hideLabel={t.proposal.hideHistory}
        items={historyItems}
      />
    </div>
  );
}

export default function HomePage() {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [proposalFromUrl, setProposalFromUrl] = useState<ProposalState | null>(null);
  const [localProposal, setLocalProposal] = useState<ProposalState | null>(null);
  const t = useMemo(() => getMessages(locale), [locale]);
  const { setTheme, settings, setShowMilliseconds } = useSettings();

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("count23_locale", l);
  }, []);

  useEffect(() => {
    const parse = () => {
      const parsed = parseProposalFromHash(window.location.hash);
      setProposalFromUrl(parsed);
      if (parsed) {
        setLocalProposal(null);
      }
    };
    setLocaleState(getInitialLocale());
    setMounted(true);
    parse();
    window.addEventListener("hashchange", parse);
    return () => window.removeEventListener("hashchange", parse);
  }, []);

  if (!mounted) return null;
  const activeProposal = proposalFromUrl ?? localProposal;

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
            activeProposal ? "justify-start pt-6" : "justify-center"
          }`}
        >
          {!activeProposal ? (
            <div className="glass-card glow-blue flex w-full max-w-lg flex-col items-center p-8 sm:p-10">
              <TimeInput
                onStart={(targetTime) => {
                  const created = createInitialProposalState({
                    proposedTimeUtc: targetTime.toISOString(),
                    actorTimeZone: getUserTimeZone(),
                  });
                  setLocalProposal(created);
                }}
              />
            </div>
          ) : (
            <ProposalWorkspace
              key={activeProposal.meetingId}
              initialProposal={activeProposal}
              locale={locale}
              showMilliseconds={settings.showMilliseconds}
              fromSharedLink={proposalFromUrl !== null}
              onPromoteToShareable={(proposal) => {
                window.history.replaceState(null, "", formatProposalHash(proposal));
                setProposalFromUrl(proposal);
                setLocalProposal(null);
              }}
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
