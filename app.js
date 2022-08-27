const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

let database = null;

const dbPath = path.join(__dirname, "todoApplication.db");

const intialiseDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running with http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db error : ${e.message}`);
    process.exit(1);
  }
};

intialiseDbAndServer();

/*  Scenario 1   &  Scenario 2
    
   /todos/?priority=HIGH

   Returns a list of all todos whose priority is 'HIGH' */

app.get("/todos/", async (request, response) => {
  const { priority, status, search_q } = request.query;

  const q = `
              SELECT
                *
               FROM
                Todo
               WHERE
                priority LIKE '${priority}' OR
                status LIKE '${status}' OR 
                todo LIKE '%${search_q}%'
                ;`;
  const r = await database.all(q);
  response.send(r);
});

/*
 Scenario 3 
    
 Returns a list of all todos whose priority is 'HIGH' and status is 'IN PROGRESS'

/todos/?priority=HIGH&status=IN%20PROGRESS */

app.get("/todos/", async (request, response) => {
  const { priority, status } = request.query;

  const Q = `
              SELECT
                *
               FROM
                Todo
               WHERE
                priority LIKE '${priority}' AND 
                status LIKE '${status}'
                ;`;
  const r = await database.all(Q);
  response.send(r);
});

 /* API 2
   Path: `/todos/:todoId/`
   Returns a specific todo based on the todo ID   */

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const Q = `
              SELECT
                *
               FROM
                Todo
               WHERE
                id = ${todoId}
                ;`;
  const r = await database.get(Q);
  response.send(r);
});


/* API 3
 Path: `/todos/`
 Create a todo in the todo table, */
                

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const Q = `
              INSERT INTO todo
              (id,todo, priority, status)
              VALUES(${id},'${todo}','${priority}','${status}')`;

  await database.run(Q);
  response.send("Todo Successfully Added");
}); 

/* API 4
   Path: `/todos/:todoId/`
   Updates the details of a specific todo based on the todo ID  */

app.put("/todos/:todoId/", async (request, response) => {

  const { todo = "", priority = "" , status = "" } = request.body;

  const { todoId } = request.params;

  if (todo != "") {
    const Q = `
              UPDATE todo
              
              SET 
                 todo = '${todo}'
        
              WHERE
                 id = ${todoId}`;

    await database.run(Q);

    response.send("Todo Updated");
  } 
  
  else if (priority != "") {
    const Q = `
              UPDATE todo
              
              SET 
                
                 priority = '${priority}'                 
              
              WHERE
                 id = ${todoId}`;

    await database.run(Q);
    response.send("Priority Updated");

  }
  
  else if (status != "") {
    const Q = `
              UPDATE todo
              
              SET 
                 status = '${status}'

              WHERE
                 id = ${todoId}`;

    await database.run(Q);
    response.send("Status Updated");
  }
});


/* ## API 5

#### Path: `/todos/:todoId/`

#### Method: `DELETE` 

Deletes a todo from the todo table based on the todo ID  

*/


app.delete("/todos/:todoId/", async (request, response) => {


  const { todoId } = request.params;

   
    const Q = `
              DELETE FROM
                
                todo
        
              WHERE

                 id = ${todoId}`;

    await database.run(Q);

    response.send("Todo Deleted");
})


module.exports = app;
