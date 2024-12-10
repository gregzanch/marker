BINARY_NAME=marker

build-app:
	cd app && yarn build

build:
	make build-app
	cd server && go mod tidy
	cd server && go build -o ${BINARY_NAME} .
 
clean:
	cd server && go clean
	cd server && rm ${BINARY_NAME}