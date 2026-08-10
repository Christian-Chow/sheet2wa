import type { SVGProps } from "react";

export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5 13.9 8l5.6 1.9-5.6 1.9L12 17.4 10.1 11.8 4.5 9.9l5.6-1.9L12 2.5Z" />
      <path d="M19.5 15.5 20.4 18l2.5.9-2.5.9-.9 2.5-.9-2.5L16 18.9l2.5-.9.9-2.5Z" />
    </svg>
  );
}

export function TableIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M9.5 4v16M15 4v16" strokeLinecap="round" />
    </svg>
  );
}

export function ClipboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="6" y="4.5" width="12" height="17" rx="2" />
      <path d="M9 4.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" strokeLinecap="round" />
      <path d="M9 12h6M9 16h6" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        d="M12 3.5 21.5 20h-19L12 3.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 10v4.5" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MessageCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        d="M12 3.5c-5 0-9 3.4-9 7.6 0 2.5 1.4 4.7 3.6 6.1-.1 1-.5 2.2-1.4 3.3 1.7-.2 3.2-.9 4.3-1.7.8.2 1.6.3 2.5.3 5 0 9-3.4 9-7.6s-4-7.6-9-7.6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
