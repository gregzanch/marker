BINARY_NAME=marker

build-app:
	cd app && yarn && yarn build

build:
	make build-app
	cd server && go mod tidy
	cd server && go build -o ${BINARY_NAME} .
 
clean:
	cd server && go clean
	cd server && rm ${BINARY_NAME}

patch:
	deno run --allow-read --allow-write version.ts --version=patch

minor:
	deno run --allow-read --allow-write version.ts --version=minor

major:
	deno run --allow-read --allow-write version.ts --version=major

version:
	deno run --allow-read --allow-write version.ts --version=$(v)