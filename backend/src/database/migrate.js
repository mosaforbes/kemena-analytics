import { query } from './db.js';

const migrate = async () => {
  console.log('Starting database migration...');
  
  try {
    // Create artists table
    await query(`
      CREATE TABLE IF NOT EXISTS artists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        spotify_id VARCHAR(255) UNIQUE,
        spotify_uri VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ artists table created');

    // Create metrics table for time-series data
    await query(`
      CREATE TABLE IF NOT EXISTS metrics (
        id SERIAL PRIMARY KEY,
        artist_id INTEGER NOT NULL REFERENCES artists(id),
        metric_date DATE NOT NULL,
        
        -- Spotify metrics
        spotify_followers INTEGER,
        spotify_monthly_listeners INTEGER,
        spotify_streams_monthly INTEGER,
        spotify_streams_total BIGINT,
        spotify_playlist_reach INTEGER,
        spotify_playlist_adds_monthly INTEGER,
        spotify_saves_monthly INTEGER,
        
        -- YouTube metrics
        youtube_subscribers INTEGER,
        youtube_views_monthly INTEGER,
        youtube_views_total BIGINT,
        
        -- Instagram metrics
        instagram_followers INTEGER,
        instagram_engagement_rate DECIMAL(5, 2),
        
        -- Computed metrics
        engagement_ratio DECIMAL(10, 4),
        momentum_score INTEGER,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(artist_id, metric_date)
      )
    `);
    console.log('✓ metrics table created');

    // Create campaigns table
    await query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        artist_id INTEGER NOT NULL REFERENCES artists(id),
        name VARCHAR(255) NOT NULL,
        song_name VARCHAR(255) NOT NULL,
        featuring VARCHAR(255),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        target_weeks INTEGER,
        platforms TEXT[] DEFAULT '{}',
        strategy_notes TEXT,
        is_active BOOLEAN DEFAULT false,
        
        -- Campaign metrics
        streams_before BIGINT,
        streams_after BIGINT,
        streams_goal BIGINT,
        playlist_adds_before INTEGER,
        playlist_adds_after INTEGER,
        playlist_adds_goal INTEGER,
        radio_spins_before INTEGER,
        radio_spins_after INTEGER,
        radio_spins_goal INTEGER,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ campaigns table created');

    // Create sync_log table for tracking API syncs
    await query(`
      CREATE TABLE IF NOT EXISTS sync_logs (
        id SERIAL PRIMARY KEY,
        artist_id INTEGER NOT NULL REFERENCES artists(id),
        sync_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        records_updated INTEGER,
        error_message TEXT,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ sync_logs table created');

    // Create insights table for storing AI-generated insights
    await query(`
      CREATE TABLE IF NOT EXISTS insights (
        id SERIAL PRIMARY KEY,
        artist_id INTEGER NOT NULL REFERENCES artists(id),
        insight_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        metric VARCHAR(255),
        description TEXT NOT NULL,
        confidence_score INTEGER,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ insights table created');

    // Create indexes for better query performance
    await query(`CREATE INDEX IF NOT EXISTS idx_metrics_artist_date ON metrics(artist_id, metric_date DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_campaigns_artist ON campaigns(artist_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_insights_artist ON insights(artist_id, created_at DESC)`);
    console.log('✓ indexes created');

    console.log('✅ Database migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
