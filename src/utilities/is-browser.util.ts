export function isBrowserUtil(): boolean {
	return typeof window !== 'undefined' && !!window
}