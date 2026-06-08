const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

const GROUPS = {
  'المجموعة A': ['المكسيك', 'جنوب أفريقيا', 'كوريا الجنوبية', 'التشيك'],
  'المجموعة B': ['كندا', 'البوسنة والهرسك', 'قطر', 'سويسرا'],
  'المجموعة C': ['البرازيل', 'المغرب', 'هايتي', 'إسكتلندا'],
  'المجموعة D': ['الولايات المتحدة', 'باراغواي', 'أستراليا', 'تركيا'],
  'المجموعة E': ['ألمانيا', 'كوراساو', 'ساحل العاج', 'الإكوادور'],
  'المجموعة F': ['هولندا', 'اليابان', 'السويد', 'تونس'],
  'المجموعة G': ['بلجيكا', 'مصر', 'إيران', 'نيوزيلندا'],
  'المجموعة H': ['إسبانيا', 'الرأس الأخضر', 'السعودية', 'الأوروغواي'],
  'المجموعة I': ['فرنسا', 'السنغال', 'العراق', 'النرويج'],
  'المجموعة J': ['الأرجنتين', 'الجزائر', 'النمسا', 'الأردن'],
  'المجموعة K': ['البرتغال', 'الكونغو الديمقراطية', 'أوزبكستان', 'كولومبيا'],
  'المجموعة L': ['إنجلترا', 'كرواتيا', 'غانا', 'بنما']
};

function generateFixtures() {
  const baseTime = new Date('2026-06-11T19:00:00Z').getTime();
  const HOUR = 3600000;
  const DAY = 24 * HOUR;

  const round1Start = baseTime;
  const round2Start = baseTime + 11 * DAY;
  const round3Start = baseTime + 22 * DAY;

  // توزيع المباريات على 4 أيام لكل جولة (3 مجموعات في اليوم)
  // كل مجموعة لها مباراتين: الأولى في 19:00، الثانية في 22:00
  const GROUPS_PER_DAY = 3;
  const SLOTS = [19 * HOUR, 22 * HOUR]; // 7PM و 10PM

  const groupNames = Object.keys(GROUPS);
  const fixtures = [];

  // Round 1: كل يوم 3 مجموعات، كل مجموعة مباراتين
  for (let g = 0; g < 12; g++) {
    const teams = GROUPS[groupNames[g]];
    const dayIndex = Math.floor(g / GROUPS_PER_DAY);
    const groupInDay = g % GROUPS_PER_DAY;
    const dayOffset = dayIndex * DAY;

    // مباراة 1 (فريق 1 vs فريق 2) في 19:00
    fixtures.push({
      teamA: teams[0],
      teamB: teams[1],
      stage: groupNames[g],
      round: 1,
      start: new Date(round1Start + dayOffset + SLOTS[0] + groupInDay * 0.5 * HOUR).toISOString()
    });
    // مباراة 2 (فريق 3 vs فريق 4) في 22:00
    fixtures.push({
      teamA: teams[2],
      teamB: teams[3],
      stage: groupNames[g],
      round: 1,
      start: new Date(round1Start + dayOffset + SLOTS[1] + groupInDay * 0.5 * HOUR).toISOString()
    });
  }

  // Round 2
  for (let g = 0; g < 12; g++) {
    const teams = GROUPS[groupNames[g]];
    const dayIndex = Math.floor(g / GROUPS_PER_DAY);
    const groupInDay = g % GROUPS_PER_DAY;
    const dayOffset = dayIndex * DAY;

    fixtures.push({
      teamA: teams[0],
      teamB: teams[2],
      stage: groupNames[g],
      round: 2,
      start: new Date(round2Start + dayOffset + SLOTS[0] + groupInDay * 0.5 * HOUR).toISOString()
    });
    fixtures.push({
      teamA: teams[1],
      teamB: teams[3],
      stage: groupNames[g],
      round: 2,
      start: new Date(round2Start + dayOffset + SLOTS[1] + groupInDay * 0.5 * HOUR).toISOString()
    });
  }

  // Round 3
  for (let g = 0; g < 12; g++) {
    const teams = GROUPS[groupNames[g]];
    const dayIndex = Math.floor(g / GROUPS_PER_DAY);
    const groupInDay = g % GROUPS_PER_DAY;
    const dayOffset = dayIndex * DAY;

    fixtures.push({
      teamA: teams[0],
      teamB: teams[3],
      stage: groupNames[g],
      round: 3,
      start: new Date(round3Start + dayOffset + SLOTS[0] + groupInDay * 0.5 * HOUR).toISOString()
    });
    fixtures.push({
      teamA: teams[1],
      teamB: teams[2],
      stage: groupNames[g],
      round: 3,
      start: new Date(round3Start + dayOffset + SLOTS[1] + groupInDay * 0.5 * HOUR).toISOString()
    });
  }

  // Round 4 — دور الـ 32 (32 مباراة)
  const round4Start = baseTime + 33 * DAY;
  for (let i = 1; i <= 32; i++) {
    fixtures.push({
      teamA: `الفريق ${i*2-1}`,
      teamB: `الفريق ${i*2}`,
      stage: 'دور الـ 32',
      round: 4,
      start: new Date(round4Start + Math.floor((i-1)/4) * DAY + SLOTS[(i-1)%2]).toISOString()
    });
  }

  // Round 5 — دور الـ 16 (16 مباراة)
  const round5Start = baseTime + 40 * DAY;
  for (let i = 1; i <= 16; i++) {
    fixtures.push({
      teamA: `الفائز م${i*2-1}`,
      teamB: `الفائز م${i*2}`,
      stage: 'دور الـ 16',
      round: 5,
      start: new Date(round5Start + Math.floor((i-1)/4) * DAY + SLOTS[(i-1)%2]).toISOString()
    });
  }

  // Round 6 — دور الـ 8 (8 مباريات)
  const round6Start = baseTime + 47 * DAY;
  for (let i = 1; i <= 8; i++) {
    fixtures.push({
      teamA: `الفائز م${i*2-1}`,
      teamB: `الفائز م${i*2}`,
      stage: 'دور الـ 8',
      round: 6,
      start: new Date(round6Start + Math.floor((i-1)/2) * DAY + SLOTS[(i-1)%2]).toISOString()
    });
  }

  // Round 7 — دور الـ 4 (4 مباريات)
  const round7Start = baseTime + 52 * DAY;
  for (let i = 1; i <= 4; i++) {
    fixtures.push({
      teamA: `الفائز م${i*2-1}`,
      teamB: `الفائز م${i*2}`,
      stage: 'دور الـ 4',
      round: 7,
      start: new Date(round7Start + Math.floor((i-1)/2) * DAY + SLOTS[(i-1)%2]).toISOString()
    });
  }

  // Round 8 — النهائي (مباراة واحدة)
  const round8Start = baseTime + 57 * DAY;
  fixtures.push({
    teamA: 'الفائز نصف النهائي 1',
    teamB: 'الفائز نصف النهائي 2',
    stage: 'النهائي',
    round: 8,
    start: new Date(round8Start + 19 * HOUR).toISOString()
  });

  return fixtures;
}

async function init() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'player',
        status VARCHAR(20) NOT NULL DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        teamA VARCHAR(100) NOT NULL,
        teamB VARCHAR(100) NOT NULL,
        stage VARCHAR(50) NOT NULL,
        start_at TIMESTAMP NOT NULL,
        actual_scoreA INTEGER,
        actual_scoreB INTEGER,
        round INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        scoreA INTEGER NOT NULL,
        scoreB INTEGER NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, match_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value VARCHAR(5000) NOT NULL
      )
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_matches_start_at ON matches(start_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');

    const valueTypeCheck = await client.query("SELECT data_type FROM information_schema.columns WHERE table_name='settings' AND column_name='value'");
    if (valueTypeCheck.rows.length > 0 && valueTypeCheck.rows[0].data_type === 'character varying') {
      await client.query("ALTER TABLE settings ALTER COLUMN value TYPE TEXT");
      console.log('Migration: settings.value changed from VARCHAR(5000) to TEXT');
    }

    const statusCheck = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='status'");
    if (statusCheck.rows.length === 0) {
      await client.query("ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'approved'");
    }

    const roundCheck = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='matches' AND column_name='round'");
    if (roundCheck.rows.length === 0) {
      await client.query("ALTER TABLE matches ADD COLUMN round INTEGER NOT NULL DEFAULT 1");
    }

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminCheck = await client.query("SELECT id FROM users WHERE username = $1", [adminUsername]);
    if (adminCheck.rows.length === 0) {
      const hash = bcrypt.hashSync(adminPassword, 10);
      await client.query(
        "INSERT INTO users (name, username, password_hash, role, status) VALUES ($1, $2, $3, $4, $5)",
        ['المدير', adminUsername, hash, 'admin', 'approved']
      );
    }

    const settingsCheck = await client.query("SELECT value FROM settings WHERE key = 'current_round'");
    if (settingsCheck.rows.length === 0) {
      await client.query("INSERT INTO settings (key, value) VALUES ('current_round', '1')");
    }

    const matchesCheck = await client.query('SELECT COUNT(*) FROM matches');
    const expectedCount = 133;
    const currentCount = parseInt(matchesCheck.rows[0].count);
    if (currentCount !== expectedCount) {
      console.log(`Matches count is ${currentCount}, expected ${expectedCount}. Recreating...`);
      await client.query('DELETE FROM predictions');
      await client.query('DELETE FROM matches');
      const fixtures = generateFixtures();
      for (const fixture of fixtures) {
        await client.query(
          'INSERT INTO matches (teamA, teamB, stage, start_at, round) VALUES ($1, $2, $3, $4, $5)',
          [fixture.teamA, fixture.teamB, fixture.stage, fixture.start, fixture.round]
        );
      }
      console.log(`Created ${fixtures.length} matches`);
    } else if (currentCount > 0) {
      const sampleMatch = await client.query('SELECT teamA FROM matches LIMIT 1');
      const expectedTeams = Object.values(GROUPS).flat();
      if (!expectedTeams.includes(sampleMatch.rows[0].teama)) {
        console.log('Match team names are outdated. Recreating...');
        await client.query('DELETE FROM predictions');
        await client.query('DELETE FROM matches');
        const fixtures = generateFixtures();
        for (const fixture of fixtures) {
          await client.query(
            'INSERT INTO matches (teamA, teamB, stage, start_at, round) VALUES ($1, $2, $3, $4, $5)',
            [fixture.teamA, fixture.teamB, fixture.stage, fixture.start, fixture.round]
          );
        }
        console.log(`Created ${fixtures.length} matches`);
      }
    }

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function findUserByUsername(username) {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0] || null;
}

async function getUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function createUser(name, username, password) {
  const hash = bcrypt.hashSync(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, username, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, username, hash, 'player', 'pending']
  );
  return result.rows[0];
}

async function getPendingUsers() {
  const result = await pool.query("SELECT * FROM users WHERE status = 'pending' ORDER BY created_at ASC");
  return result.rows;
}

async function getAllUsers() {
  const result = await pool.query("SELECT * FROM users ORDER BY role DESC, created_at ASC");
  return result.rows;
}

async function approveUser(userId) {
  await pool.query("UPDATE users SET status = 'approved' WHERE id = $1", [userId]);
}

async function rejectUser(userId) {
  await pool.query("UPDATE users SET status = 'rejected' WHERE id = $1 AND status = 'pending'", [userId]);
}

async function deleteUser(userId) {
  await pool.query('DELETE FROM predictions WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM users WHERE id = $1 AND role != $2', [userId, 'admin']);
}

async function getMatches() {
  const result = await pool.query('SELECT * FROM matches ORDER BY start_at ASC');
  return result.rows.map(normalizeMatch);
}

async function getCurrentRound() {
  const result = await pool.query("SELECT value FROM settings WHERE key = 'current_round'");
  return parseInt(result.rows[0]?.value || '1');
}

async function setCurrentRound(round) {
  await pool.query(
    "INSERT INTO settings (key, value) VALUES ('current_round', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
    [String(round)]
  );
}

async function getPublishedRounds() {
  const result = await pool.query("SELECT value FROM settings WHERE key = 'published_rounds'");
  if (result.rows.length > 0) {
    try {
      return JSON.parse(result.rows[0].value);
    } catch (e) {
      return [];
    }
  }
  return [];
}

async function publishRound(round) {
  const published = await getPublishedRounds();
  if (!published.includes(round)) {
    published.push(round);
    published.sort();
  }
  await pool.query(
    "INSERT INTO settings (key, value) VALUES ('published_rounds', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
    [JSON.stringify(published)]
  );
}

async function unpublishRound(round) {
  const published = await getPublishedRounds();
  const updated = published.filter(r => r !== round);
  await pool.query(
    "INSERT INTO settings (key, value) VALUES ('published_rounds', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
    [JSON.stringify(updated)]
  );
}

async function getVisiblePredictions() {
  const result = await pool.query("SELECT value FROM settings WHERE key = 'visible_predictions'");
  if (result.rows.length > 0) {
    try {
      return JSON.parse(result.rows[0].value);
    } catch (e) {
      return [];
    }
  }
  return [];
}

async function togglePredictionVisibility(matchId) {
  const visible = await getVisiblePredictions();
  const id = parseInt(matchId, 10);
  let updated;
  if (visible.includes(id)) {
    updated = visible.filter(v => v !== id);
  } else {
    updated = [...visible, id];
  }
  await pool.query(
    "INSERT INTO settings (key, value) VALUES ('visible_predictions', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
    [JSON.stringify(updated)]
  );
  return updated;
}

async function getAllPredictionsForMatch(matchId) {
  const result = await pool.query(`
    SELECT p.*, u.name AS user_name
    FROM predictions p
    JOIN users u ON p.user_id = u.id
    WHERE p.match_id = $1
    ORDER BY u.name ASC
  `, [matchId]);
  return result.rows.map(normalizePrediction);
}

async function getMatchById(matchId) {
  const result = await pool.query('SELECT * FROM matches WHERE id = $1', [matchId]);
  return normalizeMatch(result.rows[0]) || null;
}

async function savePrediction(userId, matchId, scoreA, scoreB) {
  const result = await pool.query(`
    INSERT INTO predictions (user_id, match_id, scoreA, scoreB, updated_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, match_id)
    DO UPDATE SET scoreA = $3, scoreB = $4, updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `, [userId, matchId, scoreA, scoreB]);
  return result.rows[0];
}

async function getPrediction(userId, matchId) {
  const result = await pool.query(
    'SELECT * FROM predictions WHERE user_id = $1 AND match_id = $2',
    [userId, matchId]
  );
  return normalizePrediction(result.rows[0]) || null;
}

async function getUserPredictions(userId) {
  const result = await pool.query(`
    SELECT p.*, m.teamA, m.teamB, m.stage, m.start_at, m.round, m.actual_scoreA, m.actual_scoreB
    FROM predictions p
    JOIN matches m ON p.match_id = m.id
    WHERE p.user_id = $1
    ORDER BY m.start_at ASC
  `, [userId]);
  return result.rows.map(normalizePrediction);
}

async function updateKnockoutTeams(matchId, teamA, teamB) {
  await pool.query(
    'UPDATE matches SET teamA = $1, teamB = $2 WHERE id = $3',
    [teamA, teamB, matchId]
  );
}

async function updateMatchResult(matchId, scoreA, scoreB) {
  await pool.query(
    'UPDATE matches SET actual_scoreA = $1, actual_scoreB = $2 WHERE id = $3',
    [scoreA, scoreB, matchId]
  );
}

async function getLeaderboard() {
  const result = await pool.query(`
    SELECT u.id, u.name, u.username,
      COALESCE(SUM(
        CASE
          WHEN p.scoreA = m.actual_scoreA AND p.scoreB = m.actual_scoreB THEN 20
          WHEN p.scoreA IS NOT NULL AND m.actual_scoreA IS NOT NULL THEN
            CASE
              WHEN (p.scoreA > p.scoreB AND m.actual_scoreA > m.actual_scoreB)
                OR (p.scoreA < p.scoreB AND m.actual_scoreA < m.actual_scoreB)
                OR (p.scoreA = p.scoreB AND m.actual_scoreA = m.actual_scoreB) THEN
                CASE
                  WHEN (p.scoreA - p.scoreB) = (m.actual_scoreA - m.actual_scoreB) THEN 15
                  ELSE 10
                END
              ELSE 0
            END
          ELSE 0
        END
      ), 0) AS total,
      COUNT(p.id) AS predictions_count,
      COALESCE(SUM(
        CASE
          WHEN p.scoreA = m.actual_scoreA AND p.scoreB = m.actual_scoreB THEN 1
          ELSE 0
        END
      ), 0)::int AS correct_predictions,
      COUNT(CASE WHEN m.actual_scoreA IS NOT NULL THEN 1 END) AS judged_predictions
    FROM users u
    LEFT JOIN predictions p ON u.id = p.user_id
    LEFT JOIN matches m ON p.match_id = m.id
    WHERE u.role != 'admin' AND u.status = 'approved'
    GROUP BY u.id, u.name, u.username
    ORDER BY total DESC, u.name ASC
  `);
  return result.rows.map(row => ({
    ...row,
    total: parseInt(row.total) || 0,
    predictions_count: parseInt(row.predictions_count) || 0,
    correct_predictions: parseInt(row.correct_predictions) || 0,
    judged_predictions: parseInt(row.judged_predictions) || 0,
    success_rate: parseInt(row.judged_predictions) > 0
      ? Math.round((parseInt(row.correct_predictions) / parseInt(row.judged_predictions)) * 100 * 10) / 10
      : 0
  }));
}

async function getGroupStandings() {
  const result = await pool.query("SELECT value FROM settings WHERE key = 'group_standings'");
  if (result.rows.length > 0) {
    try {
      return JSON.parse(result.rows[0].value);
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function calculateGroupStandings() {
  const matchesResult = await pool.query(
    "SELECT * FROM matches WHERE actual_scoreA IS NOT NULL AND actual_scoreB IS NOT NULL ORDER BY start_at ASC"
  );
  const matches = matchesResult.rows.map(normalizeMatch);

  const teamFlags = getTeamFlags();
  const groups = {};

  for (const [groupName, teamNames] of Object.entries(GROUPS)) {
    groups[groupName] = {};
    for (const name of teamNames) {
      groups[groupName][name] = {
        name,
        flag: teamFlags[name] || 'unknown',
        played: 0, wins: 0, draws: 0, losses: 0,
        scored: 0, conceded: 0, goalDifference: 0, points: 0
      };
    }
  }

  for (const match of matches) {
    const stage = match.stage;
    if (!groups[stage]) continue;
    const { teamA, teamB, actual_scoreA, actual_scoreB } = match;

    if (!groups[stage][teamA] || !groups[stage][teamB]) continue;

    const tA = groups[stage][teamA];
    const tB = groups[stage][teamB];

    tA.played++;
    tB.played++;
    tA.scored += actual_scoreA;
    tA.conceded += actual_scoreB;
    tB.scored += actual_scoreB;
    tB.conceded += actual_scoreA;

    if (actual_scoreA > actual_scoreB) {
      tA.wins++;
      tA.points += 3;
      tB.losses++;
    } else if (actual_scoreA < actual_scoreB) {
      tB.wins++;
      tB.points += 3;
      tA.losses++;
    } else {
      tA.draws++;
      tB.draws++;
      tA.points += 1;
      tB.points += 1;
    }
  }

  for (const groupName of Object.keys(GROUPS)) {
    const teamsInGroup = groups[groupName] || {};
    for (const teamName of Object.keys(teamsInGroup)) {
      const t = teamsInGroup[teamName];
      t.goalDifference = t.scored - t.conceded;
    }
  }

  const result = [];
  for (const groupName of Object.keys(GROUPS)) {
    const teamsInGroup = groups[groupName] || {};
    const teams = Object.values(teamsInGroup)
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.scored - a.scored);
    result.push({ name: groupName, teams });
  }

  const jsonValue = JSON.stringify(result);
  console.log('Saving group_standings to settings table:');
  console.log('  key column:', 'group_standings');
  console.log('  value column length (chars):', jsonValue.length);
  try {
    await pool.query(
      "INSERT INTO settings (key, value) VALUES ('group_standings', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [jsonValue]
    );
  } catch (e) {
    console.error('Error saving group standings:', e);
  }

  return result;
}

async function getLeaderboardStats() {
  const playersResult = await pool.query("SELECT COUNT(*) FROM users WHERE role != 'admin' AND status = 'approved'");
  const predictionsResult = await pool.query("SELECT COUNT(*) FROM predictions");
  const matchesResult = await pool.query("SELECT COUNT(*) FROM matches");
  const totalPlayers = parseInt(playersResult.rows[0].count) || 0;
  const totalPredictions = parseInt(predictionsResult.rows[0].count) || 0;
  const totalMatches = parseInt(matchesResult.rows[0].count) || 0;

  const topScoreResult = await pool.query(`
    SELECT u.name, COALESCE(SUM(
      CASE
        WHEN p.scoreA = m.actual_scoreA AND p.scoreB = m.actual_scoreB THEN 20
        WHEN p.scoreA IS NOT NULL AND m.actual_scoreA IS NOT NULL THEN
          CASE
            WHEN (p.scoreA > p.scoreB AND m.actual_scoreA > m.actual_scoreB)
              OR (p.scoreA < p.scoreB AND m.actual_scoreA < m.actual_scoreB)
              OR (p.scoreA = p.scoreB AND m.actual_scoreA = m.actual_scoreB) THEN
              CASE
                WHEN (p.scoreA - p.scoreB) = (m.actual_scoreA - m.actual_scoreB) THEN 15
                ELSE 10
              END
            ELSE 0
          END
        ELSE 0
      END
    ), 0) AS total
    FROM users u
    LEFT JOIN predictions p ON u.id = p.user_id
    LEFT JOIN matches m ON p.match_id = m.id
    WHERE u.role != 'admin' AND u.status = 'approved'
    GROUP BY u.id, u.name
    ORDER BY total DESC LIMIT 1
  `);

  const topCorrectResult = await pool.query(`
    SELECT u.name, COUNT(CASE WHEN p.scoreA = m.actual_scoreA AND p.scoreB = m.actual_scoreB THEN 1 END)::int AS correct
    FROM users u
    LEFT JOIN predictions p ON u.id = p.user_id
    LEFT JOIN matches m ON p.match_id = m.id
    WHERE u.role != 'admin' AND u.status = 'approved' AND m.actual_scoreA IS NOT NULL
    GROUP BY u.id, u.name
    ORDER BY correct DESC LIMIT 1
  `);

  const topRateResult = await pool.query(`
    SELECT u.name,
      COUNT(CASE WHEN m.actual_scoreA IS NOT NULL THEN 1 END) AS judged,
      COUNT(CASE WHEN p.scoreA = m.actual_scoreA AND p.scoreB = m.actual_scoreB THEN 1 END) AS correct
    FROM users u
    LEFT JOIN predictions p ON u.id = p.user_id
    LEFT JOIN matches m ON p.match_id = m.id
    WHERE u.role != 'admin' AND u.status = 'approved'
    GROUP BY u.id, u.name
    HAVING COUNT(CASE WHEN m.actual_scoreA IS NOT NULL THEN 1 END) > 0
    ORDER BY (CASE WHEN COUNT(CASE WHEN m.actual_scoreA IS NOT NULL THEN 1 END) > 0
      THEN COUNT(CASE WHEN p.scoreA = m.actual_scoreA AND p.scoreB = m.actual_scoreB THEN 1 END)::float / COUNT(CASE WHEN m.actual_scoreA IS NOT NULL THEN 1 END)
      ELSE 0 END) DESC LIMIT 1
  `);

  const topScoreRow = topScoreResult.rows[0];
  const topCorrectRow = topCorrectResult.rows[0];
  const topRateRow = topRateResult.rows[0];

  return {
    totalPlayers,
    totalPredictions,
    totalMatches,
    topScore: topScoreRow ? { name: topScoreRow.name, value: parseInt(topScoreRow.total) || 0 } : null,
    topCorrect: topCorrectRow ? { name: topCorrectRow.name, value: parseInt(topCorrectRow.correct) || 0 } : null,
    topRate: topRateRow ? {
      name: topRateRow.name,
      value: parseInt(topRateRow.judged) > 0 ? Math.round((parseInt(topRateRow.correct) / parseInt(topRateRow.judged)) * 100 * 10) / 10 : 0
    } : null
  };
}

function normalizeMatch(row) {
  if (!row) return null;
  return {
    id: row.id,
    teamA: row.teama || row.teamA,
    teamB: row.teamb || row.teamB,
    stage: row.stage,
    start_at: row.start_at,
    actual_scoreA: row.actual_scorea != null ? row.actual_scorea : row.actual_scoreA,
    actual_scoreB: row.actual_scoreb != null ? row.actual_scoreb : row.actual_scoreB,
    round: row.round,
    created_at: row.created_at
  };
}

function normalizePrediction(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    match_id: row.match_id,
    scoreA: row.scorea != null ? row.scorea : row.scoreA,
    scoreB: row.scoreb != null ? row.scoreb : row.scoreB,
    updated_at: row.updated_at,
    teamA: row.teama || row.teamA || null,
    teamB: row.teamb || row.teamB || null,
    stage: row.stage || null,
    round: row.round || null,
    start_at: row.start_at || null,
    actual_scoreA: row.actual_scorea != null ? row.actual_scorea : (row.actual_scoreA != null ? row.actual_scoreA : null),
    actual_scoreB: row.actual_scoreb != null ? row.actual_scoreb : (row.actual_scoreB != null ? row.actual_scoreB : null),
    user_name: row.user_name || row.username || null
  };
}

function getTeamFlags() {
  return {
    'المكسيك': 'mx', 'جنوب أفريقيا': 'za', 'كوريا الجنوبية': 'kr', 'التشيك': 'cz',
    'كندا': 'ca', 'البوسنة والهرسك': 'ba', 'قطر': 'qa', 'سويسرا': 'ch',
    'البرازيل': 'br', 'المغرب': 'ma', 'هايتي': 'ht', 'إسكتلندا': 'gb-sct',
    'الولايات المتحدة': 'us', 'باراغواي': 'py', 'أستراليا': 'au', 'تركيا': 'tr',
    'هولندا': 'nl', 'اليابان': 'jp', 'السويد': 'se', 'تونس': 'tn',
    'بلجيكا': 'be', 'مصر': 'eg', 'إيران': 'ir', 'نيوزيلندا': 'nz',
    'إسبانيا': 'es', 'الرأس الأخضر': 'cv', 'السعودية': 'sa', 'الأوروغواي': 'uy',
    'فرنسا': 'fr', 'السنغال': 'sn', 'العراق': 'iq', 'النرويج': 'no',
    'الأرجنتين': 'ar', 'الجزائر': 'dz', 'النمسا': 'at', 'الأردن': 'jo',
    'البرتغال': 'pt', 'الكونغو الديمقراطية': 'cd', 'أوزبكستان': 'uz', 'كولومبيا': 'co',
    'إنجلترا': 'gb-eng', 'كرواتيا': 'hr', 'غانا': 'gh', 'بنما': 'pa',
    'ألمانيا': 'de', 'كوراساو': 'cw', 'ساحل العاج': 'ci', 'الإكوادور': 'ec'
  };
}

function calculatePoints(predA, predB, actA, actB) {
  if (actA == null || actB == null) return 0;
  if (predA == null || predB == null) return 0;

  if (predA === actA && predB === actB) return 20;
  const actualDiff = actA - actB;
  const predictedDiff = predA - predB;
  const actualOutcome = Math.sign(actualDiff);
  const predictedOutcome = Math.sign(predictedDiff);

  if (actualOutcome === predictedOutcome) {
    if (actualDiff === predictedDiff) return 15;
    return 10;
  }
  return 0;
}

function getGroups() {
  return GROUPS;
}

module.exports = {
  pool,
  init,
  findUserByUsername,
  getUserById,
  createUser,
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  deleteUser,
  getMatches,
  getCurrentRound,
  setCurrentRound,
  getPublishedRounds,
  publishRound,
  unpublishRound,
  getVisiblePredictions,
  togglePredictionVisibility,
  getAllPredictionsForMatch,
  getMatchById,
  savePrediction,
  getPrediction,
  getUserPredictions,
  updateKnockoutTeams,
  updateMatchResult,
  getLeaderboard,
  getLeaderboardStats,
  getGroupStandings,
  calculateGroupStandings,
  calculatePoints,
  getTeamFlags,
  getGroups,
  initNewsTable,
  getNews,
  addNews,
  deleteNews,
  updateNews
};

async function initNewsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      image_path TEXT,
      breaking BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function getNews() {
  const result = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
  return result.rows;
}

async function addNews({ title, body, image_path, breaking }) {
  await pool.query(
    'INSERT INTO news (title, body, image_path, breaking) VALUES ($1,$2,$3,$4)',
    [title, body, image_path || null, breaking || false]
  );
}

async function deleteNews(id) {
  const result = await pool.query('DELETE FROM news WHERE id=$1 RETURNING image_path', [id]);
  return result.rows[0];
}

async function updateNews(id, { title, body, image_path, breaking }) {
  if (image_path !== undefined) {
    await pool.query(
      'UPDATE news SET title=$1, body=$2, image_path=$3, breaking=$4 WHERE id=$5',
      [title, body, image_path, breaking || false, id]
    );
  } else {
    await pool.query(
      'UPDATE news SET title=$1, body=$2, breaking=$3 WHERE id=$4',
      [title, body, breaking || false, id]
    );
  }
}
