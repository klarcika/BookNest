const express= require('express');
const app=express();
const port=3000;

app.use(express.json());

// kmetija routes
app.get('/',(req,res)=>{
    res.send('povezava dela');
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});