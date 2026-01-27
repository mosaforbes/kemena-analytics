#!/usr/bin/env node

/**
 * Remote Migration Runner
 * This script connects to the Railway PostgreSQL database and runs migrations
 * Usage: node backend/scripts/run-migrations.js <DATABASE_URL>
 * 
 * If DATABASE_URL is not provided, it will use the RAILWAY_DATABASE_URL or .env values
 */

import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

const getDatabaseConfig = () => {
  // Try to use DATABASE_URL from Railway
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  }

  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'kemena_analytics',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
};

const runMigrations = async () => {
  const config = getDatabaseConfig();
  const pool = new Pool(config);

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();
    console.log('✓ Connected to database');

    console.log('\n📊 Running migrations...\n');

    // Migration 1: Create artists table
    console.log('→ Creating artists table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS artists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        spotify_id VARCHAR(255) UNIQUE,
        spotify_uri VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ artists table created');

    // Migration 2: Create metrics table
    console.log('→ Creating metrics table...');
    await client.query(`
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
    console.log('  ✓ metrics table created');

    // Migration 3: Create campaigns table
    console.log('→ Creating campaigns table...');
    await client.query(`
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
    console.log('  ✓ campaigns table created');

    // Migration 4: Create sync_logs table
    console.log('→ Creating sync_logs table...');
    await client.query(`
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
    console.log('  ✓ sync_logs table created');

    // Migration 5: Create insights table
    console.log('→ Creating insights table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS insights (
        id SERIAL PRIMARY KEY,
        artist_id INTEGER NOT NULL REFERENCES artists(id),
        insight_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        metric_value DECIMAL(10, 2),
        metric_unit VARCHAR(50),
        action_items TEXT,
        confidence_level VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ insights table created');

    // Create indexes for performance
    console.log('\n→ Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_metrics_artist_date 
      ON metrics(artist_id, metric_date DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_campaigns_artist 
      ON campaigns(artist_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sync_logs_artist 
      ON sync_logs(artist_id)
    `);
    console.log('  ✓ Indexes created');

    client.release();

    console.log('\n✅ All migrations completed successfully!\n');
    console.log('📋 Schema Summary:');
    console.log('  • artists - Artist profiles');
    console.log('  • metrics - Time-series metrics data');
    console.log('  • campaigns - Campaign tracking');
    console.log('  • sync_logs - Sync operation logs');
    console.log('  • insights - AI-generated insights\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Verify DATABASE_URL or .env variables');
    console.error('  2. Ensure PostgreSQL is running');
    console.error('  3. Check database credentials\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run migrations
runMigrations();
