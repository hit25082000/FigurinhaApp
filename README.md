# ⚽ Minha Figurinha Copa 2026 - Aplicativo Web Completo

Este é um aplicativo web completo para a venda de **figurinhas personalizadas estilo álbum de futebol**, com fluxo operacional fim a fim (captura de lead, processamento da figurinha com IA/Satori, checkout com order bumps, webhook de pagamento e painel administrativo).

---

## 🛠️ Stack Utilizada

* **Framework**: Next.js 14+ / 15+ (App Router)
* **Linguagem**: TypeScript
* **Estilização**: Tailwind CSS v4 + PostCSS
* **Formulários e Validação**: React Hook Form + Zod
* **Banco de Dados**: Prisma + SQLite (padrão local para facilidade de testes) / PostgreSQL (suportado para produção)
* **Renderização de Imagens**: `@vercel/og` (Satori) para desenhar e renderizar a figurinha dinamicamente no servidor sem dependências binárias complexas.
* **Geração de PDF**: `pdf-lib` para montar o PDF A4 imprimível da figurinha com as linhas de corte.

---

## 🚀 Como Executar Localmente

### 1. Clonar e Instalar as Dependências

Na pasta raiz do projeto, instale as dependências ignorando peer-deps (por conta de dependências do Next.js e React Hook Form):

```bash
npm install --legacy-peer-deps
```

### 2. Configurar o Banco de Dados (SQLite)

O projeto está configurado para usar **SQLite** local por padrão, permitindo que você execute o projeto imediatamente sem precisar instalar ou configurar o PostgreSQL localmente. 

Para sincronizar o banco de dados e popular os produtos/order bumps:

```bash
# Cria o banco SQLite local (dev.db) e as tabelas
npx prisma db push

# Popula o banco com o produto da figurinha e os 5 order bumps
npx tsx prisma/seed.ts
```

### 3. Variáveis de Ambiente

O arquivo `.env` já vem pré-configurado por padrão:
* `DATABASE_URL="file:./dev.db"` (Conexão SQLite)
* `ADMIN_PASSWORD="admin_craque_2026"` (Senha para login no painel `/admin`)
* `STORAGE_PROVIDER="local"` (Fotos salvas na pasta `public/uploads`)
* `PAYMENT_PROVIDER="mock"` (Checkout em modo simulação)
* `NEXT_PUBLIC_APP_URL="http://localhost:3000"`

### 4. Rodar o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 💡 Como Testar o Fluxo Operacional (Mock Mode)

1. **Criação (`/criar`)**:
   * Preencha o nome do craque.
   * Selecione ou tire uma foto do rosto (uma foto de teste está em `reference/` ou você pode subir qualquer imagem JPG/PNG/WEBP).
   * Assista a tela de carregamento fake de 3s.
   * Preencha data de nascimento e e-mail.
   * Preencha clube, peso e altura.
   * Confirme seus dados e clique em "Gerar Figurinha".

2. **Geração (`/gerando/[orderId]`)**:
   * Assista à barra de progresso fake que simula a IA gerando sua figurinha. Você pode assistir ao vídeo VSL interativo na tela.
   * O sistema chamará a API `/api/generate-sticker` para processar e atualizar a figurinha no banco de dados.

3. **Resultado (`/resultado/[orderId]`)**:
   * Veja sua figurinha desenhada sob medida (com o nome do craque, peso, altura, idade calculada e clube do coração) exibindo a marca d'água **"PRÉVIA"**.
   * Veja os depoimentos reais de WhatsApp no carrossel de vendas.
   * Clique em "Receber minha figurinha".

4. **Checkout (`/checkout/[orderId]`)**:
   * Preencha os dados de cadastro.
   * Ative os order bumps desejados (PDF de impressão, Pôster A2, etc.) na borda tracejada vermelha e veja o preço total atualizar dinamicamente no resumo!
   * Selecione **Pix** para ver as instruções de pagamento e o QR Code. Ao clicar no botão verde, você verá um botão especial azul de **Simulação de Pagamento** para aprovar o pedido instantaneamente.
   * Selecione **Cartão de Crédito**, preencha os dados fictícios e clique em comprar para aprovar a simulação imediatamente.

5. **Obrigado (`/obrigado/[orderId]`)**:
   * O sistema exibe o layout da figurinha limpo (sem a marca d'água **"PRÉVIA"**).
   * Você pode clicar em **"Baixar Figurinha (PNG)"** e **"Baixar PDF para Impressão"** para baixar seus arquivos gerados de verdade no servidor!

6. **Área do Cliente (`/minha-area`)**:
   * Digite o e-mail informado na compra e tenha acesso a todos os seus pedidos finalizados e pendentes com seus respectivos botões de download.

7. **Painel Admin (`/admin`)**:
   * Faça login com a senha `admin_craque_2026`.
   * Monitore faturamento, leads capturados e pedidos.
   * Visualize a foto original enviada e a figurinha gerada.
   * Altere status manualmente, reenvie e-mails de entrega, faça upload de figurinhas alternativas e exporte a lista de pedidos em formato CSV.

---

## ⚙️ Alternar para PostgreSQL (Produção)

Caso queira usar o PostgreSQL real em produção:

1. Edite o arquivo [prisma/schema.prisma](file:///c:/Users/luiz.domingues/Dev/FigurinhaApp/prisma/schema.prisma):
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. No arquivo `.env`, altere o `DATABASE_URL` para o endereço de conexão do seu PostgreSQL:
   ```env
   DATABASE_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
   ```
3. Rode a migração do Prisma para criar as tabelas no PostgreSQL:
   ```bash
   npx prisma migrate dev --name init
   ```
