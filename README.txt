Instructions:

Have a redis database with default parameters ready, I used docker to create my redis server. Redis was used for caching database calls.

Docker Command:
docker run --name redis -p 6379:6379 -d redis

Running and installing the application:

Run npm install to initialize node_packages

Run npm main.js to start app.

Application will be running on localhost:8080

Notes:

- Since the app uses Fixer's free service, the app can only convert from euro's, sorry

- I was having fun, so I might've gone a little over the 3 hr mark building this. 