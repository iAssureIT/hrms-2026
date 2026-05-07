import flowbitePlugin from "flowbite/plugin";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./templates/**/*.{js,ts,jsx,tsx,mdx}",
    "./widgets/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
      "4xl": { max: "2560px" },
    },

    extend: {
      animation: {
        ["infinite-slider"]: "infiniteSlider 40s linear infinite",
        "infinite-scroll": "infinite-scroll 25s linear infinite",
        rotateblk: "rotateblk 2s linear infinite",
        "infinite-slider-left-to-right":
          "infiniteSliderLeftToRight 40s linear infinite",
      },
      keyframes: {
        infiniteSlider: {
          "0%": { transform: "translateX(0)" },
          "100%": {
            transform: "translateX(calc(-250px * 10))",
          },
        },
        "infinite-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        rotateblk: {
          from: {
            transform: " rotate(380deg)  translate(-62.5px) rotate(10deg)",
          },
          to: { transform: "rotate(20deg) translate(-62.5px) rotate(-40deg)" },
        },
        infiniteSliderLeftToRight: {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(calc(250px * 10))",
          },
        },
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        site: "#3c8dbc",
        green: "#3c8dbc",
        lightgreen: "#f1f6f9",
        Green: "#367fa9",
        successGreen: "#50c878",
        lightBlue: "#d2f2d4",
        lightPink: "#fa6b84",
        grayZero: "#e0eded",
        grayOne: "#ededed",
        grayTwo: "#c5c5c5",
        grayThree: "#999999",
        grayFour: "#666666",
        black: "#333333",
        btnHover: "#576073",
        offWhite: "#F5F5FF",
        purple: "#618FED",
        darkBlue: "#283593",
        skyBlue: "#376bff",
        light: "#f1f1f1",
        lightGray: "#666666",
        darkGray: "#333333",
        btnBlue: "#17478D",
        fbColor: "#3b5998",
        whatsappColor: "#4FCE5D",
        twitterColor: "#00acee",
        regularTextBlue: "#0c3e72",
        leftGray: "#2e3951",
        leftBlack: "#333333",
        leftBlue: "#17478F",
        leftWhite: "#f3f7ff",
        leftLightGray: "#666666",
        regularTextRed: "#fe5c24",
        redColor: "#fe5c24",
        skyBlue: "#2493e0",
        linkColor: "#007bff",
        yellowColor: "#ffc962",
        formColor: "#e3f2fd",
        submitBtn: "#283592",
        Accordion: "#004f95",
        ftLink: "#618AE8",
        Gray: "#5E666C",
        textDark: "#181D4E",
        textLight: "#5F5F65",
        textLink: "#096BF0",
        blogSite: "#F4F8FA",
      },
      scale: {
        90: "0.9",
      },
      boxShadow: {
        "3xl": "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
      },

      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        Montserrat: ["Montserrat", "sans-serif"],
      },
      screens: {
        exLG: "2736px",
      },
    },
  },
  variants: {
    extend: {
      scale: ["active"],
    },
  },

  plugins: [flowbitePlugin],
};

export default config;
