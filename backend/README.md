# Backend

This is the backend for the Vesmir application. It is a Django application that uses the Django Rest Framework (DRF) for the API. See the main documentation for [DRF](https://www.django-rest-framework.org/) and [Django](https://docs.djangoproject.com/en/5.0/) for more information.


## Setting up the application (locally)

1. create any environment (conda, pyenv, etc.)
2. `pip install -r requirements.txt`.
3. python manage.py makemigrations
4. `python manage.py migrate'.
5. `python manage.py runserver 0.0.0.0:8000`.

## Using Docker
Go to [app main README.md](../README.md) and follow the instructions to run the backend using Docker.


## How authentication works

We use [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/en/latest/) for authentication. It is [the best solution](https://mahan-yt.medium.com/jwt-vs-simplejwt-3dce2c8ace48). Once the frontend sends the username/password to the backend, the backend will return a token. The frontend will then use the token to authenticate the user. There is an access token and a refresh token. The access token is used to authenticate the user and the refresh token is used to get a new access token (and a new refresh token). The Access Token is valid for 60 minutes and the Refresh Token is valid for 7 days.
> The access token must be passed in the request header as `Authorization: Bearer <access_token>'.
