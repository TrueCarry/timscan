import {Cell} from "@/ton/src"

export const cellToBoc = (cell: Cell) => {
    return cell.toBoc({idx: false}).toString('base64')
}

export const bocToCell = (boc: string) => {
    return Cell.fromBoc(Buffer.from(boc, 'base64'))[0]
}