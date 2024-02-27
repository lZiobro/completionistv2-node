const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");

const db = require("./db/dbConfig");

const server = express();
server.use(bodyParser.json({ limit: "350mb" }));
server.use(
  cors({
    origin: "*",
    methods: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
server.use(helmet());
server.use(express.json());

server.get("/", (req, resp) => {
  resp.send("Welcome to the site");
});

server.get("/login", (req, resp) => {
  //try to login the user
});

server.get("/getBeatmapsetsForYear", async (req, resp) => {
  //try to login the user
  try {
    const queryYear = req.query.year;
    const queryMonth = req.query.month;
    let year = "2000";
    let endYear = "2100";
    let month = "01";
    let endMonth = "01";

    if (queryYear) {
      year = queryYear;
      if (queryMonth && queryMonth < 12) {
        endYear = queryYear;
      } else {
        endYear = (parseInt(queryYear) + 1).toString();
      }
    }

    if (queryMonth) {
      if (parseInt(queryMonth) < 10) {
        month = `0${queryMonth}`;
      } else {
        month = queryMonth;
      }

      if (parseInt(queryMonth) < 9) {
        endMonth = `0${(parseInt(queryMonth) + 1).toString()}`;
      } else if (parseInt(queryMonth) === 12) {
        endMonth = `01`;
      } else {
        endMonth = (parseInt(queryMonth) + 1).toString();
      }
    }

    const beatmaps = await db("beatmapsets")
      .where("ranked_date", ">=", `${year}-${month}-01T00:00:00Z`)
      .where("ranked_date", "<", `${endYear}-${endMonth}-01T00:00:00Z`)
      .join("beatmaps", "beatmaps.beatmapset_id", "beatmapsets.id")
      .where("beatmaps.mode", "=", req.query.gamemode ?? "osu")
      .select(
        "beatmaps.id",
        "beatmaps.beatmapset_id",
        "beatmaps.version",
        "beatmaps.accuracy",
        "beatmaps.convert",
        "beatmaps.convert",
        "beatmaps.url",
        "beatmaps.ranked",
        "beatmaps.mode"
      );

    if (!beatmaps || !beatmaps[0]) {
      resp.json();
      return;
    }

    const beatmapsArrays = beatmaps.reduce((r, a) => {
      r[a.beatmapset_id] = r[a.beatmapset_id] || [];
      r[a.beatmapset_id].push(a);
      return r;
    }, {});

    const beatmapsets = await db("beatmapsets")
      .where("ranked_date", ">=", `${year}-${month}-01T00:00:00Z`)
      .where("ranked_date", "<", `${endYear}-${endMonth}-01T00:00:00Z`)
      .select("id", "artist", "status", "title", "ranked_date");

    for await (const beatmapset of beatmapsets) {
      beatmapset.beatmaps = beatmapsArrays[beatmapset.id];
    }

    const resultsBeatmapsets = beatmapsets
      .filter((x) => x.beatmaps && x.beatmaps[0])
      .sort((a, b) =>
        a.ranked_date < b.ranked_date
          ? -1
          : a.ranked_date > b.ranked_date
          ? 1
          : 0
      );

    resp.json(resultsBeatmapsets);
    // resp.json(beatmapsArrays);
  } catch (err) {
    console.log(err);
    resp.json({ error: err });
  }
});

server.get("/getAllBeatmapsets", async (req, resp) => {
  //try to login the user
  try {
    const beatmaps = await db("beatmapsets")
      .join("beatmaps", "beatmaps.beatmapset_id", "beatmapsets.id")
      .where("beatmaps.mode", "=", req.query.gamemode ?? "osu")
      .select(
        "beatmaps.id",
        "beatmaps.beatmapset_id",
        "beatmaps.version",
        "beatmaps.accuracy",
        "beatmaps.convert",
        "beatmaps.convert",
        "beatmaps.url",
        "beatmaps.ranked",
        "beatmaps.mode"
      );

    if (!beatmaps || !beatmaps[0]) {
      resp.json();
      return;
    }

    const beatmapsArrays = beatmaps.reduce((r, a) => {
      r[a.beatmapset_id] = r[a.beatmapset_id] || [];
      r[a.beatmapset_id].push(a);
      return r;
    }, {});

    const beatmapsets = await db("beatmapsets").select(
      "id",
      "artist",
      "status",
      "title",
      "ranked_date"
    );

    for await (const beatmapset of beatmapsets) {
      beatmapset.beatmaps = beatmapsArrays[beatmapset.id];
    }

    resp.json(beatmapsets.filter((x) => x.beatmaps && x.beatmaps[0]));
  } catch (err) {
    console.log(err);
    resp.json({ error: err });
  }
});

server.post("/getUserScoresOnBeatmaps", async (req, resp) => {
  //   req.query.userId = 7552274; // -ExGon-
  try {
    const scoresMods = await db("user_scores")
      .select()
      .where("user_id", "=", req.query.userId)
      .where("mode", "=", req.query.gamemode ?? "osu")
      .join("scores_mods", "scores_mods.score_id", "user_scores.id")
      .select("scores_mods.*");

    const scoresModsArrays = scoresMods.reduce((r, a) => {
      r[a.score_id] = r[a.score_id] || [];
      r[a.score_id].push(a.mod);
      return r;
    }, {});

    const user_scores = await db("user_scores")
      .select(
        "id",
        "accuracy",
        "created_at",
        "beatmapset_id",
        "beatmap_id",
        "rank",
        "statistics_count_miss"
      )
      .where("user_id", "=", req.query.userId)
      .where("mode", "=", req.query.gamemode ?? "osu");

    const beatmapsIds = req.body.beatmapsIds;

    const user_scores2 = user_scores.filter((x) =>
      beatmapsIds.some((y) => y === x.beatmap_id)
    );

    for await (const score of user_scores2) {
      score.mods = scoresModsArrays[score.id];
    }

    resp.json(user_scores2);
  } catch (err) {
    console.log(err);
    resp.json({ error: err });
  }
});

server.get("/getUserCompletion", async (req, resp) => {
  try {
    const beatmaps = await db("beatmapsets")
      .join("beatmaps", "beatmaps.beatmapset_id", "beatmapsets.id")
      .where(
        "beatmaps.mode",
        "=",
        req.query.convertsOnly === "true" ? "osu" : req.query.gamemode ?? "osu"
      )
      .select("beatmaps.id", "beatmapsets.ranked_date");

    const beatmapByYear = {};

    const year = new Date().getFullYear();

    for (let i = 2007; i <= year; i++) {
      beatmapByYear[i] = beatmaps.filter(
        (x) =>
          x.ranked_date >= `${i}-01-01T00:00:00Z` &&
          x.ranked_date < `${i + 1}-01-01T00:00:00Z`
      );
    }

    const user_scores = await db("user_scores")
      .select("beatmap_id")
      .where("user_id", "=", req.query.userId ?? 7552274)
      .where("mode", "=", req.query.gamemode ?? "osu");

    const completionByYearCount = {};

    for (let i = 2007; i <= year; i++) {
      completionByYearCount[i] = {};
      completionByYearCount[i].completed = beatmapByYear[i].filter((x) =>
        user_scores.some((y) => y.beatmap_id === x.id)
      ).length;
    }

    for (let i = 2007; i <= year; i++) {
      completionByYearCount[i].total = beatmaps.filter(
        (x) =>
          x.ranked_date >= `${i}-01-01T00:00:00Z` &&
          x.ranked_date < `${i + 1}-01-01T00:00:00Z`
      ).length;
    }

    resp.json({
      completions: { ...completionByYearCount },
    });
  } catch (err) {
    console.log(err);
    resp.json({ error: err });
  }
});

server.get("/getAllUserScores", async (req, resp) => {
  //   req.query.userId = 7552274; // -ExGon-
  try {
    const scoresMods = await db("user_scores")
      .select()
      .where("user_id", "=", req.query.userId)
      .where("mode", "=", req.query.gamemode ?? "osu")
      .join("scores_mods", "scores_mods.score_id", "user_scores.id")
      .select("scores_mods.*");

    const scoresModsArrays = scoresMods.reduce((r, a) => {
      r[a.score_id] = r[a.score_id] || [];
      r[a.score_id].push(a.mod);
      return r;
    }, {});

    const user_scores = await db("user_scores")
      .select(
        "id",
        "accuracy",
        "created_at",
        "beatmapset_id",
        "beatmap_id",
        "rank",
        "statistics_count_miss"
      )
      .where("user_id", "=", req.query.userId)
      .where("mode", "=", req.query.gamemode ?? "osu");

    for await (const score of user_scores) {
      score.mods = scoresModsArrays[score.id];
    }

    resp.json(user_scores);
  } catch (err) {
    console.log(err);
    resp.json({ error: err });
  }
});

server.post("/insertUserScores", async (req, resp) => {
  try {
    // await insertOrUpdate("user_scores", req.body);
    await db("user_scores").insert(req.body).onConflict("id").merge();
    for await (const score of req.body) {
      score.mods.forEach(async (x) => {
        await db("scores_mods")
          .insert({ mod: x, score_id: score.id })
          .onConflict(["score_id", "mod"])
          .merge();
      });
    }

    resp.json("SUCCESS");
  } catch (err) {
    console.log(err);
    resp.json({ error: err });
  }
});

server.post("/insertBeatmapsets", async (req, resp) => {
  const beatmapsets = req.body;
  try {
    var beatmaps = [];
    for await (const beatmapset of beatmapsets) {
      beatmaps.push(...beatmapset.beatmaps);
      delete beatmapset.beatmaps;
    }
    await db("beatmaps")
      .insert([...beatmaps])
      .onConflict("id")
      .merge();
    await db("beatmapsets").insert(beatmapsets).onConflict("id").merge();
    resp.json("SUCCESS");
  } catch (err) {
    console.log(err);
    resp.json({ error: err });
  }
});

server.post("/insertBeatmapset", async (req, resp) => {
  const beatmapset = req.body;
  try {
    var beatmaps = [];
    beatmaps.push(...beatmapset.beatmaps);
    delete beatmapset.beatmaps;
    await db("beatmaps")
      .insert([...beatmaps])
      .onConflict("id")
      .merge();
    await db("beatmapsets").insert(beatmapset).onConflict("id").merge();
    resp.json("SUCCESS");
  } catch (err) {
    console.log(err);
    resp.json({ error: err });
  }
});

server.get("/getBeatmapsets", async (req, resp) => {
  try {
    const authToken = req.query.authTokenString;
    const cursor_string = req.query.cursorString;
    const response = await fetch(
      cursor_string === null
        ? "https://osu.ppy.sh/api/v2/beatmapsets/search?s=ranked"
        : `https://osu.ppy.sh/api/v2/beatmapsets/search?s=ranked&cursor_string=${cursor_string}`,
      //   "https://osu.ppy.sh/api/v2/beatmapsets/search?sort=ranked_asc&s=ranked"
      // : `https://osu.ppy.sh/api/v2/beatmapsets/search?sort=ranked_asc&s=ranked&cursor_string=${cursor_string}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const respJson = await response.json();
    const fetchedBeatmapsetsIds = respJson.beatmapsets.map((x) => x.id);

    var overlapCount = await db("beatmapsets")
      .whereIn("id", fetchedBeatmapsetsIds)
      .count();

    // console.log("dupa");
    // console.log(overlapCount[count]);

    //sqlite3 ver
    const overlapCountCount = overlapCount[0]["count(*)"];
    //postgres ver
    // const overlapCountCount = overlapCount[0]?.count;

    resp.json({
      response: respJson,
      ratelimitRemaining: response.headers.get("x-ratelimit-remaining"),
      overlapCount: overlapCountCount ?? 0,
    });
  } catch (err) {
    resp.json({ error: err });
  }
});

server.get("/getAllBeatmapsetsIdsFromDb", async (req, resp) => {
  try {
    const response = await db("beatmapsets").select("id");

    resp.json(response.map((x) => x.id));
  } catch (err) {
    resp.json({ error: err });
  }
});

server.get("/fetchBeatmapsetById", async (req, resp) => {
  try {
    const authToken = req.query.authTokenString;
    const beatmapsetId = req.query.beatmapsetId;
    const response = await fetch(
      `https://osu.ppy.sh/api/v2/beatmapsets/${beatmapsetId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    resp.json({
      response: await response.json(),
      ratelimitRemaining: response.headers.get("x-ratelimit-remaining"),
    });
  } catch (err) {
    resp.json({ error: err });
  }
});

// https://osu.ppy.sh/api/v2/users/2163544/scores/recent?mode=osu&limit=100&offset=0
server.get("/getUserScoreOnBeatmap", async (req, resp) => {
  try {
    const beatmapId = req.query.beatmapId;
    const userId = req.query.userId;
    const authToken = req.query.authTokenString;
    const response = await fetch(
      `https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}/scores/users/${userId}?mode=${
        req.query.gamemode ?? "osu"
      }`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    resp.json({
      response: await response?.json(),
      ratelimitRemaining: response.headers.get("x-ratelimit-remaining"),
    });
    // console.log(response.headers.get("x-ratelimit-remaining"));
  } catch (err) {
    resp.json({ error: err });
  }
});

server.get("/getToken", async (req, resp) => {
  try {
    const code = req.query.code;
    const returnUrl = req.query.returnUrl ?? "http://localhost:3000";
    const response = await fetch("https://osu.ppy.sh/oauth/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: "30207",
        client_secret: "MEZAoG94qa89hiwwtUicU66qx7yxNfbOAhpErLOK",
        code: code,
        grant_type: "authorization_code",
        redirect_uri: returnUrl,
        scope: "public",
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    resp.json(await response?.json());
  } catch (err) {
    resp.json({ error: err });
  }
});

server.get("/getAllUserScoresOnBeatmap", async (req, resp) => {
  try {
    const beatmapId = req.query.beatmapId;
    const userId = req.query.userId;
    const authToken = req.query.authTokenString;
    const response = await fetch(
      `https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}/scores/users/${userId}/all?mode=${
        req.query.gamemode ?? "osu"
      }`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    var beatmap = await db("beatmaps")
      .select("id", "beatmapset_id")
      .where("id", "=", beatmapId);

    const respJson = await response?.json();
    respJson["beatmap"] = beatmap;

    resp.json({
      response: respJson,
      ratelimitRemaining: response.headers.get("x-ratelimit-remaining"),
    });
  } catch (err) {
    resp.json({ error: err });
  }
});

const HOST = "localhost";
const PORT = process?.env?.PORT || 21727;

server.listen(PORT, HOST, () =>
  console.log(`Server running at ${HOST}:${PORT}`)
);
module.exports = server;
