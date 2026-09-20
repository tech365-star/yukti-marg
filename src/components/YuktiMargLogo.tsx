import React from 'react';

interface YuktiMargLogoProps {
  className?: string;
  size?: number | string;
  useImage?: boolean;
}

export const YuktiMargLogo: React.FC<YuktiMargLogoProps> = ({
  className = 'w-14 h-14',
  size,
  useImage = false,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const style = size ? { width: size, height: size } : undefined;

  if (useImage && !imgError) {
    return (
      <img
        src="/yukti_marg_logo.jpg"
        alt="Yukti Marg Official Emblem"
        className={`rounded-full object-contain ${className}`}
        style={style}
        onError={() => setImgError(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-full flex-shrink-0 ${className}`}
      style={style}
      aria-label="Yukti Marg Official Emblem"
    >
      {/* Outer White Background */}
      <circle cx="250" cy="250" r="248" fill="#ffffff" />

      {/* Outer Golden Border Ring */}
      <circle
        cx="250"
        cy="250"
        r="230"
        stroke="#c98e1f"
        strokeWidth="16"
        fill="none"
      />

      {/* --- WHEAT / LAUREL WREATH (LEFT & RIGHT) --- */}
      {/* Left Stalk & Grains */}
      <g fill="#c98e1f">
        <path
          d="M125 365 C100 340 75 300 70 250 C65 195 85 140 128 100"
          stroke="#c98e1f"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Left alternating wheat grains */}
        <path d="M125 102 C110 94 92 104 98 122 C104 134 122 128 130 112 Z" />
        <path d="M148 120 C130 115 114 128 122 144 C128 154 144 148 152 130 Z" />
        <path d="M106 130 C90 125 76 138 82 154 C88 166 104 160 112 144 Z" />
        <path d="M130 156 C114 152 98 166 106 182 C112 192 128 186 134 168 Z" />
        <path d="M90 172 C76 168 62 184 70 200 C76 212 92 206 98 190 Z" />
        <path d="M116 200 C100 196 86 212 94 228 C100 238 116 232 120 214 Z" />
        <path d="M82 222 C70 220 58 236 66 252 C72 264 88 258 92 240 Z" />
        <path d="M110 248 C96 246 84 264 92 280 C98 290 112 284 116 266 Z" />
        <path d="M82 274 C72 274 62 292 72 306 C80 316 94 310 98 292 Z" />
        <path d="M112 298 C100 298 90 316 100 330 C108 338 122 332 124 314 Z" />
        <path d="M94 330 C86 332 80 348 92 360 C100 368 112 360 114 346 Z" />
        <path d="M125 348 C116 352 110 368 122 378 C130 384 142 374 140 358 Z" />
      </g>

      {/* Right Stalk & Grains (Mirrored) */}
      <g fill="#c98e1f">
        <path
          d="M375 365 C400 340 425 300 430 250 C435 195 415 140 372 100"
          stroke="#c98e1f"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Right alternating wheat grains */}
        <path d="M375 102 C390 94 408 104 402 122 C396 134 378 128 370 112 Z" />
        <path d="M352 120 C370 115 386 128 378 144 C372 154 356 148 348 130 Z" />
        <path d="M394 130 C410 125 424 138 418 154 C412 166 396 160 388 144 Z" />
        <path d="M370 156 C386 152 402 166 394 182 C388 192 372 186 366 168 Z" />
        <path d="M410 172 C424 168 438 184 430 200 C424 212 408 206 402 190 Z" />
        <path d="M384 200 C400 196 414 212 406 228 C400 238 384 232 380 214 Z" />
        <path d="M418 222 C430 220 442 236 434 252 C428 264 412 258 408 240 Z" />
        <path d="M390 248 C404 246 416 264 408 280 C402 290 388 284 384 266 Z" />
        <path d="M418 274 C428 274 438 292 428 306 C420 316 406 310 402 292 Z" />
        <path d="M388 298 C400 298 410 316 400 330 C392 338 378 332 376 314 Z" />
        <path d="M406 330 C414 332 420 348 408 360 C400 368 388 360 386 346 Z" />
        <path d="M375 348 C384 352 390 368 378 378 C370 384 358 374 360 358 Z" />
      </g>

      {/* --- RISING SUN --- */}
      {/* Sun Rays */}
      <g fill="#f59e0b">
        {/* 11 radiating sunbeams */}
        <rect x="245" y="100" width="10" height="42" rx="5" />
        <rect x="210" y="108" width="9" height="38" rx="4.5" transform="rotate(-18 214 127)" />
        <rect x="281" y="108" width="9" height="38" rx="4.5" transform="rotate(18 286 127)" />
        <rect x="178" y="126" width="9" height="36" rx="4.5" transform="rotate(-36 182 144)" />
        <rect x="313" y="126" width="9" height="36" rx="4.5" transform="rotate(36 318 144)" />
        <rect x="154" y="156" width="9" height="34" rx="4.5" transform="rotate(-54 158 173)" />
        <rect x="337" y="156" width="9" height="34" rx="4.5" transform="rotate(54 342 173)" />
        <rect x="136" y="196" width="9" height="32" rx="4.5" transform="rotate(-72 140 212)" />
        <rect x="355" y="196" width="9" height="32" rx="4.5" transform="rotate(72 360 212)" />
      </g>

      {/* Semicircular Sun Disk */}
      <path
        d="M188 215 A 62 62 0 0 1 312 215 Z"
        fill="#f59e0b"
      />

      {/* --- OPEN BOOK & HIGHWAY ROAD ARROW --- */}
      {/* Highway Body and Arrow Head in Deep Emerald */}
      <g fill="#064e3b">
        {/* Arrow Point Head */}
        <polygon points="250,178 274,202 260,202 260,210 240,210 240,202 226,202" />
        {/* Highway shaft widening downward with perspective */}
        <polygon points="240,202 260,202 298,280 202,280" />
        {/* Lower Road Trunk */}
        <polygon points="202,280 298,280 278,335 222,335" />
      </g>

      {/* Road Dashed Center Median Marking (White) */}
      <line
        x1="250"
        y1="208"
        x2="250"
        y2="330"
        stroke="#ffffff"
        strokeWidth="5"
        strokeDasharray="14 10"
        strokeLinecap="round"
      />

      {/* Open Book Wings in Deep Emerald with White Page Separators */}
      <g fill="#064e3b">
        {/* Left Book Wing Main Body */}
        <path
          d="M250 355 C220 352 165 338 128 326 C124 324 120 330 124 336 C155 358 215 365 244 365 C248 365 250 358 250 355 Z"
        />
        <path
          d="M245 342 C212 340 160 326 128 312 C124 310 120 316 124 322 C155 342 212 353 244 353 Z"
        />
        <path
          d="M235 326 C202 324 155 308 128 294 C124 292 118 298 124 304 C150 322 202 336 235 336 Z"
        />
        <path
          d="M225 300 C196 295 152 280 134 268 C128 264 122 272 126 278 C150 296 195 312 225 314 Z"
        />

        {/* Right Book Wing Main Body */}
        <path
          d="M250 355 C280 352 335 338 372 326 C376 324 380 330 376 336 C345 358 285 365 256 365 C252 365 250 358 250 355 Z"
        />
        <path
          d="M255 342 C288 340 340 326 372 312 C376 310 380 316 376 322 C345 342 288 353 256 353 Z"
        />
        <path
          d="M265 326 C298 324 345 308 372 294 C376 292 382 298 376 304 C350 322 298 336 265 336 Z"
        />
        <path
          d="M275 300 C304 295 348 280 366 268 C372 264 378 272 374 278 C350 296 305 312 275 314 Z"
        />

        {/* Center Spine Link */}
        <path
          d="M242 355 C246 362 254 362 258 355 L255 363 C253 366 247 366 245 363 Z"
        />
      </g>

      {/* --- TRICOLOR SWOOSH & GOLD ACCENTS --- */}
      {/* Left Golden Accent Line */}
      <line
        x1="110"
        y1="388"
        x2="196"
        y2="388"
        stroke="#c98e1f"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Saffron Ribbon Curve */}
      <path
        d="M202 396 C225 376 272 374 295 382 C285 385 240 384 216 394 Z"
        fill="#ff671f"
      />

      {/* Green Ribbon Curve */}
      <path
        d="M204 410 C228 410 270 398 290 390 C272 398 235 402 214 402 Z"
        fill="#046a38"
      />

      {/* Right Golden Accent Line */}
      <line
        x1="304"
        y1="388"
        x2="390"
        y2="388"
        stroke="#c98e1f"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
};
