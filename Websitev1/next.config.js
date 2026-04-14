/** @type {import('next').NextConfig} */

const nextConfig = {
  i18n: {
    locales: ["en"],
    defaultLocale: "en", // default lang 
  },
  publicRuntimeConfig: {
    // API_BASE_URL: "http://localhost:3030/",
    PORT: 3033,
    NODE_ENV: "production",
  },
  images: {
    domains: ["s3.ap-south-1.amazonaws.com"],
  },
  env: {
    HOSTNAME: "http://localhost:3004",
    BASEURL: "http://localhost:3050",
    NEXT_PUBLIC_BASE_URL: "http://localhost:3050",

    NEXT_PUBLIC_ADMIN_EMAIL: "sales@iassureit.com",
    NEXT_PUBLIC_CONTACT_EMAIL: "iassureitmail@gmail.com",
    EVENTS: "OTP for SignUp, OTP for Login, Account Created, Forgot Password, Reset Password Successful, User Activated, User Blocked"

  },
}
export default nextConfig;
