# SofiavSdabg

[![Tests](https://github.com/slatinasda/sofiav-sdabg/actions/workflows/tests.yml/badge.svg)](https://github.com/slatinasda/sofiav-sdabg/actions/workflows/tests.yml)

Website of the Seventh-day Adventist Church in Sofia - Slatina.

## Requirements

- Node.js (see `.nvmrc`)
- Chromium for Playwright, required by the production build

## Installation

```
npm ci
npx playwright install chromium
```

Blog posts live in a separate, public repository:

https://github.com/slatinasda/sofiav-sdabg-blogposts

To include posts locally, clone that repository into a `blog-content` folder in the project root:

```
git clone https://github.com/slatinasda/sofiav-sdabg-blogposts blog-content
```

The build reads posts from `blog-content/posts`. Without a `blog-content` checkout, the blog simply
builds empty.

## Development server

```
npm start
```

Open `http://localhost:4200/`. App auto-reloads when source files change.

## Production build

```
npm run build
```

Serve the contents of `dist/sofiav-sdabg/browser` from any static file server.

Prerendered routes are real directories with their own `index.html`; routes rendered on the client and unknown URLs must fall back to `index.csr.html`. See `example.htaccess` for an Apache configuration.

The API endpoints used by the application are hosted here:

https://github.com/slatinasda/sofiav-sdabg-api

## Running from Docker

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

The production build is now located in the `dist` folder on the host.
