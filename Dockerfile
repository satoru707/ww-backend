FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm && pnpm install
COPY . .

ENV DATABASE_URL="postgresql://postgres:password07@localhost:5432/wealthwave"
ENV JWT_SECRET='secret'
ENV NODE_ENV='development'
ENV PORT=3000
EXPOSE 3000

# RUN pnpm prisma
CMD ["pnpm", "dev"]