
exports.up = function (knex) {
    return knex.schema.createTable('google_users', (table) => {
        table.increments();
        table.string('subject').notNullable();
        table.string('name');
        table.string('email');
        table.string('picture');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('google_users');
};
