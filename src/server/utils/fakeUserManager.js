import JwtSessionHelper from 'jwt-session-helper';

class FakeUserManager {
  constructor(){
    this.userCount = 0;
    this.users = {};
    this.userIdMap = {};

    this.jwtSessionHelper = new JwtSessionHelper('secret', {
      defaults: {
        algorithm: 'HS256',
      },
      signDefaults: {
        issuer: 'localhost',
        expiresIn: '1y',
      },
      parsePayload: ({ user, auth_type, ...rest }) => ({
        userid: user.id,
        name: user.name,
        username: user.username,
        auth_type,
        privilege: user.privilege,
        subject: `user:${user.id}:${rest.wsSessionNumber || 0}`,
        token_type: 'Bearer',
        ...rest,
      }),
      exposeInfo: (originalData, payload) => {
        let result = {
          ...payload,
        };
        delete result.auth_type;
        return result;
      },
    });

    this.register('admin', 'admin', 'Admin', 'admin');
    
    for (let index = 1; index <= 10; index++) {
      this.register(`t${index}`, `t${index}`, `Test User ${index}`, 'user');
    }
  }

  register(username, password, name, privilege){
    if(this.users[username]){
      return null;
    }
    const id = `${++this.userCount}`;
    const user = {
      id,
      name,
      username,
      password,
      privilege,
    };

    this.users[username] = user;
    this.userIdMap[id] = user;
    return user;
  }

  authenticate(auth_type, username, password, extraPayload){
    const user = this.users[username];
    if(auth_type !== 'basic' || !user){
      return null;
    }

    let session = this.jwtSessionHelper.createSession({
      ...extraPayload,
      user,
      auth_type,
    });

    return session.info;
  }

  authenticateFromToken(token, extraPayload){
    const tokenInfo = this.verify(token);
    if(!tokenInfo){
      return null;
    }

    const user = this.users[tokenInfo.username];
    if(!user){
      return null;
    }

    let session = this.jwtSessionHelper.createSession({
      ...extraPayload,
      user,
      auth_type: tokenInfo.auth_type,
    });

    return session.info;
  }

  verify(token){
    try{
      return this.jwtSessionHelper.verify(token);
    }catch(e){
      return null;
    }
  }

  _exposeUserData(user){
    if(!user){
      return null;
    }
    const {
      id,
      name,
      username,
      privilege,
    } = user;
    return {
      id,
      name,
      username,
      privilege,
    };
  }

  getUserById(id){
    return this._exposeUserData(this.userIdMap[id]);
  }

  getUserByName(username){
    return this._exposeUserData(this.users[username]);
  }
}

export default new FakeUserManager();
