# SofiavSdabg

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 21.2.8.


## API Endpoints

The API endpoints used in this project are hosted in this repo:

https://github.com/slatinasda/sofiav-sdabg-api


## Running from docker

Build the image:
```
docker build -t sdabg.net/sofiav-app .
```

Run the development server from the image:
```
docker run -it --rm -p 4200:4200 sdabg.net/sofiav-app
```


## Create a production build from docker

1. Build the image:

    ```
    docker build -t sdabg.net/sofiav-app .
    ```

2. Run the build command in a new container:

    ```
    docker run -it sdabg.net/sofiav-app npm run build
    ```

3. Get the ID of the latest container

    ```
    docker ps -alq
    ```

4. Copy the `dist` folder from the latest container in which the project was built to the `host`

    ```
    docker cp $(docker ps -alq):/usr/src/app/dist ./
    ```

5. Remove the container which was used to build the project

    ```
    docker rm $(docker ps -alq)
    ```

6. The production build should now be located in the root folder of this project on the host


## Blog

Blog posts are markdown files that live in a separate, public repo:

https://github.com/slatinasda/sofiav-sdabg-blogposts

To have posts show up locally, clone that repo into a `blog-content` folder in the root of this project:

```
git clone https://github.com/slatinasda/sofiav-sdabg-blogposts blog-content
```

The build (`npm run build`/`npm start`) reads posts from `blog-content/posts` and generates
the blog's static assets, sitemap, RSS feed. Without a `blog-content` checkout, the blog simply builds empty.

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
