import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost", 
  database: "permalist",
  password: "work",
  port: "5432" 
}
)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

db.connect();

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

function fullDate(){
  let date =  new Date();
  let newDate = date.toLocaleDateString();
  return newDate;
}

app.get("/", async(req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  const items = result.rows;
  const today = fullDate();

  res.render("index.ejs", {
    listTitle: today,
    listItems: items,
  });
    
  } catch (error) {
    console.log(error)
  }
  
});

app.post("/add", async(req, res) => {

  try {
    const item = req.body.newItem;
    if(item.replaceAll(" ", "") !== ""){
      await db.query("INSERT INTO items (title) VALUES ($1);", [item]);
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit", async(req, res) => {
  const id = req.body.updatedItemId; 
  const updatedItem = req.body.updatedItemTitle;
  await db.query("UPDATE items SET title = ($1) WHERE id = ($2);", [updatedItem, id])
  res.redirect("/");
});

app.post("/delete", async(req, res) => {

  try {
    const id = req.body.deleteItemId; 
  await db.query("DELETE FROM items WHERE id = ($1);", [id])
  res.redirect("/");
  } catch (error) {
    console.log(error);
  }

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});