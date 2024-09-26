# Vezmir AI :crystal_ball:

## Docker Configuration

To run the site, you first need to [install docker](https://docs.docker.com/engine/install/). Then there are a few things you can do:
1. `docker compose up -d` will run the server in _detach_ mode (remove the `-d` if you really want the full logs).
2. ./restart_docker.sh` will restart the containers with the following options:
    - `-p` to run `docker system prune -a`;
    - `-r` to run `docker volume rm vezmir_postgres_data` ;
    - `-b` to add the `--build` command to `docker compose up -d`;
3. `docker exec -it {dev-react|dev-django} {command} {args}` to execute each command in the appropriate containers. For example, `docker exec -it dev-django python manage.py migrate` will run the migrations in the container.
4. `docker logs --tail 1000 -f {dev-react|dev-django}` to monitor the logs for a container (don't quit the process like without the `-d` command from 1.)

## Pre-commit configuration

Pre-commit configuration is important to keep high standard quality code. In order to keep a clean, neat codebase, some rules must be followed.

### Install Pre-commit hooks

In order to install pre-commit hooks, you actually need a python environement. Either use a default one (like conda base) or create one (with whatever) and run the following command (with the python environement activated of course):

`pip install pre-commit ruff`

Once this is done, just run `pre-commit install` and here you go, everythin now should be running when you run the `git commit` command.

:warning: WARNING: Commiting from vscode/cursor source control won't run the pre-commit, you __must__ run it from the command line.

If you want to run the pre-commit formatting just like that, you can run either `pre-commit run -a`/`pre-commit run -f path/to/file` or `npm run lint` from frontend and `ruff check` from backend. Please refer to [ES Lint docs](https://eslint.org/docs/latest/) and [Ruff docs](https://docs.astral.sh/ruff/) for more information.
