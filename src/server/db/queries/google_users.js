const knex = require('../connections');

function getGoogleUserBySubject(subject) {
    return knex('google_users')
        .select('*')
        .where({ subject: subject })
        .first();
}

function addGoogleUser(user) {
    return knex('google_users')
        .insert(user)
        .returning(['email', 'name', 'picture']);
}

function getGoogleUser(userId) {
    return knex('google_users')
        .select('*')
        .where({ id: userId })
        .first();
}

module.exports = {
    getGoogleUserBySubject,
    getGoogleUser,
    addGoogleUser,
};