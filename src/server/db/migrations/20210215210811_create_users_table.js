
exports.up = function (knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments();
        table.string('uid').notNullable();
        table.string('name');
        table.string('email');
        table.string('picture');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
