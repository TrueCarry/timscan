import * as sqlite from './sqlite/sqlite3'
import knex from 'knex'
// import makeKnex from 'knex/lib/knex-builder/make-knex'
// import { resolveConfig } from 'knex/lib/knex-builder/internal/config-resolver'
// import { createSqliteWasmClient } from './sqlite/knex/dialects/sqlite3'
import createSqliteWasmClient from '../../knex-dialect-sqlite-wasm'
import { delay } from './utils/callTonApi'

// knex.bui

// function knex(config, db) {
//   const { resolvedConfig } = resolveConfig(config)
//   const Dialect = sqliteDialect
//   resolvedConfig.driver = db

//   const newKnex = makeKnex(new Dialect(resolvedConfig))
//   if (resolvedConfig.userParams) {
//     newKnex.userParams = resolvedConfig.userParams
//   }
//   return newKnex
// }

export async function initSqlite() {
  const init = await sqlite.sqlite3InitModule()
  const { sqlite3 } = init
  console.log('init sql', sqlite3)
  const log = console.log
  global.sqlite3Driver = sqlite3.oo1

  const capi = sqlite3.capi /* C-style API */
  const oo = sqlite3.oo1 /* high-level OO API */
  log('sqlite3 version', capi.sqlite3_libversion(), capi.sqlite3_sourceid())
  // const db = new oo.DB('/mydb.sqlite3', 'ct')
  // log('transient db =', db.filename)

  try {
    // db.exec('CREATE TABLE IF NOT EXISTS t(a integer,b integer)')
    // db.exec('INSERT INTO t(a,b) VALUES(1,2)')
    // db.exec('INSERT INTO t(a,b) VALUES(3,2)')
    const db = knex({
      client: createSqliteWasmClient(oo),
      connection: '/mydb.sqlite3',
    })
    await db.raw(`CREATE TABLE IF NOT EXISTS t(a integer,b integer)`)
    await db('t').insert({
      a: 5,
      b: 6,
    })
    console.log('knexDb', await db('t').select('a'))

    await Promise.all([
      db
        .transaction(async (trx) => {
          await trx('t').insert({
            a: 7,
            b: 8,
          })
          await delay(10000)
          console.log('knexDb2', await trx('t').select('a'))
          // throw new Error('wtf')
        })
        .catch((e) => {}),
      db
        .transaction(async (trx) => {
          await trx('t').insert({
            a: 10,
            b: 11,
          })
          await delay(10000)
          console.log('knexDb2', await trx('t').select('a'))
          // throw new Error('wtf')
        })
        .catch((e) => {}),
    ])
    console.log('knexDb3', await db('t').select('a'))

    // log('Create a table...')

    // // Equivalent:
    // // db.exec({
    // //   sql: 'CREATE TABLE IF NOT EXISTS t(a,b)',
    // //   // ... numerous other options ...
    // // })
    // db.exec('INSERT INTO t(a,b) VALUES (1,2)')
    // const resultRows = []
    // const res = db.exec(`SELECT * FROM t`, {
    //   resultRows,
    // })
    // console.log('res', res, resultRows)
  } finally {
    //   db.close()
  }

  // const
  // const init = await sqlite3InitModule()
  // console.log('init', init)
  // sqlite3InitModuleState

  // window.sqlite3InitModule().then(function (sqlite3) {
  //   // The module is now loaded and the sqlite3 namespace
  //   // object was passed to this function.
  //   console.log('sqlite3:', sqlite3)
  // })
}
