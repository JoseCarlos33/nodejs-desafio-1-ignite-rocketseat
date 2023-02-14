import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { id, title, description} = req.query
      
      const tasks = database.select('tasks', {
        id,
        title,
        description
      })

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null,
      }

      database.insert('tasks', task)

      return res.writeHead(201, { "Content-Type": "application/json" }).end(JSON.stringify(task));
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: async (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      const updatedTask = await database.update('tasks', id, {
        title,
        description,
      })
      
      if(updatedTask){
        return res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(updatedTask));
      }
      
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({error: "Erro ao atualizar task, por favor verifique os dados e tente novamente."}));
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/:completeParam'),
    handler: async (req, res) => {
      const { id, completeParam } = req.params
      const completeTaskDate = completeParam === "complete" ? new Date() : null;

      console.log("VERIFICATION", completeParam === "complete", completeTaskDate)
      const updatedTask = await database.update('tasks', id, null, completeTaskDate)
      
      if(updatedTask){
        return res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(updatedTask));
      }
      
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({error: "Erro ao atualizar task, por favor verifique os dados e tente novamente."}));
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  }
]
