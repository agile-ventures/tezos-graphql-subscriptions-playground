export type Block = {
    hash: string
    operations: any[]
}

export type Operation = {
    kind: string
    hash: string
    contents: any[]
}

export type Content = {
    kind: string
    hash: string
}