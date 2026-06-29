FROM node:lts AS base
WORKDIR /app

# By copying only the package.json and package-lock.json here, we ensure that the following `-deps` steps are independent of the source code.
# Therefore, the `-deps` steps will be skipped if only the source code changes.
COPY package.json package-lock.json ./

# Stage 1: Install all dependencies
FROM base AS build-deps
RUN npm install

# Stage 2: Build the static site
FROM build-deps AS build
COPY . .
RUN npm run build

# Stage 3: Serve
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
