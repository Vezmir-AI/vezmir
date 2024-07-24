# Backend

This is the backend for the Vesmir app. It is a Django app that uses Django Rest Framework (DRF) for the API. Refer to the main documentation for [DRF](https://www.django-rest-framework.org/) and [Django](https://docs.djangoproject.com/en/5.0/) for more information.


## Setup the app (locally)

1. create any environement (conda, pyenv, etc.)
2. `pip install -r requirements.txt`
3. `python manage.py makemigrations`
4. `python manage.py migrate`
5. `python manage.py runserver 0.0.0.0:8000`

## Using Docker
Go to the [app main README.md](../README.md) and follow the instructions to run the backend using Docker.


## How authentication works

We use [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/en/latest/) for authentication. Once the frontend sent username/password to the backend, the backend will return a token. The frontend will then use the token to authenticate the user. There is a Access token and a Refresh token. The Access token is used to authenticate the user and the Refresh token is used to get a new Access token. The access token is valid for 15 minutes and the refresh token is valid for 7 days. 
> The access token should be passed in the header of the request as `Authorization: Bearer <access_token>`.