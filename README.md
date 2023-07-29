# SofiavSdabg

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.1.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

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
