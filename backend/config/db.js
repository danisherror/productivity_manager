const mongoose=require('mongoose')
mongoose.set('strictQuery',false)                 // Withouth querying as well it will remain connected

process.env.DB_URL
const connectWithDb1 =()=>{
    mongoose.connect(process.env.MONGO_URI_1)
    .then(console.log("Db got connected"))
    .catch(error=>{
        console.log(`DB CONNECTION ISSUES`);
        console.log(error)
        // process.exit(1);
    })
}

module.exports=connectWithDb1