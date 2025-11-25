






import React, { useState } from 'react';



import type { Todo } from '../types';



import Modal from './Modal';







interface TodoItemProps {



  todo: Todo;



  onDelete: (id: number) => void;



  onUpdate: (id: number, text: string, completed: boolean) => void;



}







const TodoItem: React.FC<TodoItemProps> = ({ todo, onDelete, onUpdate }) => {







  // Log the props to the browser console for debugging







  console.log('Todo item props:', todo);















  const [isEditing, setIsEditing] = useState(false);



  const [text, setText] = useState(todo.title);



  const [showModal, setShowModal] = useState(false);







  const handleUpdate = () => {



    onUpdate(todo.id, text, todo.completed);



    setIsEditing(false);



  };







  const handleToggleCompleted = () => {



    onUpdate(todo.id, todo.title, !todo.completed);



  };







  const handleDeleteClick = () => {



    setShowModal(true);



  };







  const handleConfirmDelete = () => {



    onDelete(todo.id);



    setShowModal(false);



  };







  return (



    <>



      <li className="todo-item">



        <div className="todo-main">



          <input



            type="checkbox"



            checked={todo.completed}



            onChange={handleToggleCompleted}



          />



          {isEditing ? (



            <input



              type="text"



              value={text}



              onChange={(e) => setText(e.target.value)}



              className="edit-input"



            />



          ) : (



            <div className="todo-details">



              <span className="todo-text" style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>



                {todo.title}



              </span>



              <span className="todo-date">



                              {todo.created_at}



                            </span>



            </div>



          )}



        </div>



        <div className="todo-actions">



          {isEditing ? (



            <button onClick={handleUpdate}>Save</button>



          ) : (



            <button onClick={() => setIsEditing(true)}>Edit</button>



          )}



          <button onClick={handleDeleteClick}>Delete</button>



        </div>



      </li>



      <Modal



        isOpen={showModal}



        onClose={() => setShowModal(false)}



        onConfirm={handleConfirmDelete}



      >



        <p>Are you sure you want to delete this to-do?</p>



      </Modal>



    </>



  );



};







export default TodoItem;






