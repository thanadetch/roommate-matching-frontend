# syntax=docker/dockerfile:1

# ---------- deps: ติดตั้ง dependencies ----------
    FROM node:20-alpine AS deps
    WORKDIR /app
    COPY package*.json ./
    # ใช้ npm ci เพื่อ reproducible และเร็วกว่า
    RUN npm ci --ignore-scripts && npm cache clean --force
    
    # ---------- builder: build Next เป็น standalone ----------
    FROM node:20-alpine AS builder
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    ARG NEXT_PUBLIC_API_URL
    ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
    RUN npm run build
    
    # ---------- runner: image สุดท้ายสำหรับรันจริง ----------
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV PORT=3001
    
    RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
    
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    USER nextjs
    EXPOSE 3001
    CMD ["node", "server.js"]
    