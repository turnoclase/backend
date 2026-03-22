help: _header
	${info }
	@echo Opciones:
	@echo --------------------
	@echo build
	@echo workspace
	@echo update
	@echo deploy
	@echo clean
	@echo --------------------

_header:
	@echo --------------------
	@echo TurnoClase - Backend
	@echo --------------------

build:
	@docker compose build --pull

workspace:
	@docker compose run -q --rm node /bin/bash

update:
	@docker compose run -q --rm node /bin/sh -c 'cd functions && npm update'
	@echo Generando commit...
	@sleep 5
	@cd ../../ && git commit -a -m "Actualización de dependencias"

deploy:
	@docker compose run -q --rm --service-ports node /bin/sh -c 'firebase login && firebase use turnoclase-eu && firebase deploy --only functions'

clean:
	@docker compose down -v --remove-orphans
