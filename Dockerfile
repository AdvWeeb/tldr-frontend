# Build stage
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Serve stage
FROM nginx:alpine

RUN adduser -D -H -u 1001 -s /sbin/nologin vite

RUN mkdir -p /app/www

COPY --from=build /app/dist /app/www

COPY nginx.conf /etc/nginx/templates/default.conf.template

RUN chown -R vite:vite /app/www && \
    chmod -R 755 /app/www && \
    chown -R vite:vite /var/cache/nginx && \
    chown -R vite:vite /var/log/nginx && \
    chown -R vite:vite /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R vite:vite /var/run/nginx.pid && \
    chmod -R 777 /etc/nginx/conf.d

EXPOSE 80

ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
ENV PORT=80

USER vite

CMD ["nginx", "-g", "daemon off;"]
