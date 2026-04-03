import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Term } from "./models";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function termIsSpring(term: Term) {
	// if start date is before June, it's a spring term (true), otherwise it's a fall term (false)
	const month = new Date(term.starts_at).getMonth();
	return month < 6;
}