# Senior Design Glue

This application is a locally deployed webapp that allows professors to maanage their existing database

![example](/assets/query.png "Quick usage")


# Startup

Note that this assumes you have access to a backup file to load into the container. If it's already loaded, then you're good to go! Just run the following:

```
docker compose up
```

If you anticipate there has been a major change, it's best to run

```
docker compose up --build
```

Once this is done, you will have access to the following:

- [The Webapp: localhost:3000](http://localhost:3000)

- [The Backend: localhost:5000/docs](http://localhost:5000/docs)

- [The Adminer: localhost:8080](http://localhost:8080)

Note the following credentials for the adminer:

System:
Server
Username
Password
Database: postgres

| Setting  | Value      |
| -------- | -------    |
| System   | PostgreSQL |
| Server   | postgres   |
| Username | root       |
| Password | root       |
| Database | postgres   |


# Other Useful Commands

To pull the codebase:
```
git pull
```

To list running docker containers:
```
docker ps
```

To exec into a container with a terminal session (example provided). **This only runs if your container is running in the background. It is recommended to start your containers in one container, then run this command in a different terminal**
```
docker compose exec -it postgres bash
```

