// import jsonwebtoken from 'jsonwebtoken';

// /**
//  * @param {*} user - The user object
//  */
// function issueJWT(user) {
  
//   const userId = user.id;
//   const expiresIn = '7d';
  
//   const payload = {
//     userId: userId,
//     iat: Date.now()
//   };
  
//   const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });
  
//   return {
//     token: "Bearer " + signedToken,
//     expires: expiresIn
//   }
// }