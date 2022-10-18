# collaborative-activity-recognition

> A [Marcelle](https://marcelle.netlify.app) Application

## Installing

To install dependencies, just run `yarn` from the main repository.
You will need yarn installed (`npm i -g yarn`).

## Running with the hosted backend

To run the app in development mode with the hosted server, just run:

```sh
yarn dev
```

## Running with the backend running locally

It is possible to the run the backend locally. The data will be stored in the filesystem using NeDB.

First, install dependencies for the backend:

```sh
cd backend
yarn
cd ..
```

Then, build the backend by running from the root:

```sh
yarn run backend:build
```

Then, run the backend locally:

```sh
yarn run backend:start
```

Then, edit the location of the backend in the datastore, file `./src/index.js`:

```js
const backend_url = 'http://localhost:3030';
// const backend_url = 'https://long-wind-713.fly.dev';
```

Finally, run the development server in parallel:

```sh
yarn dev
```

The app will be accessible on http://localhost:3000/

## Available Scripts

### npm run dev

Runs the app in the development mode.
Open http://localhost:3000 to view it in the browser.

The page will reload if you make edits.

### npm run build

Builds a static copy of your site to the `dist/` folder.
Your app is ready to be deployed!

### npm run backend:build

Build the backend server

### npm run backend:start

Run the backend server locally
