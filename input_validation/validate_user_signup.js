import Joi from 'joi';

/**  
 * @params user
 * @returns {*} 
*/

const validateUserSignUp = (user) => {
    
    const schema = Joi.object({
        firstName:  Joi.string()
                    .required(),
        lastName:   Joi.string()
                    .required(),
        email:      Joi.string()
                    .email({ minDomainSegments: 2, tlds: { allow: [ 'com', 'net' ] }})
                    .required(),
        password:   Joi.string()
                    .min(6)
                    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
                    .required(),
        phoneNum:   Joi.string()
                    .required(),
        });       
    return schema.validate(user)     
};

export default validateUserSignUp;