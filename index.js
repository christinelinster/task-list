import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost", 
  database: "tasklist",
  password: "work",
  port: "5432" 
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

db.connect();

let items = [
  { id: 1, task: "Buy milk", category: "General" },
  { id: 2, task: "Finish homework", category: "Learning" },
];

let categories = [{id: 1, type: "Learning"},{id:2, type: "General"}]

let currentCategory = "";
// let currentCategoryId = 1; 

// async function getCurrentCategory(){
//   const result = await db.query("SELECT * FROM categories")
//   categories = result.rows;
//   return categories.find((category) => category.id == currentCategoryId).type;
// }

function fullDate(){
  let date =  new Date();
  let newDate = date.toLocaleDateString();
  return newDate;
}

app.get("/", async(req, res) => {
  try {
    categories = (await db.query("SELECT * FROM categories")).rows;
    console.log(categories);
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows;
    const today = fullDate();

  res.render("index.ejs", {
    listItems: items,
    categories: categories,
    today: today
  });
    
  } catch (error) {
    console.log(error)
  }
  
});

app.post("/add", async(req, res) => {

  try {
    currentCategory = req.body.list;
    const item = req.body.newItem;
    if(item.replaceAll(" ", "") !== ""){
      await db.query("INSERT INTO items (task, category) VALUES ($1, $2);", [item, currentCategory]);
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/list", async(req,res) => {
  try{
    const listName = req.body.newList;
    if(listName.replaceAll(" ", "") !== ""){
      const result = await db.query("INSERT INTO categories (type) VALUES ($1) RETURNING *;", [listName]);
      currentCategory = result.rows[0].type;
      res.redirect("/");
    }else{
      res.redirect("/");
    }
  }catch(error){
    console.log(error);
  }
})

app.post("/edit", async(req, res) => {
  const id = req.body.updatedItemId; 
  const updatedItem = req.body.updatedItemTask;
  await db.query("UPDATE items SET task = ($1) WHERE id = ($2);", [updatedItem, id])
  res.redirect("/");
});

app.post("/delete", async(req, res) => {
  try {
    const itemId = req.body.deleteItemId; 
    const listId = req.body.deleteListId;
    
  await db.query("DELETE FROM items WHERE id = ($1);", [itemId])
  await db.query("DELETE FROM categories WHERE id = ($1);", [listId])
  
  res.redirect("/");
  } catch (error) {
    console.log(error);
  }

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});