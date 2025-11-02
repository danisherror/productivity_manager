# Steps to install dependency
#### For client

<span style="color:#c00000">Command to clone this repo</span>
```
git clone https://github.com/danisherror/productivity_manager.git
```

<span style="color:#c00000">Command to download the frontend dependencies:</span>
```
npm install 
```
or
```
npm install --legacy-peer-deps
```
#### For server

<span style="color:#c00000">Command to download the backend dependencies:</span>
```
npm install
```

# Steps to run the project:
#### For client

```
npm start
```
#### For server
```
npm start
```
---

# Server .env
```.env
NODE_ENV= LOCAL
MONGO_URI_1="<mongodb-url>"
PORT=4000
JWT_SECRET= secretkey
JWT_EXPIRY=1d
front_end_url= "http://localhost:3000"
EMAIL_USERNAME=<email>
EMAIL_PASSWORD=<app password from google>
EMAIL_SECRET=secretkey
```
---

# Client .env
```.env
REACT_APP_BACKEND_URL=
```
