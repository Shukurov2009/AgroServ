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
      keepAlive: true,
    })
    globalForPg.__agroservPool.on('error', (error) => {
      console.error('Postgres pool error:', error.message)
    })
  }
  return globalForPg.__agroservPool
}

const TRANSIENT_CODES = new Set(['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE'])

function isTransient(error) {
  return (
    TRANSIENT_CODES.has(error?.code) ||
    /Connection terminated|connection error|Connection closed/i.test(error?.message || '')
  )
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function query(text, params) {
  const readOnly = /^\s*(select|with)\b/i.test(text)
  const attempts = readOnly ? 3 : 1
  let lastError
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await getPool().query(text, params)
    } catch (error) {
      lastError = error
      if (!readOnly || !isTransient(error) || attempt === attempts - 1) throw error
      await sleep(100 * (attempt + 1))
    }
  }
  throw lastError
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
