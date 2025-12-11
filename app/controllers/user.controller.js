const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const emailValidator = require('email-validator');
const dbConfig = require("../config/db.config.js");
//const db = require("../models");
var service = require("../services/user.service.js")

//Добавление нового пользователя
exports.create = (req, res)  => {

// Валидация запроса
	//console.log('user.controller Create req.body ', req.body);
  let d = req.body.date_of_birth
  let is_date = isNaN(Date.parse(d))
  console.log('user.controller Create is date ', is_date)
  
  if (!req.body.name) {res.status(400).send("Не валидный ФИО"); return;}
  if (is_date) {res.status(400).send("Не валидная дата рождения"); return;}
  if (!emailValidator.validate(req.body.email)) {res.status(400).send("Не валидный email"); return;}
  if (req.body.role != 'admin' && req.body.role != 'user') {res.status(400).send("Не валидный role"); return;}
  //return
  // Создание пользователя
  const salt = bcrypt.genSaltSync(7);
  const hash = bcrypt.hashSync(req.body.password, salt);
  //console.log('user.controller hash ', hash);
  
  
  const user = {
    name: req.body.name,
    date_of_birth: new Date(req.body.date_of_birth),
    email: req.body.email,
    password: hash,
    role: req.body.role
    
  };

  // Запись пользователя в базу данных
  console.log('user.controller Create user ');

    service.userCreate(user)
    .then((value) =>  {
      console.log('user.controller Create user value ', value.dataValues)
      res.send(value);
    }) ;
 
};


//Авторизация пользователя
exports.auth =  (req, res) => {
  
  if (!emailValidator.validate(req.body.email)) {res.status(400).send("Не валидный email"); return;}
  if (!req.body.password) {res.status(400).send("Не валидный password"); return;}
   
   
  let email = req.body.email;
    let password = req.body.password;
    console.log('User.controller auth email, password ', email, password);
  
    service.find_by_email(email)
    
    .then(data => {
      if (!(data instanceof Object))  {res.send(data); return;}
      console.log('User.controller auth data ', data.dataValues);
      let id = data.id
      let role = data.role
      let status = data.status
      console.log('User.controller auth status ', status);
      if(!status ) {res.send('Вы заблокированы'); return;}
       
      let hash = data.password
      const passwordCompare = bcrypt.compareSync(password, hash)
      console.log('passwordCompare ', passwordCompare);
      if(passwordCompare) {
        var token = jwt.encode({
          id: id,
          email: email,
          role: role,
          status: status
        }, dbConfig.secretkey)
        console.log('User.controller auth token ', token, token.length);
        
     res.send(token)
      }
      else {res.send('Не правильный password')}
      
    })
    .catch(err => {
      console.log('User.controller auth data cath err ', err);
      res.status(500)
      res.send({
        message: err
      })
    });
    
}



// Получение всех пользователей
exports.findAll = (req, res) => {
  let token =  req.headers['x-auth']
  //console.log('user-contr findAll token ', token);
  if(!token || token === 'null')  { res.send('Пользователь не авторизован'); return; }
  try{
  var auth = jwt.decode(token, dbConfig.secretkey)
  }
  catch {res.send('Пользователь не авторизован'); return;}
  //console.log('user-contr findAll token ', token);
  console.log('user-contr findAll auth ', auth);
  
  service.find_all_users(auth.email)
  // User.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Users."
      });
    });
};


// Получение пользователя по id
exports.findById = (req, res) => {
  let token =  req.headers['x-auth']
  //console.log('user-contr findById token ', token);
  if(!token || token === 'null')  { res.send('Пользователь не авторизован'); return; }
  
  try{
  var auth = jwt.decode(token, dbConfig.secretkey)
  }
  catch {res.send('Пользователь не авторизован'); return;}
  //console.log('user-contr findById token ', token);
  //console.log('user-contr findById auth ', auth);
  const id = req.query.id;
  if(!id)  { res.send('Не валидный id'); return; }
  //console.log('User.controller findid req.params.id ', req.params, req.params.id);

  service.find_by_id(id, auth.id, auth.role)

  .then((data) => { res.send(data)}) 
  .catch((err) => {
    console.log('User.controller findid test cath err ', err);
      
  });


};



// Блокировка пользователя по id
exports.blocking = (req, res) => {
  let id_req = req.query.id
  if(!id_req)  { res.send('Не валидный id'); return; }
  //console.log('user-contr blocking id_req ', id_req);
  let token =  req.headers['x-auth']
  //console.log('user-contr blocking token ', token);
  if(!token || token === null)  { res.send('Пользователь не авторизован'); return; }

  try{
    var auth = jwt.decode(token, dbConfig.secretkey)
  }
  catch {res.send('Пользователь не авторизован'); return;}
  //console.log('user-contr blocking token ', token);
  //console.log('user-contr blocking auth ', auth);


  service.find_by_id(id_req, auth.id, auth.role)
  .then(data => {
    //console.log('user-contr blocking auth User.findOne data ', data , data.role);
    // console.log('user-contr blocking auth User.findOne data.users.dataValues.status ', data.status);
    if (!(data instanceof Object)) { res.send((data)); return; }
  
    service.blocking_by_id(id_req)
    .then(data => { res.send((data));})

    .catch(err => {
      res.status(500).send({
        message: err
      });
    });
    })
  .catch(err => {
    res.status(500).send({
      message: err
    });
  });

};



