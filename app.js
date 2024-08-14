const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initilzeDBAndStart = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DataBase Error : '${error}'`);
  }
};

initilzeDBAndStart();

//Scenario 1

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

//Scenario 2

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

//Scenario 3

const hasPriorityAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

//Scenario 4

const hasSearch_qProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

//Scenario 5

const hasCategoryAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

//Scenario 6

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

//Scenario 7

const hasCategoryAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

// API 1
app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q = "" } = request.query;
  let data = "";
  let getTodoQuery = "";

  const isValidStatus = (status) => {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      return true;
    } else {
      return false;
    }
  };

  const isValidPriority = (priority) => {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      return true;
    } else {
      return false;
    }
  };

  const isValidCategory = (category) => {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      return true;
    } else {
      return false;
    }
  };

  switch (true) {
    case hasCategoryAndPriorityProperty(request.query):
      if (isValidCategory(request.query.category)) {
        if (isValidPriority(request.query.priority)) {
          getTodoQuery = `SELECT id,todo,priority,status,category,due_date as dueDate 
          FROM 
          todo
           WHERE category='${category}' AND priority='${priority}';`;
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasCategoryAndStatusProperty(request.query):
      if (isValidCategory(request.query.category)) {
        if (isValidStatus(request.query.status)) {
          getTodoQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE category='${category}' AND status='${status}';`;
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    case hasPriorityAndStatusProperty(request.query):
      if (isValidPriority(request.query.priority)) {
        if (isValidStatus(request.query.status)) {
          getTodoQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE priority='${priority}' AND status='${status}';`;
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasSearch_qProperty(request.query):
      getTodoQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE todo LIKE '%${search_q}%';`;
      break;

    case hasStatusProperty(request.query):
      if (isValidStatus(request.query.status) === true) {
        getTodoQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE status='${status}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasPriorityProperty(request.query):
      if (isValidPriority(request.query.priority) === true) {
        getTodoQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE priority='${priority}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasCategoryProperty(request.query):
      if (isValidCategory(request.query.category)) {
        getTodoQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE category='${category}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    default:
      getTodoQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo ;`;
      break;
  }
  data = await db.all(getTodoQuery);
  response.send(data);
});

// API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE id='${todoId}';`;
  data = await db.get(getTodoQuery);
  response.send(data);
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const formateDate = format(new Date(date), "yyyy-MM-dd");
  const isValidDate = isValid(new Date(formateDate));
  if (isValidDate) {
    getTodoQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE date(due_date) = '${formateDate}';`;
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
  const data = await db.all(getTodoQuery);
  response.send(data);
});

// API 4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const isValidStatus = (status) => {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      return true;
    } else {
      return false;
    }
  };

  const isValidPriority = (priority) => {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      return true;
    } else {
      return false;
    }
  };

  const isValidCategory = (category) => {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      return true;
    } else {
      return false;
    }
  };

  const formateDate = format(new Date(dueDate), "yyyy-MM-dd");
  const isValidDate = isValid(new Date(formateDate));

  if (isValidPriority(priority)) {
    if (isValidStatus(status)) {
      if (isValidCategory(category)) {
        if (isValidDate) {
          const addTodoQuery = `INSERT INTO todo(id, todo,category, priority, status,due_date)
                Values(
                    'S{id}',
                    '${todo}',
                    '${category}',
                    '${priority}',
                    '${status}',
                    '${dueDate}'
                );`;
          await db.run(addTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

// API 5
app.put("/todos/:todoId/", async (request, response) => {
  let updateTodoQuery = "";
  result = "";
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;

  const isValidStatus = (status) => {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      return true;
    } else {
      return false;
    }
  };

  const isValidPriority = (priority) => {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      return true;
    } else {
      return false;
    }
  };

  const isValidCategory = (category) => {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      return true;
    } else {
      return false;
    }
  };
  const isValidDueDate = (dueDate) => {
    const formateDate = format(new Date(dueDate), "yyyy-MM-dd");
    const isValidDate = isValid(new Date(formateDate));
    if (isValidDate === true) {
      return true;
    } else {
      return false;
    }
  };

  switch (true) {
    case status !== undefined:
      if (isValidStatus(status)) {
        updateTodoQuery = `UPDATE todo SET status='${status}' WHERE id='${todoId}';`;
        result = "Status Updated";
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case priority !== undefined:
      if (isValidPriority(priority)) {
        updateTodoQuery = `UPDATE todo SET priority='${priority}' WHERE id='${todoId}';`;
        result = "Priority Updated";
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case dueDate !== undefined:
      if (isValidDueDate(dueDate)) {
        updateTodoQuery = `UPDATE todo SET due_date='${dueDate}' WHERE id='${todoId}';`;
        result = "Due Date Updated";
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
    case category !== undefined:
      if (isValidCategory(category)) {
        updateTodoQuery = `UPDATE todo SET category='${category}' WHERE id='${todoId}';`;
        result = "Category Updated";
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      updateTodoQuery = `UPDATE todo SET todo='${todo}' WHERE id='${todoId}';`;
      result = "Todo Updated";
      break;
  }
  await db.run(updateTodoQuery);
  response.send(result);
});

// API 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id='${todoId}';`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
