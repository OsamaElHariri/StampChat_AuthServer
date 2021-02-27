const knex = require('../connections');

function getUserByUid(uid) {
    return knex('users')
        .select('*')
        .where({ uid: uid })
        .first();
}

function addUser(user) {
    return knex('users')
        .insert(user)
        .returning('*');
}

function getUser(userId) {
    return knex('users')
        .select('*')
        .where({ id: userId })
        .first();
}

module.exports = {
    getUserByUid,
    addUser,
    getUser,
};