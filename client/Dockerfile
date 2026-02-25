# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time API URL (browser calls this from the host)
ARG REACT_APP_API_URL=http://localhost:3001/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
# Avoid treating warnings as errors in Docker build
ENV CI=false

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# Serve stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
