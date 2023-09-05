Node Task API Documentation

## Introduction

Welcome to the API documentation for Node Task.




####### Create User #######

POST  /accounts

Body: 
{
  "first_name": "Muhammmad",
  "last_name": "Marwan",
  "email": "mhdmarwantest@gmail.com",
  "phone":"971568382638",
  "password":"569956",
  "birthday":"1999-09-02"
}




####### Login User #######

POST /login

Body: 
{
    "email":"mhdmarwantest@gmail.com",
    "password":"569956"
}




####### Read User #######

GET /accounts/:id

Header:
{
    Authorization:{token}
}




######## Update User #######

PUT /accounts/:id

Header:
{
    Authorization:{token}
}

Body: 
{
  "first_name": "Muhammmad",
  "last_name": "Marwan",
  "email": "mhdmarwantest111@gmail.com",
  "phone":"971568382638",
  "password":"569956",
  "birthday":"1999-09-02"
}




######## Delete User #######

DELETE /accounts/:id

Header:
{
    Authorization:{token}
}




####### User List #######

GET /accounts

Header:
{
    Authorization:{token}
}





