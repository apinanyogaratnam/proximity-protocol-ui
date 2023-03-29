VERSION := 1.6

build:
	rm -rf packages/web-app/dist
	rm -rf packages/ui-components/dist
	cd packages/ui-components && npm run build
	cd packages/web-app && npm run build
	docker build -t dao-app --platform linux/amd64 .
	docker tag dao-app apinanyogaratnam/dao-app:${VERSION}
	docker push apinanyogaratnam/dao-app:${VERSION}

run:
	docker stop $$(docker ps -aq)
	docker pull apinanyogaratnam/dao-app:${VERSION}
	docker run -p 9080:9080 -d apinanyogaratnam/dao-app:${VERSION}
