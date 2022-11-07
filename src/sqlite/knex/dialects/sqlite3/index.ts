// SQLite3
// -------
import defaults from 'lodash/defaults'
import map from 'lodash/map'

import Client from 'knex/lib/client'
import Knex from 'knex/types'

import Raw from 'knex/lib/raw'
import Transaction from './execution/sqlite-transaction'
import SqliteQueryCompiler from './query/sqlite-querycompiler'
import SchemaCompiler from './schema/sqlite-compiler'
import ColumnCompiler from './schema/sqlite-columncompiler'
import TableCompiler from './schema/sqlite-tablecompiler'
import ViewCompiler from './schema/sqlite-viewcompiler'
import SQLite3_DDL from './schema/ddl'
import Formatter from 'knex/lib/formatter'
import QueryBuilder from './query/sqlite-querybuilder'
// const { promisify } = require('util')
const promisify = (fn, ...args) => {
  return new Promise((resolve, reject) => {
    fn(...args, (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })
}

const TypedClient = Client // as typeof Knex.Client

// export default Client_SQLite3

export function createSqliteWasmClient(sqliteDriver: any): typeof TypedClient {
  class Client_SQLite3 extends TypedClient {
    constructor(config) {
      super(config)
      console.log('create config sqlitewasm', config)

      // this.__driver = config.driver
      this.initializeDriver()

      if (config.connection && config.connection.filename === undefined) {
        this.logger.warn(
          'Could not find `connection.filename` in config. Please specify ' +
            'the database path and name to avoid errors. ' +
            '(see docs https://knexjs.org/guide/#configuration-options)'
        )
      }

      if (config.useNullAsDefault === undefined) {
        this.logger.warn(
          'sqlite does not support inserting default values. Set the ' +
            '`useNullAsDefault` flag to hide this warning. ' +
            '(see docs https://knexjs.org/guide/query-builder.html#insert).'
        )
      }
    }

    _driver() {
      console.log('get driver', sqliteDriver)
      // return require('sqlite3')
      return sqliteDriver
      // global.sqlite3Driver
      // this.__driver
    }

    schemaCompiler() {
      return new SchemaCompiler(this, ...arguments)
    }

    transaction() {
      return new Transaction(this, ...arguments)
    }

    queryCompiler(builder, formatter) {
      return new SqliteQueryCompiler(this, builder, formatter)
    }

    queryBuilder() {
      return new QueryBuilder(this)
    }

    viewCompiler(builder, formatter) {
      return new ViewCompiler(this, builder, formatter)
    }

    columnCompiler() {
      return new ColumnCompiler(this, ...arguments)
    }

    tableCompiler() {
      return new TableCompiler(this, ...arguments)
    }

    ddl(compiler, pragma, connection) {
      return new SQLite3_DDL(this, compiler, pragma, connection)
    }

    wrapIdentifierImpl(value) {
      return value !== '*' ? `\`${value.replace(/`/g, '``')}\`` : '*'
    }

    // Get a raw connection from the database, returning a promise with the connection object.
    acquireRawConnection() {
      return new Promise((resolve, reject) => {
        // the default mode for sqlite3
        let flags = 'ct'
        //  this.driver.OPEN_READWRITE | this.driver.OPEN_CREATE

        if (this.connectionSettings.flags) {
          if (!Array.isArray(this.connectionSettings.flags)) {
            throw new Error(`flags must be an array of strings`)
          }
          this.connectionSettings.flags.forEach((_flag) => {
            if (!_flag.startsWith('OPEN_') || !this.driver[_flag]) {
              throw new Error(`flag ${_flag} not supported by node-sqlite3`)
            }
            flags = flags | this.driver[_flag]
          })
        }

        const db = new this.driver.DB(this.connectionSettings.filename, flags)
        resolve(db)
        // , (err) => {
        //   if (err) {
        //     return reject(err)
        //   }
        //   resolve(db)
        // })
      })
    }

    // Used to explicitly close a connection, called internally by the pool when
    // a connection times out or the pool is shutdown.
    async destroyRawConnection(connection) {
      const close = promisify((cb) => connection.close(cb))
      return close()
    }

    // Runs the query on the specified connection, providing the bindings and any
    // other necessary prep work.
    _query(connection, obj) {
      if (!obj.sql) throw new Error('The query is empty')

      const { method } = obj
      // let callMethod
      // switch (method) {
      //   case 'insert':
      //   case 'update':
      //     callMethod = obj.returning ? 'all' : 'run'
      //     break
      //   case 'counter':
      //   case 'del':
      //     callMethod = 'run'
      //     break
      //   default:
      //     callMethod = 'all'
      // }
      const bindings = this._formatBindings(obj.bindings)
      return new Promise(function (resolver, rejecter) {
        // if (!connection || !connection[callMethod]) {
        if (!connection) {
          return rejecter(new Error(`Error calling ${callMethod} on connection.`))
        }

        // const statement = connection.prepare(obj.sql)

        const resultRows = []
        try {
          connection.exec({
            sql: obj.sql,
            bind: bindings,
            rowMode: 'object',
            resultRows,
          })
        } catch (e) {
          rejecter(e)
          return
        }
        console.log('got result rows', resultRows)
        obj.response = resultRows
        obj.context = {}
        resolver(obj)

        // try {
        //   statement.bind(bindings)
        // } finally {
        //   statement.finalize()
        // }

        // connection[callMethod](obj.sql, obj.bindings, function (err, response) {
        //   if (err) return rejecter(err)
        //   obj.response = response

        //   // We need the context here, as it contains
        //   // the "this.lastID" or "this.changes"
        //   obj.context = this

        //   return resolver(obj)
        // })
      })
    }

    _formatBindings(bindings) {
      if (!bindings) {
        return []
      }
      return bindings.map((binding) => {
        if (binding instanceof Date) {
          return binding.valueOf()
        }

        if (typeof binding === 'boolean') {
          return Number(binding)
        }

        return binding
      })
    }

    _stream(connection, obj, stream) {
      if (!obj.sql) throw new Error('The query is empty')

      const client = this
      return new Promise(function (resolver, rejecter) {
        stream.on('error', rejecter)
        stream.on('end', resolver)

        return client
          ._query(connection, obj)
          .then((obj) => obj.response)
          .then((rows) => rows.forEach((row) => stream.write(row)))
          .catch(function (err) {
            stream.emit('error', err)
          })
          .then(function () {
            stream.end()
          })
      })
    }

    // Ensures the response is returned in the same format as other clients.
    processResponse(obj, runner) {
      const ctx = obj.context
      const { response, returning } = obj
      if (obj.output) return obj.output.call(runner, response)
      switch (obj.method) {
        case 'select':
          return response
        case 'first':
          return response[0]
        case 'pluck':
          return map(response, obj.pluck)
        case 'insert': {
          if (returning) {
            if (response) {
              return response
            }
          }
          return [ctx.lastID]
        }
        case 'update': {
          if (returning) {
            if (response) {
              return response
            }
          }
          return ctx.changes
        }
        case 'del':
        case 'counter':
          return ctx.changes
        default: {
          return response
        }
      }
    }

    poolDefaults() {
      return defaults({ min: 1, max: 1 }, super.poolDefaults())
    }

    formatter(builder) {
      return new Formatter(this, builder)
    }

    values(values, builder, formatter) {
      if (Array.isArray(values)) {
        if (Array.isArray(values[0])) {
          return `( values ${values
            .map((value) => `(${this.parameterize(value, undefined, builder, formatter)})`)
            .join(', ')})`
        }
        return `(${this.parameterize(values, undefined, builder, formatter)})`
      }

      if (values instanceof Raw) {
        return `(${this.parameter(values, builder, formatter)})`
      }

      return this.parameter(values, builder, formatter)
    }
  }

  Object.assign(Client_SQLite3.prototype, {
    dialect: 'sqlitewasm',

    driverName: 'sqlitewasm',
  })

  return Client_SQLite3
}
