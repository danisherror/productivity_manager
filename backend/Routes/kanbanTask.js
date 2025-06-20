const express=require('express')
const router=express.Router()

const kanbanTaskController=require('../controller/kanbanTaskController')
const {isLoggedIn}=require('../middlewares/user')

router.get('/kanban_task/:boardId/tasks',isLoggedIn, kanbanTaskController.getAll);
router.get('/kanban_task/:boardId/tasks/:taskId',isLoggedIn, kanbanTaskController.getById);
router.post('/kanban_task/:boardId/tasks',isLoggedIn, kanbanTaskController.create);
router.put('/kanban_task/:boardId/tasks/:taskId',isLoggedIn, kanbanTaskController.update);
router.delete('/kanban_task/:boardId/tasks/:taskId',isLoggedIn, kanbanTaskController.delete);
module.exports=router;
