/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: { styledComponents: true },
    images: {
        domains: ['static.coinall.ltd'],
    },
};

console.log('process.env.BASE_URL:', process.env.NEXT_PUBLIC_CONTRACT_ID)

export default nextConfig;
