const Person = require('./models/person')
require('dotenv').config()


const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
//const { Model } = require('mongoose')

const app = express()

/*let persons = [
    {
      "id": 1,
      "name": "Arto Hellas",
      "number": "040-123456"
    },
    {
      "id": 2,
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": 3,
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]
*/


app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('content', (req,) => {
  return JSON.stringify(req.body)
})

//app.use(morgan('tiny'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  const date = new Date()

  Person.countDocuments({}, (err, count) => {
    if (err){
      console.log(err)
    }else{
      console.log(count)
      response.send(`
                <div>Phonebook has info for ${count} people</div>
                <div>${date}</div>
                `
      )
    }
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))

  /*const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }*/
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    }).catch(error => next(error))
})

/*const generateId = () => {
    id = Math.floor(Math.random() * 100000) + 1
    console.log(id)
    return id
}*/

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if(body.name === undefined || body.number === undefined){
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  Person.countDocuments( { name: body.name },function(err, count) {
    if(count>0){
      return response.status(400).json({
        error: 'user already exists'
      })
    } else {
      person.save().then(savedPerson => {
        response.json(savedPerson.toJSON())
      })
        .catch(error => next(error))
    }
  })

})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true } )
    .then(updatePerson => {
      response.json(updatePerson)
    })
    .catch(error => next(error))
})

/*app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
          })
    }
    if (persons.find(person => person.name === body.name)){
        console.log(persons.find(person => person.name === body.name))
        return response.status(400).json({
            error: 'name must be unique'
          })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})*/

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})