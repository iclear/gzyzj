const fs = require('fs')
const bodyParser = require('body-parser')
const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')

const server = jsonServer.create()
const router = jsonServer.router('./database.json')
const userdb = JSON.parse(fs.readFileSync('./users.json', 'UTF-8'))

server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.json())
server.use(jsonServer.defaults());

const SECRET_KEY = '123456789'

const expiresIn = '1h'

// Create a token from a payload 
function createToken(payload){
  return jwt.sign(payload, SECRET_KEY, {expiresIn})
}

// Verify the token 
function verifyToken(token){
  return  jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ?  decode : err)
}

// Check if the user exists in database
function isAuthenticated({username, password}){
  return userdb.users.findIndex(user => user.username === username && user.password === password) !== -1
}

// Login to one of the users from ./users.json
server.post('/tokens', (req, res) => {
  console.log("login endpoint called; request body:");
  console.log(req.body);
  const {username, password} = req.body;
  if (isAuthenticated({username, password}) === false) {
    const status = 401
    const message = 'Incorrect username or password'
    res.status(status).json({status, message})
    return
  }
  const access_token = createToken({username, password})
  console.log("Access Token:" + access_token);
  res.status(200).json({"code":20000, "data":{access_token}})
})

server.get('/me', (req, res) => {
  res.send({"code":20000,data:{ name : "", avatar : "", roles : [ 'administrator' ]}})
})
/*
server.use(/^(?!\/tokens).*$/,  (req, res, next) => {
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401
    const message = 'Error in authorization format'
    res.status(status).json({status, message})
    return
  }
  try {
    let verifyTokenResult;
     verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

     if (verifyTokenResult instanceof Error) {
       const status = 401
       const message = 'Access token not provided'
       res.status(status).json({status, message})
       return
     }
     next()
  } catch (err) {
    const status = 401
    const message = 'Error access_token is revoked'
    res.status(status).json({status, message})
  }
})
*/
server.use((req, res, next) => {
  if (req.headers.referer != "http://www.gzyzj.360ycb.com/") {
    const status = 401
let message = 'Error in authorization format'
    res.status(status).json({status, message})
    return
  }
  next()
})

server.use(router)

server.listen(2080, () => {
  console.log('Run Auth API Server')
})
