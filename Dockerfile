# Build dependencies
FROM node:17-alpine as builder
WORKDIR /app
COPY package.json .
RUN npm i

COPY ./src ./src
COPY ./prisma ./prisma
COPY tsconfig.json .
RUN npm run build
# Build production image
FROM builder as runner
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD npm run start
