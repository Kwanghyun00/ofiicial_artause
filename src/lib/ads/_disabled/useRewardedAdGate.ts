"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const GPT_SCRIPT_SRC = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
const GPT_SCRIPT_SELECTOR = 'script[data-rewarded-gpt="true"]';
const DEFAULT_OPT_IN_MESSAGE = "광고 시청 완료 시 응모가 가능합니다. 지금 시청하시겠습니까?";

type RewardedAdEvent = {
  slot: unknown;
  makeRewardedVisible?: () => void;
};

type RewardedSlot = {
  addService: (service: unknown) => void;
};

type PubAdsService = {
  addEventListener: (eventName: string, listener: (event: RewardedAdEvent) => void) => void;
  removeEventListener?: (eventName: string, listener: (event: RewardedAdEvent) => void) => void;
};

type GoogletagLike = {
  cmd: Array<() => void>;
  apiReady?: boolean;
  enums?: { OutOfPageFormat?: { REWARDED?: unknown } };
  pubads: () => PubAdsService;
  defineOutOfPageSlot: (adUnitPath: string, outOfPageFormat: unknown) => RewardedSlot | null;
  display: (slot: RewardedSlot) => void;
  destroySlots: (slots?: RewardedSlot[]) => boolean;
  enableServices: () => void;
};

declare global {
  interface Window {
    googletag?: GoogletagLike;
    __rewardedGptLoaderPromise?: Promise<void>;
    __rewardedGptServicesEnabled?: boolean;
  }
}

export type RewardedAdStatus = "idle" | "loading" | "ready" | "showing" | "granted" | "closed" | "error";

type UseRewardedAdGateOptions = {
  adUnitPath?: string;
  optInMessage?: string;
};

type UseRewardedAdGateResult = {
  status: RewardedAdStatus;
  isWatching: boolean;
  rewardGranted: boolean;
  adSessionId: string;
  error: string | null;
  watchAd: () => Promise<boolean>;
  resetReward: () => void;
};

function ensureGoogletag(): GoogletagLike {
  if (!window.googletag) {
    window.googletag = { cmd: [] } as unknown as GoogletagLike;
  }

  if (!Array.isArray(window.googletag.cmd)) {
    window.googletag.cmd = [];
  }

  return window.googletag;
}

function loadGptScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("보상형 광고는 브라우저에서만 사용할 수 있습니다."));
  }

  if (window.__rewardedGptLoaderPromise) {
    return window.__rewardedGptLoaderPromise;
  }

  window.__rewardedGptLoaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(GPT_SCRIPT_SELECTOR);

    if (existingScript) {
      if (existingScript.dataset.loaded === "true" || window.googletag?.apiReady) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => {
          window.__rewardedGptLoaderPromise = undefined;
          reject(new Error("광고 스크립트를 불러오지 못했습니다."));
        },
        { once: true },
      );
      return;
    }

    ensureGoogletag();

    const script = document.createElement("script");
    script.async = true;
    script.src = GPT_SCRIPT_SRC;
    script.crossOrigin = "anonymous";
    script.dataset.rewardedGpt = "true";
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => {
        window.__rewardedGptLoaderPromise = undefined;
        reject(new Error("광고 스크립트를 불러오지 못했습니다."));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return window.__rewardedGptLoaderPromise;
}

function createAdSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `rw_${crypto.randomUUID()}`;
  }

  return `rw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function useRewardedAdGate({
  adUnitPath = "",
  optInMessage = DEFAULT_OPT_IN_MESSAGE,
}: UseRewardedAdGateOptions): UseRewardedAdGateResult {
  const [status, setStatus] = useState<RewardedAdStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [adSessionId, setAdSessionId] = useState("");

  const isWatchingRef = useRef(false);
  const rewardGrantedRef = useRef(false);
  const slotRef = useRef<RewardedSlot | null>(null);
  const hasAdUnitPath = adUnitPath.trim().length > 0;

  const cleanupSlot = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const googletag = window.googletag;
    if (!googletag || !slotRef.current) {
      return;
    }

    try {
      googletag.destroySlots([slotRef.current]);
    } catch {
      // ignore cleanup error
    } finally {
      slotRef.current = null;
    }
  }, []);

  const resetReward = useCallback(() => {
    cleanupSlot();
    rewardGrantedRef.current = false;
    setRewardGranted(false);
    setAdSessionId("");
    setError(null);
    setStatus("idle");
  }, [cleanupSlot]);

  useEffect(() => {
    return () => {
      cleanupSlot();
    };
  }, [cleanupSlot]);

  const watchAd = useCallback(async () => {
    if (!hasAdUnitPath) {
      setStatus("error");
      setError("보상형 광고 유닛 경로가 설정되지 않았습니다.");
      return false;
    }

    if (isWatchingRef.current) {
      return false;
    }

    isWatchingRef.current = true;
    rewardGrantedRef.current = false;
    setRewardGranted(false);
    setAdSessionId("");
    setError(null);
    setStatus("loading");
    cleanupSlot();

    try {
      await loadGptScript();
      const googletag = ensureGoogletag();

      if (!window.__rewardedGptServicesEnabled) {
        googletag.cmd.push(() => {
          if (!window.__rewardedGptServicesEnabled) {
            googletag.enableServices();
            window.__rewardedGptServicesEnabled = true;
          }
        });
      }

      const granted = await new Promise<boolean>((resolve) => {
        let settled = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let readyListener: (event: RewardedAdEvent) => void = () => {};
        let grantedListener: (event: RewardedAdEvent) => void = () => {};
        let closedListener: (event: RewardedAdEvent) => void = () => {};

        const finish = (result: boolean, nextStatus: RewardedAdStatus) => {
          if (settled) {
            return;
          }
          settled = true;

          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          const pubads = googletag.pubads();
          pubads.removeEventListener?.("rewardedSlotReady", readyListener);
          pubads.removeEventListener?.("rewardedSlotGranted", grantedListener);
          pubads.removeEventListener?.("rewardedSlotClosed", closedListener);

          cleanupSlot();
          setStatus(nextStatus);
          resolve(result);
        };

        timeoutId = setTimeout(() => {
          setError("광고 로딩이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.");
          finish(false, "error");
        }, 60000);

        googletag.cmd.push(() => {
          const rewardedFormat = googletag.enums?.OutOfPageFormat?.REWARDED;
          if (!rewardedFormat) {
            setError("보상형 광고 형식을 사용할 수 없습니다.");
            finish(false, "error");
            return;
          }

          const slot = googletag.defineOutOfPageSlot(adUnitPath, rewardedFormat);
          if (!slot) {
            setError("현재 환경에서는 보상형 광고를 지원하지 않습니다.");
            finish(false, "error");
            return;
          }

          slotRef.current = slot;
          const pubads = googletag.pubads();

          readyListener = (event) => {
            if (event.slot !== slot) {
              return;
            }

            setStatus("ready");
            const approved = window.confirm(optInMessage);
            if (!approved) {
              finish(false, "closed");
              return;
            }

            if (typeof event.makeRewardedVisible !== "function") {
              setError("광고를 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.");
              finish(false, "error");
              return;
            }

            setStatus("showing");
            event.makeRewardedVisible();
          };

          grantedListener = (event) => {
            if (event.slot !== slot) {
              return;
            }

            rewardGrantedRef.current = true;
            setRewardGranted(true);
            setAdSessionId(createAdSessionId());
            setStatus("granted");
          };

          closedListener = (event) => {
            if (event.slot !== slot) {
              return;
            }

            finish(rewardGrantedRef.current, rewardGrantedRef.current ? "granted" : "closed");
          };

          pubads.addEventListener("rewardedSlotReady", readyListener);
          pubads.addEventListener("rewardedSlotGranted", grantedListener);
          pubads.addEventListener("rewardedSlotClosed", closedListener);

          slot.addService(pubads);
          googletag.display(slot);
        });
      });

      return granted;
    } catch (adError) {
      const message =
        adError instanceof Error ? adError.message : "보상형 광고를 준비하는 중 문제가 발생했습니다.";
      setError(message);
      setStatus("error");
      return false;
    } finally {
      isWatchingRef.current = false;
    }
  }, [adUnitPath, cleanupSlot, hasAdUnitPath, optInMessage]);

  return useMemo(
    () => ({
      status,
      isWatching: isWatchingRef.current,
      rewardGranted,
      adSessionId,
      error,
      watchAd,
      resetReward,
    }),
    [adSessionId, error, resetReward, rewardGranted, status, watchAd],
  );
}
