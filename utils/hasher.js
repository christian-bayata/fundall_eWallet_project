import bcrypt from 'bcrypt-nodejs';

const Hasher = {

	/**
     *
     * @param password
     * @returns {Promise<void>}
     */
	async encryptPassword (password) {
		const SALT_FACTOR = await bcrypt.genSalt(10);
		return await bcrypt.hash(password, SALT_FACTOR);
	},

	/**
     *
     * @param givenPassword
     * @param actualPassword
     * @returns {Promise<void>}
     */
	async comparePasswords(givenPassword, actualPassword) {
		return await bcrypt.compare(givenPassword, actualPassword);
	}

}

export default Hasher;
