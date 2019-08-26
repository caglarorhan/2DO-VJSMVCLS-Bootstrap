class Model {
    constructor() {
        if(!localStorage.getItem('uid_const')){
            localStorage.setItem('uid_const','0');
        }
        if(!localStorage.getItem('myToDos')) {
            this.todos = [];
            localStorage.setItem('myToDos', JSON.stringify(this.todos));
        } else {
            this.todos = JSON.parse(localStorage.getItem('myToDos'));
        }
    }
    addToDo(todoObj){
        //
        if(!todoObj.header){
            alert('ToDo tasks need at least a name/header to be saved!');
            return false;
        }

        //
        let todo = {
            id: parseInt(localStorage.getItem('uid_const'))+1,
            header:todoObj.header,
            info:todoObj.info,
            createDate: new Date(),
            completed: false,
            completeDate: new Date('01/01/2999')
        };

        this.todos.push(todo);
        localStorage.setItem('myToDos', JSON.stringify(this.todos));
        localStorage.setItem('uid_const',(parseInt(localStorage.getItem('uid_const'))+1).toString());

        this.reRefreshToDoList();
        this.reRefreshBindDeleteToDo();
        this.reRefreshBindDetailsToDo();
        return true;
    }

    getToDos(){
        this.todos = JSON.parse(localStorage.getItem('myToDos'));
        return this.todos;
    }

    findToDoIndex(todoID){
        let todos = this.getToDos();
        let todosLength =todos.length;
        for(let todoIndex=0; todoIndex<todosLength; todoIndex++){
            if(parseInt(todos[todoIndex].id)===parseInt(todoID)){
                return todoIndex;
            }
        }
        return -1;
    }


    //delete todo
    deleteToDo(todoID){
        if(this.findToDoIndex(todoID)===-1){
            console.log(`Couldn't find the todo record!`);
            return false;
        }
        let todoIndex= this.findToDoIndex(todoID);
        let oToDo = this.todos[todoIndex];
        if(confirm(`Do you want to delete ${oToDo.header}?`)){
            let a_1 = this.todos.slice(0,todoIndex);
            let a_2 = this.todos.slice(todoIndex+1, this.todos.length);
            this.todos = a_1.concat(a_2);
            localStorage.setItem('myToDos', JSON.stringify(this.todos));
            localStorage.setItem('uid_const',(parseInt(localStorage.getItem('uid_const'))-1).toString());
            this.reRefreshToDoList();
            this.reRefreshBindDeleteToDo();
            this.reRefreshBindUpdateToDo();
            this.reRefreshBindDetailsToDo();
            return true;
        }else{
            return false;
        }

    }

    //details of todo

    detailsToDo(todoID){
        if(this.findToDoIndex(todoID)===-1){
            console.log(`Couldn't find the todo record!`);
            return false;
        }
        let todoIndex= this.findToDoIndex(todoID);
        let oToDo = this.todos[todoIndex];
        alert(`
              Info: ${oToDo.info}
              Complation: ${oToDo.completed? 'Completed!': 'Not completed!'}
              ${oToDo.completed ? 'Completed on: '+ oToDo.completeDate:''}
        `);

    }



    // update todo
    updateToDo(todoID){
        if(this.findToDoIndex(todoID)===-1){
            alert(`Couldn't find the todo record!`);
            return false;
        }
        let todoIndex= this.findToDoIndex(todoID);
        let oToDo = this.todos[todoIndex];
        oToDo.completed = !oToDo.completed;
        if(oToDo.completed){
            oToDo.completeDate= new Date();
        }else{
            oToDo.completeDate= new Date('01/01/2999')
        }
        this.todos[todoIndex]=oToDo;
        localStorage.setItem('myToDos', JSON.stringify(this.todos));
        this.reRefreshToDoList();
        this.reRefreshBindDeleteToDo();
        this.reRefreshBindUpdateToDo();
        this.reRefreshBindDetailsToDo();

    }

    bindRefreshToDoList(callback){
        this.reRefreshToDoList = callback;
    }

    bindRefreshBindDeleteToDo(callback){
        this.reRefreshBindDeleteToDo = callback;
    }

    bindRefreshBindDetailsToDo(callback){
        this.reRefreshBindDetailsToDo = callback;
    }

    bindRefreshUpdateToDo(callback){
        this.reRefreshBindUpdateToDo = callback;
    }

}

class View {
    constructor() {
        this.todoName = document.querySelector('#taskName');
        this.todoInfo = document.querySelector('#taskInformation');
        this.addToDoButton = document.querySelector('#taskSubmitButton');
    }


    get _thisName(){
        return this.todoName.value;
    }
    get _thisInfo(){
        return this.todoInfo.value;
    }



    bindAddToDo(handler){
        this.addToDoButton.addEventListener('click', async ()=>{
            let todoLists = await handler({header:this._thisName, info:this._thisInfo});
            if(todoLists){
                this.todoName.value='';
                this.todoInfo.value='';
                this.todoName.focus();
            }
        });
    }

    bindDeleteToDo(handler){
        let buttons = document.querySelectorAll('button.todoDelete');
        buttons.forEach((theButton)=>{
            theButton.addEventListener('click',async ()=>{
                let responseFromProcess = await handler(theButton.dataset.id);
                //console.log(responseFromProcess)
                if(responseFromProcess){
                    console.log('Done! Deleted!');
                }
            })
        })
    }

    bindDetailsToDo(handler){
        let buttons = document.querySelectorAll('button.todoDetails');
        buttons.forEach((theButton)=>{
            theButton.addEventListener('click',async ()=>{
                let responseFromProcess = await handler(theButton.dataset.id);
                //console.log(responseFromProcess)
                if(responseFromProcess){
                    console.log('Here are the details!');

                }
            })
        })
    }

    bindUpdateToDo(handler){
        let doneChecks = document.querySelectorAll('input.todoDone');
        doneChecks.forEach((oCheckBox)=>{
            oCheckBox.addEventListener('click',async ()=>{
                let responseFromProcess = await handler(oCheckBox.dataset.id);
                if(responseFromProcess){
                    console.log('Condition changed!');
                }
            })
        })
    }

    listToDos(toDoList){
        let listContainer;
        listContainer = document.getElementById('todoListContainer');
        listContainer.innerHTML='';


        if(toDoList.length<1){
            listContainer.innerHTML='There is no todo in the list!'
        }else{
            // todo list
            toDoList.forEach((todo)=>{
                listContainer.innerHTML += `
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <div class="input-group-text">
                                <input type="checkbox" ${todo.completed?"checked":''}  data-id="${todo.id}" aria-label="Checkbox for following text input" class="todoDone">
                            </div>
                            </div>
                        
    
                        <span type="text" class="form-control ml-auto" aria-label="Text input with checkbox" title="${todo.info}"><b>${todo.header}</b></span>
                        <div class="input-group-append" id="button-addon4">
                            <button class="btn btn-outline-info todoDetails" type="button" data-id="${todo.id}">Details</button>
                            <button class="btn btn-outline-danger todoDelete" type="button" data-id="${todo.id}">Delete</button>
                        </div>
                    </div>`;
            })
        }

    }




}
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.view.bindAddToDo((tobj) => { return this.model.addToDo(tobj)});

        this.view.listToDos(this.model.getToDos());
        this.model.bindRefreshToDoList(()=>{this.view.listToDos(this.model.getToDos());});

        this.view.bindDeleteToDo((todoId) => {this.model.deleteToDo(todoId)});
        this.model.bindRefreshBindDeleteToDo(()=> this.view.bindDeleteToDo((todoId) => {this.model.deleteToDo(todoId)}));

        this.view.bindDetailsToDo((todoId) => {this.model.detailsToDo(todoId)});
        this.model.bindRefreshBindDetailsToDo(()=> this.view.bindDetailsToDo((todoId) => {this.model.detailsToDo(todoId)}));

        this.view.bindUpdateToDo((todoId)=>{this.model.updateToDo(todoId)});
        this.model.bindRefreshUpdateToDo(()=>{this.view.bindUpdateToDo((todoId)=>{this.model.updateToDo(todoId)})})
    }






}

window.addEventListener('load',function(){
    const app = new Controller(new Model(), new View());
});


