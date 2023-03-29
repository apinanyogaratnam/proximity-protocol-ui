VERSION := 1.3

build:
	docker build -t dao-app --platform linux/amd64 .
	docker tag dao-app apinanyogaratnam/dao-app:${VERSION}
	docker push apinanyogaratnam/dao-app:${VERSION}

run:
	docker stop apinanyogaratnam/dao-app
	docker rm dao-app
	docker pull apinanyogaratnam/dao-app:${VERSION}
	docker run -p 9080:9080 -d apinanyogaratnam/dao-app:${VERSION}
