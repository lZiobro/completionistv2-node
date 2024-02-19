/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  await knex.schema.createTable("beatmapsets", (table) => {
    table.integer("id").unique();
    table.string("artist");
    table.string("artist_unicode");
    table.string("cover");
    table.string("creator");
    table.integer("play_count");
    table.integer("favourite_count");
    table.string("status");
    table.string("title");
    table.string("title_unicode");
    table.integer("track_id");
    table.integer("user_id");
    table.decimal("bpm");
    table.boolean("is_scoreable");
    table.boolean("ranked");
    table.dateTime("ranked_date");
    table.dateTime("submitted_date");
    table.dateTime("last_updated");
    table.string("tags");
    table.boolean("spotlight");
    table.integer("offset");
    table.string("source");
    //then a list of beatmaps in a set
  });

  await knex.schema.createTable("beatmaps", (table) => {
    table.integer("id").unique();
    //from which set is the map - use for grouping maps(diffs) int sets
    table.integer("beatmapset_id"); //.references("beatmapsets.id");
    table.decimal("difficulty_rating");
    table.string("mode");
    table.integer("total_length");
    table.integer("user_id");
    table.string("version");
    table.decimal("accuracy");
    table.decimal("ar");
    table.decimal("cs");
    table.decimal("drain");
    table.decimal("bpm");
    table.integer("max_combo");
    table.boolean("convert");
    table.integer("count_circles");
    table.integer("count_sliders");
    table.integer("count_spinners");
    table.integer("hit_length");
    table.boolean("is_scoreable");
    table.dateTime("last_updated");
    table.integer("mode_int");
    table.integer("passcount");
    table.integer("playcount");
    table.string("url");
    table.boolean("ranked");
    table.string("status");
    //then a list of beatmaps in a set
  });

  await knex.schema.createTable("user_scores", (table) => {
    table.integer("id").unique();
    table.decimal("accuracy");
    table.integer("best_id");
    table.dateTime("created_at");
    table.integer("max_combo");
    table.string("mode");
    table.integer("mode_int");
    table.specificType("mods", "text ARRAY");
    table.boolean("passed");
    table.boolean("perfect");
    table.decimal("pp");
    table.string("rank");
    table.boolean("replay");
    table.bigInteger("score");
    table.integer("statistics_count_100");
    table.integer("statistics_count_300");
    table.integer("statistics_count_50");
    table.integer("statistics_count_geki");
    table.integer("statistics_count_katu");
    table.integer("statistics_count_miss");
    table.string("type");
    table.integer("user_id");
    table.integer("beatmapset_id"); //constraint?
    table.integer("beatmap_id"); //constraint?
    table.string("username");
  });

  await knex.schema.createTable("scores_mods", (table) => {
    table.unique(["mod", "score_id"]);
    table.string("mod");
    table.integer("score_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("beatmapsets");
  await knex.schema.dropTableIfExists("beatmaps");
  await knex.schema.dropTableIfExists("user_scores");
};
