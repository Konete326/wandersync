export default function Loader({ text = '', size = 'md' }) {
  const scale = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-125' : 'scale-100';

  return (
    <div className="car-loader-wrapper p-4">
      <div className={`car-loader ${scale}`}>
        <svg
          className="car-loader-svg"
          width="120"
          height="80"
          viewBox="0 0 120 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path className="road" d="M8 64H112" />

          <g className="road-lines">
            <path d="M10 64H28" />
            <path d="M38 64H56" />
            <path d="M66 64H84" />
            <path d="M94 64H110" />
          </g>

          <g className="car">
            <path
              className="car-body"
              d="M24 52L29 36C30 33 32 31 35 31H69C72 31 75 33 77 36L84 52H91C94 52 96 54 96 57V60H20V57C20 54 22 52 24 52Z"
            />

            <path
              className="window"
              d="M36 34H49V45H31L34 36C34.5 34.8 35 34 36 34Z"
            />

            <path
              className="window"
              d="M52 34H68C70 34 71 35 72 37L76 45H52V34Z"
            />

            <rect className="light" x="84" y="48" width="6" height="4" rx="1" />

            <g className="wheel wheel-left">
              <circle cx="34" cy="57" r="7" />
              <circle className="hub" cx="34" cy="57" r="2.5" />
            </g>

            <g className="wheel wheel-right">
              <circle cx="78" cy="57" r="7" />
              <circle className="hub" cx="78" cy="57" r="2.5" />
            </g>
          </g>

          <g className="speed-lines">
            <path d="M8 36H20" />
            <path d="M4 44H16" />
            <path d="M10 52H18" />
          </g>
        </svg>
      </div>
      {text ? (
        <p className="text-xs sm:text-sm font-medium text-muted-foreground animate-pulse tracking-wide font-heading">
          {text}
        </p>
      ) : null}
    </div>
  );
}
