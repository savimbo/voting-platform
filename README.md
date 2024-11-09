<p align="center">
  <img src="https://images.squarespace-cdn.com/content/v1/62597d1197d1507f287b5af5/a6dc5e2c-1426-447f-9616-6df04ad0947e/SV_Logo.png" width="200" alt="Savimbo Logo" />
</p>



# [Savimbo](https://www.savimbo.com/) voting platform

## System Description

The Savimbo voting system is designed to allow communities to decide how to allocate funds.  

Each incoming amount is divided into three portions: one for long-term investment, one for distribution among community members, and one for carrying out projects of collective interest.  

Community leaders propose projects and prepare budgets, and the community votes on which projects they want to pursue. 

The proportion allocated to each portion, the quorum required to approve a vote, and other parameters are configurable. 

  

## Development environment setup

### Pre-requisites

- git
- Node 20.x. We advise to use nvm for installing node
- We will assume you are using Visual Studio Code, but you can use any other editor
- You will need [Docker Desktop](https://www.docker.com/products/docker-desktop/) for hosting the database if you do not have your own PostgreSQL infrastructure 


### Install the code

- Clone the repo
    ```bash
    git clone https://github.com/savimbo/voting-platform.git
    ```

- Change to the code folder and download its dependencies 
    ```bash
    cd vote-api
    npm ci
    ```


### Install the database

When the backend is executed, it will create automatically the database in case it does not exist as long as it finds a PostgreSQL engine. We will use a docker container to host PostgreSQL (make sure you installed Docker Desktop)

- Download the docker image
    ```bash
    docker pull postgres:16.3
    ```

- Customize your database credentials if you wish. You need to edit the file called _.env_ in the repo root folder. Do not change the variable DATABASE_HOST.

- Create the container for the database. Make sure you are in the repo root (you can use pwd in linux). You can get errors executing this command but the container may have been created anyway. 
    ```bash
    pwd
    /home/<your path>/vote-platform
    docker run --name vote_platform -p 5432:5432 --env-file .env -d postgres:16.3 
    ```

- Verify the container creation. Open _Docker Desktop_. You should see it under the _Containers_ section. From now on, you can turn on and off this container when needed. 
- If you want to have a fresh version of the database you can delete the container and run the previous _docker run_ command again


### Running the system

You need to run the two parts in order:

- Make sure your database container is running
- Run the backend
  - Open a terminal and change to _vote-api_ folder
  - Build and run the project in debug mode
    ```bash
    npm run build
    npm start 
    ```
- The system should be up and running by now. 
- The system does not attempt to validate the Google token during login to facilitate testing without requiring Google access setup. To enable validation, go to the validateGoogleToken() function in the auth.service.ts file and set demoMode to false.
 
### API documentation

When the system running, open a browser and point it to [localhost:4000/api/v1/apidoc](http://localhost:4000/api/v1/apidoc) to access the swagger documentation of the service
