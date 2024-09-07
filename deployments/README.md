This is the basic nginx config fot the Django/React deployement.
```upstream app_server { server unix:/run/gunicorn.sock; }

server { listen 80; server_name api.vezmir.ai www.vezmir.ai vezmir.ai; return 301 https://$server_name$request_uri; }

server { listen 443 ssl; server_name api.vezmir.ai;

ssl_certificate /etc/letsencrypt/live/api.vezmir.ai/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/api.vezmir.ai/privkey.pem;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;

location / {
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://app_server;
}
}

server { listen 443 ssl; server_name www.vezmir.ai vezmir.ai;

# SSL configuration
ssl_certificate /etc/letsencrypt/live/www.vezmir.ai/fullchain.pem;  # Update with the correct path to your SSL certificate
ssl_certificate_key  /etc/letsencrypt/live/www.vezmir.ai/privkey.pem;  # Update with the correct path to your SSL private key

# Optional: Improve SSL security
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'HIGH:!aNULL:!MD5';
ssl_prefer_server_ciphers on;

# Root directory for your Vite application
root /var/www/vezmir.ai;

# Serve the index.html file for all requests
location / {
    try_files $uri $uri/ /index.html;
}
}
```
In order to publish the servers, you then need to make this file available in the sites-enabled from nginx. This is done with `sudo ln -s /etc/nginx/sites-available/vezmir.ai.conf /etc/nginx/sites-enabled/`. You can then test the config with `sudo nginx -t`.

The following is to give rights to the user for the database after creating both with `sudo -u postgres psql`:
```
ALTER ROLE vezmir_user_prod SET client_encoding TO 'utf8'; ALTER ROLE vezmir_user_prod SET default_transaction_isolation TO 'read committed'; ALTER ROLE vezmir_user_prod SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE vezmir_prod TO vezmir_user_prod; ALTER DATABASE vezmir_prod owner to vezmir_user_prod;
```

This is /etc/systemd/system/gunicorn.socket:
```
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target
```
and /etc/systemd/system/gunicorn.service:
```
[Unit] Description=gunicorn daemon Requires=gunicorn.socket After=network.target

[Service] User=azureuser Group=www-data WorkingDirectory=/home/azureuser/backend ExecStart=/home/azureuser/.vezmir/bin/gunicorn
--access-logfile -
--workers 3
--bind unix:/run/gunicorn.sock
vesmir_app.wsgi:application

[Install] WantedBy=multi-user.target
````
Then just run `sudo systelctl daemon-reload && sudo systemctl restart gunicorn && sudo systemctl restart nginx`


and finally how to create https certificate
`sudo certbot --nginx -d api.vezmir.ai -d www.vezmir.ai -d vezmir.ai`
