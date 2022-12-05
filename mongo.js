const mongoose = require('mongoose')

if(process.argv.length < 3){
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}else if (process.argv.length > 5){
    console.log('not valid arguments')
    console.log(process.argv.length)
    process.exit(1)
}



const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

/*if(process.argv[3]){
    const name = process.argv[3]
}
if(process.argv[4]){
    const number = process.argv[4]
}*/

const url = `mongodb+srv://fullstackOpen:${password}@cluster0.jtolom4.mongodb.net/?retryWrites=true&w=majority`



const personSchema = new mongoose.Schema({
    name: String,
    number: Number,
})

const Person = mongoose.model('Person', personSchema)


if(name && number){
    mongoose
        .connect(url)
        .then((result) => {
            console.log('connected')

            const person = new Person({
                number: number,
                name: name,
            })

            return person.save()
        })
        .then(() => {
            console.log(`added ${name} ${number} to phonebook`)
            return mongoose.connection.close()
        })
        .catch((err) => console.log(err))
} else {
    mongoose.connect(url)
        .then(() => {
            Person.find({}).then(result => {
                console.log('phonebook')
                result.forEach(person => {
                    console.log(`${person.name} ${person.number}`)
                    mongoose.connection.close()
                })
            })            
        })                
        .catch((err) => console.log(err))    
}





