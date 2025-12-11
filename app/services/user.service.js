const db = require("../models");
const User = db.users;


//Добавление нового пользователя
async function userCreate(userCr)   {
    {  
    try {  
        const user = await User.create( userCr );  
        return user;  
    }  
    catch (error) {  
        if (error.name === 'SequelizeUniqueConstraintError') {  
            // Обработать ошибку, например, сообщить пользователю, что email уже зарегистрирован  
            console.error('The email is already registered.'); 
            return 'email уже сущкствует'; 
        }  
        else {  
            // Другие ошибки можно обработать здесь  
            console.error('An error occurred:', error);  
        }  
    }  
}  
}

//Получение пользователя по id
async function find_by_id(id, auth_id, auth_role) {
    //console.log('user-srvc findById id ', id, auth_id, auth_role);
    
    try{

        const foundUser = await User.findOne({
      where: { id: auth_id }
    });
    //console.log('Запрашивающий пользователь:', foundUser.toJSON());
    const data = foundUser.toJSON();
    
            //console.log('user-srvc data ', data, data.status);
        
       if(!data.status )  {  return 'Вы заблокированы'; }
        
    //console.log('user-srvc findById id ', id, auth_id, auth_role);
      
      
      if(id != data.id && data.role != 'admin')  {  return 'Нет прав доступа'; }
    
        const foundUser1 = await User.findOne({
      where: { id: id }
    });
    if (!foundUser1) return 'Нет такого пользователя';
    //console.log('Найденный пользователь:', foundUser1.toJSON());
    const user = foundUser1.toJSON();
    
         return user
         
    }
     catch (error) {  
          
              
            console.error('An error occurred:', error);  
          
    } 

    
}

//Получение пользователя по email
async function find_by_email(email) {
    //console.log('user-srvc findByEmail email ', email);
    
    try{

        const foundUser = await User.findOne({
      where: { email: email }
    });
    //console.log('Запрашиваемый пользователь:', foundUser/*.toJSON()*/);
    
    if( !foundUser ){return 'email не существует';}
    const data = foundUser.toJSON();
    //console.log('User.service find_by_email data ', data);
    
            //console.log('user-srvc data ', data, data.status);
    return data   
    
    }
     catch (error) {  
    console.error('An error occurred:', error);  
          
    } 

    
}

//Получение всех пользователей
async function find_all_users(email) {
    //console.log('user-srvc findByEmail email ', email);

    try{

        const foundUser = await User.findOne({where:{email: email}, raw: true });
    //console.log('Зuser-srvc find_all_usersl foundUser ', foundUser);
    //return foundUser
    if(!foundUser.status)  {  return 'Вы заблокированы';}
    if(foundUser.role != 'admin')  { return 'Нет прав доступа'; }
    
    }
     catch (error) {  
    console.error('An error occurred:', error);  
          
    }
    
    try{

        const foundUsers = await User.findAll({raw:true});
    //console.log('Зuser-srvc find_all_usersl foundUsers ', foundUsers);
    return foundUsers
    
    }
     catch (error) {  
    console.error('An error occurred:', error);  
          
    } 

    
}

//Блокировка пользователя по id
async function blocking_by_id(id) {
    //console.log('user-srvc blocking_by_id id ', id/*, auth_id, auth_role*/);
    
    const data = await User.update( {status: false}, {
      where: { id: id }
    });
    //console.log('user-srvc blocking id data ', data);
      if(data[0] === 0 ) { return 'Нет такого пользователя id = '+id;}
      return('Пользователь заблокирован id = '+id);
    
}
module.exports.userCreate = userCreate;
module.exports.find_by_id = find_by_id;
module.exports.find_by_email = find_by_email;
module.exports.find_all_users = find_all_users;
module.exports.blocking_by_id = blocking_by_id;