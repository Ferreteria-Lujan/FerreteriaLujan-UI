// Íconos de trazo (stroke) para la navbar y la tabla
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
               strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const IconPlusCircle = () => (
  <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
)
export const IconReceipt = () => (
  <svg {...base}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
)
export const IconDocument = () => (
  <svg {...base}>
    <path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 12h5M10 16h5" />
  </svg>
)
export const IconPencil = () => (
  <svg {...base}><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19z" /><path d="M14.5 6.5l3 3" /></svg>
)
export const IconEye = () => (
  <svg {...base}><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
)
export const IconSearch = () => (
  <svg {...base}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></svg>
)
export const IconChevronLeft = () => <svg {...base}><path d="M15 5l-7 7 7 7" /></svg>
export const IconChevronRight = () => <svg {...base}><path d="M9 5l7 7-7 7" /></svg>
export const IconChevronDown = () => <svg {...base}><path d="M5 9l7 7 7-7" /></svg>
export const IconClipboard = () => (
  <svg {...base}>
    <rect x="6" y="5" width="12" height="16" rx="2" /><path d="M9 3h6v4H9z" /><path d="M9 12h6M9 16h6" />
  </svg>
)
export const IconTruck = () => (
  <svg {...base}>
    <path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" />
    <circle cx="7.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" />
  </svg>
)
export const IconBox = () => (
  <svg {...base}>
    <path d="M3 8l9-5 9 5v8l-9 5-9-5z" /><path d="M3 8l9 5 9-5M12 13v8" />
  </svg>
)
export const IconTransfer = () => (
  <svg {...base}><path d="M4 8h14l-3-3M20 16H6l3 3" /></svg>
)
export const IconCart = () => (
  <svg {...base}>
    <path d="M3 4h3l2.2 11h10l2-8H7" /><circle cx="9.5" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" />
  </svg>
)
export const IconTag = () => (
  <svg {...base}><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.3" /></svg>
)
