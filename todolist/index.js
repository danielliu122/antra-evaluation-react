const APIs = (() => {
    const URL = "http://localhost:3000/todos";

    const addTodo = (newTodos) => {
        return fetch(URL, {
            method: "POST",
            body: JSON.stringify(newTodos),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            return res.json();
        })
    }


    const deleteTodo = (id) => {
        return fetch(`${URL}/${id}`, {
            method: "DELETE"
        }).then((res) => {
            return res.json();
        })
    };

    // update Todo
    const updateTodo = (todo,id) => {
        console.log(todo, id)
        return fetch(`${URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(todo),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            console.log(res, JSON.stringify(todo))
            return res.json();
        })
    };

    // update status
    const updateStatus = (todo,id) => {
        console.log(todo, id)
        return fetch(`${URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(todo),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            console.log(res, JSON.stringify(todo))
            return res.json();
        })
    };


    const getTodos = () => {
        return fetch(`${URL}`).then((res) => {
            return res.json();
        })
    }

    return {
        getTodos,
        deleteTodo,
        updateTodo,
        updateStatus,
        addTodo
    }
})()




/* 
    closure, IIFE
    event bubbling, event capturing
    json server
*/
const Model = (() => {
    class State {
        #todos;
        #onChangeCb;
        constructor() {
            this.#todos = [];
            this.#onChangeCb = () => { }
        }
        get todos() {
            return this.#todos
        }
        set todos(newTodos) {
            this.#todos = newTodos
            this.#onChangeCb();
        }

        subscribe = (cb) => {
            this.#onChangeCb = cb;
        }
    }
    return {
        State
    }

})();

/* 
    [
        {content:"work",id:1},
        {content:"eat",id:2}
    ]
*/

const View = (() => {
    const formEl = document.querySelector(".todo__form");
    const todoListEl = document.querySelector(".todo__list");
    const renderTodolist = (todos) => {
        let template, template1, template2 = "";
        todos.sort((a,b)=>b.id-a.id).forEach((todo) => {
            console.log(todo, todos)
            if (todo.status === "pending"){
            template1 += `
                <li><span class="pending" id= "${todo.id}"<p style = "text-decoration:line-through; color: grey" class="resolvedStatus"> ${todo.content}</p></span><button type= "button" class="btn--update" id="${todo.id}">Update</button><button type= "button" class="btn--delete" id="${todo.id}">Delete</button>
            `
            }
            else {
            template2 += `
                <li><span id="${todo.id}">${todo.content}  </span><button type= "button" class="btn--update" id="${todo.id}">Update</button><button type= "button" class="btn--delete" id="${todo.id}">Delete</button></li>
            `
            }
        })
        template= template2+template1
        todoListEl.innerHTML = template;
    }
    return {
        formEl,
        renderTodolist,
        todoListEl
    }
})();



const ViewModel = ((Model, View) => {
    const state = new Model.State();
    
    const addTodo = () => {
        View.formEl.addEventListener("submit", (event) => {
            event.preventDefault();
            const content = event.target[0].value;
            if(content.trim() === "") return;
            const newTodo = { content }
            APIs.addTodo(newTodo).then(res => {
                console.log("Res", res);
                state.todos = [res, ...state.todos];//anti-pattern
            })

        })
    }

    const deleteTodo = () => {
        View.todoListEl.addEventListener("click", (event) => {
            console.log(event.currentTarget, event.target)
            const { id } = event.target
            if (event.target.className === "btn--delete") {
                APIs.deleteTodo(id).then(res => {
                    console.log("Res", res);
                    state.todos = state.todos.filter((todo) => {
                        return +todo.id !== +id
                    });
                });
            }
        })
    }

    // update Todo
    const updateTodo = () => {
        View.todoListEl.addEventListener("click", (event) => {
            const { id } = event.target
            console.log(id)

            
            if (event.target.className === "btn--update") {
                // clicking on button first turns content into input 
                const todo = event.target
                const todoParent = todo.parentNode


                const contentText= todoParent.textContent.replace("UpdateDelete","").trim("")
                let template =`
                <input type= "text" id= "updateInput" value = ${contentText}></input><button type= "button" class="btn--update2" id="${todo.id}">Update</button><button type= "button" class="btn--delete" id="${todo.id}">Delete</button>
            `
                todoParent.innerHTML = template
            }
            else if (event.target.className === "btn--update2") {
                // clicking on button second update 
                const todo = event.target
                const todoParent = todo.parentNode
                const testTxt= document.getElementById("updateInput").value


                
                let template =`
                <span>${testTxt}</span><button type= "button" class="btn--update" id="${todo.id}">Update</button><button type= "button" class="btn--delete" id="${todo.id}">Delete</button>
            `
                 todoParent.innerHTML = template

                // patch to api ?
                let contentText = todoParent.textContent.replace("UpdateDelete","").trim("")
                let contentText2 = {
                    content: contentText
                }
                APIs.updateTodo(contentText2, id)


            }
        })
    }
    // updateStatus
    // return todo list where order finished status lower

    const updateStatus = () => {
        View.todoListEl.addEventListener("dblclick", (event) => {
            const { id } = event.target
            console.log(event.target)
            
            if (event.target.className !== "resolvedStatus" && event.target.className !== "btn--update"&& event.target.className !== "btn--delete"){
                console.log("first click updatestatus")
                const todo = event.target;
                const todoParent = event.target.parentNode;
                todoParent.innerHTML= `
            <span  id="${todo.id}"><p style = "text-decoration:line-through; color: grey"  id="${todo.id}" class="resolvedStatus"> ${todo.textContent}</p></span><button type= "button" class="btn--update" id="${todo.id}">Update</button><button type= "button" class="btn--delete" id="${todo.id}">Delete</button>
            `
                console.log(todoParent.id, todo.id)
            // patch to api ?
            let contentText = todo.textContent.replace("UpdateDelete","").trim("")
            let contentText2 = {
                content: contentText,
                status: "pending"
            }

            APIs.updateStatus(contentText2, id).then(res => {
                console.log("Res", res);
            })
            

            }
            else if (event.target.className === "resolvedStatus" && event.target.className !== "btn--update" && event.target.className !== "btn--delete"){
                console.log("second click updatestatus")
                const todo = event.target
                const todoParent = todo.parentNode.parentNode
                todoParent.innerHTML= `
                <span> ${todo.textContent}</p></span><button type= "button" class="btn--update" id="${todo.id}">Update</button><button type= "button" class="btn--delete" id="${todo.id}">Delete</button>
                
                `
                // patch to api ?
                let contentText = todo.textContent.replace("UpdateDelete","").trim("")
                let contentText2 = {
                    content: contentText,
                    status: "resolved"
                }
                APIs.updateStatus(contentText2, id)

            }
            
        })

    }

    const getTodos = ()=>{
        APIs.getTodos().then(res=>{
            state.todos = res;
        })
    }

    const bootstrap = () => {
        addTodo();
        deleteTodo();
        updateTodo();
        updateStatus();
        getTodos();
        state.subscribe(() => {
            View.renderTodolist(state.todos)
        });
    }
    return {
        bootstrap
    }
})(Model, View);

ViewModel.bootstrap();


