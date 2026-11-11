/** Decorative nursing workbook used on the welcome screens. */
export function StudyNotebook({className}:{className?:string}){
 return <svg className={className} viewBox="0 0 244 192" fill="none" aria-hidden="true" focusable="false">
  <ellipse cx="127" cy="166" rx="72" ry="9" fill="var(--notebook-shadow)"/>
  <path d="M44 39v18m-9-9h18m145 62v20m-10-10h20M200 30v12m-6-6h12" stroke="var(--notebook-accent)" strokeWidth="2.5" strokeLinecap="round"/>
  <circle cx="38" cy="122" r="3" fill="var(--notebook-accent)"/>
  <circle cx="214" cy="78" r="3.5" fill="var(--notebook-accent)"/>
  <g transform="rotate(-10 119 98)" stroke="var(--notebook-outline)" strokeWidth="2">
   <path d="M166 40h15a4 4 0 0 1 4 4v15h-19m0 7h15a4 4 0 0 1 4 4v15h-19" fill="var(--notebook-accent)"/>
   <rect x="65" y="32" width="107" height="130" rx="12" fill="var(--notebook-accent)"/>
   <rect x="63" y="26" width="106" height="130" rx="12" fill="var(--notebook-sheet)"/>
   <path d="M81 28v126m10-99h63m-63 75h63m-63 8h43" strokeOpacity=".32"/>
   <path d="M63 47h10m-10 25h10m-10 25h10m-10 25h10m-10 25h10" strokeLinecap="round"/>
   <path d="M120 111s-23-12-23-25c0-12 15-15 23-5 8-10 23-7 23 5 0 13-23 25-23 25Z" fill="var(--notebook-accent)"/>
   <path d="M96 93h14l4-6 5 12 5-10 3 4h17" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
  <path d="M166 111c1 19 18 17 19 1l1-9m-20 8-1-8m9 23v13a12 12 0 0 0 24 0v-4" stroke="var(--notebook-outline)" strokeWidth="2.5" strokeLinecap="round"/>
  <circle cx="198" cy="131" r="4" fill="var(--notebook-sheet)" stroke="var(--notebook-outline)" strokeWidth="2"/>
 </svg>;
}
