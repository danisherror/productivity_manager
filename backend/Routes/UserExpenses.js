const express=require('express')
const router=express.Router()
const expensesController=require('../controller/UserExpensesController')
const {isLoggedIn}=require('../middlewares/user')

router.get('/user_expense_getAll',isLoggedIn, expensesController.getAll);
router.get('/user_expense_getByID/:id',isLoggedIn, expensesController.getById);
router.post('/user_expense_create',isLoggedIn, expensesController.create);
router.put('/user_expense_update/:id',isLoggedIn, expensesController.update);
router.delete('/user_expense_delete/:id',isLoggedIn, expensesController.delete);
module.exports=router;