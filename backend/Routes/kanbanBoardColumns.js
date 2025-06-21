const express=require('express')
const router=express.Router()

const kanbanBoardColumns=require('../controller/kanbanBoardColumnsController')
const {isLoggedIn}=require('../middlewares/user')

router.post('/kanban_board/:boardId/columns',isLoggedIn, kanbanBoardColumns.create);
router.delete('/kanban_board/:boardId/columns/:columnId',isLoggedIn, kanbanBoardColumns.delete);
router.put('/kanban_board/:boardId/columns/:columnId',isLoggedIn, kanbanBoardColumns.update);

module.exports=router;
