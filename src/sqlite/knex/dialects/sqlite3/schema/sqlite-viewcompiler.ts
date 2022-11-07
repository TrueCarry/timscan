/* eslint max-len: 0 */

import ViewCompiler from 'knex/lib/schema/viewcompiler.js'
import { columnize as columnize_ } from 'knex/lib/formatter/wrappingFormatter'

class ViewCompiler_SQLite3 extends ViewCompiler {
  constructor(client, viewCompiler) {
    super(client, viewCompiler)
  }

  createOrReplace() {
    const columns = this.columns
    const selectQuery = this.selectQuery.toString()
    const viewName = this.viewName()

    const columnList = columns
      ? ' (' + columnize_(columns, this.viewBuilder, this.client, this.bindingsHolder) + ')'
      : ''

    const dropSql = `drop view if exists ${viewName}`
    const createSql = `create view ${viewName}${columnList} as ${selectQuery}`

    this.pushQuery({
      sql: dropSql,
    })
    this.pushQuery({
      sql: createSql,
    })
  }
}

export default ViewCompiler_SQLite3
