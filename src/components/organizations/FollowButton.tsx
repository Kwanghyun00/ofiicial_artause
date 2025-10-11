"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "artause.followedOrganizations";
const STORAGE_EVENT = "artause:follow:update";

function readFollowedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((value): value is string => typeof value === "string"));
    }
  } catch (error) {
    console.warn("Failed to parse followed organization ids", error);
  }
  return new Set();
}

function writeFollowedIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(Array.from(ids));
  window.localStorage.setItem(STORAGE_KEY, payload);
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

type FollowButtonProps = {
  organizationId: string;
  initialFollowerCount?: number;
  size?: "sm" | "md";
};

export function FollowButton({ organizationId, initialFollowerCount = 0, size = "md" }: FollowButtonProps) {
  const [isFollowed, setIsFollowed] = useState(false);
  const [displayCount, setDisplayCount] = useState(initialFollowerCount);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateFromStorage = () => {
      const ids = readFollowedIds();
      setIsFollowed(ids.has(organizationId));
      setDisplayCount(initialFollowerCount + (ids.has(organizationId) ? 1 : 0));
    };

    updateFromStorage();
    window.addEventListener("storage", updateFromStorage);
    window.addEventListener(STORAGE_EVENT, updateFromStorage);
    return () => {
      window.removeEventListener("storage", updateFromStorage);
      window.removeEventListener(STORAGE_EVENT, updateFromStorage);
    };
  }, [organizationId, initialFollowerCount]);

  const toggleFollow = () => {
    const ids = readFollowedIds();
    if (ids.has(organizationId)) {
      ids.delete(organizationId);
    } else {
      ids.add(organizationId);
    }
    writeFollowedIds(ids);
    const nextFollowed = ids.has(organizationId);
    setIsFollowed(nextFollowed);
    setDisplayCount(initialFollowerCount + (nextFollowed ? 1 : 0));
  };

  const baseClass =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
  const sizeClass = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2";
  const stateClass = isFollowed
    ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
    : "border-slate-300 bg-white text-slate-700 hover:border-indigo-500 hover:text-indigo-600";

  const countClass = isFollowed ? "text-white/80" : "text-slate-500";

  return (
    <button
      type="button"
      onClick={toggleFollow}
      data-followed={isFollowed}
      aria-pressed={isFollowed}
      className={`${baseClass} ${sizeClass} ${stateClass}`}
    >
      <span>{isFollowed ? "팔로잉" : "팔로우"}</span>
      <span className={`text-xs font-normal md:text-sm ${countClass}`} aria-hidden>{displayCount.toLocaleString()}</span>
    </button>
  );
}
