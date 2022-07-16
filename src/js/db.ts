import Dexie from 'dexie'
import { AccountState } from './api'
import { AccountPlainState } from './models/AccountState'

interface IState {
  address: string
  raw: string
}
class AppDb extends Dexie {
  accounts!: Dexie.Table<AccountPlainState, string>

  constructor() {
    super('AppDb')
    this.version(1).stores({
      accounts: 'address',
    })
  }
}

export default AppDb
