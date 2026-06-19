import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aumenta o tempo máximo das rotas de API serverless para 3 minutos
  // Necessário para aguardar o polling da Kie AI (gpt-image-2 pode levar até 2 minutos)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
