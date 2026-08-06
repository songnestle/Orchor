/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * /explore 与 /marketplace 曾经各自铺同一批技能卡,现已并入首页。
   *
   * 这里用路由级重定向而不是页面里的 redirect():那两个页面会被静态
   * 预渲染,redirect() 在构建时就跑掉了,线上只剩一个没有 Location 头的
   * 307 —— 浏览器停在原地,等于旧链接直接白屏。308 也更适合这种永久搬迁。
   */
  async redirects() {
    return [
      { source: "/explore", destination: "/", permanent: true },
      { source: "/marketplace", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
