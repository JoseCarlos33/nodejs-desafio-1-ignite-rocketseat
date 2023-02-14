import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persist()
      })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }

  select(table, search) {
    let data = this.#database[table] ?? []
    const hasValidSearchParams =  Object.entries(search).some(([key, value]) => {
      return !!value
    })

    if (hasValidSearchParams) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key]?.includes(value)
        })
      })
    }


    return data
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()

    return data
  }

  update(table, id, data, completedAt) {
    const rowIndex = this.#database[table]?.findIndex(row => row.id === id)
    console.log("try update complete", completedAt)
    if (rowIndex > -1) {
      const currentRow = this.#database[table][rowIndex]
      this.#database[table][rowIndex] = { 
        ...currentRow,
        title: data?.title ?? currentRow.title,
        description: data?.description ?? currentRow.description,
        completed_at: completedAt ?? null
      }
      this.#persist()

      return this.#database[table][rowIndex]
    }

    return null;
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }
}
