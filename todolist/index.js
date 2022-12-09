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
    const updateTodo = (id) => {
        return fetch(`${URL}/${id}`, {
            method: "PATCH"
        }).then((res) => {
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
        let template = "";
        todos.sort((a,b)=>b.id-a.id).forEach((todo) => {
            template += `
                <li><span>${todo.content}</span><button type= "button" class="btn--update" id="${todo.id}">Update</button><button type= "button" class="btn--delete" id="${todo.id}">Delete</button></li>
            `
        })
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
            event.preventDefault();
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
            event.preventDefault();
            //const content = event.target[0].value;
            //console.log("content", content)
            //console.log(event.currentTarget, event.target)
            const { id } = event.target
            console.log(id)

            
            if (event.target.className === "btn--update") {
                // clicking on button first turns content into input 
                console.log("firstClick1")
                const todo = document.getElementById(id)
                const todoParent = todo.parentNode

                var old = todoParent.innerHTML
                console.log("old inner" , old)


                const contentText= todoParent.textContent.replace("UpdateDelete","")
                let template =`
                <input type= "text" id= "updateInput" value = ${contentText}></input><button type= "button" class="btn--update2" id="${todo.id}">Update</button><button type= "button" class="btn--delete" id="${todo.id}">Delete</button>
            `
                todoParent.innerHTML = template
            }
            else if (event.target.className === "btn--update2") {
                // clicking on button second update 

                console.log("firstClick2")
                const todo = document.getElementById(id)
                const todoParent = todo.parentNode
                const testTxt= document.getElementById("updateInput").value
                console.log("testTxt",testTxt)
                let template =`
                <li><span>${testTxt}</span><button type= "button" class="btn--update" id="${todo.id}">Update</button><button type= "button" class="btn--delete" id="${todo.id}">Delete</button></li>
            `
            todoParent.parentNode.innerHTML = template

            //clicking on button second submits content to template and retursn input to content

            // APIs.updateTodo(id).then(res => {
            //     console.log("Res", res);
            //     state.todos = [res, ...state.todos];//anti-pattern

            // });
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


