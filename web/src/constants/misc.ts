import kamelhisaabSecondaryLogo from "@/assets/svgs/kamel-hisaab-secondary.svg";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AppLogoUrlPrimary = import.meta.env.VITE_APP_TYPE == "ledgi" ? "/khaata-logo.svg" : "/kamel-hisaab-primary.svg";
export const AppLogoUrlSecondary = import.meta.env.VITE_APP_TYPE == "ledgi" ? "/khaata-logo.svg" : kamelhisaabSecondaryLogo;
