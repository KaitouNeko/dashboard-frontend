import React from 'react';

const Logo = () => {
  return (
    <svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
      {/* <!-- 漸變背景 --> */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a6fa5" />
          <stop offset="100%" stopColor="#23395d" />
        </linearGradient>

        {/* <!-- 雲朵漸變 --> */}
        <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0e6f0" />
        </linearGradient>

        {/* <!-- AI圖案漸變 --> */}
        <linearGradient
          id="circuitGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#54c8ff" />
          <stop offset="100%" stopColor="#2196f3" />
        </linearGradient>
      </defs>

      {/* <!-- 背景 --> */}
      <rect
        x="0"
        y="0"
        width="500"
        height="300"
        rx="20"
        fill="url(#bgGradient)"
      />

      {/* <!-- 雲朵形狀 --> */}
      <path
        d="M170,140 Q150,110 175,105 Q185,85 210,90 Q220,70 250,75 Q280,60 300,80 Q330,75 340,95 Q360,90 370,110 Q380,125 365,140 Q375,160 350,170 Q335,195 305,180 Q285,195 255,180 Q225,190 205,170 Q175,175 170,140"
        fill="url(#cloudGradient)"
      />

      {/* <!-- AI元素 - 電路圖案 --> */}
      <g stroke="url(#circuitGradient)" strokeWidth="2.5" fill="none">
        <path d="M190,130 L240,130 L240,150 L290,150" />
        <path d="M300,90 L300,160 L330,160" />
        <path d="M220,100 L220,130" />
        <path d="M280,130 L280,170" />
        <path d="M260,110 L260,170" />
        <circle cx="240" cy="130" r="5" fill="#54c8ff" />
        <circle cx="280" cy="150" r="5" fill="#54c8ff" />
        <circle cx="300" cy="160" r="5" fill="#54c8ff" />
        <circle cx="220" cy="130" r="5" fill="#54c8ff" />
        <circle cx="260" cy="170" r="5" fill="#54c8ff" />
      </g>

      {/* <!-- 數據點 --> */}
      <g fill="#54c8ff">
        <circle cx="200" cy="120" r="2" />
        <circle cx="230" cy="115" r="2" />
        <circle cx="260" cy="95" r="2" />
        <circle cx="290" cy="105" r="2" />
        <circle cx="320" cy="120" r="2" />
        <circle cx="340" cy="130" r="2" />
        <circle cx="315" cy="145" r="2" />
        <circle cx="290" cy="130" r="2" />
        <circle cx="250" cy="150" r="2" />
        <circle cx="220" cy="160" r="2" />
        <circle cx="195" cy="150" r="2" />
        <circle cx="180" cy="130" r="2" />
      </g>

      {/* <!-- 文字 --> */}
      <text
        x="250"
        y="220"
        font-family="Arial, sans-serif"
        font-size="28"
        font-weight="bold"
        text-anchor="middle"
        fill="#ffffff"
      >
        CLOUD INTERACTIVE
      </text>

      {/* <!-- 標語 --> */}
      <text
        x="250"
        y="245"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        textAnchor="middle"
        fill="#a9c7ff"
      >
        AI POWERED SOLUTIONS
      </text>
    </svg>
  );
};

export default Logo;
