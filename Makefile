VERSION := 1.1

build:
	docker build -t dao-app --platform linux/amd64 .
	docker tag dao-app apinanyogaratnam/dao-app:${VERSION}
	docker push apinanyogaratnam/dao-app:${VERSION}

run:
	docker pull apinanyogaratnam/dao-app:${VERSION}
	docker run -p 9080:9080 -d apinanyogaratnam/dao-app:${VERSION}
