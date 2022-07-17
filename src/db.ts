import Dexie from 'dexie'
// import { AccountState } from './api'
import { AccountPlainState } from './models/AccountState'
import { PlainTransaction } from './models/Transaction'

// interface IState {
//   address: string
//   raw: string
// }
class AppDb extends Dexie {
  accounts!: Dexie.Table<AccountPlainState, string>
  transactions!: Dexie.Table<PlainTransaction, string>

  constructor() {
    super('AppDb')
    this.version(3).stores({
      accounts: 'address',
      transactions: '[address+lt],hash',
    })
  }
}

export default AppDb
