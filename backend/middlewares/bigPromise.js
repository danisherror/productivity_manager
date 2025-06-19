//we are using this to use try catch and aync-await

module.exports=func=>(req,res,next)=>
    Promise.resolve(func(req,res,next)).catch(next)