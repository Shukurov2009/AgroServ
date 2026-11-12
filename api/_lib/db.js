import pg from 'pg'

const { Pool } = pg
const globalForPg = globalThis

export function getPool() {
  if (!globalForPg.__agroservPool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
    if (!connectionString) throw new Error('DATABASE_URL topilmadi')
    globalForPg.__agroservPool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=disable') ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    })
    globalForPg.__agroservPool.on('error', (error) => {
      console.error('Postgres pool error:', error.message)
    })
  }
  return globalForPg.__agroservPool
}

export function query(text, params) {
  return getPool().query(text, params)
}

export async function withTransaction(callback) {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}
