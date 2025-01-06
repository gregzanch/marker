# Stage 1: Build the Svelte app
FROM node:22 AS svelte-builder
WORKDIR /app
COPY ./app/package*.json ./
RUN yarn install
COPY ./app .
RUN yarn build

# Stage 2: Build the Go server
FROM golang:1.23 AS go-builder
WORKDIR /server
COPY ./server/go.mod ./server/go.sum ./
RUN go mod download
COPY ./server .
RUN go build -o marker .

# Stage 3: Create the final image
FROM ubuntu:latest
WORKDIR /marker
COPY --from=svelte-builder /app/dist ./app/dist
COPY --from=go-builder /server/marker ./server/marker
RUN chmod +x ./server/marker

# Expose the application port
EXPOSE 80

WORKDIR ./server
# Command to run the Go server
CMD ["./marker"]
