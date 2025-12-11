import React from 'react';

interface RefreshIconProps {
  onClick?: () => void;
  ariaLabel?: string;
}

// Elastic Team changed the icon look, to a new one, which we don't want. hence we use the old one.
export default function RefreshIcon({
  onClick,
  ariaLabel = 'Retry task',
}: RefreshIconProps) {
  return (
    <button
      className="euiButtonIcon css-wprskz-euiButtonIcon-xs-empty-primary"
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={16}
        viewBox="0 0 16 16"
        className="euiIcon euiButtonIcon__icon css-de5qxo-euiIcon-m-inherit"
        role="img"
        aria-hidden="true"
      >
        <path d="M11.228 2.942a.5.5 0 1 1-.538.842A5 5 0 1 0 13 8a.5.5 0 1 1 1 0 6 6 0 1 1-2.772-5.058ZM14 1.5v3A1.5 1.5 0 0 1 12.5 6h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 1 1 1 0Z" />
      </svg>
    </button>
  );
}
