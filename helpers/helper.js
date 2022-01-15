/*
* Helper Object for Controllers
*/
const Helper = {

    /**
     * Get user's sign-up details
     * @param {Object} data - data containing user's details
     * @returns {Object} return user's data
     */
    userDetails(data) {
      return {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNum: data.phoneNum,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    },

      /**
   * Get user's profile
   * @param {Object} data - object containing user's details
   * @returns {Object} return user's data
   */
  getUserProfile(data) {
    return {
      id: data.id,
      userName: data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email
    };
  },
};

export default Helper;