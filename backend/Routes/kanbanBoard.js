const express=require('express')
const router=express.Router()

const kanbanBoardController=require('../controller/kanbanBoardController')
const {isLoggedIn}=require('../middlewares/user')

router.get('/kanban_board_getAll',isLoggedIn, kanbanBoardController.getAll);
router.get('/kanban_board_getByID/:boardId',isLoggedIn, kanbanBoardController.getById);
router.post('/kanban_board__create',isLoggedIn, kanbanBoardController.create);
router.put('/kanban_board__update/:boardId',isLoggedIn, kanbanBoardController.update);
router.delete('/kanban_board__delete/:boardId',isLoggedIn, kanbanBoardController.delete);
module.exports=router;
