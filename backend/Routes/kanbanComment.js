const express=require('express')
const router=express.Router()

const kanbanCommentController=require('../controller/kanbanCommentController')
const {isLoggedIn}=require('../middlewares/user')

router.get('/kanban_comment/:taskId/comments',isLoggedIn, kanbanCommentController.getAll);
router.post('/kanban_comment/:taskId/comments',isLoggedIn, kanbanCommentController.create);
router.put('/kanban_comment/comments/:commentId',isLoggedIn, kanbanCommentController.update);
router.delete('/kanban_comment/comments/:commentId',isLoggedIn, kanbanCommentController.delete);
module.exports=router;
