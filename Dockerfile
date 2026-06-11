FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
COPY prisma ./prisma
COPY deploy/docker-entrypoint.sh ./docker-entrypoint.sh

RUN npm install --no-save prisma@6.19.3 tsx@4.22.4 bcryptjs@3.0.3 \
  && npx prisma generate \
  && chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
